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

  // ========== PRODUCTS ==========
  
  @Get()
  findAll() { return this.service.findAllProducts(); }

  @Get('search')
  search(@Query('keyword') keyword: string) { return this.service.searchProducts(keyword); }

  @Get('status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  getStatusOptions() { return this.service.getStatusOptions(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOneProduct(id); }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  createProduct(@Body() dto: CreateProductDto) { return this.service.createProduct(dto); }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) { return this.service.updateProduct(id, dto); }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  removeProduct(@Param('id') id: string) { return this.service.removeProduct(id); }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  updateProductStatus(@Param('id') id: string, @Body() dto: UpdateProductStatusDto) {
    return this.service.updateProductStatus(id, dto.status);
  }

  // ========== PRODUCT DETAILS ==========

  @Get('details')
  findAllDetails() { return this.service.findAllDetails(); }

  @Post('details')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  createDetail(@Body() dto: CreateProductDetailDto) { return this.service.createDetail(dto); }

  @Get('details/:id')
  findOneDetail(@Param('id') id: string) { return this.service.findOneDetail(id); }

  @Patch('details/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  updateDetail(@Param('id') id: string, @Body() dto: UpdateProductDetailDto) { return this.service.updateDetail(id, dto); }

  @Delete('details/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  removeDetail(@Param('id') id: string) { return this.service.removeDetail(id); }

  // ========== IMAGES ==========

  @Get('images')
  findAllImages() { return this.service.findAllImages(); }

  @Post('images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  createImage(@Body() dto: CreateProductImageDto) { return this.service.createImage(dto); }

  @Patch('images/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  updateImage(@Param('id') id: string, @Body() dto: UpdateProductImageDto) { return this.service.updateImage(+id, dto); }

  @Delete('images/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  removeImage(@Param('id') id: string) { return this.service.removeImage(+id); }

  // ========== SIZES ==========

  @Get('sizes')
  getSizes() { return this.service.findAllSizes(); }

  @Get('sizes/search')
  searchSizes(@Query('keyword') keyword: string) { return this.service.searchSizes(keyword); }

  @Post('sizes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  createSize(@Body('name') name: string) { return this.service.createSize(name); }

  @Get('sizes/:id')
  findOneSize(@Param('id') id: string) { return this.service.findOneSize(+id); }

  @Patch('sizes/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  updateSize(@Param('id') id: string, @Body('name') name: string) { return this.service.updateSize(+id, name); }

  @Delete('sizes/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  deleteSize(@Param('id') id: string) { return this.service.deleteSize(+id); }

  // ========== COLORS ==========

  @Get('colors')
  getColors() { return this.service.findAllColors(); }

  @Get('colors/search')
  searchColors(@Query('keyword') keyword: string) { return this.service.searchColors(keyword); }

  @Post('colors')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  createColor(@Body() body: { name: string; code?: string; hexCode?: string }) {
    return this.service.createColor(body.name, body.code, body.hexCode);
  }

  @Get('colors/:id')
  findOneColor(@Param('id') id: string) { return this.service.findOneColor(+id); }

  @Patch('colors/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  updateColor(@Param('id') id: string, @Body() body: { name?: string; code?: string; hexCode?: string }) {
    return this.service.updateColor(+id, body);
  }

  @Delete('colors/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  deleteColor(@Param('id') id: string) { return this.service.deleteColor(+id); }
}