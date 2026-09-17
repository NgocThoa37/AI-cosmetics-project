'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMyOrders } from '@/store/slices/order.slice';
import { fetchMyProfile } from '@/store/slices/customerAuth.slice';
import { formatCurrency, formatDate, getOrderStatusLabel, getOrderStatusColor } from '@/helpers/format.helper';
import AccountSidebar from '@/components/customer/AccountSidebar';

export default function AccountPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, loading: authLoading } = useCustomerAuth();
  const { orders, loading: ordersLoading } = useAppSelector((state) => state.order);

  useEffect(() => {
    // ✅ CHỈ LOG, KHÔNG REDIRECT
    const token = localStorage.getItem('customer_token');
    console.log('🔍 [AccountPage] Token:', token ? 'CÓ' : 'KHÔNG');
    console.log('🔍 [AccountPage] isAuthenticated:', isAuthenticated);
    
    // ❌ KHÔNG REDIRECT
    // if (!isAuthenticated) {
    //   router.push('/login');
    //   return;
    // }
    
    // ✅ Nếu có token và authenticated, fetch data
    if (token && isAuthenticated) {
      dispatch(fetchMyProfile());
      dispatch(fetchMyOrders());
    }
  }, [isAuthenticated, router, dispatch]);

  const recentOrders = orders?.slice(0, 3) || [];

  if (authLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const userInfo = user || {};
  const fullName = userInfo.fullName || 'Khách hàng';
  const email = userInfo.email || '';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <AccountSidebar />

        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#FAF8F5] border border-brand-warm rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-brand-accent">{userInfo.totalOrder || 0}</p>
              <p className="text-xs text-brand-dark/50">Đơn hàng đã đặt</p>
            </div>
            <div className="bg-[#FAF8F5] border border-brand-warm rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-brand-accent">{formatCurrency(userInfo.totalSpent || 0)}</p>
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