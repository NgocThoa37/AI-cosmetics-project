import { Controller, Get, Post, Body, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CustomersService } from '../customers/customers.service';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly customersService: CustomersService,
  ) {}

  private async getCustomerId(userId: number): Promise<number> {
    const customer = await this.customersService.findByUserId(userId);
    return customer.id;
  }

  @Get()
  async getCart(@Request() req) {
    const customerId = await this.getCustomerId(req.user.userId);
    return this.cartService.getCart(customerId);
  }

  @Post('add')
  async addToCart(@Request() req, @Body() addToCartDto: AddToCartDto) {
    const customerId = await this.getCustomerId(req.user.userId);
    return this.cartService.addToCart(customerId, addToCartDto);
  }

  @Post('update')
  async updateCart(@Request() req, @Body() updateCartDto: UpdateCartDto) {
    const customerId = await this.getCustomerId(req.user.userId);
    return this.cartService.updateCartItem(customerId, updateCartDto);
  }

  @Delete('remove/:productDetailId')
  async removeItem(@Request() req, @Param('productDetailId') productDetailId: string) {
    const customerId = await this.getCustomerId(req.user.userId);
    return this.cartService.removeCartItem(customerId, productDetailId);
  }

  @Delete('clear')
  async clearCart(@Request() req) {
    const customerId = await this.getCustomerId(req.user.userId);
    return this.cartService.clearCart(customerId);
  }
}