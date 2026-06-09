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
    const customer = await this.customersRepository.findOne({ where: { id }, relations: ['user'] });
    if (!customer) throw new NotFoundException(`Customer with ID ${id} not found`);
    return customer;
  }

  async findAll(): Promise<Customer[]> {
    return this.customersRepository.find({
      relations: ['user'], 
    });
  }

  async findByUserId(userId: number): Promise<Customer> {
    const customer = await this.customersRepository.findOne({ where: { userId }, relations: ['user'] });
    if (!customer) throw new NotFoundException(`Customer for user ${userId} not found`);
    return customer;
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    await this.findOne(id);
    await this.customersRepository.update(id, updateCustomerDto);
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