import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Cart } from './cart.entity';
import { ProductDetail } from '../../products/entities/product-detail.entity';

@Entity('cart_detail')
export class CartDetail extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'cart_id' })
  cartId!: number;

  @Column({ name: 'product_detail_id' })
  productDetailId!: string;

  @Column({ type: 'int', default: 1 })
  quantity!: number;

  @ManyToOne(() => Cart, cart => cart.details)
  @JoinColumn({ name: 'cart_id' })
  cart!: Cart;

  @ManyToOne(() => ProductDetail)
  @JoinColumn({ name: 'product_detail_id' })
  productDetail!: ProductDetail;
}