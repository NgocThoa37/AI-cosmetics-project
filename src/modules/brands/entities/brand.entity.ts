import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

export enum BrandStatus {
  COOPERATING = 'cooperating',
  SUSPENDED = 'suspended',
}

@Entity('brands')
export class Brand {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'brand_code', length: 50, unique: true })
  brandCode!: string;

  @Column({ length: 100 })
  name!: string;

  @Column({ length: 100 })
  origin!: string;

  @Column({ type: 'enum', enum: BrandStatus, default: BrandStatus.COOPERATING })
  status!: BrandStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => Product, product => product.brand)
  products!: Product[];
}