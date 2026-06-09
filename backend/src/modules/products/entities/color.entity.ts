import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ProductDetail } from './product-detail.entity';

@Entity('products_colors')
export class Color extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 50 })
  name!: string;

  @Column({ length: 20, nullable: true })
  code!: string;

  @Column({ name: 'hex_code', length: 7, nullable: true })
  hexCode!: string;

  @OneToMany(() => ProductDetail, detail => detail.color)
  productDetails!: ProductDetail[];
}