import { Controller, Get, Patch, Param, Body, Delete, Post, Query, UnauthorizedException, BadRequestException, Res, Req, UseGuards  } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { Response } from 'express';
import { AdminGuard } from './guards/admin.guard';    

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly jwtService: JwtService,
  ) {}

  // ==================== LOGIN ====================
  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    const account = await this.adminService.findAccountByUsername(body.username);
    
    if (!account) {
      throw new UnauthorizedException('Sai tên đăng nhập hoặc mật khẩu');
    }
    
    const isPasswordValid = await bcrypt.compare(body.password, account.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Sai tên đăng nhập hoặc mật khẩu');
    }
    
    if (account.role !== 'admin' && account.role !== 'employee') {
      throw new UnauthorizedException('Tài khoản không có quyền truy cập');
    }
    
    const token = this.jwtService.sign(
      { sub: account.userId, username: account.username, role: account.role },
      { secret: process.env.JWT_ACCESS_SECRET!, expiresIn: '1d' }
    );
    
    const refreshToken = this.jwtService.sign(
      { sub: account.userId, username: account.username, role: account.role },
      { secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_ACCESS_SECRET, expiresIn: '7d' }
    );
    
    return { 
      accessToken: token,
      refreshToken: refreshToken,
      user: {
        id: account.userId,
        username: account.username,
        role: account.role,
      }
    };
  }

  // ==================== ACCOUNTS ====================
  @Get('accounts')
  getAllAccounts() {
    return this.adminService.getAllAccountsWithDetails();
  }

  @Post('accounts')
  createAccount(@Body() data: any) {
    return this.adminService.createAccount(data);
  }

  @Patch('accounts/:id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.adminService.updateAccountStatus(+id, status);
  }

  @Delete('accounts/:id')
  deleteAccount(@Param('id') id: string) {
    return this.adminService.deleteAccount(+id);
  }

  // ==================== EMPLOYEES ====================
  @Get('employees')
  getEmployees() {
    return this.adminService.getEmployees();
  }

  @Get('employees/:id')
  getEmployeeById(@Param('id') id: string) {
    return this.adminService.getEmployeeById(+id);
  }

  @Post('employees')
  createEmployee(@Body() data: any) {
    return this.adminService.createEmployee(data);
  }

  @Patch('employees/:id')
  updateEmployee(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateEmployee(+id, data);
  }

  @Delete('employees/:id')
  deleteEmployee(@Param('id') id: string) {
    return this.adminService.deleteEmployee(+id);
  }

  // ==================== CUSTOMERS ====================
  @Get('customers')
  getCustomers() {
    return this.adminService.getCustomers();
  }

  @Get('customers/:id')
  getCustomerById(@Param('id') id: string) {
    return this.adminService.getCustomerById(+id);
  }

  @Post('customers')
  createCustomer(@Body() data: any) {
    return this.adminService.createCustomer(data);
  }

  @Patch('customers/:id')
  updateCustomer(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateCustomer(+id, data);
  }

  @Delete('customers/:id')
  deleteCustomer(@Param('id') id: string) {
    return this.adminService.deleteCustomer(+id);
  }

  // ==================== CATEGORIES ====================
  @Get('categories')
  getCategories() {
    return this.adminService.getCategories();
  }

  @Get('categories/:id')
  getCategoryById(@Param('id') id: string) {
    return this.adminService.getCategoryById(+id);
  }

  @Post('categories')
  createCategory(@Body() data: any) {
    return this.adminService.createCategory(data);
  }

  @Patch('categories/:id')
  updateCategory(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateCategory(+id, data);
  }

  @Delete('categories/:id')
  deleteCategory(@Param('id') id: string) {
    return this.adminService.deleteCategory(+id);
  }

  // ==================== BRANDS ====================
  @Get('brands')
  getBrands() {
    return this.adminService.getBrands();
  }

  @Get('brands/:id')
  getBrandById(@Param('id') id: string) {
    return this.adminService.getBrandById(+id);
  }

  @Post('brands')
  createBrand(@Body() data: any) {
    return this.adminService.createBrand(data);
  }

  @Patch('brands/:id')
  updateBrand(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateBrand(+id, data);
  }

  @Delete('brands/:id')
  deleteBrand(@Param('id') id: string) {
    return this.adminService.deleteBrand(+id);
  }

  // ==================== COLORS ====================
  @Get('colors/all')
async getAllColors() {
  return this.adminService.getAllColors();
}

