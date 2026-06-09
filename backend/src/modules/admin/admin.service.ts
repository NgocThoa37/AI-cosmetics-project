import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Account } from '../auth/entities/account.entity';
import { Employee } from '../employees/entities/employee.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Role } from '../auth/enums/role.enum';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Account) private accountRepo: Repository<Account>,
    @InjectRepository(Employee) private employeeRepo: Repository<Employee>,
    @InjectRepository(Customer) private customerRepo: Repository<Customer>,
  ) {}

  async getAllAccountsWithDetails() {
    return this.accountRepo.find({ relations: ['user'], order: { createdAt: 'DESC' } });
  }

  async updateAccountStatus(accountId: number, status: string) {
    await this.accountRepo.update(accountId, { status });
    return { message: 'Account status updated' };
  }

  async updateAccountRole(accountId: number, role: Role) {
    const account = await this.accountRepo.findOne({ where: { id: accountId } });
    if (!account) throw new Error('Account not found');
    const oldRole = account.role;
    account.role = role;
    await this.accountRepo.save(account);
    // If role changes to employee, ensure employee record exists
    if (role === Role.EMPLOYEE && oldRole !== Role.EMPLOYEE) {
      const existing = await this.employeeRepo.findOne({ where: { userId: account.userId } });
      if (!existing) {
        const employee = this.employeeRepo.create({
          employeeCode: `EMP-${Date.now()}`,
          hireDate: new Date(),
          userId: account.userId,
        });
        await this.employeeRepo.save(employee);
      }
    }
    return { message: 'Role updated' };
  }

  async deleteAccount(accountId: number) {
    const account = await this.accountRepo.findOne({ where: { id: accountId } });
    if (account!.role === Role.ADMIN) throw new Error('Cannot delete admin account');
    await this.userRepo.delete(account!.userId);
    await this.accountRepo.delete(accountId);
    return { message: 'Account deleted' };
  }
}