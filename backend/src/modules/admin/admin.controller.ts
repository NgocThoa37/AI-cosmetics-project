import { Controller, Get, Patch, Param, Body, Delete, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('accounts')
  getAllAccounts() {
    return this.adminService.getAllAccountsWithDetails();
  }

  @Patch('accounts/:id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.adminService.updateAccountStatus(+id, status);
  }

  @Patch('accounts/:id/role')
  updateRole(@Param('id') id: string, @Body('role') role: Role) {
    return this.adminService.updateAccountRole(+id, role);
  }

  @Delete('accounts/:id')
  deleteAccount(@Param('id') id: string) {
    return this.adminService.deleteAccount(+id);
  }
}