export const SKIN_TYPE_LABELS: Record<string, string> = {
  oily: 'Da dầu',
  dry: 'Da khô',
  combination: 'Da hỗn hợp',
  sensitive: 'Da nhạy cảm',
  normal: 'Da thường',
  all: 'Tất cả loại da',
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao hàng',
  delivered: 'Đã giao thành công',
  cancelled: 'Đã hủy',
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cod: 'Thanh toán khi nhận hàng (COD)',
  momo: 'Ví điện tử MoMo',
  vnpay: 'VNPAY',
};

export const FREE_SHIPPING_THRESHOLD = 500000;
export const DEFAULT_SHIPPING_FEE = 30000;