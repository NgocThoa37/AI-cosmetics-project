import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { Product } from '../../products/entities/product.entity';
import { OrderDetail } from '../../order/entities/order-detail.entity';
import { ReviewReply } from './review-reply.entity';

@Entity('reviews')
export class Review extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'order_item_id' })
  orderItemId!: number;

  @Column({ name: 'customer_id' })
  customerId!: number;

  @Column({ name: 'product_id' })
  productId!: string;

  @Column({ type: 'int' })
  rating!: number;

  @Column({ length: 200, nullable: true })
  title!: string;

  @Column({ type: 'text', nullable: true })
  comment!: string;

  @Column({ name: 'image_urls', type: 'json', nullable: true })
  imageUrls!: string[];

  @Column({ name: 'review_date', type: 'date' })
  reviewDate!: Date;

  @Column({ name: 'is_verified_purchase', default: false })
  isVerifiedPurchase!: boolean;

  @Column({ name: 'is_approved', default: false })
  isApproved!: boolean;

  @ManyToOne(() => Customer, customer => customer.reviews)
  @JoinColumn({ name: 'customer_id' })
  customer!: Customer;

  @ManyToOne(() => Product, product => product.reviews)
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @ManyToOne(() => OrderDetail)
  @JoinColumn({ name: 'order_item_id' })
  orderItem!: OrderDetail;

  @OneToMany(() => ReviewReply, reply => reply.review)
  replies!: ReviewReply[];
}