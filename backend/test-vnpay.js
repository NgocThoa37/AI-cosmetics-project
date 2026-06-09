const crypto = require('crypto');
const querystring = require('qs');

// ==================== CẤU HÌNH ====================
const config = {
    tmnCode: 'U0T5D8RF',
    secretKey: 'FU0MFIP6CHRHWLXQUPN06YFM7SYMAUGL',  // Thử từng secret
    vnpUrl: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    returnUrl: 'http://localhost:3000/vnpay-callback'
};

// ==================== HÀM SORT ĐÚNG CHUẨN VNPAY ====================
function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

// ==================== TẠO URL ====================
function createPaymentUrl(orderId, amount) {
    let date = new Date();
    
    let vnp_Params = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: config.tmnCode,
        vnp_Locale: 'vn',
        vnp_CurrCode: 'VND',
        vnp_TxnRef: orderId,
        vnp_OrderInfo: `Thanh toan don hang ${orderId}`,
        vnp_OrderType: 'other',
        vnp_Amount: amount * 100,
        vnp_ReturnUrl: config.returnUrl,
        vnp_IpAddr: '127.0.0.1',
        vnp_CreateDate: date.getFullYear() + String(date.getMonth() + 1).padStart(2, '0') + String(date.getDate()).padStart(2, '0') + String(date.getHours()).padStart(2, '0') + String(date.getMinutes()).padStart(2, '0') + String(date.getSeconds()).padStart(2, '0')
    };

    // Sắp xếp params
    vnp_Params = sortObject(vnp_Params);
    
    // Tạo chuỗi ký (không encode)
    let signData = querystring.stringify(vnp_Params, { encode: false });
    console.log('SignData:', signData);
    
    // Tạo chữ ký
    let hmac = crypto.createHmac('sha512', config.secretKey);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    console.log('Signature:', signed);
    
    // Thêm chữ ký vào params (đã encode sẵn từ sortObject)
    vnp_Params['vnp_SecureHash'] = signed;
    
    // Tạo URL
    let paymentUrl = config.vnpUrl + '?' + querystring.stringify(vnp_Params, { encode: false });
    
    return paymentUrl;
}

// ==================== TEST ====================
console.log('\n' + '='.repeat(70));
console.log('🚀 TEST VNPAY - CHUẨN THEO DOCS');
console.log('='.repeat(70));

const orderId = 'TEST_' + Date.now();
const amount = 10000; // 10,000 VND

const url = createPaymentUrl(orderId, amount);

console.log(`\n📝 Order ID: ${orderId}`);
console.log(`💰 Amount: ${amount} VND`);
console.log(`\n🔗 URL thanh toán:\n${url}`);
console.log('\n' + '='.repeat(70));
console.log('💳 THẺ TEST: NCB / 9704198526191432198 / NGUYEN VAN A / 07/15 / OTP: 123456');
console.log('='.repeat(70) + '\n');