@Get('colors')
async getColors(
  @Query('page') page?: string,
  @Query('limit') limit?: string
) {
  return this.adminService.getColors(
    page ? parseInt(page, 10) : 1,
    limit ? parseInt(limit, 10) : 10
  );
}

@Get('colors/:id')
async getColorById(@Param('id') id: string) {
  const colorId = parseInt(id, 10);
  if (isNaN(colorId) || colorId <= 0) {
    throw new BadRequestException('Invalid color ID');
  }
  return this.adminService.getColorById(colorId);
}

@Post('colors')
createColor(@Body() data: { name: string; code: string }) {
  return this.adminService.createColor(data);
}

@Patch('colors/:id')
updateColor(@Param('id') id: string, @Body() data: { name?: string; code?: string }) {
  return this.adminService.updateColor(+id, data);
}

@Delete('colors/:id')
deleteColor(@Param('id') id: string) {
  return this.adminService.deleteColor(+id);
}

@Post('colors/delete-multiple')
deleteMultipleColors(@Body('ids') ids: number[]) {
  return this.adminService.deleteMultipleColors(ids);
}


  // ==================== SIZES ====================
  @Get('sizes/all')
async getAllSizes() {
  return this.adminService.getAllSizes();
}

@Get('sizes')
async getSizes(
  @Query('page') page?: string,
  @Query('limit') limit?: string
) {
  return this.adminService.getSizes(
    page ? parseInt(page, 10) : 1,
    limit ? parseInt(limit, 10) : 10
  );
}

@Get('sizes/:id')
async getSizeById(@Param('id') id: string) {
  const sizeId = parseInt(id, 10);
  if (isNaN(sizeId) || sizeId <= 0) {
    throw new BadRequestException('Invalid size ID');
  }
  return this.adminService.getSizeById(sizeId);
}

@Post('sizes')
createSize(@Body() data: { name: string; code?: string; sortOrder?: number }) {
  return this.adminService.createSize(data);
}

@Patch('sizes/:id')
updateSize(@Param('id') id: string, @Body() data: { name?: string; code?: string; sortOrder?: number }) {
  return this.adminService.updateSize(+id, data);
}

@Delete('sizes/:id')
deleteSize(@Param('id') id: string) {
  return this.adminService.deleteSize(+id);
}

@Post('sizes/delete-multiple')
deleteMultipleSizes(@Body('ids') ids: number[]) {
  return this.adminService.deleteMultipleSizes(ids);
}

