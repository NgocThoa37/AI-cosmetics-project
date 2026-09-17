import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  // ✅ PUBLIC - Không cần login
  @Get()
  findAll() {
    return this.brandsService.findAll();
  }

  // ✅ PUBLIC - Không cần login
  @Get('search')
  search(@Query('keyword') keyword: string) {
    return this.brandsService.search(keyword);
  }

  // ✅ PUBLIC - Không cần login
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.brandsService.findOne(+id);
  }

  // ❌ PRIVATE - Chỉ ADMIN
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() createBrandDto: CreateBrandDto) {
    return this.brandsService.create(createBrandDto);
  }

  // ❌ PRIVATE - Chỉ ADMIN
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateBrandDto: UpdateBrandDto) {
    return this.brandsService.update(+id, updateBrandDto);
  }

  // ❌ PRIVATE - Chỉ ADMIN
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.brandsService.updateStatus(+id, status as any);
  }

  // ❌ PRIVATE - Chỉ ADMIN
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.brandsService.remove(+id);
  }
}