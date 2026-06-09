import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CartService } from './cart.service';
import { Cart } from './entities/cart.entity';
import { CartDetail } from './entities/cart-detail.entity';
import { CustomersService } from '../customers/customers.service';
import { ProductsService } from '../products/products.service';
import { BadRequestException } from '@nestjs/common';

const mockCartRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  getCart: jest.fn(),
};
const mockCartDetailRepo = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};
const mockCustomersService = { getOrCreateCustomer: jest.fn() };
const mockProductsService = {
  findOneDetail: jest.fn(),
  findOneProduct: jest.fn(),
  updateStock: jest.fn(),
};

describe('CartService', () => {
  let service: CartService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: getRepositoryToken(Cart), useValue: mockCartRepo },
        { provide: getRepositoryToken(CartDetail), useValue: mockCartDetailRepo },
        { provide: CustomersService, useValue: mockCustomersService },
        { provide: ProductsService, useValue: mockProductsService },
      ],
    }).compile();
    service = module.get<CartService>(CartService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should add to cart', async () => {
    const mockCart = { id: 1, customerId: 1, totalItems: 0, totalPrice: 0 };
    const mockCartAfter = { id: 1, customerId: 1, totalItems: 2, totalPrice: 200, details: [] };
    
    mockCartRepo.findOne.mockResolvedValueOnce(mockCart);
    mockProductsService.findOneDetail.mockResolvedValueOnce({ quantity: 10, productId: 'p1' });
    mockProductsService.findOneProduct.mockResolvedValueOnce({ price: 100 });
    mockCartDetailRepo.findOne.mockResolvedValueOnce(null);
    mockCartDetailRepo.create.mockReturnValue({});
    mockCartDetailRepo.save.mockResolvedValueOnce({});
    mockCartRepo.update.mockResolvedValueOnce({});
    
    // Mock getCart 
    jest.spyOn(service, 'getCart' as any).mockResolvedValueOnce(mockCartAfter);
    
    const result = await service.addToCart(1, { productDetailId: 'd1', quantity: 2 });
    
    expect(result).toBeDefined();
    expect(result.totalItems).toBe(2); 
    expect(mockProductsService.findOneDetail).toHaveBeenCalledWith('d1');
    expect(mockCartDetailRepo.save).toHaveBeenCalled();
    });

  it('should throw error if product out of stock', async () => {
    mockCartRepo.findOne.mockResolvedValueOnce({ id: 1, customerId: 1 });
    mockProductsService.findOneDetail.mockResolvedValueOnce({ quantity: 0 });
    
    await expect(service.addToCart(1, { productDetailId: 'd1', quantity: 2 }))
      .rejects.toThrow(BadRequestException);
  });
});