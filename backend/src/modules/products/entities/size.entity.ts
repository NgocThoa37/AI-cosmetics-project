import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ProductDetail } from './product-detail.entity';

@Entity('products_sizes')
export class Size extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 50 })
  name!: string;

  @OneToMany(() => ProductDetail, detail => detail.size)
  productDetails!: ProductDetail[];
}