import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { CartDetail } from './cart-detail.entity';

@Entity('carts')
export class Cart extends BaseEntity {
  @PrimaryGeneratedColumn()
  i!: number;

  @Column({ name: 'customer_id' })
  customerId!: number;

  @Column({ name: 'total_items', default: 0 })
  totalItems!: number;

  @Column({ name: 'total_price', type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalPrice!: number;

  @ManyToOne(() => Customer, customer => customer.carts)
  @JoinColumn({ name: 'customer_id' })
  customer!: Customer;

  @OneToMany(() => CartDetail, detail => detail.cart)
  details!: CartDetail[];
}