import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { CustomersService } from '../customers/customers.service';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService,
  private readonly customersService: CustomersService,
  ) {}

  // ========== CUSTOMER ROUTES ==========
  
  @Post()
  async createOrder(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    const customer = await this.customersService.findByUserId(req.user.userId);
    return this.orderService.createOrder(customer.id, createOrderDto);
  }

  @Get('my-orders')
  async getMyOrders(@Request() req) {
    const customer = await this.customersService.findByUserId(req.user.userId);
    console.log('Customer found:', customer);  
    console.log('Customer ID:', customer.id); 
    return this.orderService.findByCustomer(customer.id);  
  }

  @Patch(':id/cancel')
  async cancelOrder(@Param('id') id: string, @Request() req, @Body('reason') reason: string) {
    const customer = await this.customersService.findByUserId(req.user.userId);
    return this.orderService.cancelOrderByCustomer(+id, customer.id, reason);  // 👈 customer.id = 1
  }

  @Get(':id')                
  getOrder(@Param('id') id: string) {
    return this.orderService.findOneOrder(+id);
  }

  // ========== ADMIN/EMPLOYEE ROUTES ==========

  @Get()
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  @UseGuards(RolesGuard)
  findAll() {
    return this.orderService.findAll();
  }

  @Get('search')           
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  @UseGuards(RolesGuard)
  search(@Query('keyword') keyword: string) {
    return this.orderService.search(keyword);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  @UseGuards(RolesGuard)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto, @Request() req) {
    return this.orderService.updateStatus(+id, dto, req.user.userId, req.user.role);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  @UseGuards(RolesGuard)
  remove(@Param('id') id: string, @Request() req) {
    return this.orderService.updateStatus(+id, { orderStatus: 'cancelled' as any }, req.user.userId, req.user.role);
  }
}