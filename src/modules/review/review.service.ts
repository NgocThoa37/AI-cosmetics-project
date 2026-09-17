import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { ReviewReply } from './entities/review-reply.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReplyReviewDto } from './dto/reply-review.dto';
import { OrderService } from '../order/order.service';
import { ProductsService } from '../products/products.service';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review) private reviewRepo: Repository<Review>,
    @InjectRepository(ReviewReply) private replyRepo: Repository<ReviewReply>,
    private orderService: OrderService,
    private productsService: ProductsService,
  ) {}

  // ✅ Hàm lưu ảnh base64 thành file
  private async saveImage(base64String: string): Promise<string> {
    // Tạo thư mục uploads/reviews nếu chưa có
    const uploadDir = path.join(process.cwd(), 'uploads', 'reviews');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Tạo tên file duy nhất
    const filename = `${uuidv4()}.jpg`;
    const filepath = path.join(uploadDir, filename);

    // Xóa prefix "data:image/jpeg;base64," và chuyển thành buffer
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Ghi file
    fs.writeFileSync(filepath, buffer);

    // Trả về đường dẫn URL
    return `/uploads/reviews/${filename}`;
  }

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

    // ✅ Xử lý ảnh: base64 → lưu file
    let savedImageUrls: string[] = [];
    if (dto.imageUrls && dto.imageUrls.length > 0) {
      for (const image of dto.imageUrls) {
        // Nếu là base64, lưu thành file
        if (image.startsWith('data:image')) {
          try {
            const filePath = await this.saveImage(image);
            savedImageUrls.push(filePath);
          } catch (error) {
            console.error('Failed to save image:', error);
            // Nếu lưu ảnh thất bại, vẫn tiếp tục
          }
        } else {
          // Nếu là URL, giữ nguyên
          savedImageUrls.push(image);
        }
      }
    }

    const review = this.reviewRepo.create({
      ...dto,
      customerId,
      reviewDate: new Date(),
      isVerifiedPurchase: true,
      isApproved: false,
      imageUrls: savedImageUrls, // ✅ Lưu đường dẫn ảnh đã lưu
    });
    const saved = await this.reviewRepo.save(review);
    await this.updateProductAverageRating(review.productId);
    return saved;
  }

  async findAll(): Promise<Review[]> {
    return this.reviewRepo.find({ relations: ['customer', 'customer.user', 'replies', 'replies.employee'] });
  }

  async findByProduct(productId: string): Promise<Review[]> {
    return this.reviewRepo.find({
      where: { productId, isApproved: true },
      relations: ['customer', 'customer.user', 'replies']
    });
  }

  async findByCustomer(customerId: number): Promise<Review[]> {
    console.log('🔍 [findByCustomer] customerId:', customerId);

    return this.reviewRepo.find({
      where: { customerId },
      relations: [
        'product',
        'product.details',
        'product.details.images',
        'replies',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  // ✅ THÊM: Kiểm tra đã review chưa
  async hasReviewed(customerId: number, orderItemId: number): Promise<boolean> {
    const review = await this.reviewRepo.findOne({
      where: { customerId, orderItemId },
    });
    return !!review;
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