'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMyOrders } from '@/store/slices/order.slice';
import { fetchMyProfile } from '@/store/slices/auth.slice';
import { formatCurrency, formatDate, getOrderStatusLabel, getOrderStatusColor } from '@/helpers/format.helper';
import { User, MapPin, KeyRound, ShoppingBag, Bell, Star } from 'lucide-react';

export default function AccountPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { orders, loading: ordersLoading } = useAppSelector((state) => state.order);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    dispatch(fetchMyProfile());
    dispatch(fetchMyOrders());
  }, [isAuthenticated, router, dispatch]);

  const menuItems = [
    { href: '/account/profile', icon: User, label: 'Hồ sơ cá nhân' },
    { href: '/account/addresses', icon: MapPin, label: 'Địa chỉ giao hàng' },
    { href: '/account/change-password', icon: KeyRound, label: 'Đổi mật khẩu' },
    { href: '/account/orders', icon: ShoppingBag, label: 'Đơn hàng của tôi' },
    { href: '/account/reviews', icon: Star, label: 'Đánh giá của tôi' },
  ];

  const recentOrders = orders?.slice(0, 3) || [];

  if (authLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="bg-[#FAF8F5] border border-brand-warm rounded-2xl p-5 sticky top-24">
            <div className="flex items-center gap-3 pb-5 mb-3 border-b border-brand-warm">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-brand-sand">
                <Image
                  src={user?.user?.avatar || '/avatar-placeholder.jpg'}
                  alt={user?.user?.fullName || 'User'}
                  width={48}
                  height={48}
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-bold text-brand-dark">{user?.user?.fullName}</p>
                <p className="text-xs text-brand-dark/50">{user?.user?.email}</p>
              </div>
            </div>
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm text-brand-dark/70 hover:bg-brand-sand hover:text-brand-dark transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={16} />
                      <span>{item.label}</span>
                    </div>
                    ›
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#FAF8F5] border border-brand-warm rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-brand-accent">{user?.totalOrder || 0}</p>
              <p className="text-xs text-brand-dark/50">Đơn hàng đã đặt</p>
            </div>
            <div className="bg-[#FAF8F5] border border-brand-warm rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-brand-accent">{formatCurrency(user?.totalSpent || 0)}</p>
              <p className="text-xs text-brand-dark/50">Tổng chi tiêu</p>
            </div>
            <div className="bg-[#FAF8F5] border border-brand-warm rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-brand-accent">{orders?.length || 0}</p>
              <p className="text-xs text-brand-dark/50">Sản phẩm đã mua</p>
            </div>
          </div>

          <div className="bg-[#FAF8F5] border border-brand-warm rounded-2xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-brand-dark">Đơn hàng gần đây</h3>
              <Link href="/account/orders" className="text-xs text-brand-accent hover:underline">Xem tất cả</Link>
            </div>
            {ordersLoading ? (
              <div className="flex justify-center py-8"><LoadingSpinner /></div>
            ) : recentOrders.length === 0 ? (
              <p className="text-center text-brand-dark/50 py-8">Chưa có đơn hàng nào</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <Link key={order.id} href={`/account/orders/${order.id}`} className="block p-4 bg-white rounded-xl border border-brand-warm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-mono text-xs text-brand-dark/50">{order.orderCode}</p>
                        <p className="text-sm">{formatDate(order.createdAt)}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${getOrderStatusColor(order.orderStatus)}`}>
                        {getOrderStatusLabel(order.orderStatus)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-brand-warm/50">
                      <span className="text-sm">{order.details?.length || 0} sản phẩm</span>
                      <span className="font-bold text-brand-accent">{formatCurrency(order.totalAmount)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}