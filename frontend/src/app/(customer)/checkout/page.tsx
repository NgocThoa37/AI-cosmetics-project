'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch } from '@/store/hooks';
import { createOrder } from '@/store/slices/order.slice';
import { paymentService } from '@/services/api/payment.service';
import { formatCurrency } from '@/helpers/format.helper';
import { MapPin, ShieldCheck, CreditCard, ArrowLeft } from 'lucide-react';
import { PaymentMethod } from '@/types';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAuth();
  const { cart, loading: cartLoading } = useCart();
  const [selectedDetailIds, setSelectedDetailIds] = useState<number[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.COD);
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    const ids = searchParams.get('ids');
    if (ids) setSelectedDetailIds(ids.split(',').map(Number));
    if (user?.user?.fullName) setRecipientName(user.user.fullName);
    if (user?.user?.phone) setRecipientPhone(user.user.phone);
  }, [isAuthenticated, router, searchParams, user]);

  const selectedDetails = cart?.details?.filter(item => selectedDetailIds.includes(item.id)) || [];
  const subtotal = selectedDetails.reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);
  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const total = subtotal + shippingFee;

  const handlePlaceOrder = async () => {
    if (!recipientName || !recipientPhone || !recipientAddress) {
      toast.error('Vui lòng điền đầy đủ thông tin giao hàng');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        shippingAddress: recipientAddress,
        shippingPhone: recipientPhone,
        note: note || undefined,
        paymentMethod,
        items: selectedDetails.map(item => ({ 
          productDetailId: item.productDetailId, 
          quantity: item.quantity 
        })),
      };

      const order = await dispatch(createOrder(orderData)).unwrap();

      if (paymentMethod === PaymentMethod.MOMO) {
        const momoRes = await paymentService.createMomoPayment(order.id, `${window.location.origin}/payment/momo-return`);
        window.location.href = momoRes.payUrl;
      } else if (paymentMethod === PaymentMethod.VNPAY) {
        const vnpayRes = await paymentService.createVnpayPayment(order.id, `${window.location.origin}/payment/vnpay-return`);
        window.location.href = vnpayRes.payUrl;
      } else {
        router.push(`/account/orders/${order.id}?success=true`);
        toast.success('Đặt hàng thành công!');
      }
    } catch (error) {
      toast.error('Đặt hàng thất bại, vui lòng thử lại');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (selectedDetails.length === 0) {
    return (
      <div className="flex justify-center py-20">
        <div className="text-center">
          <p className="text-brand-dark/60">Không có sản phẩm nào được chọn</p>
          <Button onClick={() => router.push('/cart')} className="mt-4">
            Quay lại giỏ hàng
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 hover:bg-brand-sand rounded-full">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-serif text-2xl text-brand-dark">Thanh toán</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <div className="bg-[#FAF8F5] border border-brand-warm rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <MapPin size={20} className="text-brand-accent flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-brand-dark mb-4">Địa chỉ nhận hàng</h3>
                <div className="space-y-3">
                  <Input 
                    label="Họ tên người nhận" 
                    value={recipientName} 
                    onChange={(e) => setRecipientName(e.target.value)} 
                    placeholder="Nhập họ tên" 
                  />
                  <Input 
                    label="Số điện thoại" 
                    value={recipientPhone} 
                    onChange={(e) => setRecipientPhone(e.target.value)} 
                    placeholder="Nhập số điện thoại" 
                  />
                  <Input 
                    label="Địa chỉ cụ thể" 
                    value={recipientAddress} 
                    onChange={(e) => setRecipientAddress(e.target.value)} 
                    placeholder="Số nhà, tên đường..." 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-[#FAF8F5] border border-brand-warm rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <CreditCard size={20} className="text-brand-accent flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-brand-dark mb-4">Phương thức thanh toán</h3>
                <div className="space-y-3">
                  {[
                    { value: PaymentMethod.COD, label: 'Thanh toán khi nhận hàng (COD)' },
                    { value: PaymentMethod.MOMO, label: 'Ví điện tử MoMo' },
                    { value: PaymentMethod.VNPAY, label: 'VNPAY' },
                  ].map((method) => (
                    <label 
                      key={method.value} 
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${paymentMethod === method.value ? 'border-brand-accent bg-brand-accent/5' : 'border-brand-warm bg-white'}`}
                    >
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value={method.value} 
                        checked={paymentMethod === method.value} 
                        onChange={() => setPaymentMethod(method.value)} 
                        className="text-brand-accent" 
                      />
                      <span className="text-sm">{method.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Order Note */}
          <div className="bg-[#FAF8F5] border border-brand-warm rounded-2xl p-6">
            <label className="block font-bold text-brand-dark mb-2">Ghi chú đơn hàng</label>
            <textarea 
              value={note} 
              onChange={(e) => setNote(e.target.value)} 
              rows={3} 
              placeholder="Ghi chú về giao hàng..." 
              className="w-full px-4 py-3 bg-white border border-brand-warm rounded-xl focus:outline-none focus:border-brand-accent text-sm" 
            />
          </div>
        </div>

        {/* Right Column - Summary */}
        <div className="lg:col-span-1">
          <div className="bg-[#FAF8F5] border border-brand-warm rounded-2xl p-6 sticky top-24">
            <h3 className="font-bold text-brand-dark mb-4 pb-3 border-b border-brand-warm">Đơn hàng của bạn</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto mb-4">
              {selectedDetails.map((item) => (
                <div key={item.id} className="flex gap-3 text-sm">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-white border border-brand-warm flex-shrink-0">
                    <Image 
                      src={item.product?.images?.find(img => img.isMain)?.imageUrl || '/placeholder.jpg'} 
                      alt="" 
                      width={48} 
                      height={48} 
                      className="object-cover" 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium line-clamp-1">{item.product?.name}</p>
                    <p className="text-xs text-brand-dark/50">SL: {item.quantity}</p>
                  </div>
                  <div className="font-medium">{formatCurrency((item.product?.price || 0) * item.quantity)}</div>
                </div>
              ))}
            </div>
            <div className="space-y-2 pt-3 border-t border-brand-warm">
              <div className="flex justify-between text-sm">
                <span className="text-brand-dark/60">Tạm tính</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-brand-dark/60">Phí vận chuyển</span>
                <span>{shippingFee === 0 ? 'Miễn phí' : formatCurrency(shippingFee)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2">
                <span>Tổng cộng</span>
                <span className="text-brand-accent">{formatCurrency(total)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-brand-dark/50 mt-4 mb-6">
              <ShieldCheck size={14} />
              <span>Thanh toán an toàn bảo mật</span>
            </div>
            <Button onClick={handlePlaceOrder} loading={isSubmitting} fullWidth className="py-3">
              ĐẶT HÀNG NGAY
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}