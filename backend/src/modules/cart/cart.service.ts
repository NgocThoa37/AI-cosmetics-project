import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartDetail } from './entities/cart-detail.entity';
import { CustomersService } from '../customers/customers.service';
import { ProductsService } from '../products/products.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private cartRepo: Repository<Cart>,
    @InjectRepository(CartDetail) private cartDetailRepo: Repository<CartDetail>,
    private customersService: CustomersService,
    private productsService: ProductsService,
  ) {}

  private async getOrCreateCart(customerId: number): Promise<Cart> {
    let cart = await this.cartRepo.findOne({ 
      where: { customerId }, 
      relations: ['details', 'details.productDetail'] 
    });
    if (!cart) {
      cart = this.cartRepo.create({ customerId, totalItems: 0, totalPrice: 0 });
      cart = await this.cartRepo.save(cart);
    }
    return cart;
  }

  private async recalculateCart(cartId: number): Promise<void> {
    const cart = await this.cartRepo.findOne({ 
      where: { i: cartId },  // 👈 Dùng 'i' thay vì 'id'
      relations: ['details', 'details.productDetail'] 
    });
    if (!cart) return;
    let totalItems = 0;
    let totalPrice = 0;
    for (const detail of cart.details) {
      const productDetail = await this.productsService.findOneDetail(detail.productDetailId);
      const product = await this.productsService.findOneProduct(productDetail.productId);
      totalItems += detail.quantity;
      totalPrice += detail.quantity * Number(product.price);
    }
    cart.totalItems = totalItems;
    cart.totalPrice = totalPrice;
    await this.cartRepo.save(cart);
  }

  async getCart(customerId: number): Promise<Cart> {
    return this.getOrCreateCart(customerId);
  }

  async addToCart(customerId: number, dto: AddToCartDto): Promise<Cart> {
    const productDetail = await this.productsService.findOneDetail(dto.productDetailId);
    if (productDetail.quantity < dto.quantity) throw new BadRequestException('Not enough stock');
    const cart = await this.getOrCreateCart(customerId);
    
    const cartId = cart.i;  // 👈 Lấy cart.i (số thứ tự)
    
    let existingDetail = await this.cartDetailRepo.findOne({ 
      where: { cartId, productDetailId: dto.productDetailId } 
    });
    
    if (existingDetail) {
      existingDetail.quantity += dto.quantity;
      await this.cartDetailRepo.save(existingDetail);
    } else {
      existingDetail = this.cartDetailRepo.create({ 
        cartId,  // 👈 Dùng cartId
        productDetailId: dto.productDetailId, 
        quantity: dto.quantity 
      });
      await this.cartDetailRepo.save(existingDetail);
    }
    await this.recalculateCart(cartId);
    return this.getCart(customerId);
  }

  async updateCartItem(customerId: number, dto: UpdateCartDto): Promise<Cart> {
    const cart = await this.getOrCreateCart(customerId);
    const cartId = cart.i;
    
    const detail = await this.cartDetailRepo.findOne({ 
      where: { cartId, productDetailId: dto.productDetailId } 
    });
    if (!detail) throw new NotFoundException('Item not found in cart');
    
    if (dto.quantity === 0) {
      await this.cartDetailRepo.delete(detail.id);
    } else {
      detail.quantity = dto.quantity;
      await this.cartDetailRepo.save(detail);
    }
    await this.recalculateCart(cartId);
    return this.getCart(customerId);
  }

  async removeCartItem(customerId: number, productDetailId: string): Promise<Cart> {
    const cart = await this.getOrCreateCart(customerId);
    const cartId = cart.i;
    
    await this.cartDetailRepo.delete({ cartId, productDetailId });
    await this.recalculateCart(cartId);
    return this.getCart(customerId);
  }

  async clearCart(customerId: number): Promise<void> {
    const cart = await this.getOrCreateCart(customerId);
    const cartId = cart.i;
    
    await this.cartDetailRepo.delete({ cartId });
    await this.recalculateCart(cartId);
  }
}