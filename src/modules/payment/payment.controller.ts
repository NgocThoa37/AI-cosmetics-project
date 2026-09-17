import { Controller, Post, Body, Get, Query, Res, HttpStatus, Req, BadRequestException, NotFoundException, Param } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreateMomoPaymentDto } from './dto/create-momo-payment.dto';
import type { Response, Request } from 'express';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // ==================== MOMO ROUTES ====================
  
  @Post('momo')
  async createMomoPayment(@Body() dto: CreateMomoPaymentDto) {
    console.log('🔍 [MOMO] orderId nhận được:', dto?.orderId);
    return this.paymentService.createMomoPayment(dto.orderId, undefined);
  }

  @Post('momo-ipn')
  async momoIpn(@Body() body: any) {
    return this.paymentService.momoIpnHandler(body);
  }

  @Get('momo-return')
  async momoReturn(@Query() query, @Req() req: Request, @Res() res: Response) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    
    const tokenFromCookie = req.cookies?.access_token || '';
    const tokenFromQuery = query.token || '';
    const token = tokenFromCookie || tokenFromQuery || '';
    
    console.log('🔍 [MOMO] Token từ cookie:', tokenFromCookie ? 'CÓ' : 'KHÔNG');
    console.log('🔍 [MOMO] Token từ query:', tokenFromQuery ? 'CÓ' : 'KHÔNG');
    
    try {
      const result = await this.paymentService.momoReturn(query);
      let orderCode = result.orderCode || query.orderId || '';
      if (orderCode && orderCode.includes('_')) {
        orderCode = orderCode.split('_')[0];
      }
      
      const errorMessage = result.message || query.message || 'Thanh toán thất bại';
      
      // ✅ SỬA: Redirect về DANH SÁCH đơn hàng, không phải chi tiết
      if (result.success) {
        return res.redirect(`${frontendUrl}/account/orders?payment=success&method=MoMo&token=${encodeURIComponent(token)}`);
      } else {
        return res.redirect(`${frontendUrl}/account/orders?payment=failed&message=${encodeURIComponent(errorMessage)}&token=${encodeURIComponent(token)}`);
      }
    } catch (error: any) {
      let orderCode = query.orderId || query.orderCode || '';
      if (orderCode && orderCode.includes('_')) {
        orderCode = orderCode.split('_')[0];
      }
      const errorMessage = error.message || 'Lỗi thanh toán';
      // ✅ SỬA: Redirect về DANH SÁCH đơn hàng
      return res.redirect(`${frontendUrl}/account/orders?payment=failed&message=${encodeURIComponent(errorMessage)}&token=${encodeURIComponent(token)}`);
    }
  }

  // ==================== VNPAY ROUTES ====================
  
  @Post('vnpay')
  async createVNPayPayment(@Body('orderId') orderId: number, @Req() req: Request, @Res() res: Response) {
    try {
      if (!orderId || isNaN(orderId)) {
        throw new BadRequestException('Invalid orderId');
      }

      let ipAddr = req.headers['x-forwarded-for'] as string;
      if (ipAddr) {
        ipAddr = ipAddr.split(',')[0].trim();
      }
      if (!ipAddr) {
        ipAddr = req.socket.remoteAddress || '';
      }
      if (!ipAddr) {
        ipAddr = '127.0.0.1';
      }
      ipAddr = ipAddr.replace(/^::ffff:/, '');
      
      console.log('IP Address:', ipAddr);
      
      const result = await this.paymentService.createVNPayPayment(orderId, ipAddr);
      return res.status(HttpStatus.OK).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      const status = error instanceof BadRequestException || error instanceof NotFoundException 
        ? HttpStatus.BAD_REQUEST 
        : HttpStatus.INTERNAL_SERVER_ERROR;
      return res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }

  @Get('vnpay-ipn')
  async vnpayIpn(@Query() query: any, @Res() res: Response) {
    try {
      const result = await this.paymentService.handleVNPayIpn(query);
      return res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      return res.status(HttpStatus.OK).json({
        RspCode: '99',
        Message: error.message || 'Unknown error',
      });
    }
  }

  @Get('vnpay-return')
  async vnpayReturn(@Query() query: any, @Res() res: Response) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    try {
      const result = await this.paymentService.handleVNPayReturn(query);
      
      // ✅ SỬA: Redirect về DANH SÁCH đơn hàng, không phải chi tiết
      if (result.success) {
        return res.redirect(`${frontendUrl}/account/orders?payment=success&method=VNPAY`);
      } else {
        const errorMessage = result.message || 'Thanh toán VNPAY thất bại';
        return res.redirect(`${frontendUrl}/account/orders?payment=failed&message=${encodeURIComponent(errorMessage)}`);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Lỗi thanh toán';
      return res.redirect(`${frontendUrl}/account/orders?payment=failed&message=${encodeURIComponent(errorMessage)}`);
    }
  }

  // ==================== COMMON ROUTES ====================
  
  @Get('status/:orderId')
  async getPaymentStatus(@Param('orderId') orderId: number, @Res() res: Response) {
    try {
      if (!orderId || isNaN(orderId)) {
        throw new BadRequestException('Invalid orderId');
      }
      const result = await this.paymentService.getPaymentStatus(orderId);
      return res.status(HttpStatus.OK).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      const status = error instanceof NotFoundException ? HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST;
      return res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }
}