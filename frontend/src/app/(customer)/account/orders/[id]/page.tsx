'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchOrderById, cancelOrder } from '@/store/slices/order.slice';
import { formatCurrency, formatDateTime, getOrderStatusLabel, getOrderStatusColor } from '@/helpers/format.helper';
import { MapPin, Phone, CreditCard, AlertCircle } from 'lucide-react';
import { OrderStatus } from '@/types';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const dispatch = useAppDispatch();
  const { currentOrder, loading } = useAppSelector((state) => state.order);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    if (id) dispatch(fetchOrderById(parseInt(id)));
  }, [dispatch, id]);

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) { toast.error('Vui lòng nhập lý do hủy đơn'); return; }
    await dispatch(cancelOrder({ orderId: currentOrder!.id, reason: cancelReason }));
    setShowCancelConfirm(false);
    dispatch(fetchOrderById(currentOrder!.id));
    toast.success('Đã hủy đơn hàng');
  };

  if (loading || !currentOrder) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const canCancel = currentOrder.orderStatus === OrderStatus.PENDING || currentOrder.orderStatus === OrderStatus.CONFIRMED;

  const getPaymentMethodLabel = (method: string): string => ({ 
    cod: 'Thanh toán khi nhận hàng (COD)', 
    momo: 'Ví điện tử MoMo', 
    vnpay: 'VNPAY' 
  }[method] || method);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-serif text-2xl text-brand-dark">Chi tiết đơn hàng</h1>
          <p className="text-sm text-brand-dark/50 font-mono">Mã đơn: {currentOrder.orderCode}</p>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-bold ${getOrderStatusColor(currentOrder.orderStatus)}`}>
          {getOrderStatusLabel(currentOrder.orderStatus)}
        </span>
      </div>

      <div className="space-y-6">
        {/* Shipping Info */}
        <div className="bg-[#FAF8F5] border border-brand-warm rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <MapPin size={20} className="text-brand-accent flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-bold text-brand-dark mb-3">Thông tin giao hàng</h3>
              <div className="space-y-1 text-sm">
                <p className="font-medium">{currentOrder.customer?.user?.fullName || 'Khách hàng'}</p>
                <div className="flex items-center gap-2 text-brand-dark/60">
                  <Phone size={12} />
                  <span>{currentOrder.shippingPhone}</span>
                </div>
                <p className="text-brand-dark/60 mt-2">{currentOrder.shippingAddress}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="bg-[#FAF8F5] border border-brand-warm rounded-2xl p-6">
          <h3 className="font-bold text-brand-dark mb-4">Sản phẩm đã mua</h3>
          <div className="space-y-4">
            {currentOrder.details?.map((detail) => (
              <div key={detail.id} className="flex gap-4 pb-4 border-b border-brand-warm last:border-0">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-white border border-brand-warm flex-shrink-0">
                  <Image
                    src={detail.product?.images?.find(img => img.isMain)?.imageUrl || '/placeholder.jpg'}
                    alt=""
                    width={64}
                    height={64}
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-bold">{detail.product?.name}</p>
                  <p className="text-xs text-brand-dark/50">x{detail.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-brand-accent">{formatCurrency(detail.subtotal)}</p>
                  <p className="text-xs text-brand-dark/50">{formatCurrency(detail.unitPrice)} / sp</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-brand-warm space-y-2">
            <div className="flex justify-between text-sm">
              <span>Tạm tính</span>
              <span>{formatCurrency(currentOrder.totalAmount - currentOrder.shippingFee)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Phí vận chuyển</span>
              <span>{currentOrder.shippingFee === 0 ? 'Miễn phí' : formatCurrency(currentOrder.shippingFee)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2">
              <span>Tổng cộng</span>
              <span className="text-brand-accent">{formatCurrency(currentOrder.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-[#FAF8F5] border border-brand-warm rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <CreditCard size={20} className="text-brand-accent flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-bold text-brand-dark mb-2">Phương thức thanh toán</h3>
              <p className="text-sm">{getPaymentMethodLabel(currentOrder.paymentMethod)}</p>
              <p className={`text-xs mt-1 ${currentOrder.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                {currentOrder.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
              </p>
            </div>
          </div>
        </div>

        {/* Cancel Button */}
        {canCancel && (
          <div className="flex justify-end">
            <Button variant="danger" onClick={() => setShowCancelConfirm(true)}>
              Hủy đơn hàng
            </Button>
          </div>
        )}

        {/* Cancel Modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="flex items-center gap-2 text-amber-600 mb-4">
                <AlertCircle size={20} />
                <h3 className="font-bold">Xác nhận hủy đơn hàng</h3>
              </div>
              <p className="text-sm text-brand-dark/70 mb-4">
                Bạn có chắc chắn muốn hủy đơn hàng #{currentOrder.orderCode}?
              </p>
              <textarea
                placeholder="Lý do hủy đơn (bắt buộc)"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-brand-warm rounded-xl focus:outline-none focus:border-brand-accent text-sm mb-4"
              />
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowCancelConfirm(false)}>Đóng</Button>
                <Button variant="danger" onClick={handleCancelOrder}>Xác nhận hủy</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}