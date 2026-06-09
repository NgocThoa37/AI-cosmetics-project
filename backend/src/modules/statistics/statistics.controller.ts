import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@Controller('statistics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.EMPLOYEE) 
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('revenue')
  getRevenue(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('groupBy') groupBy: 'day' | 'week' | 'month' | 'year',
  ) {
    return this.statisticsService.getRevenue(new Date(startDate), new Date(endDate), groupBy);
  }

  @Get('best-selling')
  getBestSelling(@Query('limit') limit: string) {
    return this.statisticsService.getBestSellingProducts(limit ? parseInt(limit) : 10);
  }

  @Get('orders')
  getOrderStats() {
    return this.statisticsService.getOrderStatistics();
  }

  @Get('customers')
  getCustomerStats() {
    return this.statisticsService.getCustomerStatistics();
  }

  @Get('export/excel')
  async exportExcel(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
  ) {
    const buffer = await this.statisticsService.exportRevenueReportExcel(
      new Date(startDate),
      new Date(endDate),
    );
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=revenue-report.xlsx');
    res.send(buffer);
  }

  @Get('export/pdf')
  async exportPDF(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
  ) {
    const buffer = await this.statisticsService.exportRevenueReportPDF(
      new Date(startDate),
      new Date(endDate),
    );
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=revenue-report.pdf');
    res.send(buffer);
  }
}