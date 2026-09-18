'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useCart } from '@/hooks/useCart';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { useAppDispatch } from '@/store/hooks';
import { createOrder } from '@/store/slices/order.slice';
import { paymentService } from '@/services/api/payment.service';
import { formatCurrency } from '@/helpers/format.helper';
import { MapPin, ShieldCheck, CreditCard, ArrowLeft } from 'lucide-react';
import { PaymentMethod } from '@/types';
import toast from 'react-hot-toast';

const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="2"%3E%3Crect x="3" y="3" width="18" height="18" rx="2"%3E%3C/rect%3E%3Ccircle cx="8.5" cy="8.5" r="1.5"%3E%3C/circle%3E%3Cpath d="M21 15l-5-5L5 21"%3E%3C/path%3E%3C/svg%3E';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { user } = useCustomerAuth();
  const { cart, loading: cartLoading, clearCart } = useCart();

  const [selectedDetailIds, setSelectedDetailIds] = useState<number[]>([]);
  const [buyNowItem, setBuyNowItem] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.COD);
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const productDetailId = searchParams.get('productDetailId');
  const quantity = parseInt(searchParams.get('quantity') || '1');

  useEffect(() => {
    const token = localStorage.getItem('customer_token');
    if (!token) {
      router.push('/');
      return;
    }

    if (productDetailId) {
      fetch(`/api/products/details/${productDetailId}`)
        .then(res => res.json())
        .then(data => {
          const productData = data.data || data;
          setBuyNowItem({
            ...productData,
            id: productData.id || productData.productDetailId,
            quantity: quantity,
            product: productData.product,
          });
        })
        .catch(err => {
          console.error('❌ Failed to get product:', err);
          toast.error('Không thể lấy thông tin sản phẩm');
          router.push('/cart');
        });
      return;
    }

    const ids = searchParams.get('ids');
    if (ids) {
      setSelectedDetailIds(ids.split(',').map(Number));
    } else {
      router.push('/cart');
      return;
    }

    const userInfo = user?.user || user || {};
    if (userInfo.fullName) setRecipientName(userInfo.fullName);
    if (userInfo.phone) setRecipientPhone(userInfo.phone);
  }, [router, searchParams, user, productDetailId, quantity]);

  let selectedDetails = [];
  let subtotal = 0;

  if (buyNowItem) {
    selectedDetails = [buyNowItem];
    subtotal = (buyNowItem.product?.price || 0) * buyNowItem.quantity;
  } else {
    selectedDetails = cart?.details?.filter(item => selectedDetailIds.includes(item.id)) || [];
    subtotal = selectedDetails.reduce((sum, item) => {
      const product = (item as any).product;
      const productDetail = item.productDetail;
      const productFromDetail = (productDetail as any)?.product;
      const finalProduct = product || productFromDetail;
      const price = finalProduct?.price || 0;
      return sum + price * item.quantity;
    }, 0);
  }

  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const total = subtotal + shippingFee;

  const getImageUrl = (item: any): string => {
    const product = item.product || item;
    const productDetail = item.productDetail || item;

    if (product?.images && product.images.length > 0) {
      const mainImage = product.images.find((img: any) => img.isMain);
      if (mainImage?.imageUrl) return mainImage.imageUrl;
      if (product.images[0]?.imageUrl) return product.images[0].imageUrl;
    }

    if (productDetail?.images && productDetail.images.length > 0) {
      const mainImage = productDetail.images.find((img: any) => img.isMain);
      if (mainImage?.imageUrl) return mainImage.imageUrl;
      if (productDetail.images[0]?.imageUrl) return productDetail.images[0].imageUrl;
    }

    return PLACEHOLDER_IMAGE;
  };

  const handlePlaceOrder = async () => {
    if (!recipientName || !recipientPhone || !recipientAddress) {
      toast.error('Vui lòng điền đầy đủ thông tin giao hàng');
      return;
    }

    setIsSubmitting(true);
    try {
      let items = [];

      if (buyNowItem) {
        if (!buyNowItem.id) {
          toast.error('Không tìm thấy ID sản phẩm');
          setIsSubmitting(false);
          return;
        }

        items = [{
          productDetailId: buyNowItem.id,
          quantity: buyNowItem.quantity
        }];
      } else {
        items = selectedDetails.map(item => ({
          productDetailId: item.productDetailId,
          quantity: item.quantity
        }));
      }

      if (items.length === 0) {
        toast.error('Không có sản phẩm để đặt hàng');
        setIsSubmitting(false);
        return;
      }

      const orderData = {
        shippingAddress: recipientAddress,
        shippingPhone: recipientPhone,
        note: note || undefined,
        paymentMethod,
        items,
      };

      const order = await dispatch(createOrder(orderData)).unwrap();

      if (!order || !order.id) {
        toast.error('Không thể tạo đơn hàng');
        setIsSubmitting(false);
        return;
      }

      await clearCart();

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
    } catch (error: any) {
      console.error('❌ [ĐẶT HÀNG] Error:', error);
      toast.error(error.response?.data?.message || 'Đặt hàng thất bại, vui lòng thử lại');
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

  if (selectedDetails.length === 0 && !buyNowItem) {
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
        <div className="lg:col-span-2 space-y-6">
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

        <div className="lg:col-span-1">
          <div className="bg-[#FAF8F5] border border-brand-warm rounded-2xl p-6 sticky top-24">
            <h3 className="font-bold text-brand-dark mb-4 pb-3 border-b border-brand-warm">Đơn hàng của bạn</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto mb-4">
              {selectedDetails.map((item) => {
                const product = (item as any).product || item.product;
                const productName = product?.name || 'Sản phẩm';
                const price = product?.price || 0;
                const imageUrl = getImageUrl(item);
                const qty = item.quantity || 1;

                return (
                  <div key={item.id} className="flex gap-3 text-sm">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-white border border-brand-warm flex-shrink-0">
                      <Image
                        src={imageUrl}
                        alt={productName}
                        width={48}
                        height={48}
                        className="object-cover"
                        onError={(e) => {
                          e.currentTarget.src = PLACEHOLDER_IMAGE;
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium line-clamp-1">{productName}</p>
                      <p className="text-xs text-brand-dark/50">SL: {qty}</p>
                    </div>
                    <div className="font-medium">{formatCurrency(price * qty)}</div>
                  </div>
                );
              })}
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

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}