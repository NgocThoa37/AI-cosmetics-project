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
    return this.paymentService.createMomoPayment(dto.orderId, undefined);
  }

  @Post('momo-ipn')
  async momoIpn(@Body() body: any) {  // 👈 Dùng @Body thay vì @Query
    return this.paymentService.momoIpnHandler(body);
  }

  @Get('momo-return')
  async momoReturn(@Query() query, @Res() res: Response) {
    try {
      const result = await this.paymentService.momoReturn(query);
      if (result.success) {
        return res.redirect(`http://localhost:3000/payment-success?orderId=${result.orderId}`);
      } else {
        return res.redirect(`http://localhost:3000/payment-fail?message=${result.message}`);
      }
    } catch (error: any) {
      return res.redirect(`http://localhost:3000/payment-fail?message=${error.message}`);
    }
  }

  // ==================== VNPAY ROUTES ====================
  
  @Post('vnpay')
  async createVNPayPayment(@Body('orderId') orderId: number, @Req() req: Request, @Res() res: Response) {
    try {
      // Validate orderId
      if (!orderId || isNaN(orderId)) {
        throw new BadRequestException('Invalid orderId');
      }

      // Lấy IP address đúng cách
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
    try {
      const result = await this.paymentService.handleVNPayReturn(query);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      
      if (result.success) {
        return res.redirect(`${frontendUrl}/payment-success?orderId=${result.orderCode}&transactionId=${result.transactionId}`);
      } else {
        return res.redirect(`${frontendUrl}/payment-fail?code=${result.code || 'error'}&message=${result.message}`);
      }
    } catch (error: any) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontendUrl}/payment-fail?code=error&message=${encodeURIComponent(error.message)}`);
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