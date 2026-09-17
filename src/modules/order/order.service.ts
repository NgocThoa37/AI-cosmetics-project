import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus, PaymentStatus } from './entities/order.entity';
import { OrderDetail } from './entities/order-detail.entity';
import { CartService } from '../cart/cart.service';
import { CustomersService } from '../customers/customers.service';
import { ProductsService } from '../products/products.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(OrderDetail) private orderDetailRepo: Repository<OrderDetail>,
    private cartService: CartService,
    private customersService: CustomersService,
    private productsService: ProductsService,
  ) {}

  private generateOrderCode(): string {
    return `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
  }

  async createOrder(customerId: number, dto: CreateOrderDto): Promise<Order> {
  // ✅ Lấy items từ DTO (không phải từ cart)
  const items = dto.items;
  
  if (!items || items.length === 0) {
    throw new BadRequestException('Không có sản phẩm để đặt hàng');
  }
  
  // Check stock and calculate total
  let totalAmount = 0;
  for (const item of items) {
    const detail = await this.productsService.findOneDetail(item.productDetailId);
    if (!detail) {
      throw new BadRequestException(`Sản phẩm ${item.productDetailId} không tồn tại`);
    }
    if (detail.quantity < item.quantity) {
      throw new BadRequestException(`Sản phẩm ${detail.sku} đã hết hàng`);
    }
    const product = await this.productsService.findOneProduct(detail.productId);
    totalAmount += item.quantity * Number(product.price);
  }
  
  totalAmount += dto.shippingFee || 0;
  
  const orderCode = this.generateOrderCode();
  const order = this.orderRepo.create({
    orderCode,
    customerId,
    shippingAddress: dto.shippingAddress,
    shippingPhone: dto.shippingPhone,
    shippingFee: dto.shippingFee || 0,
    totalAmount,
    paymentMethod: dto.paymentMethod,
    paymentStatus: PaymentStatus.PENDING,
    orderStatus: OrderStatus.PENDING,
    note: dto.note,
  });
  
  const savedOrder = await this.orderRepo.save(order);
  
  // Create order details and deduct stock
  for (const item of items) {
    const detail = await this.productsService.findOneDetail(item.productDetailId);
    const product = await this.productsService.findOneProduct(detail.productId);
    
    const orderDetail = this.orderDetailRepo.create({
      orderId: savedOrder.id,
      productDetailId: item.productDetailId,
      productId: product.id,
      quantity: item.quantity,
      unitPrice: product.price,
      subtotal: item.quantity * Number(product.price),
    });
    await this.orderDetailRepo.save(orderDetail);
    
    // Deduct stock
    detail.quantity -= item.quantity;
    await this.productsService.updateDetail(item.productDetailId, { quantity: detail.quantity } as any);
  }
  
  // Update customer totals
  await this.customersService.updateTotals(customerId, totalAmount);
  
  return this.findOneOrder(savedOrder.id);
}

  async findOneOrder(id: number): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: [
        'details',
        'details.product',
        'details.productDetail',          // Load productDetail
        'details.productDetail.images',   // Load images trong productDetail
        'details.productDetail.color',
        'details.productDetail.size',
        'customer',
        'customer.user',
      ]
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async findByCustomer(customerId: number): Promise<Order[]> {
  console.log('🔍 [OrderService] findByCustomer - customerId:', customerId);
  console.log('🔍 [OrderService] Customer ID type:', typeof customerId);
  
  const orders = await this.orderRepo.find({
    where: { customerId },
    relations: [
      'details',
      'details.product',
      'details.product.details',           
      'details.product.details.images',    
      'details.product.details.color',
      'details.product.details.size',
      'details.productDetail',
      'details.productDetail.images',
      'details.productDetail.color',
      'details.productDetail.size',
    ],
    order: { createdAt: 'DESC' }
  });
  
  console.log('🔍 [OrderService] Found orders:', orders.length);
  orders.forEach(o => {
    console.log(`  - Order ${o.id}: customerId=${o.customerId}, code=${o.orderCode}`);
  });
  
  return orders;
}

  async findAll(): Promise<Order[]> {
    return this.orderRepo.find({
      relations: [
        'customer',
        'customer.user',
        'details',
        'details.product',
        'details.productDetail',
        'details.productDetail.images',    // ✅ Load ảnh từ ProductDetail
      ],
      order: { createdAt: 'DESC' }
    });
  }

  async updateStatus(id: number, dto: UpdateOrderStatusDto, userId: number, role: string): Promise<Order> {
    const order = await this.findOneOrder(id);
    if (role !== 'admin' && role !== 'employee') {
      throw new ForbiddenException('Permission denied');
    }
    if (dto.orderStatus === OrderStatus.CANCELLED && order.orderStatus !== OrderStatus.CANCELLED) {
      if (!dto.cancelledReason) throw new BadRequestException('Cancellation reason required');
      order.cancelledReason = dto.cancelledReason;
      order.cancelledBy = userId;
      // Restore stock
      for (const detail of order.details) {
        const productDetail = await this.productsService.findOneDetail(detail.productDetailId);
        productDetail.quantity += detail.quantity;
        await this.productsService.updateDetail(detail.productDetailId, { quantity: productDetail.quantity } as any);
      }
    }
    if (dto.orderStatus) order.orderStatus = dto.orderStatus;
    if (dto.paymentStatus) order.paymentStatus = dto.paymentStatus;
    if (dto.orderStatus === OrderStatus.SHIPPED) order.shipperDate = new Date();
    if (dto.orderStatus === OrderStatus.DELIVERED) order.deliveredDate = new Date();
    await this.orderRepo.save(order);
    return this.findOneOrder(id);
  }

  async cancelOrderByCustomer(orderId: number, customerId: number, reason: string): Promise<Order> {
    const order = await this.findOneOrder(orderId);
    if (order.customerId !== customerId) throw new ForbiddenException('Not your order');
    if (order.orderStatus !== OrderStatus.PENDING && order.orderStatus !== OrderStatus.CONFIRMED) {
      throw new BadRequestException('Cannot cancel order at this stage');
    }
    order.orderStatus = OrderStatus.CANCELLED;
    order.cancelledReason = reason;
    order.cancelledBy = customerId;
    // Restore stock
    for (const detail of order.details) {
      const productDetail = await this.productsService.findOneDetail(detail.productDetailId);
      productDetail.quantity += detail.quantity;
      await this.productsService.updateDetail(detail.productDetailId, { quantity: productDetail.quantity } as any);
    }
    await this.orderRepo.save(order);
    return this.findOneOrder(orderId);
  }

  async search(keyword: string): Promise<Order[]> {
    return this.orderRepo.createQueryBuilder('order')
      .leftJoinAndSelect('order.customer', 'customer')
      .where('order.orderCode LIKE :keyword', { keyword: `%${keyword}%` })
      .orWhere('customer.userId IN (SELECT id FROM users WHERE phone LIKE :keyword OR email LIKE :keyword)')
      .getMany();
  }

  async findOneByOrderItemId(orderItemId: number): Promise<Order> {
    const orderDetail = await this.orderDetailRepo.findOne({
      where: { id: orderItemId },
      relations: ['order'],
    });
    if (!orderDetail) {
      throw new NotFoundException('Order item not found');
    }
    return orderDetail.order;
  }

  async updatePaymentStatus(orderId: number, paymentStatus: PaymentStatus, transactionId?: string): Promise<Order> {
    const order = await this.findOneOrder(orderId);
    
    order.paymentStatus = paymentStatus;
    
    if (paymentStatus === PaymentStatus.PAID && order.orderStatus === OrderStatus.PENDING) {
      order.orderStatus = OrderStatus.CONFIRMED;
    }
    
    if (transactionId) {
      order.note = order.note 
        ? `${order.note} | Transaction: ${transactionId}` 
        : `Transaction: ${transactionId}`;
    }
    
    await this.orderRepo.save(order);
    return this.findOneOrder(orderId);
  }

  async findByOrderCode(orderCode: string): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { orderCode },
      relations: [
        'details',
        'details.product',
        'details.productDetail.images',  
        'details.productDetail'
      ]
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
}