import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Order, OrderStatus, PaymentStatus } from '../order/entities/order.entity';
import { OrderDetail } from '../order/entities/order-detail.entity';
import { Product } from '../products/entities/product.entity';
import { Customer } from '../customers/entities/customer.entity';
import * as ExcelJS from 'exceljs';
import * as PDFDocument from 'pdfkit';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(OrderDetail) private orderDetailRepo: Repository<OrderDetail>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(Customer) private customerRepo: Repository<Customer>,
  ) {}

  async getRevenue(startDate: Date, endDate: Date, groupBy: 'day' | 'week' | 'month' | 'year') {
    const orders = await this.orderRepo.find({
      where: {
        paymentStatus: PaymentStatus.PAID,
        orderStatus: OrderStatus.DELIVERED,
        createdAt: Between(startDate, endDate),
      },
    });
    // Group logic
    const revenueMap = new Map();
    orders.forEach(order => {
      let key: string;
      const date = new Date(order.createdAt);
      if (groupBy === 'day') key = date.toISOString().split('T')[0];
      else if (groupBy === 'week') key = `${date.getFullYear()}-W${this.getWeekNumber(date)}`;
      else if (groupBy === 'month') key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      else key = `${date.getFullYear()}`;
      const current = revenueMap.get(key) || 0;
      revenueMap.set(key, current + Number(order.totalAmount));
    });
    return Array.from(revenueMap.entries()).map(([period, revenue]) => ({ period, revenue }));
  }

  private getWeekNumber(date: Date): number {
    const firstJan = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date.getTime() - firstJan.getTime()) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + firstJan.getDay() + 1) / 7);
  }

  async getBestSellingProducts(limit: number = 10) {
    const products = await this.productRepo
      .createQueryBuilder('product')
      .orderBy('product.totalSold', 'DESC')
      .take(limit)
      .getMany();
    return products;
  }

  async getOrderStatistics() {
    const totalOrders = await this.orderRepo.count();
    const pendingOrders = await this.orderRepo.count({ where: { orderStatus: OrderStatus.PENDING } });
    const deliveredOrders = await this.orderRepo.count({ where: { orderStatus: OrderStatus.DELIVERED } });
    const cancelledOrders = await this.orderRepo.count({ where: { orderStatus: OrderStatus.CANCELLED } });
    return { totalOrders, pendingOrders, deliveredOrders, cancelledOrders };
  }

  async getCustomerStatistics() {
    const totalCustomers = await this.customerRepo.count();
    const newCustomers = await this.customerRepo.count({ where: { createdAt: Between(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()) } });
    return { totalCustomers, newCustomersLast30Days: newCustomers };
  }

  async exportRevenueReportExcel(startDate: Date, endDate: Date): Promise<Buffer> {
    const revenueData = await this.getRevenue(startDate, endDate, 'day');
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
    const revenueData = await this.getRevenue(startDate, endDate, 'day');
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => {});
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
}