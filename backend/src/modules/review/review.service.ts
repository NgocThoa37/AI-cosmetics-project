import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { ReviewReply } from './entities/review-reply.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReplyReviewDto } from './dto/reply-review.dto';
import { OrderService } from '../order/order.service';
import { ProductsService } from '../products/products.service';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review) private reviewRepo: Repository<Review>,
    @InjectRepository(ReviewReply) private replyRepo: Repository<ReviewReply>,
    private orderService: OrderService,
    private productsService: ProductsService,
  ) {}

  async create(customerId: number, dto: CreateReviewDto): Promise<Review> {
    
    console.log('=== REVIEW CREATE ===');
    console.log('customerId received:', customerId);
    console.log('orderItemId:', dto.orderItemId);
    
    const order = await this.orderService.findOneByOrderItemId(dto.orderItemId);
    console.log('Order found:', order.id);
    console.log('Order customerId:', order.customerId);
    console.log('Match:', order.customerId === customerId);
    
    if (!order || order.customerId !== customerId) {
      console.log('Throwing error - not your order');
      throw new BadRequestException('You can only review products you purchased');
    }
    const existing = await this.reviewRepo.findOne({ where: { orderItemId: dto.orderItemId } });
    if (existing) throw new BadRequestException('You already reviewed this product');

    const review = this.reviewRepo.create({
      ...dto,
      customerId,
      reviewDate: new Date(),
      isVerifiedPurchase: true,
      isApproved: false,
    });
    const saved = await this.reviewRepo.save(review);
    await this.updateProductAverageRating(review.productId);
    return saved;
  }

  async findAll(): Promise<Review[]> {
    return this.reviewRepo.find({ relations: ['customer', 'customer.user', 'replies', 'replies.employee'] });
  }

  async findByProduct(productId: string): Promise<Review[]> {
    return this.reviewRepo.find({ where: { productId, isApproved: true }, relations: ['customer', 'customer.user', 'replies'] });
  }

  async approveReview(id: number): Promise<Review> {
    const review = await this.reviewRepo.findOne({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');
    review.isApproved = true;
    await this.reviewRepo.save(review);
    await this.updateProductAverageRating(review.productId);
    return review;
  }

  async rejectReview(id: number): Promise<void> {
    const review = await this.reviewRepo.findOne({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');
    await this.reviewRepo.delete(id);
  }

  async replyToReview(reviewId: number, employeeId: number, dto: ReplyReviewDto): Promise<ReviewReply> {
    const review = await this.reviewRepo.findOne({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('Review not found');
    const reply = this.replyRepo.create({
      reviewId,
      employeeId,
      reply: dto.reply,
      repliedAt: new Date(),
    });
    return this.replyRepo.save(reply);
  }

  private async updateProductAverageRating(productId: string): Promise<void> {
    const result = await this.reviewRepo
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .where('review.productId = :productId AND review.isApproved = true', { productId })
      .getRawOne();
    const avg = parseFloat(result.avg) || 0;
    await (this.productsService as any).updateAverageRating(productId, avg);
  }
}