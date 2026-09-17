import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Account } from './entities/account.entity';
import { Customer } from '../customers/entities/customer.entity';
import { UsersService } from '../users/users.service';
import { EmailService } from '../../common/services/email.service';
import { CacheService } from '../../common/services/cache.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Role } from './enums/role.enum';
import { Cart } from '../cart/entities/cart.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private cacheService: CacheService,
    @InjectRepository(Customer)  
    private customerRepository: Repository<Customer>,
    @InjectRepository(Cart)  
    private cartRepository: Repository<Cart>,
    private dataSource: DataSource,
  ) {}

  async register(registerDto: RegisterDto) {
    const { username, email, password, fullName } = registerDto;
    
    const existingAccount = await this.accountRepository.findOne({ where: { username } });
    if (existingAccount) throw new ConflictException('Username already exists');
    
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) throw new ConflictException('Email already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      const user = await this.usersService.create({ fullName, email });
      console.log('✅ User created:', user.id);
      
      const account = this.accountRepository.create({
        username,
        password: hashedPassword,
        userId: user.id,
        role: Role.CUSTOMER,
        status: 'active',
      });
      await queryRunner.manager.save(account);
      console.log('✅ Account created:', account.id);
      
      console.log('🔍 Creating customer for user:', user.id);
      const customer = new Customer();
      customer.userId = user.id;
      customer.totalOrder = 0;
      customer.totalSpent = 0;
      await queryRunner.manager.save(customer);
      console.log('✅ Customer created:', customer.id);
      
      console.log('🔍 Creating cart for customer:', customer.id);
      const cart = new Cart();
      cart.customerId = customer.id;
      cart.totalItems = 0;
      cart.totalPrice = 0;
      await queryRunner.manager.save(cart);
      console.log('✅ Cart created:', cart.id);
      
      await queryRunner.commitTransaction();
      console.log('✅ Registration completed successfully!');
      
      return { message: 'Registration successful' };
      
    } catch (error) {
      console.error('❌ Registration error:', error);
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Registration failed: ' + (error as any).message);
    } finally {
      await queryRunner.release();
    }
  }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;
    
    console.log('📥 [LOGIN] Attempt:', username);
    
    const account = await this.accountRepository
      .createQueryBuilder('account')
      .leftJoinAndSelect('account.user', 'user')
      .where('LOWER(account.username) = LOWER(:username)', { username })
      .orWhere('LOWER(user.email) = LOWER(:email)', { email: username })
      .getOne();
    
    console.log('👤 [LOGIN] Account found:', account?.username);
    console.log('📊 [LOGIN] Role:', account?.role);
    console.log('📊 [LOGIN] Status:', account?.status);
    
    if (!account) {
      console.log('❌ [LOGIN] Account NOT found:', username);
      throw new UnauthorizedException('Sai tên đăng nhập hoặc mật khẩu');
    }
    
    if (account.status !== 'active') {
      console.log('❌ [LOGIN] Account inactive:', account.status);
      throw new UnauthorizedException('Tài khoản đã bị khóa hoặc không hoạt động');
    }
    
    const isPasswordValid = await bcrypt.compare(password, account.password);
    console.log('🔑 [LOGIN] Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ [LOGIN] Wrong password');
      throw new UnauthorizedException('Sai tên đăng nhập hoặc mật khẩu');
    }
    
    console.log('✅ [LOGIN] Success! Role:', account.role);
    
    // ✅ SỬA: Thêm userId vào payload
    const payload = { 
      sub: account.id,
      userId: account.userId,  // ✅ THÊM: ID của user trong bảng users
      username: account.username, 
      role: account.role,
      email: account.user?.email,
    };
    
    console.log('📦 [LOGIN] Payload:', payload);
    
    const accessToken = this.jwtService.sign(payload, { 
      secret: process.env.JWT_ACCESS_SECRET!, 
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN as any 
    });
    
    const refreshToken = this.jwtService.sign(payload, { 
      secret: process.env.JWT_REFRESH_SECRET!, 
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN as any 
    });
    
    return { 
      accessToken, 
      refreshToken, 
      user: { 
        id: account.user?.id,
        fullName: account.user?.fullName, 
        email: account.user?.email, 
        role: account.role,
        username: account.username,
      } 
    };
  }

  async refreshToken(refreshToken: string) {
  try {
    const payload = this.jwtService.verify(refreshToken, { 
      secret: process.env.JWT_REFRESH_SECRET 
    });
    const account = await this.accountRepository.findOne({ 
      where: { id: payload.sub },
      relations: ['user'] 
    });
    if (!account) throw new UnauthorizedException();
    
    // ✅ SỬA: Thêm userId vào payload mới
    const newPayload = { 
      sub: account.id,
      userId: account.userId,
      username: account.username, 
      role: account.role,
      email: account.user?.email,
    };
    
    const newAccessToken = this.jwtService.sign(newPayload, { 
      secret: process.env.JWT_ACCESS_SECRET!, 
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN as any 
    });
    
    return { accessToken: newAccessToken };
  } catch (error) {
    console.error('❌ [REFRESH] Error:', error);
    throw new UnauthorizedException('Invalid refresh token');
  }
}

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new BadRequestException('Email not found');
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await this.cacheService.set(`otp_${email}`, otp, 300);
    await this.emailService.sendOtpEmail(email, otp);
    return { message: 'OTP sent to email' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { otp, newPassword, email } = resetPasswordDto; 
    const cachedOtp = await this.cacheService.get(`otp_${email}`);
    if (!cachedOtp || cachedOtp !== otp) throw new BadRequestException('Invalid or expired OTP');
    const user = await this.usersService.findByEmail(email);
    const account = await this.accountRepository.findOne({ where: { userId: user!.id } });
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    account!.password = hashedPassword;
    await this.accountRepository.save(account!);
    await this.cacheService.del(`otp_${email}`);
    return { message: 'Password reset successful' };
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const account = await this.accountRepository.findOne({ where: { userId } });
    if (!account) throw new UnauthorizedException('Account not found');
    const isMatch = await bcrypt.compare(changePasswordDto.oldPassword, account!.password);
    if (!isMatch) throw new UnauthorizedException('Old password incorrect');
    account!.password = await bcrypt.hash(changePasswordDto.newPassword, 10);
    await this.accountRepository.save(account!);
    return { message: 'Password changed' };
  }

  async logout(userId: number) {
    return { message: 'Logged out' };
  }

  async createDefaultAdmin() {
    const adminExists = await this.accountRepository.findOne({ where: { role: Role.ADMIN } });
    if (!adminExists) {
      console.log('👤 Creating default admin...');
      const adminUser = await this.usersService.create({ fullName: 'Admin', email: 'admin@cosmetics.com' });
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const adminAccount = this.accountRepository.create({
        username: 'admin',
        password: hashedPassword,
        userId: adminUser!.id,
        role: Role.ADMIN,
        status: 'active',
      });
      await this.accountRepository.save(adminAccount!);
      console.log('✅ Default admin created: admin / admin123');
    }
  }
}