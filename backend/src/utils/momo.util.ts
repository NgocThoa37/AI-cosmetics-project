import * as crypto from 'crypto';
import * as https from 'https';

export class MoMoUtil {
  
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

  static async createPaymentUrl(
    order: { id: string | number; amount: number; info?: string }, 
    config: any
  ): Promise<string> {
    const date = new Date();
    const orderId = `${config.partnerCode}_${order.id}_${date.getTime()}`;
    const requestId = orderId;

    let momoParams: any = {
      partnerCode: config.partnerCode,
      partnerName: "Test",
      storeId: "MomoTestStore",
      requestId: requestId,
      amount: Math.round(order.amount).toString(),
      orderId: orderId,
      orderInfo: order.info || `Thanh toan don hang ${order.id}`,
      redirectUrl: config.returnUrl,
      ipnUrl: config.ipnUrl,
      lang: config.lang || 'vi',
      requestType: config.requestType || 'captureWallet',
      autoCapture: config.autoCapture !== false,
      extraData: '',
    };

    const rawSignature = `accessKey=${config.accessKey}&amount=${momoParams.amount}&extraData=${momoParams.extraData}&ipnUrl=${momoParams.ipnUrl}&orderId=${momoParams.orderId}&orderInfo=${momoParams.orderInfo}&partnerCode=${momoParams.partnerCode}&redirectUrl=${momoParams.redirectUrl}&requestId=${momoParams.requestId}&requestType=${momoParams.requestType}`;
    
    console.log('================ MOMO CREATE =================');
    console.log('Partner Code:', config.partnerCode);
    console.log('SECRET (last 4 chars):', config.secretKey.slice(-4));
    console.log('Raw Signature:', rawSignature);

    const hmac = crypto.createHmac('sha256', config.secretKey);
    const signature = hmac.update(Buffer.from(rawSignature, 'utf-8')).digest('hex');
    console.log('Signature:', signature);

    momoParams.signature = signature;

    const paymentUrl = await this.callMoMoApi(config.endpoint, momoParams);

    console.log('Payment URL:', paymentUrl);
    console.log('==============================================');

    return paymentUrl;
  }

  static async callMoMoApi(endpoint: string, params: any): Promise<string> {
    return new Promise((resolve, reject) => {
      const requestBody = JSON.stringify(params);
      
      const url = new URL(endpoint);
      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(requestBody)
        }
      };
      
      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            console.log('MoMo Response:', response);
            
            if (response.resultCode === 0 && response.payUrl) {
              resolve(response.payUrl);
            } else {
              reject(new Error(`MoMo Error: ${response.message} (Code: ${response.resultCode})`));
            }
          } catch (error) {
            reject(new Error(`Parse error: ${error}`));
          }
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      req.write(requestBody);
      req.end();
    });
  }

  static verifyReturnUrl(momoParams: any, config: any): boolean {
    const paramsToVerify = { ...momoParams };
    
    const signature = paramsToVerify.signature;
    delete paramsToVerify.signature;

    const rawSignature = Object.keys(paramsToVerify)
      .sort()
      .map(key => `${key}=${paramsToVerify[key]}`)
      .join('&');
    
    console.log('================ MOMO VERIFY =================');
    console.log('Raw Signature:', rawSignature);
    
    const hmac = crypto.createHmac('sha256', config.secretKey);
    const calculatedSignature = hmac.update(Buffer.from(rawSignature, 'utf-8')).digest('hex');
    
    console.log('Calculated Signature:', calculatedSignature);
    console.log('Received Signature:', signature);
    console.log('SECRET (last 4 chars):', config.secretKey.slice(-4));
    console.log('Is Match:', calculatedSignature === signature);
    console.log('==============================================');
    
    return calculatedSignature === signature;
  }
}