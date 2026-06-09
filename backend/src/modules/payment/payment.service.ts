import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, PaymentStatus, OrderStatus, PaymentMethod } from './../order/entities/order.entity';
import * as crypto from 'crypto';
import axios from 'axios';
import { VNPayUtil } from '../../utils/vnpay.util';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private momoConfig: any;
  private vnpayConfig: any;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
  ) {
    this.momoConfig = {
      accessKey: this.configService.get('MOMO_ACCESS_KEY'),
      secretKey: this.configService.get('MOMO_SECRET_KEY'),
      partnerCode: this.configService.get('MOMO_PARTNER_CODE'),
      redirectUrl: this.configService.get('MOMO_REDIRECT_URL'),
      ipnUrl: this.configService.get('MOMO_IPN_URL'),
      endpoint: this.configService.get('MOMO_ENDPOINT'),
      requestType: this.configService.get('MOMO_REQUEST_TYPE') || 'captureWallet',
    };

    // Cấu hình VNPay
    this.vnpayConfig = {
      tmnCode: this.configService.get('VNP_TMNCODE'),
      hashSecret: this.configService.get('VNP_HASHSECRET'),
      vnpUrl: this.configService.get('VNP_URL'),
      vnpApiUrl: this.configService.get('VNP_API_URL'),
      returnUrl: this.configService.get('VNP_RETURN_URL'),
      ipnUrl: this.configService.get('VNP_IPN_URL'),
      version: this.configService.get('VNP_VERSION') || '2.1.0',
      command: this.configService.get('VNP_COMMAND') || 'pay',
      currency: this.configService.get('VNP_CURRENCY') || 'VND',
      locale: this.configService.get('VNP_LOCALE') || 'vn',
      orderType: this.configService.get('VNP_ORDERTYPE') || 'other',
    };

    console.log('✅ MoMo Config loaded:', {
      partnerCode: this.momoConfig.partnerCode,
      endpoint: this.momoConfig.endpoint,
      requestType: this.momoConfig.requestType,
    });

    console.log('VNPay Config:', this.vnpayConfig);
  }

  // ==================== MOMO METHODS ====================
  
  private verifyMomoSignature(params: any): boolean {
    const signature = params.signature;
    if (!signature) {
      this.logger.error('Missing signature in MoMo callback');
      return false;
    }
    
    // Clone và loại bỏ signature
    const paramsToVerify = { ...params };
    delete paramsToVerify.signature;
    
    // Sắp xếp keys theo alphabet và tạo raw signature
    const rawSignature = Object.keys(paramsToVerify)
      .sort()
      .map(key => `${key}=${paramsToVerify[key]}`)
      .join('&');
    
    const expectedSignature = crypto
      .createHmac('sha256', this.momoConfig.secretKey)
      .update(rawSignature)
      .digest('hex');
    
    const isValid = signature === expectedSignature;
    
    if (!isValid) {
      this.logger.error(`MoMo signature mismatch. Expected: ${expectedSignature}, Got: ${signature}`);
      this.logger.debug(`Raw signature: ${rawSignature}`);
    }
    
    return isValid;
  }

  private async updateOrderPaymentSuccess(order: Order, transId: string) {
    order.paymentStatus = PaymentStatus.PAID;
    order.orderStatus = OrderStatus.CONFIRMED;
    order.note = order.note 
      ? `${order.note} | MoMo transaction: ${transId}` 
      : `MoMo transaction: ${transId}`;
    await this.orderRepo.save(order);
    this.logger.log(`✅ Order ${order.id} (${order.orderCode}) paid successfully via MoMo`);
  }

  private async updateOrderPaymentFailed(order: Order, message: string) {
    order.paymentStatus = PaymentStatus.FAILED;
    order.note = order.note 
      ? `${order.note} | MoMo failed: ${message}` 
      : `MoMo failed: ${message}`;
    await this.orderRepo.save(order);
    this.logger.warn(`❌ Order ${order.id} (${order.orderCode}) payment failed: ${message}`);
  }

  // ==================== MOMO PUBLIC METHODS ====================

  async createMomoPayment(orderId: number, returnUrl?: string) {
    // Lấy thông tin order
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) {
      throw new BadRequestException('Order not found');
    }
    
    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Order already paid');
    }
    
    const requestId = `${order.orderCode}_${Date.now()}`;
    const orderInfo = `Thanh toan don hang ${order.orderCode}`;
    const amount = Math.floor(order.totalAmount).toString();
    const redirectUrl = returnUrl || this.momoConfig.redirectUrl;

    const rawSignature = 
      `accessKey=${this.momoConfig.accessKey}` +
      `&amount=${amount}` +
      `&extraData=` +
      `&ipnUrl=${this.momoConfig.ipnUrl}` +
      `&orderId=${order.orderCode}` +
      `&orderInfo=${orderInfo}` +
      `&partnerCode=${this.momoConfig.partnerCode}` +
      `&redirectUrl=${redirectUrl}` +
      `&requestId=${requestId}` +
      `&requestType=${this.momoConfig.requestType}`;
    
    this.logger.debug(`MoMo rawSignature: ${rawSignature}`);
    
    const signature = crypto
      .createHmac('sha256', this.momoConfig.secretKey)
      .update(rawSignature)
      .digest('hex');
    
    const requestBody = {
      partnerCode: this.momoConfig.partnerCode,
      partnerName: 'AICosmetics',
      storeId: 'AICosmeticsStore',
      requestId: requestId,
      amount: amount,
      orderId: order.orderCode,
      orderInfo: orderInfo,
      redirectUrl: redirectUrl,
      ipnUrl: this.momoConfig.ipnUrl,
      requestType: this.momoConfig.requestType,
      extraData: '',
      signature: signature,
      lang: 'vi',
    };
    
    this.logger.log(`Sending MoMo request for order ${order.orderCode}`);
    
    try {
      const response = await axios.post(this.momoConfig.endpoint, requestBody, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000,
      });
      
      this.logger.log(`MoMo response resultCode: ${response.data.resultCode}`);
      
      if (response.data.resultCode === 0) {
        order.paymentMethod = PaymentMethod.MOMO;
        order.paymentStatus = PaymentStatus.PENDING;
        await this.orderRepo.save(order);
        
        return {
          success: true,
          payUrl: response.data.payUrl,
          qrCodeUrl: response.data.qrCodeUrl,
          orderCode: order.orderCode,
          message: 'Tạo thanh toán thành công',
        };
      } else {
        throw new BadRequestException(response.data.message || 'MoMo payment creation failed');
      }
    } catch (error: any) {
      if (error.response) {
        console.error('MoMo Error Response:', error.response.data);
        console.error('MoMo Error Status:', error.response.status);
        throw new BadRequestException(error.response.data?.message || 'MoMo payment creation failed');
      } else if (error.request) {
        // Không nhận được response
        console.error('MoMo No Response:', error.request);
        throw new BadRequestException('No response from MoMo server');
      } else {
        // Lỗi khác
        console.error('MoMo Error:', error.message);
        throw new BadRequestException(error.message);
      }
    }
  }

  async momoIpnHandler(body: any) {
    this.logger.log(`MoMo IPN received: ${JSON.stringify(body)}`);
    
    if (!this.verifyMomoSignature(body)) {
      return { message: 'Invalid signature' };
    }
    
    const { orderId, resultCode, transId, message } = body;
    const order = await this.orderRepo.findOne({ where: { orderCode: orderId } });
    if (!order) {
      this.logger.error(`Order not found for orderCode: ${orderId}`);
      return { message: 'Order not found' };
    }
    
    if (resultCode === 0) {
      if (order.paymentStatus !== PaymentStatus.PAID) {
        await this.updateOrderPaymentSuccess(order, transId);
      }
    } else {
      await this.updateOrderPaymentFailed(order, message || `MoMo error code: ${resultCode}`);
    }
    
    return { message: 'OK' };
  }

  async momoReturn(query: any) {
    this.logger.log(`MoMo return received: ${JSON.stringify(query)}`);
    
    // 1. Verify chữ ký
    if (!this.verifyMomoSignature(query)) {
      return {
        success: false,
        message: 'Invalid signature',
      };
    }
    
    const { orderId, resultCode, message, transId } = query;
    
    const order = await this.orderRepo.findOne({ where: { orderCode: orderId } });
    
    if (resultCode === '0') {
      if (order && order.paymentStatus !== PaymentStatus.PAID) {
        await this.updateOrderPaymentSuccess(order, transId);
      }
      
      return {
        success: true,
        orderId: order?.id,
        orderCode: orderId,
        message: 'Payment successful',
      };
    } else {
      if (order && order.paymentStatus !== PaymentStatus.PAID) {
        await this.updateOrderPaymentFailed(order, message || 'Payment cancelled or failed');
      }
      
      return {
        success: false,
        orderId: order?.id,
        orderCode: orderId,
        message: message || 'Payment failed',
      };
    }
  }

  async getPaymentStatus(orderId: number) {
    const order = await this.orderRepo.findOne({ 
      where: { id: orderId },
      select: ['id', 'orderCode', 'paymentStatus', 'orderStatus', 'totalAmount', 'paymentMethod', 'note']
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  // ==================== VNPAY METHODS ====================

  async createVNPayPayment(orderId: number, ipAddr: string) {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    
    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Order already paid');
    }

    const paymentUrl = VNPayUtil.createPaymentUrl(
      {
        id: order.orderCode, 
        amount: order.totalAmount,
        info: `Thanh toan don hang ${order.orderCode}`,
      },
      this.vnpayConfig,
      ipAddr,
    );

    order.paymentMethod = PaymentMethod.VNPAY;
    await this.orderRepo.save(order);

    return {
      paymentUrl,
      orderId: order.id,
      orderCode: order.orderCode,
    };
  }

  async handleVNPayIpn(vnpParams: any) {
    this.logger.log(`VNPay IPN received: ${JSON.stringify(vnpParams)}`);
    
    const isValid = VNPayUtil.verifyReturnUrl(vnpParams, this.vnpayConfig);

    if (!isValid) {
      this.logger.error('Invalid VNPay signature');
      return { RspCode: '97', Message: 'Invalid signature' };
    }

    const txnRef = vnpParams['vnp_TxnRef'];
    const transactionId = vnpParams['vnp_TransactionNo'];
    const responseCode = vnpParams['vnp_ResponseCode'];

    let order: Order | null = null;
    
    if (txnRef && txnRef.length > 6) {
      const orderCode = txnRef.substring(6);
      order = await this.orderRepo.findOne({ where: { orderCode } });
    }
    
    if (!order) {
      const numericOrderId = parseInt(txnRef);
      if (!isNaN(numericOrderId)) {
        order = await this.orderRepo.findOne({ where: { id: numericOrderId } });
      }
    }

    if (!order) {
      this.logger.error(`Order not found for txnRef: ${txnRef}`);
      return { RspCode: '01', Message: 'Order not found' };
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      return { RspCode: '02', Message: 'Order already confirmed' };
    }

    if (responseCode === '00') {
      order.paymentStatus = PaymentStatus.PAID;
      order.orderStatus = OrderStatus.CONFIRMED;
      order.paymentMethod = PaymentMethod.VNPAY;
      order.note = order.note 
        ? `${order.note} | VNPay transaction: ${transactionId}` 
        : `VNPay transaction: ${transactionId}`;
      await this.orderRepo.save(order);

      return { RspCode: '00', Message: 'Success' };
    } else {
      order.paymentStatus = PaymentStatus.FAILED;
      await this.orderRepo.save(order);

      return { RspCode: '96', Message: 'Payment failed' };
    }
  }

  async handleVNPayReturn(vnpParams: any) {
    const isValid = VNPayUtil.verifyReturnUrl(vnpParams, this.vnpayConfig);
    const responseCode = vnpParams['vnp_ResponseCode'];
    const txnRef = vnpParams['vnp_TxnRef'];
    const transactionId = vnpParams['vnp_TransactionNo'];

    let orderCode = null;
    if (txnRef && txnRef.length > 6) {
      orderCode = txnRef.substring(6);
    }

    if (isValid && responseCode === '00') {
      if (orderCode) {
        const order = await this.orderRepo.findOne({ where: { orderCode } });
        if (order && order.paymentStatus !== PaymentStatus.PAID) {
          order.paymentStatus = PaymentStatus.PAID;
          order.orderStatus = OrderStatus.CONFIRMED;
          order.paymentMethod = PaymentMethod.VNPAY;
          order.note = order.note 
            ? `${order.note} | VNPay transaction: ${transactionId}` 
            : `VNPay transaction: ${transactionId}`;
          await this.orderRepo.save(order);
        }
      }

      return {
        success: true,
        message: 'Payment successful',
        transactionId: transactionId,
        orderCode: orderCode,
      };
    } else {
      return {
        success: false,
        message: 'Payment failed or invalid signature',
        code: responseCode,
      };
    }
  }
}