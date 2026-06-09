import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Product } from './product.entity';
import { ProductDetail } from './product-detail.entity';

@Entity('products_image')
export class ProductImage extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'product_id' })
  productId!: string;

  @Column({ name: 'product_detail_id', nullable: true })
  productDetailId!: string;

  @Column({ name: 'image_url', length: 500 })
  imageUrl!: string;

  @Column({ name: 'is_main', default: false })
  isMain!: boolean;

  @Column({ name: 'display_order', default: 0 })
  displayOrder!: number;

  @Column({ name: 'alt_text', length: 200, nullable: true })
  altText!: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @ManyToOne(() => ProductDetail)
  @JoinColumn({ name: 'product_detail_id' })
  productDetail!: ProductDetail;
}