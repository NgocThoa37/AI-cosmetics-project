import * as crypto from 'crypto';
import * as querystring from 'qs';

export class VNPayUtil {
  static sortObject(obj: any) {
    let sorted: any = {};
    let str: string[] = [];
    let key: string;
    
    for (key in obj) {
        if (obj.hasOwnProperty(key) && obj[key] !== null && obj[key] !== undefined && obj[key] !== '') {
            str.push(encodeURIComponent(key));
        }
    }
    
    str.sort();

    for (let i = 0; i < str.length; i++) {
        const encodedKey = str[i];
        const originalKey = decodeURIComponent(encodedKey);
        let value = obj[originalKey];
        if (value !== null && value !== undefined && value !== '') {
            sorted[encodedKey] = encodeURIComponent(value).replace(/%20/g, "+");
        }
    }
    
    return sorted;
  }

  static createPaymentUrl(order: { id: string | number; amount: number; info?: string }, config: any, ipAddr: string) {
    const date = new Date();
    const createDate = this.formatDate(date);
    const orderId = `${this.formatDate(date, 'HHmmss')}${order.id}`;

    let vnpParams: any = {
      vnp_Version: config.version || '2.1.0',
      vnp_Command: config.command || 'pay',
      vnp_TmnCode: config.tmnCode,
      vnp_Locale: config.locale || 'vn',
      vnp_CurrCode: config.currency || 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: order.info || `Thanh toan don hang ${order.id}`,
      vnp_OrderType: config.orderType || 'other',
      vnp_Amount: Math.round(order.amount * 100),
      vnp_ReturnUrl: config.returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    };

    if (config.expireMinutes) {
      const expireDate = new Date(date);
      expireDate.setMinutes(date.getMinutes() + config.expireMinutes);
      vnpParams.vnp_ExpireDate = this.formatDate(expireDate);
    }

    const sortedParams = this.sortObject(vnpParams);
    
    const signData = querystring.stringify(sortedParams, { encode: false });
    console.log('Sign Data (raw):', signData);

    const hmac = crypto.createHmac('sha512', config.hashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    console.log('Signature:', signed);

    sortedParams['vnp_SecureHash'] = signed;

    const paymentUrl = config.vnpUrl + '?' + querystring.stringify(sortedParams, { encode: false });

    console.log('================ VNPAY CREATE =================');
    console.log('TMN:', config.tmnCode);
    console.log('SECRET (last 4 chars):', config.hashSecret.slice(-4));
    console.log('Payment URL:', paymentUrl);
    console.log('==============================================');

    return paymentUrl;
  }

  static formatDate(date: Date, format: string = 'YYYYMMDDHHmmss'): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    if (format === 'HHmmss') {
      return `${hours}${minutes}${seconds}`;
    }
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  static verifyReturnUrl(vnpParams: any, config: any): boolean {
    const paramsToVerify = { ...vnpParams };
    
    const secureHash = paramsToVerify['vnp_SecureHash'];
    delete paramsToVerify['vnp_SecureHash'];
    delete paramsToVerify['vnp_SecureHashType'];

    const sortedParams = this.sortObject(paramsToVerify);
    
    const signData = querystring.stringify(sortedParams, { encode: false });
    
    const hmac = crypto.createHmac('sha512', config.hashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    
    const isValid = secureHash === signed;
    
    console.log('================ VNPAY VERIFY =================');
    console.log('Verify Sign Data (raw):', signData);
    console.log('Calculated Signature:', signed);
    console.log('Received Signature:', secureHash);
    console.log('SECRET (last 4 chars):', config.hashSecret.slice(-4));
    console.log('Is Match:', isValid);
    console.log('==============================================');

    return isValid;
  }
}