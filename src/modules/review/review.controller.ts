import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReplyReviewDto } from './dto/reply-review.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { CustomersService } from '../customers/customers.service';

@Controller('reviews')
export class ReviewController {
  constructor(
    private readonly reviewService: ReviewService,
    private readonly customersService: CustomersService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req, @Body() dto: CreateReviewDto) {
    const customer = await this.customersService.findByUserId(req.user.userId);
    console.log('Customer from controller:', customer.id);
    return this.reviewService.create(customer.id, dto);
  }

  @Get('product/:productId')
  findByProduct(@Param('productId') productId: string) {
    return this.reviewService.findByProduct(productId);
  }

  // ✅ THÊM: Lấy danh sách review của customer
  @Get('my-reviews')
  @UseGuards(JwtAuthGuard)
  async getMyReviews(@Request() req) {
    const customer = await this.customersService.findByUserId(req.user.userId);
    return this.reviewService.findByCustomer(customer.id);
  }

  // ✅ THÊM: Kiểm tra đã review chưa
  @Get('check/:orderItemId')
  @UseGuards(JwtAuthGuard)
  async checkReviewed(@Param('orderItemId') orderItemId: string, @Request() req) {
    const customer = await this.customersService.findByUserId(req.user.userId);
    const reviewed = await this.reviewService.hasReviewed(customer.id, +orderItemId);
    return { reviewed };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  findAll() {
    return this.reviewService.findAll();
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  approve(@Param('id') id: string) {
    return this.reviewService.approveReview(+id);
  }

  @Delete(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  reject(@Param('id') id: string) {
    return this.reviewService.rejectReview(+id);
  }

  @Post(':id/reply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  reply(@Param('id') id: string, @Request() req, @Body() dto: ReplyReviewDto) {
    return this.reviewService.replyToReview(+id, req.user.userId, dto);
  }
}