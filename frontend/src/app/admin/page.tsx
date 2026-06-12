'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RevenueChart } from '@/components/admin/charts/RevenueChart';
import { StatusBadge } from '@/components/admin/common/StatusBadge';
import { adminService } from '@/services/api/admin.service';
import { Account, Order, Review } from '@/types/admin.types';
import { CheckCircle2, ShoppingBag, Users, Package, TrendingUp, DollarSign } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accountsRes, ordersRes, reviewsRes] = await Promise.all([
          adminService.getAccounts(),
          adminService.getOrders(),
          adminService.getReviews(),
        ]);
        setAccounts(accountsRes);
        setOrders(ordersRes);
        setReviews(reviewsRes);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalOrders = orders.length;
  const deliveredOrders = orders.filter(o => o.status === 'Đã giao').length;
  const cancelledOrders = orders.filter(o => o.status === 'Đã hủy').length;
  const totalRevenue = orders
    .filter(o => o.status === 'Đã giao')
    .reduce((sum, o) => sum + o.totalPrice, 0);
  const pendingReviews = reviews.filter(r => r.status === 'Chưa phản hồi').length;

  const statsCards = [
    { title: 'Tổng khách hàng', value: accounts.length, icon: Users, change: '+12%', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Tổng đơn hàng', value: totalOrders, icon: ShoppingBag, change: '+8%', color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Đơn thành công', value: deliveredOrders, icon: CheckCircle2, change: '96%', color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Doanh thu', value: totalRevenue.toLocaleString(), icon: DollarSign, change: '+15%', color: 'text-forest-600', bg: 'bg-forest-50', suffix: 'đ' },
  ];

  const recentOrders = orders.slice(0, 5);
  const pendingReviewsList = reviews.filter(r => r.status === 'Chưa phản hồi').slice(0, 3);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-forest-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statsCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">{card.title}</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">
                    {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                    {card.suffix && <span className="text-sm ml-0.5">{card.suffix}</span>}
                  </p>
                  <p className="text-[10px] text-emerald-600 mt-1">{card.change}</p>
                </div>
                <div className={`p-3 rounded-xl ${card.bg}`}>
                  <Icon size={22} className={card.color} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue Chart */}
      <RevenueChart />

      {/* Recent Orders & Pending Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white border border-slate-100 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-800">Đơn hàng gần đây</h3>
            <button onClick={() => router.push('/admin/orders')} className="text-xs text-forest-600 hover:underline">
              Xem tất cả
            </button>
          </div>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-lg">
                <div>
                  <p className="font-mono text-xs font-semibold text-slate-700">{order.orderCode}</p>
                  <p className="text-[11px] text-slate-500">{order.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-800">{order.totalPrice.toLocaleString()}đ</p>
                  <StatusBadge status={order.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Reviews */}
        <div className="bg-white border border-slate-100 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-800">Đánh giá chưa phản hồi</h3>
            <button onClick={() => router.push('/admin/reviews')} className="text-xs text-forest-600 hover:underline">
              Xem tất cả
            </button>
          </div>
          <div className="space-y-3">
            {pendingReviewsList.map((review) => (
              <div key={review.id} className="p-3 bg-amber-50/30 rounded-lg border border-amber-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{review.customerName}</p>
                    <p className="text-xs text-amber-600">★ {review.rating}/5</p>
                  </div>
                  <StatusBadge status={review.status} />
                </div>
                <p className="text-xs text-slate-600 mt-1 line-clamp-1">"{review.content}"</p>
                <p className="text-[10px] text-slate-400 mt-1">Sản phẩm: {review.productName}</p>
              </div>
            ))}
            {pendingReviewsList.length === 0 && (
              <p className="text-center text-slate-400 py-6 text-sm">Không có đánh giá nào chưa phản hồi</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}