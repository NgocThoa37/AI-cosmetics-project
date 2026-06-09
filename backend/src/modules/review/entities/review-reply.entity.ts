import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Review } from './review.entity';
import { Employee } from '../../employees/entities/employee.entity';

@Entity('review_replies')
export class ReviewReply extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'review_id' })
  reviewId!: number;

  @Column({ name: 'employee_id' })
  employeeId!: number;

  @Column({ type: 'text' })
  reply!: string;

  @Column({ name: 'replied_at', type: 'date' })
  repliedAt!: Date;

  @Column({ name: 'is_edited', default: false })
  isEdited!: boolean;

  @Column({ name: 'edit_at', type: 'date', nullable: true })
  editAt!: Date;

  @ManyToOne(() => Review, review => review.replies)
  @JoinColumn({ name: 'review_id' })
  review!: Review;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee!: Employee;
}