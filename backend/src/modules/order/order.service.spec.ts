import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrderService } from './order.service';
import { Order, PaymentMethod } from './entities/order.entity';
import { OrderDetail } from './entities/order-detail.entity';
import { CustomersService } from '../customers/customers.service';
import { ProductsService } from '../products/products.service';
import { CartService } from '../cart/cart.service';
import { BadRequestException } from '@nestjs/common';

describe('OrderService', () => {
  let service: OrderService;

  const mockOrderRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };
  const mockOrderDetailRepo = { create: jest.fn(), save: jest.fn() };
  const mockCartService = { getCart: jest.fn(), clearCart: jest.fn() };
  const mockProductsService = { findOneDetail: jest.fn(), findOneProduct: jest.fn(), updateStock: jest.fn() };
  const mockCustomersService = { updateTotals: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: getRepositoryToken(Order), useValue: mockOrderRepo },
        { provide: getRepositoryToken(OrderDetail), useValue: mockOrderDetailRepo },
        { provide: CustomersService, useValue: mockCustomersService },
        { provide: ProductsService, useValue: mockProductsService },
        { provide: CartService, useValue: mockCartService },
      ],
    }).compile();
    service = module.get<OrderService>(OrderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw if cart empty', async () => {
    mockCartService.getCart.mockResolvedValueOnce({ details: [] });
    await expect(service.createOrder(1, { shippingAddress: 'addr', shippingPhone: '123', paymentMethod: PaymentMethod.COD }))
      .rejects.toThrow(BadRequestException);
  });
});