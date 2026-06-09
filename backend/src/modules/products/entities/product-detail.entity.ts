import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Product } from './product.entity';
import { Color } from './color.entity';
import { Size } from './size.entity';
import { ProductImage } from './product-image.entity';
import { SkinType } from '../enums/skin-type.enum';

@Entity('products_details')
export class ProductDetail extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'product_id' })
  productId!: string;

  @Column({ name: 'color_id', nullable: true })
  colorId!: number;

  @Column({ name: 'size_id', nullable: true })
  sizeId!: number;

  @Column({ name: 'skin_type', type: 'enum', enum: SkinType, default: SkinType.ALL })
  skinType!: SkinType;

  @Column({ length: 50, unique: true })
  sku!: string;

  @Column({ type: 'int', default: 0 })
  quantity!: number;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'text', nullable: true })
  ingredients!: string;

  @Column({ type: 'json', nullable: true })
  usage!: any;

  @Column({ type: 'json', nullable: true })
  benefits!: any;

  @Column({ type: 'text', nullable: true })
  storage!: string;

  @ManyToOne(() => Product, product => product.details)
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @ManyToOne(() => Color)
  @JoinColumn({ name: 'color_id' })
  color!: Color;

  @ManyToOne(() => Size)
  @JoinColumn({ name: 'size_id' })
  size!: Size;

  @OneToMany(() => ProductImage, image => image.productDetail)
  images!: ProductImage[];
}