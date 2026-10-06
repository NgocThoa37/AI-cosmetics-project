import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  Inject, // 👈 THÊM MỚI: để inject PayOS provider
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Order,
  PaymentStatus,
  OrderStatus,
  PaymentMethod,
} from './../order/entities/order.entity';
import * as crypto from 'crypto';
import axios from 'axios';
import { VNPayUtil } from '../../utils/vnpay.util';
// 👇 THÊM MỚI: import PayOS và token provider
import { PayOS } from '@payos/node';
import { PAYOS_CLIENT } from './payos.provider';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private momoConfig: any;
  private vnpayConfig: any;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    // 👇 THÊM MỚI: inject PayOS client
    @Inject(PAYOS_CLIENT) private readonly payOS: PayOS,
  ) {
    // ==================== GIỮ NGUYÊN: Config MoMo ====================
    this.momoConfig = {
      accessKey: this.configService.get('MOMO_ACCESS_KEY'),
      secretKey: this.configService.get('MOMO_SECRET_KEY'),
      partnerCode: this.configService.get('MOMO_PARTNER_CODE'),
      redirectUrl: this.configService.get('MOMO_REDIRECT_URL'),
      ipnUrl: this.configService.get('MOMO_IPN_URL'),
      endpoint: this.configService.get('MOMO_ENDPOINT'),
      requestType:
        this.configService.get('MOMO_REQUEST_TYPE') || 'captureWallet',
    };

    // ==================== GIỮ NGUYÊN: Config VNPay ====================
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

  // ==================================================================
  // ==================== MOMO METHODS (GIỮ NGUYÊN) ===================
  // ==================================================================

  private verifyMomoSignature(params: any): boolean {
    const signature = params.signature;
    if (!signature) {
      this.logger.error('Missing signature in MoMo callback');
      return false;
    }

    const rawSignature =
      `amount=${params.amount || ''}` +
      `&extraData=${params.extraData || ''}` +
      `&message=${params.message || ''}` +
      `&orderId=${params.orderId || ''}` +
      `&orderInfo=${params.orderInfo || ''}` +
      `&orderType=${params.orderType || ''}` +
      `&partnerCode=${params.partnerCode || ''}` +
      `&payType=${params.payType || ''}` +
      `&requestId=${params.requestId || ''}` +
      `&responseTime=${params.responseTime || ''}` +
      `&resultCode=${params.resultCode || ''}` +
      `&transId=${params.transId || ''}`;

    const expectedSignature = crypto
      .createHmac('sha256', this.momoConfig.secretKey)
      .update(rawSignature)
      .digest('hex');

    const isValid = signature === expectedSignature;

    if (!isValid) {
      this.logger.error(
        `MoMo signature mismatch. Expected: ${expectedSignature}, Got: ${signature}`,
      );
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
    this.logger.log(
      `✅ Order ${order.id} (${order.orderCode}) paid successfully via MoMo`,
    );
  }

  private async updateOrderPaymentFailed(order: Order, message: string) {
    order.paymentStatus = PaymentStatus.FAILED;
    order.note = order.note
      ? `${order.note} | MoMo failed: ${message}`
      : `MoMo failed: ${message}`;
    await this.orderRepo.save(order);
    this.logger.warn(
      `❌ Order ${order.id} (${order.orderCode}) payment failed: ${message}`,
    );
  }

  async createMomoPayment(orderId: number, returnUrl?: string) {
    // ... giữ nguyên 100% code cũ của bạn
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) {
      throw new BadRequestException('Order not found');
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Order already paid');
    }

    const timestamp = Date.now();
    const uniqueId = `${order.orderCode}_${timestamp}`;
    const requestId = uniqueId;
    const momoOrderId = uniqueId;

    const orderInfo = `Thanh toan don hang ${order.orderCode}`;
    const amount = Math.floor(order.totalAmount).toString();
    const redirectUrl = returnUrl || this.momoConfig.redirectUrl;

    const rawSignature =
      `accessKey=${this.momoConfig.accessKey}` +
      `&amount=${amount}` +
      `&extraData=` +
      `&ipnUrl=${this.momoConfig.ipnUrl}` +
      `&orderId=${momoOrderId}` +
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
      orderId: momoOrderId,
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
      const response = await axios.post(
        this.momoConfig.endpoint,
        requestBody,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000,
        },
      );

      console.log('🔍 MoMo Response FULL:', response.data);
      console.log('🔍 MoMo Response resultCode:', response.data.resultCode);
      console.log('🔍 MoMo Response message:', response.data.message);

      this.logger.log(`MoMo response resultCode: ${response.data.resultCode}`);

      if (response.data.resultCode === 0) {
        order.paymentMethod = PaymentMethod.MOMO;
        await this.orderRepo.save(order);

        return {
          success: true,
          payUrl: response.data.payUrl,
          qrCodeUrl: response.data.qrCodeUrl,
          orderCode: order.orderCode,
          message: 'Tạo thanh toán thành công',
        };
      } else {
        throw new BadRequestException(
          response.data.message || 'MoMo payment creation failed',
        );
      }
    } catch (error: any) {
      if (error.response) {
        console.error('MoMo Error Response:', error.response.data);
        console.error('MoMo Error Status:', error.response.status);
        throw new BadRequestException(
          error.response.data?.message || 'MoMo payment creation failed',
        );
      } else if (error.request) {
        console.error('MoMo No Response:', error.request);
        throw new BadRequestException('No response from MoMo server');
      } else {
        console.error('MoMo Error:', error.message);
        throw new BadRequestException(error.message);
      }
    }
  }

  async momoIpnHandler(body: any) {
    // ... giữ nguyên 100% code cũ của bạn
    this.logger.log(`MoMo IPN received: ${JSON.stringify(body)}`);

    const { orderId, resultCode, transId, message } = body;

    if (resultCode === 0) {
      if (!this.verifyMomoSignature(body)) {
        return { message: 'Invalid signature' };
      }
    } else {
      this.logger.log('Skipping signature verify for cancelled/failed IPN');
    }

    let orderCode = orderId;
    if (orderId && orderId.includes('_')) {
      orderCode = orderId.split('_')[0];
    }

    const order = await this.orderRepo.findOne({ where: { orderCode } });
    if (!order) {
      this.logger.error(`Order not found for orderCode: ${orderCode}`);
      return { message: 'Order not found' };
    }

    if (resultCode === 0) {
      if (order.paymentStatus !== PaymentStatus.PAID) {
        await this.updateOrderPaymentSuccess(order, transId);
      }
    } else {
      await this.updateOrderPaymentFailed(
        order,
        message || `MoMo error code: ${resultCode}`,
      );
    }

    return { message: 'OK' };
  }

  async momoReturn(query: any) {
    // ... giữ nguyên 100% code cũ của bạn
    this.logger.log(`MoMo return received: ${JSON.stringify(query)}`);

    const { orderId, resultCode, message, transId } = query;

    if (resultCode === '0') {
      if (!this.verifyMomoSignature(query)) {
        this.logger.warn('Invalid signature for successful payment');
        return {
          success: false,
          message: 'Invalid signature',
        };
      }
    } else {
      this.logger.log('Skipping signature verify for cancelled/failed payment');
    }

    let orderCode = orderId;
    if (orderId && orderId.includes('_')) {
      orderCode = orderId.split('_')[0];
    }

    const order = await this.orderRepo.findOne({ where: { orderCode } });

    if (resultCode === '0') {
      if (order && order.paymentStatus !== PaymentStatus.PAID) {
        await this.updateOrderPaymentSuccess(order, transId);
      }

      return {
        success: true,
        orderId: order?.id,
        orderCode: orderCode,
        message: 'Payment successful',
      };
    } else {
      if (order && order.paymentStatus !== PaymentStatus.PAID) {
        await this.updateOrderPaymentFailed(
          order,
          message || 'Payment cancelled or failed',
        );
      }

      return {
        success: false,
        orderId: order?.id,
        orderCode: orderCode,
        message: message || 'Payment failed',
      };
    }
  }

  async getPaymentStatus(orderId: number) {
    // ... giữ nguyên 100% code cũ của bạn
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      select: [
        'id',
        'orderCode',
        'paymentStatus',
        'orderStatus',
        'totalAmount',
        'paymentMethod',
        'note',
      ],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  // ==================================================================
  // ==================== VNPAY METHODS (GIỮ NGUYÊN) ==================
  // ==================================================================

  async createVNPayPayment(orderId: number, ipAddr: string) {
    // ... giữ nguyên 100% code cũ của bạn
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
    // ... giữ nguyên 100% code cũ của bạn
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
        order = await this.orderRepo.findOne({
          where: { id: numericOrderId },
        });
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
    // ... giữ nguyên 100% code cũ của bạn
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

  // ==================================================================
  // ==================== PAYOS METHODS (THÊM MỚI) ====================
  // ==================================================================

  /**
   * Tạo link thanh toán PayOS
   * @param orderId ID đơn hàng trong DB
   * @param returnUrl URL quay về sau khi thanh toán (tùy chọn)
   */
  async createPayOSPayment(orderId: number, returnUrl?: string) {
    // 1. Tìm đơn hàng
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // 2. Kiểm tra đã thanh toán chưa
    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Order already paid');
    }

    // 3. PayOS yêu cầu orderCode là số nguyên dương, tối đa 9 chữ số
    //    → Dùng timestamp cắt 9 số để đảm bảo unique
    const payosOrderCode = Number(String(Date.now()).slice(-9));
    const amount = Math.floor(order.totalAmount);

    // 4. PayOS yêu cầu tối thiểu 2.000 VND
    if (amount < 2000) {
      throw new BadRequestException('Số tiền tối thiểu là 2.000 VND');
    }

    // 5. Tạo payload gửi PayOS
    const paymentData = {
      orderCode: payosOrderCode,
      amount,
      description: `Thanh toan don ${order.orderCode}`.slice(0, 25), 
      returnUrl:
        returnUrl ||
        `${process.env.BACKEND_URL || 'http://localhost:3000'}/payment/payos-return`,
      cancelUrl: `${
        process.env.BACKEND_URL || 'http://localhost:3000'
      }/payment/payos-cancel`,
    };

    try {
      // 6. Gọi PayOS API tạo link
      const paymentLink = await this.payOS.paymentRequests.create(
        paymentData,
      );

      // 7. Lưu payosOrderCode vào DB để webhook tra cứu
      order.paymentMethod = PaymentMethod.PAYOS;
      order.payosOrderCode = String(payosOrderCode);
      await this.orderRepo.save(order);

      this.logger.log(
        `✅ Tạo link PayOS thành công: orderId=${order.id}, payosOrderCode=${payosOrderCode}`,
      );

      // 8. Trả về cho Frontend
      return {
        success: true,
        checkoutUrl: paymentLink.checkoutUrl,
        qrCode: paymentLink.qrCode,
        payosOrderCode,
        orderCode: order.orderCode,
        message: 'Tạo thanh toán PayOS thành công',
      };
    } catch (error: any) {
      this.logger.error('❌ Lỗi tạo link PayOS:', error);
      throw new BadRequestException(
        error?.message || 'Không thể tạo link thanh toán PayOS',
      );
    }
  }

  /**
   * Xử lý webhook từ PayOS khi thanh toán thành công
   * PayOS sẽ POST về endpoint này mỗi khi có giao dịch
   */
  async payosWebhookHandler(body: any) {
    this.logger.log(`PayOS webhook received: ${JSON.stringify(body)}`);

    // 1. Verify chữ ký webhook (BẮT BUỘC — tránh request giả mạo)
    let webhookData: any;
    try {
      webhookData = this.payOS.webhooks.verify(body);
    } catch (error) {
      this.logger.error('❌ PayOS webhook signature invalid:', error);
      throw new BadRequestException('Webhook không hợp lệ');
    }

    const { orderCode, amount, description, reference, transactionDateTime } =
      webhookData;

    this.logger.log(
      `💰 PayOS thanh toán thành công: orderCode=${orderCode}, amount=${amount}, ref=${reference}`,
    );

    // 2. Tìm đơn hàng theo payosOrderCode
    const order = await this.orderRepo.findOne({
      where: { payosOrderCode: String(orderCode) },
    });

    if (!order) {
      this.logger.error(
        `Không tìm thấy đơn hàng với payosOrderCode=${orderCode}`,
      );
      // Vẫn trả success: true để PayOS không retry liên tục
      return { success: true, message: 'Order not found but acknowledged' };
    }

    // 3. Cập nhật trạng thái nếu chưa PAID (tránh duplicate khi webhook retry)
    if (order.paymentStatus !== PaymentStatus.PAID) {
      order.paymentStatus = PaymentStatus.PAID;
      order.orderStatus = OrderStatus.CONFIRMED;
      order.paymentMethod = PaymentMethod.PAYOS;
      order.note = order.note
        ? `${order.note} | PayOS transaction: ${reference}`
        : `PayOS transaction: ${reference}`;
      await this.orderRepo.save(order);

      this.logger.log(
        `✅ Order ${order.id} (${order.orderCode}) paid via PayOS`,
      );
    } else {
      this.logger.log(`ℹ️ Order ${order.id} đã PAID trước đó, bỏ qua`);
    }

    // 4. BẮT BUỘC phải trả về { success: true }
    return { success: true };
  }

  /**
   * Xử lý khi user quay về từ PayOS (return URL)
   * Chỉ dùng để redirect user, KHÔNG cập nhật đơn hàng ở đây
   * (việc cập nhật do webhook đảm nhiệm)
   */
  async payosReturn(query: any) {
    this.logger.log(`PayOS return received: ${JSON.stringify(query)}`);

    const { code, id, cancel, status, orderCode } = query;

    // User hủy thanh toán
    if (cancel === 'true' || status === 'CANCELLED') {
      return {
        success: false,
        message: 'Người dùng đã hủy thanh toán',
        orderCode,
      };
    }

    // PayOS trả code '00' là thành công
    return {
      success: code === '00',
      message: code === '00' ? 'Thanh toán thành công' : 'Thanh toán thất bại',
      orderCode,
      payosOrderCode: orderCode,
    };
  }
}