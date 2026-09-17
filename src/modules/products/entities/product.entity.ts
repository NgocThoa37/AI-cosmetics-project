import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Category } from '../../categories/entities/category.entity';
import { Brand } from '../../brands/entities/brand.entity';  // ← THÊM IMPORT
import { ProductDetail } from './product-detail.entity';
import { Review } from '../../review/entities/review.entity';

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  OUT_OF_STOCK = 'out_of_stock',
  DISCONTINUED = 'discontinued',
}

@Entity('products')
export class Product extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 200 })
  name!: string;

  @Column({ length: 200, unique: true })
  slug!: string;

  @Column({ name: 'category_id' })
  categoryId!: number;

  @Column({ name: 'brand_id', nullable: true }) 
  brandId!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  price!: number;

  @Column({ name: 'total_sold', default: 0 })
  totalSold!: number;

  @Column({ name: 'average_rating', type: 'decimal', precision: 3, scale: 2, default: 0 })
  averageRating!: number;

  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.ACTIVE })
  status!: ProductStatus;

  @ManyToOne(() => Category, category => category.products)
  @JoinColumn({ name: 'category_id' })
  category!: Category;

  @ManyToOne(() => Brand, brand => brand.products)
  @JoinColumn({ name: 'brand_id' })
  brand!: Brand;

  @OneToMany(() => ProductDetail, detail => detail.product)
  details!: ProductDetail[];

  @OneToMany(() => Review, review => review.product)
  reviews!: Review[];
}