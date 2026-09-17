import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('employees')
export class Employee extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'employee_code', length: 20, unique: true })
  employeeCode!: string;

  @Column({ name: 'hire_date', type: 'date' })
  hireDate!: Date;

  @Column({ 
    name: 'position', 
    length: 50, 
    nullable: true,
    default: 'Nhân viên bán hàng'
  })
  position!: string;  // 'Quản lý' | 'Nhân viên bán hàng' | 'Chăm sóc khách hàng'

  @Column({ name: 'user_id' })
  userId!: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;
}