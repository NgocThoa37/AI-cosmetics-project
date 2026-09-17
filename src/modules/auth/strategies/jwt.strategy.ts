import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../entities/account.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET')!,
    });
  }
  
  async validate(payload: any) {
    console.log('=== JWT STRATEGY ===');
    console.log('Payload nhận được:', payload);
    console.log('====================');
    
    // ✅ Lấy account từ database để verify
    const account = await this.accountRepository.findOne({
      where: { id: payload.sub },
      relations: ['user'],
    });
    
    if (!account) {
      console.log('❌ [JWT] Account not found');
      throw new UnauthorizedException('Invalid token');
    }
    
    // ✅ Trả về userId đúng từ payload (hoặc từ account.user)
    return { 
      userId: payload.userId || account.userId,  // ✅ Dùng userId từ payload
      sub: payload.sub,
      username: payload.username, 
      role: payload.role,
      email: payload.email,
      user: account.user,
      account: account,
    };
  }
}