@Post('sizes/reorder')
reorderSizes(@Body('orderIds') orderIds: number[]) {
  return this.adminService.reorderSizes(orderIds);
}

  // ==================== PRODUCTS ====================
  @Get('products')
  getProducts() {
    return this.adminService.getProducts();
  }

  @Get('products/:id')
  getProductById(@Param('id') id: string) {
    return this.adminService.getProductById(id);
  }

  @Get('products/:id/price')
  async getProductPrice(@Param('id') id: string) {
    return this.adminService.getProductPrice(id);
  }

  @Post('products')
  createProduct(@Body() data: any) {
    return this.adminService.createProduct(data);
  }

  @Patch('products/:id')
  updateProduct(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateProduct(id, data);
  }

  @Patch('products/:id/status')
  updateProductStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.adminService.updateProductStatus(id, status);
  }

  @Delete('products/:id')
  deleteProduct(@Param('id') id: string) {
    return this.adminService.deleteProduct(id);
  }

  // ==================== PRODUCT DETAILS ====================
  @Get('product-details')
  getProductDetails() {
    return this.adminService.getProductDetails();
  }

  @Get('product-details/:id')
  getProductDetailById(@Param('id') id: string) {
    return this.adminService.getProductDetailById(id);
  }

  @Post('product-details')
  createProductDetail(@Body() data: any) {
    return this.adminService.createProductDetail(data);
  }

  @Patch('product-details/:id')
  updateProductDetail(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateProductDetail(id, data);
  }

  @Patch('product-details/:id/quantity')
  updateProductQuantity(@Param('id') id: string, @Body('quantity') quantity: number) {
    return this.adminService.updateProductQuantity(id, quantity);
  }

  @Delete('product-details/:id')
  deleteProductDetail(@Param('id') id: string) {
    return this.adminService.deleteProductDetail(id);
  }

  // ==================== PRODUCT IMAGES ====================
  @Get('product-images')
  getProductImages() {
    return this.adminService.getProductImages();
  }

  @Get('product-images/:id')
  getProductImageById(@Param('id') id: string) {
    return this.adminService.getProductImageById(+id);
  }

  @Post('product-images')
  createProductImage(@Body() data: any) {
    return this.adminService.createProductImage(data);
  }

  @Patch('product-images/:id')
  updateProductImage(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateProductImage(+id, data);
  }

  @Delete('product-images/:id')
  deleteProductImage(@Param('id') id: string) {
    return this.adminService.deleteProductImage(+id);
  }

  // ==================== ORDERS ====================
  @Get('orders')
  getOrders() {
    return this.adminService.getOrders();
  }

  @Get('orders/:id')
  getOrderById(@Param('id') id: string) {
    return this.adminService.getOrderById(+id);
  }

  @Patch('orders/:id/status')
  @UseGuards(AdminGuard)
  updateOrderStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Req() req: any,
  ) {
    // ✅ THÊM LOG NÀY
    console.log('🔍 [Controller] ===== UPDATE ORDER STATUS =====');
    console.log('🔍 [Controller] id:', id);
    console.log('🔍 [Controller] status from body:', status);
    console.log('🔍 [Controller] userId:', req.user?.sub || req.user?.userId);
    console.log('🔍 [Controller] role:', req.user?.role);
    console.log('🔍 [Controller] =================================');
    
    const userId = req.user?.sub || req.user?.userId;
    const role = req.user?.role;
    
    return this.adminService.updateOrderStatus(+id, status, userId, role);
  }

    @Delete('orders/:id')
    deleteOrder(@Param('id') id: string) {
      return this.adminService.deleteOrder(+id);
    }

  @Post('orders/delete-multiple')
  deleteMultipleOrders(@Body('ids') ids: number[]) {
    return this.adminService.deleteMultipleOrders(ids);
  }

  // ==================== REVIEWS ====================
  @Get('reviews')
  getReviews() {
    return this.adminService.getReviews();
  }

  @Get('reviews/:id')
  getReviewById(@Param('id') id: string) {
    return this.adminService.getReviewById(+id);
  }

  @Post('reviews/:id/reply')
  replyToReview(@Param('id') id: string, @Body('replyText') replyText: string) {
    return this.adminService.replyToReview(+id, replyText);
  }

  @Delete('reviews/:id')
  deleteReview(@Param('id') id: string) {
    return this.adminService.deleteReview(+id);
  }

  // ==================== STATISTICS & REPORTS ====================
  @Get('statistics/best-sellers')
  getBestSellers(@Query('limit') limit?: string) {
    return this.adminService.getBestSellers(limit ? parseInt(limit) : 10);
  }

  @Get('statistics/revenue')
  getRevenueStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('groupBy') groupBy?: 'day' | 'week' | 'month' | 'year'
  ) {
    return this.adminService.getRevenueStats(startDate, endDate, groupBy);
  }

  @Get('statistics/orders')
  getOrderStats() {
    return this.adminService.getOrderStats();
  }

  @Get('statistics/customers')
  getCustomerStats() {
    return this.adminService.getCustomerStats();
  }

  @Get('statistics/export/excel')
  async exportRevenueExcel(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res({ passthrough: true }) res: Response,  
  ) {
    const buffer = await this.adminService.exportRevenueReportExcel(
      new Date(startDate), 
      new Date(endDate)
    );
    
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=doanh-thu-${new Date().toISOString().split('T')[0]}.xlsx`,
      'Content-Length': buffer.length,
    });
    
    return buffer; 
  }

  @Get('statistics/export/pdf')
  async exportRevenuePDF(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res({ passthrough: true }) res: Response,  
  ) {
    const buffer = await this.adminService.exportRevenueReportPDF(
      new Date(startDate), 
      new Date(endDate)
    );
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=doanh-thu-${new Date().toISOString().split('T')[0]}.pdf`,
      'Content-Length': buffer.length,
    });
    
    return buffer;  
  }

  @Get('accounts/search')
  findAccountByUsername(@Query('username') username: string) {
    return this.adminService.findAccountByUsername(username);
  }

  @Patch('accounts/:id/role')
  updateRole(@Param('id') id: string, @Body('role') role: string) {
    return this.adminService.updateAccountRole(+id, role as any);
  }

  @Patch('accounts/:id/toggle-lock')
  toggleAccountLock(@Param('id') id: string) {
    return this.adminService.toggleAccountLock(+id);
  }

  @Delete('orders/:id/force')
  forceDeleteOrder(@Param('id') id: string) {
    return this.adminService.forceDeleteOrder(+id);
  }
}