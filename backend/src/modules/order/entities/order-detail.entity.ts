import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';
import { ProductDetail } from '../../products/entities/product-detail.entity';

@Entity('order_detail')
export class OrderDetail extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'order_id' })
  orderId!: number;

  @Column({ name: 'product_detail_id' })
  productDetailId!: string;

  @Column({ name: 'product_id' })
  productId!: string;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 15, scale: 2 })
  unitPrice!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  subtotal!: number;

  @ManyToOne(() => Order, order => order.details)
  @JoinColumn({ name: 'order_id' })
  order!: Order;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @ManyToOne(() => ProductDetail)
  @JoinColumn({ name: 'product_detail_id' })
  productDetail!: ProductDetail;
}