import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Request, Query, BadRequestException } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { CustomersService } from '../customers/customers.service';

@Controller('orders')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly customersService: CustomersService,
  ) {}

  // ========== CUSTOMER ROUTES (Cần login) ==========
  
  @Post()
  @UseGuards(JwtAuthGuard)
  async createOrder(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    console.log('🔍 [createOrder] userId:', req.user?.userId);
    
    const customer = await this.customersService.findByUserId(req.user.userId);
    console.log('🔍 [createOrder] customer:', customer);
    
    if (!customer) {
      throw new BadRequestException('Customer not found. Please contact support.');
    }
    
    return this.orderService.createOrder(customer.id, createOrderDto);
  }

  @Get('my-orders')
  @UseGuards(JwtAuthGuard)
  async getMyOrders(@Request() req) {
    const customer = await this.customersService.findByUserId(req.user.userId);
    console.log('🔍 [getMyOrders] customer:', customer);
    
    if (!customer) {
      return [];
    }
    return this.orderService.findByCustomer(customer.id);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  async cancelOrder(@Param('id') id: string, @Request() req, @Body('reason') reason: string) {
    const customer = await this.customersService.findByUserId(req.user.userId);
    if (!customer) {
      throw new BadRequestException('Customer not found');
    }
    return this.orderService.cancelOrderByCustomer(+id, customer.id, reason);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getOrder(@Param('id') id: string, @Request() req) {
    const customer = await this.customersService.findByUserId(req.user.userId);
    if (!customer) {
      throw new BadRequestException('Customer not found');
    }
    return this.orderService.findOneOrder(+id);
  }

  // ========== ADMIN/EMPLOYEE ROUTES ==========

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  findAll() {
    return this.orderService.findAll();
  }

  @Get('search')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  search(@Query('keyword') keyword: string) {
    return this.orderService.search(keyword);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto, @Request() req) {
    return this.orderService.updateStatus(+id, dto, req.user.userId, req.user.role);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  remove(@Param('id') id: string, @Request() req) {
    return this.orderService.updateStatus(+id, { orderStatus: 'cancelled' as any }, req.user.userId, req.user.role);
  }
}