import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException  } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Account } from '../auth/entities/account.entity';
import { Employee } from '../employees/entities/employee.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Product } from '../products/entities/product.entity';
import { ProductDetail } from '../products/entities/product-detail.entity';
import { ProductImage } from '../products/entities/product-image.entity';
import { Category } from '../categories/entities/category.entity';
import { Brand } from '../brands/entities/brand.entity';
import { Order } from '../order/entities/order.entity';
import { Review } from '../review/entities/review.entity';
import { Role } from '../auth/enums/role.enum';
import { OrderDetail } from '../order/entities/order-detail.entity';
import { OrderStatus, PaymentStatus, PaymentMethod  } from '../order/entities/order.entity';

import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { ReviewReply } from '../review/entities/review-reply.entity';
import { Color } from '../products/entities/color.entity';
import { Size } from '../products/entities/size.entity';
import { CreateAccountDto } from '../auth/dto/create-account.dto'; 
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(ReviewReply) private reviewReplyRepo: Repository<ReviewReply>,
    @InjectRepository(Account) private accountRepo: Repository<Account>,
    @InjectRepository(Employee) private employeeRepo: Repository<Employee>,
    @InjectRepository(Customer) private customerRepo: Repository<Customer>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(ProductDetail) private productDetailRepo: Repository<ProductDetail>,
    @InjectRepository(ProductImage) private productImageRepo: Repository<ProductImage>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    @InjectRepository(Brand) private brandRepo: Repository<Brand>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(Review) private reviewRepo: Repository<Review>,
    @InjectRepository(Color) private colorRepo: Repository<Color>,
    @InjectRepository(Size) private sizeRepo: Repository<Size>,
    @InjectRepository(OrderDetail) private orderDetailRepo: Repository<OrderDetail>,
  ) {}

  async findAccountByUsername(username: string) {
    return this.accountRepo.findOne({ 
      where: { username },
      relations: ['user']
    });
  }

  // ==================== ACCOUNTS ====================
  
  async createAccount(createAccountDto: CreateAccountDto) {
    // Kiểm tra username đã tồn tại chưa
    const existingAccount = await this.accountRepo.findOne({
      where: { username: createAccountDto.username }
    });
    if (existingAccount) {
      throw new ConflictException('Username already exists');
    }

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await this.userRepo.findOne({
      where: { email: createAccountDto.email }
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash(createAccountDto.password, 10);

    // Tạo user mới
    const userData: any = {
      fullName: createAccountDto.fullName,
      email: createAccountDto.email,
    };
    
    if (createAccountDto.phone) {
      userData.phone = createAccountDto.phone;
    }
    if (createAccountDto.avatar) {
      userData.avatar = createAccountDto.avatar;
    }
    
    const user = this.userRepo.create(userData);
    const savedUser = await this.userRepo.save(userData) as User;

    // Tạo account mới
    const account = this.accountRepo.create({
      username: createAccountDto.username,
      password: hashedPassword,
      role: createAccountDto.role || Role.CUSTOMER,
      status: createAccountDto.status || 'active',
      userId: savedUser.id,
    });
    const savedAccount = await this.accountRepo.save(account);

    // Nếu role là EMPLOYEE, tự động tạo employee record
    if (savedAccount.role === Role.EMPLOYEE) {
      const employee = this.employeeRepo.create({
        employeeCode: `EMP-${Date.now()}`, 
        hireDate: new Date(),
        userId: savedUser.id, 
      });
      await this.employeeRepo.save(employee);
    }

    // Nếu role là CUSTOMER, tự động tạo customer record
    if (savedAccount.role === Role.CUSTOMER) {
      const customer = this.customerRepo.create({
        loyaltyPoints: 0,
        userId: savedUser.id,
      } as any);
      await this.customerRepo.save(customer);
    }

    return {
      message: 'Account created successfully',
      account: {
        id: savedAccount.id,
        username: savedAccount.username,
        role: savedAccount.role,
        status: savedAccount.status,
        user: savedUser,
      }
    };
  }

  async updateAccountStatus(accountId: number, status: string) {
    const account = await this.accountRepo.findOne({
      where: { id: accountId },
      relations: ['user']
    });
    
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    
    // Không cho phép thay đổi trạng thái của admin
    if (account.role === Role.ADMIN) {
      throw new ConflictException('Cannot change status of admin account');
    }
    
    // Validation status hợp lệ
    const validStatuses = ['active', 'inactive', 'banned'];
    if (!validStatuses.includes(status)) {
      throw new ConflictException('Invalid status. Must be: active, inactive, banned');
    }
    
    account.status = status;
    await this.accountRepo.save(account);
    
    return {
      message: 'Account status updated successfully',
      account: {
        id: account.id,
        username: account.username,
        status: account.status,
        updatedAt: new Date()
      }
    };
  }

  async getAllAccountsWithDetails() {
    return this.accountRepo.find({ relations: ['user'], order: { createdAt: 'DESC' } });
  }

  async updateAccountRole(accountId: number, role: Role) {
    const account = await this.accountRepo.findOne({ where: { id: accountId } });
    if (!account) throw new Error('Account not found');
    const oldRole = account.role;
    account.role = role;
    await this.accountRepo.save(account);
    if (role === Role.EMPLOYEE && oldRole !== Role.EMPLOYEE) {
      const existing = await this.employeeRepo.findOne({ where: { userId: account.userId } });
      if (!existing) {
        const employee = this.employeeRepo.create({
          employeeCode: `EMP-${Date.now()}`,
          hireDate: new Date(),
          userId: account.userId,
        });
        await this.employeeRepo.save(employee);
      }
    }
    return { message: 'Role updated' };
  }

  async updateAccount(accountId: number, updateData: any) {
    const account = await this.accountRepo.findOne({
      where: { id: accountId },
      relations: ['user']
    });
    
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    
    // Không cho phép sửa role của ADMIN
    if (account.role === Role.ADMIN && updateData.role && updateData.role !== Role.ADMIN) {
      throw new ConflictException('Cannot change admin role');
    }
    
    // Cập nhật user info
    if (updateData.fullName || updateData.email || updateData.phone || updateData.avatar) {
      await this.userRepo.update(account.userId, {
        fullName: updateData.fullName,
        email: updateData.email,
        phone: updateData.phone,
        avatar: updateData.avatar,
      });
    }
    
    // Cập nhật account info
    if (updateData.role || updateData.status) {
      await this.accountRepo.update(accountId, {
        role: updateData.role,
        status: updateData.status,
      });
    }
    
    // Nếu cập nhật mật khẩu
    if (updateData.password) {
      const hashedPassword = await bcrypt.hash(updateData.password, 10);
      await this.accountRepo.update(accountId, { password: hashedPassword });
    }
    
    return this.accountRepo.findOne({
      where: { id: accountId },
      relations: ['user']
    });
  }

  async toggleAccountLock(accountId: number) {
    const account = await this.accountRepo.findOne({ where: { id: accountId } });
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    
    if (account.role === Role.ADMIN) {
      throw new ConflictException('Cannot lock admin account');
    }
    
    const newStatus = account.status === 'active' ? 'banned' : 'active';
    account.status = newStatus;
    await this.accountRepo.save(account);
    
    return {
      message: `Account ${newStatus === 'active' ? 'unlocked' : 'locked'} successfully`,
      status: newStatus
    };
  }

  async deleteAccount(accountId: number) {
    const account = await this.accountRepo.findOne({ where: { id: accountId } });
    if (account!.role === Role.ADMIN) throw new Error('Cannot delete admin account');
    await this.userRepo.delete(account!.userId);
    await this.accountRepo.delete(accountId);
    return { message: 'Account deleted' };
  }

  // ==================== EMPLOYEES ====================
  async getEmployees() {
    return this.employeeRepo.find({ relations: ['user'] });
  }

  async createEmployee(data: any) {
    const employee = this.employeeRepo.create(data);
    return this.employeeRepo.save(employee);
  }

  async updateEmployee(id: number, updateData: any) {
    const employee = await this.employeeRepo.findOne({
      where: { id },
      relations: ['user'],  // Chỉ lấy user, không lấy account
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // 🔥 1. Cập nhật Employee (employeeCode, position, hireDate)
    const employeeUpdate: any = {};
    if (updateData.employeeCode !== undefined) {
      employeeUpdate.employeeCode = updateData.employeeCode;
    }
    if (updateData.position !== undefined) {  // 🔥 CHỨC VỤ
      employeeUpdate.position = updateData.position;
    }
    if (updateData.hireDate !== undefined) {
      employeeUpdate.hireDate = updateData.hireDate;
    }

    // 🔥 2. Cập nhật User (fullName, phone, email) - KHÔNG CÓ role, status
    const userUpdate: any = {};
    if (updateData.fullName !== undefined) userUpdate.fullName = updateData.fullName;
    if (updateData.phone !== undefined) userUpdate.phone = updateData.phone;
    if (updateData.email !== undefined) userUpdate.email = updateData.email;

    // Cập nhật Employee
    if (Object.keys(employeeUpdate).length > 0) {
      await this.employeeRepo.update(id, employeeUpdate);
    }

    // Cập nhật User
    if (Object.keys(userUpdate).length > 0) {
      await this.userRepo.update(employee.userId, userUpdate);
    }

    return this.employeeRepo.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async deleteEmployee(id: number) {
    const employee = await this.employeeRepo.findOne({ where: { id } });
    if (!employee) throw new NotFoundException('Employee not found');
    await this.employeeRepo.delete(id);
    return { message: 'Employee deleted' };
  }

  // ==================== CATEGORIES ====================
  async getCategories() {
    return this.categoryRepo.find();
  }

  async createCategory(data: any) {
    const category = this.categoryRepo.create(data);
    return this.categoryRepo.save(category);
  }

  async updateCategory(id: number, data: any) {
    await this.categoryRepo.update(id, data);
    return this.categoryRepo.findOne({ where: { id } });
  }

  async deleteCategory(id: number) {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    await this.categoryRepo.delete(id);
    return { message: 'Category deleted' };
  }

  // ==================== PRODUCTS ====================
  async getProducts() {
    return this.productRepo.find({
      relations: ['category', 'brand', 'details'],  // ✅ THÊM 'details'
      order: { createdAt: 'DESC' },
    });
  }

  async getProductById(id: string) {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['category', 'brand', 'details'],
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async createProduct(data: any) {
    // Tự động tạo slug từ tên sản phẩm
    let slug = data.slug;
    if (!slug && data.name) {
      slug = this.generateSlug(data.name);
    }

    // 🔥 MAP DỮ LIỆU TỪ FE SANG ENTITY
    const product = this.productRepo.create({
      id: data.id || crypto.randomUUID(),
      name: data.name,
      slug: slug,
      categoryId: data.category_id || data.categoryId || null,
      brandId: data.brand_id || data.brandId || null,
      price: data.price || 0,
      status: data.status || 'active',
    });

    console.log('📤 Product created:', product);
    return this.productRepo.save(product);
  }

  // 🔥 THÊM HÀM TẠO SLUG
  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')  // Xóa dấu tiếng Việt
      .replace(/[^a-z0-9]+/g, '-')       // Thay khoảng trắng bằng -
      .replace(/^-+|-+$/g, '');          // Xóa - ở đầu và cuối
  }

  async updateProduct(id: string, data: any) {
    console.log('📥 [UPDATE] ID:', id);
    console.log('📥 [UPDATE] Data:', data);
    
    const product = await this.getProductById(id);
    console.log('👤 [UPDATE] Product found:', product?.name);
    
    // Nếu cập nhật tên, tự động cập nhật slug
    if (data.name && data.name !== product.name) {
      data.slug = this.generateSlug(data.name);
    }

    // ✅ MAP ĐÚNG FIELD - Dùng updateData object
    const updateData: any = {};
  
    if (data.name !== undefined) updateData.name = data.name;
    if (data.price !== undefined) updateData.price = Number(data.price);
    if (data.status !== undefined) updateData.status = data.status;
    if (data.slug !== undefined) updateData.slug = data.slug;
    
    // ✅ MAP category_id -> categoryId
    if (data.category_id !== undefined || data.categoryId !== undefined) {
      updateData.categoryId = data.category_id || data.categoryId || null;
    }
    
    // ✅ MAP brand_id -> brandId
    if (data.brand_id !== undefined || data.brandId !== undefined) {
      updateData.brandId = data.brand_id || data.brandId || null;
    }

    console.log('📤 [UPDATE] Update data:', updateData);
    
    // ✅ DÙNG update() - Cập nhật trực tiếp vào database
    await this.productRepo.update(id, updateData);
    
    // Lấy lại data mới
    const updated = await this.productRepo.findOne({
      where: { id },
      relations: ['category', 'brand'],
    });
    
    console.log('✅ [UPDATE] Updated:', updated);
    
    return updated;
  }

  async updateProductStatus(id: string, status: string) {
    await this.productRepo.update(id, { status: status as any });
    return { message: 'Status updated' };
  }

  async deleteProduct(id: string) {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    await this.productRepo.delete(id);
    return { message: 'Product deleted' };
  }

  // ==================== PRODUCT DETAILS ====================
  async getProductDetails() {
    return this.productDetailRepo.find({ relations: ['product', 'color', 'size'] });
  }

  async getProductPrice(id: string) {
    const product = await this.productRepo.findOne({
      where: { id },
      select: ['price'],
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return { price: product.price };
  }

  async createProductDetail(data: any) {
    const detail = this.productDetailRepo.create(data);
    return this.productDetailRepo.save(detail);
  }

  async updateProductDetail(id: string, data: any) {
    const detail = await this.productDetailRepo.findOne({
      where: { id },
      relations: ['product', 'color', 'size'],
    });

    if (!detail) {
      throw new NotFoundException('Product detail not found');
    }

    // Cập nhật các field hợp lệ
    if (data.sku !== undefined) detail.sku = data.sku;
    if (data.quantity !== undefined) detail.quantity = data.quantity;
    if (data.skinType !== undefined) detail.skinType = data.skinType;
    if (data.colorId !== undefined) detail.colorId = data.colorId;
    if (data.sizeId !== undefined) detail.sizeId = data.sizeId;
    if (data.description !== undefined) detail.description = data.description;
    if (data.ingredients !== undefined) detail.ingredients = data.ingredients;
    if (data.usage !== undefined) detail.usage = data.usage;
    if (data.benefits !== undefined) detail.benefits = data.benefits;
    if (data.storage !== undefined) detail.storage = data.storage;

    return this.productDetailRepo.save(detail);
  }

  async updateProductQuantity(productDetailId: string, quantity: number) {
    await this.productDetailRepo.update(productDetailId, { quantity });
    return { message: 'Product detail quantity updated' };
  }

  async deleteProductDetail(id: string) {
    const detail = await this.productDetailRepo.findOne({ where: { id } });
    if (!detail) throw new NotFoundException('Product detail not found');
    await this.productDetailRepo.delete(id);
    return { message: 'Product detail deleted' };
  }

  // ==================== PRODUCT IMAGES ====================
 async getProductImages() {
    console.log('📤 [GET] getProductImages');
    try {
      const images = await this.productImageRepo.find({
        relations: ['product'],
        order: { createdAt: 'DESC' },
      });
      console.log('✅ [GET] Found:', images.length, 'images');
      return images;
    } catch (error) {
      console.error('❌ [GET] Error:', error);
      throw error;
    }
  }

  async getProductImageById(id: number) {
    console.log('📤 [GET] getProductImageById:', id);
    try {
      const image = await this.productImageRepo.findOne({
        where: { id },
        relations: ['product'],
      });
      console.log('✅ [GET] Found image:', image);
      return image;
    } catch (error) {
      console.error('❌ [GET] Error:', error);
      throw error;
    }
  }

  async createProductImage(data: any) {
    console.log('🔥 [CREATE] Data received:', data);
    
    try {
      // Kiểm tra dữ liệu bắt buộc
      if (!data.productId) {
        throw new Error('productId is required');
      }
      if (!data.imageUrl) {
        throw new Error('imageUrl is required');
      }
      
      // ✅ DÙNG RAW QUERY - CHẮC CHẮN 100%
      const result = await this.productImageRepo.query(`
        INSERT INTO products_image (
          product_id, 
          product_detail_id, 
          image_url, 
          is_main, 
          display_order, 
          alt_text,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        data.productId,
        data.productDetailId || null,
        data.imageUrl,
        data.isMain ? 1 : 0,
        Number(data.displayOrder) || 0,
        data.altText || '',
      ]);
      
      console.log('✅ [CREATE] Insert result:', result);
      
      // Lấy lại bản ghi vừa tạo
      const savedImage = await this.productImageRepo.findOne({
        where: { id: result.insertId },
        relations: ['product'],
      });
      
      console.log('✅ [CREATE] Saved image:', savedImage);
      return savedImage;
    } catch (error) {
      console.error('❌ [CREATE] Error:', error);
      throw error;
    }
  }

  async updateProductImage(id: number, data: any) {
    console.log('🔥 [UPDATE] ID:', id, 'Data:', data);
    
    try {
      // ✅ FIX: Khai báo kiểu rõ ràng cho mảng
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      
      if (data.isMain !== undefined) {
        updateFields.push('is_main = ?');
        updateValues.push(data.isMain ? 1 : 0);
      }
      if (data.displayOrder !== undefined) {
        updateFields.push('display_order = ?');
        updateValues.push(Number(data.displayOrder) || 0);
      }
      if (data.altText !== undefined) {
        updateFields.push('alt_text = ?');
        updateValues.push(data.altText || '');
      }
      if (data.imageUrl !== undefined) {
        updateFields.push('image_url = ?');
        updateValues.push(data.imageUrl);
      }
      if (data.productId !== undefined) {
        updateFields.push('product_id = ?');
        updateValues.push(data.productId);
      }
      
      if (updateFields.length === 0) {
        console.warn('⚠️ [UPDATE] No fields to update');
        return this.productImageRepo.findOne({ 
          where: { id },
          relations: ['product'],
        });
      }
      
      updateFields.push('updated_at = NOW()');
      updateValues.push(id);
      
      const query = `
        UPDATE products_image 
        SET ${updateFields.join(', ')} 
        WHERE id = ?
      `;
      
      console.log('📝 [UPDATE] Query:', query);
      console.log('📝 [UPDATE] Values:', updateValues);
      
      await this.productImageRepo.query(query, updateValues);
      
      const updatedImage = await this.productImageRepo.findOne({
        where: { id },
        relations: ['product'],
      });
      
      console.log('✅ [UPDATE] Updated image:', updatedImage);
      return updatedImage;
    } catch (error) {
      console.error('❌ [UPDATE] Error:', error);
      throw error;
    }
  }

  async deleteProductImage(id: number) {
    console.log('🔥 [DELETE] ID:', id);
    
    try {
      const result = await this.productImageRepo.query(`
        DELETE FROM products_image WHERE id = ?
      `, [id]);
      
      console.log('✅ [DELETE] Result:', result);
      return { success: true, message: 'Xóa ảnh thành công' };
    } catch (error) {
      console.error('❌ [DELETE] Error:', error);
      throw error;
    }
  }

  // ==================== BRANDS ====================
  async getBrands() {
    return this.brandRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async getBrandById(id: number) {
    const brand = await this.brandRepo.findOne({ where: { id } });
    if (!brand) {
      throw new NotFoundException('Brand not found');
    }
    return brand;
  }

  async createBrand(data: any) {
    // 🔥 TỰ ĐỘNG SINH brandCode NẾU KHÔNG CÓ
    if (!data.brandCode) {
      const count = await this.brandRepo.count();
      data.brandCode = `BR${String(count + 1).padStart(3, '0')}`;
      console.log('📤 Tự động sinh brandCode:', data.brandCode);
    }

    console.log('📥 Dữ liệu nhận từ FE:', data);
    
    const brand = this.brandRepo.create(data);
    return this.brandRepo.save(brand);
  }

  async updateBrand(id: number, data: any) {
    const brand = await this.getBrandById(id);
    
    if (data.name !== undefined) brand.name = data.name;
    if (data.origin !== undefined) brand.origin = data.origin;
    if (data.status !== undefined) brand.status = data.status;
    
    return this.brandRepo.save(brand);
  }

  async deleteBrand(id: number) {
    const brand = await this.getBrandById(id);
    await this.brandRepo.delete(id);
    return { message: 'Brand deleted successfully' };
  }

  // ==================== ORDERS ====================
  async getOrders() {
    return this.orderRepo.find({ relations: ['customer', 'customer.user', 'details'] });
  }


  async deleteOrder(orderId: number) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['details']
    });
    
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    
    // Chỉ cho phép xóa đơn hàng có trạng thái pending hoặc cancelled
    if (order.orderStatus !== 'pending' && order.orderStatus !== 'cancelled') {
      throw new ConflictException(
        `Cannot delete order with status "${order.orderStatus}". Only pending or cancelled orders can be deleted.`
      );
    }
    
    // Kiểm tra quyền (ví dụ: không xóa đơn hàng quá 30 ngày)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    if (new Date(order.createdAt) < thirtyDaysAgo) {
      throw new ConflictException('Cannot delete orders older than 30 days');
    }
    
    // Xóa các order details trước (nếu có cascade chưa set)
    if (order.details && order.details.length > 0) {
      // Nếu bạn có repository cho OrderDetail, xóa ở đây
      // await this.orderDetailRepo.delete({ orderId: order.id });
    }
    
    // Xóa order
    await this.orderRepo.delete(orderId);
    
    return {
      message: 'Order deleted successfully',
      deletedOrder: {
        id: order.id,
        orderStatus: order.orderStatus,
        deletedAt: new Date()
      }
    };
  }

  // Xóa nhiều đơn hàng cùng lúc
  async deleteMultipleOrders(orderIds: number[]) {
    const results = {
      success: [] as number[],
      failed: [] as { id: number; reason: string }[]
    };
    
    for (const id of orderIds) {
      try {
        await this.deleteOrder(id);
        results.success.push(id);
      } catch (error: any) {
        results.failed.push({ id, reason: error.message });
      }
    }
    
    return {
      message: `Deleted ${results.success.length} orders, failed ${results.failed.length}`,
      results
    };
  }

  // Xóa vĩnh viễn đơn hàng (force delete, bỏ qua kiểm tra)
  async forceDeleteOrder(orderId: number) {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    
    await this.orderRepo.delete(orderId);
    
    return {
      message: 'Order permanently deleted',
      deletedOrderId: orderId
    };
  }

  // ==================== REVIEWS ====================
  async getReviews() {
    return this.reviewRepo.find({ 
      relations: [
        'customer', 
        'customer.user', 
        'product',
        'reply',
        'reply.employee',
        'reply.employee.user'
      ],
      order: { createdAt: 'DESC' }
    });
  }

  async replyToReview(id: number, replyText: string, employeeId: number = 1) {
    const review = await this.reviewRepo.findOne({ 
      where: { id },
      relations: ['reply']
    });
    
    if (!review) {
      throw new NotFoundException('Review not found');
    }

      let reply;
    if (review.reply) {
      // Cập nhật reply cũ
      await this.reviewReplyRepo.update(review.reply.id, {
        reply: replyText,
        repliedAt: new Date(),
        employeeId: employeeId,
      });
      reply = await this.reviewReplyRepo.findOne({ 
        where: { id: review.reply.id } 
      });
    } else {
      // Tạo reply mới
      reply = this.reviewReplyRepo.create({
        reviewId: id,
        reply: replyText,
        repliedAt: new Date(),
        employeeId: employeeId,
      });
      await this.reviewReplyRepo.save(reply);
      
      // 🔥 Gán reply vào review
      review.reply = reply;
      await this.reviewRepo.save(review);
    }

    return this.reviewRepo.findOne({ 
      where: { id },
      relations: [
        'customer', 
        'customer.user', 
        'product',
        'reply',
        'reply.employee',
        'reply.employee.user'
      ]
    });
  }

    async deleteReview(id: number) {
    // Xóa cả reply (nếu có)
    const review = await this.reviewRepo.findOne({ 
      where: { id },
      relations: ['reply']
    });
    
    if (review?.reply) {
      await this.reviewReplyRepo.delete(review.reply.id);
    }
    
    await this.reviewRepo.delete(id);
    return { message: 'Review deleted' };
  }


  // ==================== STATISTICS ====================
  async getBestSellers(limit: number = 10) {
    const products = await this.productRepo.find({
      order: { totalSold: 'DESC' },
      take: limit,
    });
    
    return products.map(product => ({
      id: product.id,
      name: product.name,
      totalSold: product.totalSold || 0,
      price: product.price || 0,
      revenue: (product.totalSold || 0) * (product.price || 0),
    }));
  }

 async getRevenueStats(startDate?: string, endDate?: string, groupBy?: 'day' | 'week' | 'month' | 'year') {
  const query = this.orderRepo.createQueryBuilder('order')
    .where('order.orderStatus = :status', { status: 'delivered' });
  
  if (startDate) {
    query.andWhere('order.createdAt >= :startDate', { startDate: new Date(startDate) });
  }
  if (endDate) {
    query.andWhere('order.createdAt <= :endDate', { endDate: new Date(endDate) });
  }
  
  const orders = await query.getMany();
  
  // Nếu không có đơn hàng nào, trả về mảng rỗng
  if (orders.length === 0) {
    return [];
  }
  
  const revenueMap = new Map<string, number>();
  const orderCountMap = new Map<string, number>();
  
  orders.forEach(order => {
    let key: string;
    const date = new Date(order.createdAt);
    if (groupBy === 'day') key = date.toISOString().split('T')[0];
    else if (groupBy === 'week') key = `${date.getFullYear()}-W${this.getWeekNumber(date)}`;
    else if (groupBy === 'month') key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    else key = `${date.getFullYear()}`;
    
    const currentRevenue = revenueMap.get(key) || 0;
    revenueMap.set(key, currentRevenue + Number(order.totalAmount));
    
    const currentOrders = orderCountMap.get(key) || 0;
    orderCountMap.set(key, currentOrders + 1);
  });
  
  const allKeys = new Set([...revenueMap.keys(), ...orderCountMap.keys()]);
  return Array.from(allKeys)
    .map(period => ({
      period,
      revenue: revenueMap.get(period) || 0,
      orders: orderCountMap.get(period) || 0,
    }))
    .sort((a, b) => a.period.localeCompare(b.period)); // ✅ SẮP XẾP THEO THỜI GIAN
}

  private getWeekNumber(date: Date): number {
    const firstJan = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date.getTime() - firstJan.getTime()) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + firstJan.getDay() + 1) / 7);
  }

  async getOrderStats() {
    const totalOrders = await this.orderRepo.count();
    const pendingOrders = await this.orderRepo.count({ where: { orderStatus: 'pending' as any } });
    const deliveredOrders = await this.orderRepo.count({ where: { orderStatus: 'delivered' as any } });
    const cancelledOrders = await this.orderRepo.count({ where: { orderStatus: 'cancelled' as any } });
    return { totalOrders, pendingOrders, deliveredOrders, cancelledOrders };
  }

  async getCustomerStats() {
    const totalCustomers = await this.customerRepo.count();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newCustomers = await this.customerRepo.count({ where: { createdAt: Between(thirtyDaysAgo, new Date()) } });
    return { totalCustomers, newCustomersLast30Days: newCustomers };
  }

  async exportRevenueReportExcel(startDate: Date, endDate: Date): Promise<Buffer> {
    const revenueData = await this.getRevenueStats(startDate.toISOString(), endDate.toISOString(), 'day');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Revenue Report');
    worksheet.columns = [
      { header: 'Date', key: 'period', width: 20 },
      { header: 'Revenue (VND)', key: 'revenue', width: 20 },
    ];
    revenueData.forEach(item => worksheet.addRow(item));
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async exportRevenueReportPDF(startDate: Date, endDate: Date): Promise<Buffer> {
    const revenueData = await this.getRevenueStats(startDate.toISOString(), endDate.toISOString(), 'day');
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.fontSize(18).text('Revenue Report', { align: 'center' });
    doc.fontSize(12).text(`From ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`, { align: 'center' });
    doc.moveDown();
    revenueData.forEach(item => {
      doc.text(`${item.period}: ${item.revenue.toLocaleString('vi-VN')} VND`);
    });
    doc.end();
    return new Promise(resolve => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }


  // Lấy danh sách màu sắc (đã có, nhưng thêm phân trang)
  async getColors(page: number = 1, limit: number = 10) {
    const [colors, total] = await this.colorRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { name: 'ASC' }
    });
    
    return {
      data: colors,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Lấy màu sắc theo ID
  async getColorById(id: number) {
  // ✅ THÊM VALIDATION
  if (!id || isNaN(id) || id <= 0) {
    throw new BadRequestException('Invalid color ID');
  }
  
  const color = await this.colorRepo.findOne({ where: { id } });
  if (!color) {
    throw new NotFoundException(`Color with ID ${id} not found`);
  }
  return color;
}

  // Thêm màu sắc mới
  async createColor(data: { name: string; code: string }) {
    // Kiểm tra tên màu đã tồn tại chưa
    const existingColor = await this.colorRepo.findOne({
      where: { name: data.name }
    });
    if (existingColor) {
      throw new ConflictException(`Color with name "${data.name}" already exists`);
    }
    
    // Kiểm tra mã màu đã tồn tại chưa
    const existingCode = await this.colorRepo.findOne({
      where: { code: data.code }
    });
    if (existingCode) {
      throw new ConflictException(`Color code "${data.code}" already exists`);
    }
    
    const color = this.colorRepo.create({
      name: data.name,
      code: data.code
    });
    
    const savedColor = await this.colorRepo.save(color);
    
    return {
      message: 'Color created successfully',
      color: savedColor
    };
  }

  // Cập nhật màu sắc
  async updateColor(id: number, data: { name?: string; code?: string }) {
    const color = await this.colorRepo.findOne({ where: { id } });
      if (!color) {
        throw new NotFoundException(`Color with ID ${id} not found`);
      }
      
      // Kiểm tra tên mới không trùng với màu khác
      if (data.name && data.name !== color.name) {
        const existingColor = await this.colorRepo.findOne({
          where: { name: data.name }
        });
        if (existingColor) {
          throw new ConflictException(`Color with name "${data.name}" already exists`);
        }
    }
    
    // Kiểm tra mã mới không trùng với màu khác
    if (data.code && data.code !== color.code) {
      const existingCode = await this.colorRepo.findOne({
        where: { code: data.code }
      });
      if (existingCode) {
        throw new ConflictException(`Color code "${data.code}" already exists`);
      }
    }
  
    await this.colorRepo.update(id, data);
    
      return {
        message: 'Color updated successfully',
        color: await this.colorRepo.findOne({ where: { id } })
      };
  }

  // Xóa màu sắc (có kiểm tra ràng buộc)
  async deleteColor(id: number) {
    const color = await this.colorRepo.findOne({
      where: { id },
      relations: ['productDetails'] // Giả sử có relation này
    });
    
    if (!color) {
      throw new NotFoundException(`Color with ID ${id} not found`);
    }
    
    // Kiểm tra xem màu có đang được sử dụng trong product details không
    if (color.productDetails && color.productDetails.length > 0) {
      throw new ConflictException(
        `Cannot delete color "${color.name}" because it is being used by ${color.productDetails.length} product(s)`
      );
    }
    
    await this.colorRepo.delete(id);
    
    return {
      message: `Color "${color.name}" deleted successfully`,
      deletedColor: color
    };
  }

  // Xóa nhiều màu
  async deleteMultipleColors(ids: number[]) {
    const results = {
      success: [] as number[],
      failed: [] as { id: number; reason: string }[]
    };
    
    for (const id of ids) {
      try {
        await this.deleteColor(id);
        results.success.push(id);
      } catch (error: any) {
        results.failed.push({ id, reason: error.message });
      }
    }
    
    return {
      message: `Deleted ${results.success.length} colors, failed ${results.failed.length}`,
      results
    };
  }

  // Lấy danh sách kích thước
async getSizes(page: number = 1, limit: number = 10) {
  const [sizes, total] = await this.sizeRepo.findAndCount({
    skip: (page - 1) * limit,
    take: limit,
    order: { name: 'ASC' } as any
  });
  
  return {
    data: sizes,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
}

  // Lấy kích thước theo ID
  async getSizeById(id: number) {
    if (!id || isNaN(id) || id <= 0) {
      throw new BadRequestException('Invalid size ID');
    }
    
    const size = await this.sizeRepo.findOne({ where: { id } });
    if (!size) {
      throw new NotFoundException(`Size with ID ${id} not found`);
    }
    return size;
  }

  async createSize(data: { name: string; code?: string; sortOrder?: number }) {
    // Kiểm tra tên size đã tồn tại
    const existingSize = await this.sizeRepo.findOne({
      where: { name: data.name } as any
    });
    if (existingSize) {
      throw new ConflictException(`Size "${data.name}" already exists`);
    }
    
    // Kiểm tra code nếu có
    if (data.code) {
      const existingCode = await this.sizeRepo.findOne({
        where: { code: data.code } as any
      });
      if (existingCode) {
        throw new ConflictException(`Size code "${data.code}" already exists`);
      }
    }
    
    const size = this.sizeRepo.create({
      name: data.name,
      code: data.code || data.name.toUpperCase(),
      sortOrder: data.sortOrder || 0
    } as any);
    
    const savedSize = await this.sizeRepo.save(size);
    
    return {
      message: 'Size created successfully',
      size: savedSize
    };
  }

  // Cập nhật kích thước
  async updateSize(id: number, data: { name?: string; code?: string; sortOrder?: number }) {
    const size = await this.sizeRepo.findOne({ where: { id } });
    if (!size) {
      throw new NotFoundException(`Size with ID ${id} not found`);
    }
    
    // Kiểm tra tên mới
    if (data.name && data.name !== size.name) {
      const existingSize = await this.sizeRepo.findOne({
        where: { name: data.name }
      });
      if (existingSize) {
        throw new ConflictException(`Size "${data.name}" already exists`);
      }
    }
    
    // Kiểm tra code mới
    if (data.code && data.code !== (size as any).code) {
      const existingCode = await this.sizeRepo.findOne({
        where: { code: data.code } as any
      });
      if (existingCode) {
        throw new ConflictException(`Size code "${data.code}" already exists`);
      }
    }
    
    await this.sizeRepo.update(id, data);
    
    return {
      message: 'Size updated successfully',
      size: await this.sizeRepo.findOne({ where: { id } })
    };
  }

  // Xóa kích thước
  async deleteSize(id: number) {
    const size = await this.sizeRepo.findOne({
      where: { id },
      relations: ['productDetails'] // Giả sử có relation này
    });
    
    if (!size) {
      throw new NotFoundException(`Size with ID ${id} not found`);
    }
    
    // Kiểm tra xem size có đang được sử dụng không
    if (size.productDetails && size.productDetails.length > 0) {
      throw new ConflictException(
        `Cannot delete size "${size.name}" because it is being used by ${size.productDetails.length} product(s)`
      );
    }
    
    await this.sizeRepo.delete(id);
    
    return {
      message: `Size "${size.name}" deleted successfully`,
      deletedSize: size
    };
  }

  // Xóa nhiều kích thước
  async deleteMultipleSizes(ids: number[]) {
    const results = {
      success: [] as number[],
      failed: [] as { id: number; reason: string }[]
    };
    
    for (const id of ids) {
      try {
        await this.deleteSize(id);
        results.success.push(id);
      } catch (error: any) {
        results.failed.push({ id, reason: error.message });
      }
    }
    
    return {
      message: `Deleted ${results.success.length} sizes, failed ${results.failed.length}`,
      results
    };
  }

  // Sắp xếp lại thứ tự kích thước
  async reorderSizes(orderIds: number[]) {
    for (let i = 0; i < orderIds.length; i++) {
      await this.sizeRepo.update(orderIds[i], { sortOrder: i } as any);
    }
    
    return {
      message: 'Sizes reordered successfully',
      sizes: await this.sizeRepo.find({ order: { name: 'ASC' } as any })
    };
  }

  // ==================== CUSTOMERS ====================
  async getCustomers() {
    return this.customerRepo.find({ relations: ['user'] });
  }

  async getCustomerById(id: number) {
    const customer = await this.customerRepo.findOne({ 
      where: { id }, 
      relations: ['user'] 
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async createCustomer(data: any) {
  const user = await this.userRepo.findOne({ where: { id: data.userId } });
  if (!user) throw new NotFoundException('User not found');
  
  const customer = this.customerRepo.create({
      userId: data.userId,
    } as any)
    return this.customerRepo.save(customer);
  }

  async updateCustomer(id: number, data: any) {
    await this.customerRepo.update(id, data);
    return this.customerRepo.findOne({ where: { id }, relations: ['user'] });
  }

  async deleteCustomer(id: number) {
    const customer = await this.customerRepo.findOne({ where: { id } });
    if (!customer) throw new NotFoundException('Customer not found');
    await this.customerRepo.delete(id);
    return { message: 'Customer deleted' };
  }

  async getEmployeeById(id: number) {
    const employee = await this.employeeRepo.findOne({ 
      where: { id }, 
      relations: ['user'] 
    });
    if (!employee) throw new NotFoundException('Employee not found');
    return employee;
  }

  async getCategoryById(id: number) {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async getProductDetailById(id: string) {
    const detail = await this.productDetailRepo.findOne({ 
      where: { id }, 
      relations: ['product', 'color', 'size'] 
    });
    if (!detail) throw new NotFoundException('Product detail not found');
    return detail;
  }

  async getOrderById(id: number) {
    const order = await this.orderRepo.findOne({ 
      where: { id }, 
      relations: [
        'customer', 
        'customer.user', 
        'details',
        'details.product',           // ✅ THÊM
        'details.productDetail',      // ✅ THÊM
        'details.productDetail.product', // ✅ THÊM
        'details.productDetail.color',
        'details.productDetail.size',
      ] 
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

 async updateOrderStatus(
  id: number, 
  status: string, 
  userId: number,
  role: string
) {
  console.log('🔍 [Service] updateOrderStatus');
  console.log('🔍 id:', id);
  console.log('🔍 status:', status);

  const order = await this.orderRepo.findOne({ 
    where: { id },
    relations: ['details', 'details.productDetail']
  });
  
  if (!order) {
    throw new NotFoundException('Không tìm thấy đơn hàng');
  }

  // ✅ Xác định phương thức thanh toán KHÔNG cần thanh toán trước
  const isOfflinePayment = order.paymentMethod === PaymentMethod.COD || 
                           order.paymentMethod === PaymentMethod.BANKING;

  const paidRequiredStatuses = ['confirmed', 'processing', 'shipped', 'delivered'];
  
  if (paidRequiredStatuses.includes(status.toLowerCase())) {
    if (!isOfflinePayment && order.paymentStatus !== PaymentStatus.PAID) {
      throw new BadRequestException(
        `Không thể cập nhật đơn hàng thành "${status}" vì đơn hàng chưa được thanh toán. ` +
        `Trạng thái thanh toán hiện tại: ${order.paymentStatus}`
      );
    }
  }

  // ✅ Xử lý hủy đơn
  if (status.toLowerCase() === 'cancelled') {
    if (order.orderStatus === OrderStatus.DELIVERED) {
      throw new BadRequestException('Không thể hủy đơn hàng đã giao thành công');
    }
    
    if (order.orderStatus !== OrderStatus.CANCELLED) {
      for (const detail of order.details) {
        if (detail.productDetailId) {
          const productDetail = await this.productDetailRepo.findOne({
            where: { id: detail.productDetailId }
          });
          if (productDetail) {
            productDetail.quantity += detail.quantity;
            await this.productDetailRepo.save(productDetail);
          }
        }
      }
    }
  }

  // ✅ Cập nhật orderStatus
  await this.orderRepo.update(id, { orderStatus: status as any });
  
  // ✅ Nếu là COD hoặc Banking và giao hàng thành công, tự động chuyển paymentStatus thành PAID
  if (status === 'delivered' && isOfflinePayment) {
    await this.orderRepo.update(id, { paymentStatus: PaymentStatus.PAID });
  }
  
  if (status === 'delivered') {
    await this.updateProductTotalSold();
  }
  
  const updatedOrder = await this.getOrderById(id);
  
  return { 
    message: 'Cập nhật trạng thái đơn hàng thành công',
    order: updatedOrder
  };
}

// ✅ THÊM METHOD MỚI: Cập nhật total_sold cho tất cả sản phẩm
async updateProductTotalSold() {
  // Lấy tất cả order_detail của đơn hàng đã giao
  const orderDetails = await this.orderDetailRepo
    .createQueryBuilder('od')
    .leftJoin('od.order', 'o')
    .where('o.orderStatus = :status', { status: 'delivered' })
    .select('od.product_id', 'product_id')
    .addSelect('SUM(od.quantity)', 'totalSold')
    .groupBy('od.product_id')
    .getRawMany();

  // Cập nhật total_sold cho từng sản phẩm
  for (const item of orderDetails) {
    if (item.product_id) {
      await this.productRepo.update(
        { id: item.product_id },
        { totalSold: parseInt(item.totalSold) || 0 }
      );
    }
  }

  // ✅ RESET total_sold = 0 cho sản phẩm không có đơn hàng nào
  await this.productRepo
    .createQueryBuilder()
    .update(Product)
    .set({ totalSold: 0 })
    .where('id NOT IN (SELECT DISTINCT product_id FROM order_detail WHERE product_id IS NOT NULL)')
    .execute();
}

  async getReviewById(id: number) {
    const review = await this.reviewRepo.findOne({ 
      where: { id }, 
      relations: ['customer', 'customer.user', 'product'] 
    });
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  async getAllColors() {
    try {
      const colors = await this.colorRepo.find({ 
        order: { name: 'ASC' } 
      });
      return colors;
    } catch (error) {
      console.error('Error in getAllColors:', error);
      return [];
    }
  }

  async getAllSizes() {
    return this.sizeRepo.find({ order: { name: 'ASC' } });
  }
  

}