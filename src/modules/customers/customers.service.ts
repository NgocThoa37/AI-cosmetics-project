import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
    private usersService: UsersService,
  ) {}

  async findOne(id: number): Promise<Customer> {
    const customer = await this.customersRepository.findOne({ 
      where: { id }, 
      relations: ['user'] 
    });
    if (!customer) throw new NotFoundException(`Customer with ID ${id} not found`);
    return customer;
  }

  async findAll(): Promise<Customer[]> {
    return this.customersRepository.find({
      relations: ['user'], 
    });
  }

  // ✅ CHỈ SỬA METHOD NÀY
  async findByUserId(userId: number): Promise<Customer> {
    console.log('🔍 [CUSTOMERS] Finding customer for userId:', userId);
    
    // Kiểm tra user tồn tại, nếu không thì tạo mới
    let user = await this.usersService.findOne(userId);
    if (!user) {
      console.log('🆕 [CUSTOMERS] User not found, creating new user with ID:', userId);
      user = await this.usersService.create({
        fullName: `User ${userId}`,
        email: `user${userId}@temp.com`,
      });
      console.log('✅ [CUSTOMERS] User created:', user.id);
    }
    
    let customer = await this.customersRepository.findOne({ 
      where: { userId: user.id }, 
      relations: ['user'] 
    });
    
    if (!customer) {
      console.log('🆕 [CUSTOMERS] Creating new customer for userId:', user.id);
      customer = this.customersRepository.create({
        userId: user.id,
        totalOrder: 0,
        totalSpent: 0,
      });
      customer = await this.customersRepository.save(customer);
      console.log('✅ [CUSTOMERS] Customer created with ID:', customer.id);
    }
    
    return customer;
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findOne(id);
    
    const { 
      fullName, 
      phone, 
      email, 
      avatar, 
      gender,
      dob,
      ...customerData 
    } = updateCustomerDto;
    
    const userUpdateData: any = {};
    if (fullName !== undefined) userUpdateData.fullName = fullName;
    if (phone !== undefined) userUpdateData.phone = phone;
    if (email !== undefined) userUpdateData.email = email;
    if (avatar !== undefined) userUpdateData.avatar = avatar;
    if (gender !== undefined) userUpdateData.gender = gender;
    if (dob !== undefined) userUpdateData.dob = dob;
    
    if (Object.keys(userUpdateData).length > 0) {
      await this.usersService.update(customer.userId, userUpdateData);
    }
    
    if (Object.keys(customerData).length > 0) {
      await this.customersRepository.update(id, customerData);
    }
    
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const customer = await this.findOne(id);
    await this.customersRepository.delete(id);
  }

  async updateTotals(customerId: number, orderTotal: number): Promise<void> {
    const customer = await this.findOne(customerId);
    customer.totalOrder += 1;
    customer.totalSpent = Number(customer.totalSpent) + orderTotal;
    await this.customersRepository.save(customer);
  }
}