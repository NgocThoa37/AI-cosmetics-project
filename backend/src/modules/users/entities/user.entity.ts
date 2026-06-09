import { Entity, Column, PrimaryGeneratedColumn, OneToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Account } from '../../auth/entities/account.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { Review } from '../../review/entities/review.entity';

@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'full_name', length: 100 })
  fullName!: string;

  @Column({ type: 'date', nullable: true })
  dob!: Date;

  @Column({ type: 'enum', enum: ['male', 'female', 'other'], nullable: true })
  gender!: string;

  @Column({ length: 15, nullable: true })
  phone!: string;

  @Column({ length: 100, unique: true })
  email!: string;

  @Column({ type: 'text', nullable: true })
  avatar!: string;

  @OneToOne(() => Account, account => account.user)
  account!: Account;

  @OneToOne(() => Customer, customer => customer.user)
  customer!: Customer;

  @OneToOne(() => Employee, employee => employee.user)
  employee!: Employee;

  @OneToMany(() => Review, review => review.customer)
  reviews!: Review[];
}