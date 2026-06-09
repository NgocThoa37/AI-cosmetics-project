import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { OrderDetail } from './order-detail.entity';

export enum PaymentMethod {
  MOMO = 'momo',
  COD = 'cod',
  BANKING = 'banking',
  VNPAY = 'vnpay',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Entity('orders')
export class Order extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'order_code', length: 20, unique: true })
  orderCode!: string;

  @Column({ name: 'customer_id' })
  customerId!: number;

  @Column({ name: 'shipping_address', type: 'text' })
  shippingAddress!: string;

  @Column({ name: 'shipping_phone', length: 15 })
  shippingPhone!: string;

  @Column({ name: 'shipping_fee', type: 'decimal', precision: 15, scale: 2, default: 0 })
  shippingFee!: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 15, scale: 2 })
  totalAmount!: number;

  @Column({ type: 'enum', enum: PaymentMethod, default: PaymentMethod.COD })
  paymentMethod!: PaymentMethod;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus!: PaymentStatus;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  orderStatus!: OrderStatus;

  @Column({ type: 'text', nullable: true })
  note!: string;

  @Column({ name: 'cancelled_reason', type: 'text', nullable: true })
  cancelledReason!: string;

  @Column({ name: 'cancelled_by', nullable: true })
  cancelledBy!: number;

  @Column({ name: 'shipper_date', type: 'date', nullable: true })
  shipperDate!: Date;

  @Column({ name: 'delivered_date', type: 'date', nullable: true })
  deliveredDate!: Date;

  @Column({ name: 'estimated_delivered_date', type: 'date', nullable: true })
  estimatedDeliveredDate!: Date;

  @ManyToOne(() => Customer, customer => customer.orders)
  @JoinColumn({ name: 'customer_id' })
  customer!: Customer;

  @OneToMany(() => OrderDetail, detail => detail.order)
  details!: OrderDetail[];
}