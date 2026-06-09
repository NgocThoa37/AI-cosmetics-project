import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('categories')
export class Category extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @Column({ length: 100, unique: true })
  slug!: string;

  @Column({ name: 'parent_id', nullable: true })
  parentId!: number;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ name: 'display_order', default: 0 })
  displayOrder!: number;

  @ManyToOne(() => Category, category => category.children)
  @JoinColumn({ name: 'parent_id' })
  parent!: Category;

  @OneToMany(() => Category, category => category.parent)
  children!: Category[];

  @OneToMany(() => Product, product => product.category)
  products!: Product[];
}