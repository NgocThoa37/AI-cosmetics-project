import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Cart } from '../../cart/entities/cart.entity';
import { Order } from '../../order/entities/order.entity';
import { Review } from '../../review/entities/review.entity';

@Entity('customers')
export class Customer extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'total_order', default: 0 })
  totalOrder!: number;

  @Column({ name: 'total_spent', type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalSpent!: number;

  @Column({ name: 'user_id' })
  userId!: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @OneToMany(() => Cart, cart => cart.customer)
  carts!: Cart[];

  @OneToMany(() => Order, order => order.customer)
  orders!: Order[];

  @OneToMany(() => Review, review => review.customer)
  reviews!: Review[];
}