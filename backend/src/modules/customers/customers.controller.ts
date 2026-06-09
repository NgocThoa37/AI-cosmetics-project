import { Controller, Get, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@Controller('customers')
@UseGuards(JwtAuthGuard)  
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get('me')
  async getMyProfile(@Request() req) {
    const customer = await this.customersService.findByUserId(req.user.userId);
    return customer;
  }

  @Patch('me')
  async updateMyProfile(@Request() req, @Body() updateCustomerDto: UpdateCustomerDto) {
    const customer = await this.customersService.findByUserId(req.user.userId);
    return this.customersService.update(customer.id, updateCustomerDto);
  }

  @Delete('me')
  async deleteMyAccount(@Request() req) {
    const customer = await this.customersService.findByUserId(req.user.userId);
    await this.customersService.remove(customer.id);
    return { message: 'Account deleted' };
  }
  
  @Get()
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  findAll() {
    return this.customersService.findAll();
  }
  
  @Get(':id')
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(+id);
  }
}