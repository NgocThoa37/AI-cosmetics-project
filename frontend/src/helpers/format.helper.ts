export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const formatOrderCode = (code: string): string => {
  return code;
};

export const getSkinTypeLabel = (skinType: string): string => {
  const labels: Record<string, string> = {
    oily: 'Da dầu',
    dry: 'Da khô',
    combination: 'Da hỗn hợp',
    sensitive: 'Da nhạy cảm',
    normal: 'Da thường',
    all: 'Tất cả loại da',
  };
  return labels[skinType] || skinType;
};

export const getOrderStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    shipping: 'Đang giao hàng',
    delivered: 'Đã hoàn thành',
    cancelled: 'Đã hủy',
  };
  return labels[status] || status;
};

export const getOrderStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: 'text-amber-600 bg-amber-50',
    confirmed: 'text-blue-600 bg-blue-50',
    shipping: 'text-indigo-600 bg-indigo-50',
    delivered: 'text-emerald-600 bg-emerald-50',
    cancelled: 'text-red-600 bg-red-50',
  };
  return colors[status] || 'text-gray-600 bg-gray-50';
};