import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateProductDetailDto } from './dto/create-product-detail.dto';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateProductDetailDto } from './dto/update-product-detail.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { UpdateProductStatusDto } from './dto/update-product-status.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  // ========== PRODUCTS - GET (CỤ THỂ TRƯỚC, :id SAU) ==========
  
  // 1. Lấy danh sách sản phẩm (có phân trang)
  @Get()
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '12',
    @Query('category') category?: string,
    @Query('brand') brand?: string,
    @Query('search') search?: string,
  ) {
    return this.service.findAllProducts(
      parseInt(page, 10),
      parseInt(limit, 10),
      category,
      brand,
      search,
    );
  }

  // 2. Tìm kiếm sản phẩm
  @Get('search')
  search(@Query('keyword') keyword: string) {
    return this.service.searchProducts(keyword);
  }

  // 3. Lấy danh sách trạng thái
  @Get('status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  getStatusOptions() {
    return this.service.getStatusOptions();
  }

  // 4. Lấy sản phẩm bán chạy
  @Get('best-sellers')
  getBestSellers(@Query('limit') limit: string = '8') {
    return this.service.getBestSellers(parseInt(limit, 10));
  }

  // 5. Lấy danh sách màu sắc
  @Get('colors')
  getColors() {
    return this.service.findAllColors();
  }

  // 6. Lấy danh sách kích thước
  @Get('sizes')
  getSizes() {
    return this.service.findAllSizes();
  }

  // 7. Lấy danh sách chi tiết sản phẩm
  @Get('details')
  findAllDetails() {
    return this.service.findAllDetails();
  }

  // 8. Lấy danh sách ảnh sản phẩm
  @Get('images')
  findAllImages() {
    return this.service.findAllImages();
  }

  // 9. Tìm kiếm màu sắc
  @Get('colors/search')
  searchColors(@Query('keyword') keyword: string) {
    return this.service.searchColors(keyword);
  }

  // 10. Tìm kiếm kích thước
  @Get('sizes/search')
  searchSizes(@Query('keyword') keyword: string) {
    return this.service.searchSizes(keyword);
  }

  // 11. Lấy chi tiết ảnh theo ID
  @Get('images/:id')
  findImage(@Param('id') id: string) {
    return this.service.findImage(+id);
  }
  // ❌ ROUTE :id - ĐẶT CUỐI CÙNG
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOneProduct(id);
  }

  // ========== PRODUCTS - POST ==========
  
  // Tạo sản phẩm mới
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  createProduct(@Body() dto: CreateProductDto) {
    return this.service.createProduct(dto);
  }

  // Tạo chi tiết sản phẩm
  @Post('details')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  createDetail(@Body() dto: CreateProductDetailDto) {
    return this.service.createDetail(dto);
  }

  // Tạo ảnh sản phẩm
  @Post('images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  createImage(@Body() dto: CreateProductImageDto) {
    return this.service.createImage(dto);
  }

  // Tạo kích thước
  @Post('sizes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  createSize(@Body('name') name: string) {
    return this.service.createSize(name);
  }

  // Tạo màu sắc
  @Post('colors')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  createColor(@Body() body: { name: string; code?: string; hexCode?: string }) {
    return this.service.createColor(body.name, body.code, body.hexCode);
  }

  // ========== PRODUCTS - PATCH ==========

  // Cập nhật sản phẩm
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.service.updateProduct(id, dto);
  }

  // Cập nhật trạng thái sản phẩm
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  updateProductStatus(@Param('id') id: string, @Body() dto: UpdateProductStatusDto) {
    return this.service.updateProductStatus(id, dto.status);
  }

  // Cập nhật chi tiết sản phẩm
  @Patch('details/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  updateDetail(@Param('id') id: string, @Body() dto: UpdateProductDetailDto) {
    return this.service.updateDetail(id, dto);
  }

  // Cập nhật ảnh sản phẩm
  @Patch('images/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  updateImage(@Param('id') id: string, @Body() dto: UpdateProductImageDto) {
    return this.service.updateImage(+id, dto);
  }

  // Cập nhật kích thước
  @Patch('sizes/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  updateSize(@Param('id') id: string, @Body('name') name: string) {
    return this.service.updateSize(+id, name);
  }

  // Cập nhật màu sắc
  @Patch('colors/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  updateColor(@Param('id') id: string, @Body() body: { name?: string; code?: string; hexCode?: string }) {
    return this.service.updateColor(+id, body);
  }

  // ========== PRODUCTS - DELETE ==========

  // Xóa sản phẩm
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  removeProduct(@Param('id') id: string) {
    return this.service.removeProduct(id);
  }

  // Xóa chi tiết sản phẩm
  @Delete('details/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  removeDetail(@Param('id') id: string) {
    return this.service.removeDetail(id);
  }

  // Xóa ảnh sản phẩm
  @Delete('images/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  removeImage(@Param('id') id: string) {
    return this.service.removeImage(+id);
  }

  // Xóa kích thước
  @Delete('sizes/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  deleteSize(@Param('id') id: string) {
    return this.service.deleteSize(+id);
  }

  // Xóa màu sắc
  @Delete('colors/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  deleteColor(@Param('id') id: string) {
    return this.service.deleteColor(+id);
  }

  // ========== ROUTE CÓ PARAM :id - ĐẶT CUỐI CÙNG ==========
  @Get('details/:id')
  findOneDetail(@Param('id') id: string) {
    return this.service.findOneDetail(id);
  }

  @Get('colors/:id')
  findOneColor(@Param('id') id: string) {
    return this.service.findOneColor(+id);
  }

  @Get('sizes/:id')
  findOneSize(@Param('id') id: string) {
    return this.service.findOneSize(+id);
  }
}