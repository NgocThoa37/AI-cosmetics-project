'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchOrderById, cancelOrder } from '@/store/slices/order.slice';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/common/Button';
import AccountSidebar from '@/components/customer/AccountSidebar';
import { 
  formatCurrency, 
  formatDate, 
  getOrderStatusLabel, 
  getOrderStatusColor 
} from '@/helpers/format.helper';
import { ArrowLeft, MapPin, Phone, CreditCard, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const getProductImage = (detail: any): string => {
  if (detail.productDetail?.images?.length > 0) {
    const mainImage = detail.productDetail.images.find((img: any) => img.isMain);
    return mainImage?.imageUrl || detail.productDetail.images[0]?.imageUrl;
  }
  return '/placeholder-product.jpg';
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const orderId = parseInt(id, 10);
  const dispatch = useAppDispatch();
  const { selectedOrder, loading } = useAppSelector((state) => state.order);
  
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (id && !isNaN(orderId)) {
      dispatch(fetchOrderById(orderId));
    }
  }, [dispatch, id, orderId]);

  // ✅ HÀM THANH TOÁN - GỌI ĐÚNG API THEO PHƯƠNG THỨC
  const handlePayment = async () => {
    if (!selectedOrder) {
      toast.error('Không tìm thấy đơn hàng');
      return;
    }

    // Nếu là COD thì thôi
    if (selectedOrder.paymentMethod === 'cod') {
      toast.error('Đơn hàng COD không cần thanh toán online');
      return;
    }

    setIsProcessingPayment(true);
    try {
      const token = localStorage.getItem('customer_token');

      // ✅ CHỌN API ĐÚNG THEO PHƯƠNG THỨC THANH TOÁN
      let apiUrl = '';
      if (selectedOrder.paymentMethod === 'vnpay') {
        apiUrl = '/api/payment/vnpay';
      } else if (selectedOrder.paymentMethod === 'momo') {
        apiUrl = '/api/payment/momo';
      } else {
        toast.error('Phương thức thanh toán không hỗ trợ');
        setIsProcessingPayment(false);
        return;
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId: selectedOrder.id }),
      });

      const data = await response.json();
      console.log('🔍 Response data:', data);

      // ✅ LẤY LINK THANH TOÁN (MoMo trả payUrl, VNPAY trả paymentUrl)
      const paymentUrl = data?.data?.payUrl || data?.payUrl || data?.data?.paymentUrl || data?.paymentUrl;

      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        toast.error(data?.message || 'Không thể tạo link thanh toán');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Lỗi kết nối đến máy chủ');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // ✅ HÀM HỦY ĐƠN
  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
    
    setIsCancelling(true);
    try {
      await dispatch(cancelOrder({ orderId: selectedOrder.id, reason: 'Khách hàng hủy' })).unwrap();
      toast.success('Đã hủy đơn hàng');
      router.push('/account/orders');
    } catch (error) {
      toast.error('Hủy đơn hàng thất bại');
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!selectedOrder) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <AccountSidebar />
          <div className="lg:col-span-3 text-center py-20">
            <p className="text-brand-dark/50">Không tìm thấy đơn hàng</p>
            <Link 
              href="/account/orders" 
              className="text-brand-accent hover:underline mt-2 inline-block"
            >
              Quay lại danh sách đơn hàng
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const order = selectedOrder;
  const isCOD = order.paymentMethod === 'cod';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <AccountSidebar />

        <div className="lg:col-span-3">
          <Link 
            href="/account/orders" 
            className="inline-flex items-center gap-2 text-sm text-brand-dark/50 hover:text-brand-accent transition-colors mb-4"
          >
            <ArrowLeft size={16} /> Quay lại danh sách
          </Link>

          <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
            <div>
              <h1 className="font-serif text-2xl text-brand-dark">Chi tiết đơn hàng</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-brand-dark/50">Mã đơn: {order.orderCode}</span>
                <span className="text-xs text-brand-dark/30">|</span>
                <span className="text-sm text-brand-dark/50">
                  {formatDate(order.createdAt)}
                </span>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${getOrderStatusColor(order.orderStatus)}`}>
                {getOrderStatusLabel(order.orderStatus)}
              </span>

              {order.paymentStatus === 'pending' && 
               order.orderStatus !== 'cancelled' && 
               !isCOD && (
                <Button
                  onClick={handlePayment}
                  loading={isProcessingPayment}
                  className="bg-brand-accent text-white hover:bg-brand-accent/80"
                  size="sm"
                >
                  <CreditCard size={16} className="mr-2" />
                  Thanh toán ngay
                </Button>
              )}

              {order.paymentStatus === 'paid' && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                  Đã thanh toán
                </span>
              )}

              {order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled' && (
                <Button
                  variant="outline"
                  onClick={handleCancelOrder}
                  loading={isCancelling}
                  className="text-red-500 border-red-300 hover:bg-red-50"
                  size="sm"
                >
                  Hủy đơn hàng
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-[#FAF8F5] border border-brand-warm rounded-2xl p-5">
              <h4 className="text-xs font-bold text-brand-dark/50 uppercase tracking-wider flex items-center gap-2 mb-3">
                <MapPin size={14} /> Địa chỉ giao hàng
              </h4>
              <p className="text-brand-dark font-medium">{order.shippingAddress}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-brand-dark/70">
                <span className="flex items-center gap-1">
                  <Phone size={14} /> {order.shippingPhone}
                </span>
              </div>
            </div>

            <div className="bg-[#FAF8F5] border border-brand-warm rounded-2xl p-5">
              <h4 className="text-xs font-bold text-brand-dark/50 uppercase tracking-wider flex items-center gap-2 mb-3">
                <CreditCard size={14} /> Phương thức thanh toán
              </h4>
              <p className="text-brand-dark font-medium capitalize">{order.paymentMethod}</p>
              <p className="text-sm text-brand-dark/70 mt-1">
                Trạng thái: <span className="capitalize">{order.paymentStatus}</span>
              </p>
            </div>
          </div>

          <div className="bg-white border border-brand-warm rounded-2xl p-5">
            <h3 className="font-bold text-brand-dark flex items-center gap-2 mb-4">
              <Package size={18} /> Sản phẩm
            </h3>

            <div className="divide-y divide-brand-warm/50">
              {order.details?.map((detail) => (
                <div key={detail.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-white border border-brand-warm flex-shrink-0">
                      <Image
                        src={getProductImage(detail)}
                        alt={detail.product?.name || 'Sản phẩm'}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-brand-dark">
                        {detail.product?.name || 'Sản phẩm'}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-brand-dark/50">
                        <span>Số lượng: {detail.quantity}</span>
                        <span className="text-xs">×</span>
                        <span>{formatCurrency(detail.unitPrice)}</span>
                      </div>
                    </div>
                    <span className="font-bold text-brand-accent whitespace-nowrap">
                      {formatCurrency(detail.subtotal)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-brand-warm">
              <div className="flex justify-between items-center">
                <span className="font-medium text-brand-dark">Tổng tiền</span>
                <span className="text-xl font-bold text-brand-accent">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
              {order.shippingFee > 0 && (
                <div className="flex justify-between items-center mt-1 text-sm text-brand-dark/50">
                  <span>Phí vận chuyển</span>
                  <span>{formatCurrency(order.shippingFee)}</span>
                </div>
              )}
            </div>
          </div>

          {order.note && (
            <div className="mt-4 bg-[#FAF8F5] border border-brand-warm rounded-2xl p-4">
              <h4 className="text-xs font-bold text-brand-dark/50 uppercase tracking-wider mb-1">Ghi chú</h4>
              <p className="text-sm text-brand-dark/70">{order.note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}