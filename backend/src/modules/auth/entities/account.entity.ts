import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Role } from '../enums/role.enum';

@Entity('accounts')
export class Account extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id' })
  userId!: number;

  @Column({ length: 50, unique: true })
  username!: string;

  @Column({ length: 255 })
  password!: string;

  @Column({ type: 'enum', enum: ['active', 'inactive', 'banned'], default: 'active' })
  status!: string;

  @Column({ type: 'enum', enum: Role, default: Role.CUSTOMER })
  role!: Role;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;
}