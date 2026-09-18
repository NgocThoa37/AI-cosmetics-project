'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import AccountSidebar from '@/components/customer/AccountSidebar';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMyOrders } from '@/store/slices/order.slice';
import { formatCurrency, formatDate, getOrderStatusLabel, getOrderStatusColor } from '@/helpers/format.helper';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';

// ✅ Hàm lấy ảnh từ productDetail.images
const getProductImage = (detail: any): string => {
  if (detail.productDetail?.images?.length > 0) {
    const mainImage = detail.productDetail.images.find((img: any) => img.isMain);
    return mainImage?.imageUrl || detail.productDetail.images[0]?.imageUrl;
  }
  return '/placeholder-product.jpg';
};

// ✅ Component con chứa logic dùng useSearchParams
function OrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useCustomerAuth();
  const dispatch = useAppDispatch();
  const { orders, loading } = useAppSelector((state) => state.order);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // ✅ Lấy token và message từ URL (khi redirect từ MoMo)
  const tokenFromUrl = searchParams.get('token');
  const paymentMessage = searchParams.get('message');
  const paymentStatus = searchParams.get('payment');

  useEffect(() => {
    if (tokenFromUrl) {
      localStorage.setItem('customer_token', tokenFromUrl);
      const newUrl = window.location.pathname + window.location.search.replace(/&?token=[^&]*/, '');
      router.replace(newUrl);
    }

    if (paymentMessage) {
      if (paymentStatus === 'success') {
        toast.success(decodeURIComponent(paymentMessage) || 'Thanh toán thành công!');
      } else {
        toast.error(decodeURIComponent(paymentMessage) || 'Thanh toán thất bại');
      }
      const newUrl = window.location.pathname + window.location.search.replace(/&?message=[^&]*/, '');
      router.replace(newUrl);
    }

    if (isAuthenticated) {
      dispatch(fetchMyOrders());
    }
  }, [isAuthenticated, dispatch, tokenFromUrl, paymentMessage, paymentStatus, router]);

  const filteredOrders = orders?.filter(order => {
    if (filter !== 'all' && order.orderStatus !== filter) return false;
    if (searchTerm && !order.orderCode.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const statusTabs = [
    { key: 'all', label: 'Tất cả' },
    { key: 'pending', label: 'Chờ xác nhận' },
    { key: 'confirmed', label: 'Đã xác nhận' },
    { key: 'shipping', label: 'Đang giao' },
    { key: 'delivered', label: 'Đã giao' },
    { key: 'cancelled', label: 'Đã hủy' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <AccountSidebar />

        <div className="lg:col-span-3">
          <h1 className="font-serif text-2xl text-brand-dark mb-6">Đơn hàng của tôi</h1>

          <div className="flex flex-wrap gap-2 mb-6 border-b border-brand-warm pb-3">
            {statusTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === tab.key ? 'bg-brand-accent text-white' : 'text-brand-dark/60 hover:text-brand-dark'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative mb-6">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-dark/40" />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã đơn hàng"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-brand-warm rounded-xl focus:outline-none focus:border-brand-accent text-sm"
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredOrders?.length === 0 ? (
            <div className="text-center py-16 bg-[#FAF8F5] border border-brand-warm rounded-2xl">
              <p className="text-brand-dark/50">Không có đơn hàng nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders?.map((order) => (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.id}`}
                  className="block bg-[#FAF8F5] border border-brand-warm rounded-2xl p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-mono text-sm text-brand-dark/50">{order.orderCode}</p>
                      <p className="text-xs text-brand-dark/40">{formatDate(order.createdAt)}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getOrderStatusColor(order.orderStatus)}`}>
                      {getOrderStatusLabel(order.orderStatus)}
                    </span>
                  </div>

                  <div className="flex gap-4 overflow-x-auto pb-3">
                    {order.details?.slice(0, 3).map((detail) => (
                      <div key={detail.id} className="flex flex-col items-center gap-1 flex-shrink-0 w-16">
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-white border border-brand-warm">
                          <Image
                            src={getProductImage(detail)}
                            alt={detail.product?.name || 'Sản phẩm'}
                            width={56}
                            height={56}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                            }}
                          />
                        </div>
                        <p className="text-[10px] text-brand-dark/70 text-center truncate w-full">
                          {detail.product?.name || 'Sản phẩm'}
                        </p>
                      </div>
                    ))}
                    {order.details && order.details.length > 3 && (
                      <div className="flex items-center text-xs text-brand-dark/50">
                        +{order.details.length - 3}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-brand-warm/50">
                    <span className="text-sm">Thành tiền</span>
                    <span className="font-bold text-brand-accent">{formatCurrency(order.totalAmount)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ✅ Export default với Suspense wrapper
export default function OrdersPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <OrdersContent />
    </Suspense>
  );
}