import { Controller, Get, Post, Body, Delete, Param, UseGuards, Request, Patch, BadRequestException, NotFoundException } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CustomersService } from '../customers/customers.service';
import { UsersService } from '../users/users.service';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly customersService: CustomersService,
    private readonly usersService: UsersService,
  ) {}

  private async getCustomerId(userId: number): Promise<number> {
  console.log('🔍 [getCustomerId] userId:', userId);
  
  // ✅ Để CustomersService tự xử lý tìm/tạo user và customer
  const customer = await this.customersService.findByUserId(userId);
  console.log('✅ [getCustomerId] Customer found:', customer.id);
  
  return customer.id;
}

  @Get()
async getCart(@Request() req) {
  console.log('🔍 [GET] Getting cart for user:', req.user);
  console.log('🔍 [GET] userId:', req.user.userId);
  
  try {
    const customerId = await this.getCustomerId(req.user.userId);
    console.log('✅ [GET] customerId:', customerId);
    
    const cart = await this.cartService.getCart(customerId);
    console.log('✅ [GET] Cart found:', cart?.id);
    
    return cart;
  } catch (error) {
    console.error('❌ [GET] Error:', error);
    throw error;
  }
}

  @Post('add')
  async addToCart(@Request() req, @Body() addToCartDto: AddToCartDto) {
    console.log('🔥🔥🔥 [CART] addToCart ROUTE CALLED!');
    console.log('📦 userId:', req.user.userId);
    console.log('📦 body:', JSON.stringify(addToCartDto, null, 2));
    
    try {
      const customerId = await this.getCustomerId(req.user.userId);
      console.log('📦 customerId:', customerId);
      
      const result = await this.cartService.addToCart(customerId, addToCartDto);
      console.log('✅ Result success');
      
      return result;
    } catch (error: any) { // ✅ SỬA: thêm :any
      console.error('❌ [addToCart] Error:', error);
      console.error('❌ [addToCart] Stack:', error?.stack);
      throw error;
    }
  }

  @Patch('update')
  async updateCart(@Request() req, @Body() updateCartDto: UpdateCartDto) {
    console.log('📦 [UPDATE] updateCart called');
    const customerId = await this.getCustomerId(req.user.userId);
    return this.cartService.updateCartItem(customerId, updateCartDto);
  }

  @Delete('remove/:productDetailId')
  async removeItem(@Request() req, @Param('productDetailId') productDetailId: string) {
    console.log('📦 [REMOVE] removeItem called:', productDetailId);
    const customerId = await this.getCustomerId(req.user.userId);
    return this.cartService.removeCartItem(customerId, productDetailId);
  }

  @Delete('clear')
  async clearCart(@Request() req) {
    console.log('📦 [CLEAR] clearCart called');
    const customerId = await this.getCustomerId(req.user.userId);
    return this.cartService.clearCart(customerId);
  }
}