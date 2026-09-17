'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RevenueChart } from '@/components/admin/charts/RevenueChart';
import { StatusBadge } from '@/components/admin/common/StatusBadge';
import { adminService } from '@/services/api/admin.service';
import { Account, Order, Review } from '@/types/admin.types';
import { CheckCircle2, ShoppingBag, Users, DollarSign, RefreshCw, Clock, XCircle, Package } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [accountsRes, ordersRes, reviewsRes] = await Promise.all([
        adminService.getAccounts(),
        adminService.getOrders(),
        adminService.getReviews(),
      ]);
      setAccounts(accountsRes || []);
      setOrders(ordersRes || []);
      setReviews(reviewsRes || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Không thể tải dữ liệu tổng quan');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    toast.success('Đã làm mới dữ liệu');
  };

  // ✅ FIX: Đúng với giá trị từ backend
  // Backend trả về: ['delivered', 'confirmed', 'shipped', 'pending']
  
  const totalOrders = orders?.length || 0;
  
  const deliveredOrders = orders?.filter(o => 
    o.orderStatus === 'delivered'
  ).length || 0;
  
  const pendingOrders = orders?.filter(o => 
    o.orderStatus === 'pending'
  ).length || 0;
  
  const confirmedOrders = orders?.filter(o => 
    o.orderStatus === 'confirmed'
  ).length || 0;
  
  const shippingOrders = orders?.filter(o => 
    o.orderStatus === 'shipped'  // ✅ 'shipped' không phải 'shipping'
  ).length || 0;
  
  const cancelledOrders = orders?.filter(o => 
    o.orderStatus === 'cancelled' || 
    o.orderStatus === 'canceled'
  ).length || 0;
  
  // Doanh thu - chỉ tính đơn đã giao
  const totalRevenue = orders?.filter(o => 
    o.orderStatus === 'delivered'
  ).reduce((sum, o) => sum + Number(o.totalAmount || 0), 0) || 0;
  
  // Đánh giá chưa phản hồi
  const pendingReviews = reviews?.filter(r => !r.reply).length || 0;

  // Format tiền tệ
  const formatCurrency = (amount: number) => {
    if (!amount) return '0đ';
    return amount.toLocaleString('vi-VN') + 'đ';
  };

  const statsCards = [
    { 
      title: 'Tổng khách hàng', 
      value: accounts?.length || 0, 
      icon: Users, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50' 
    },
    { 
      title: 'Tổng đơn hàng', 
      value: totalOrders, 
      icon: ShoppingBag, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50' 
    },
    { 
      title: 'Đơn thành công', 
      value: deliveredOrders, 
      icon: CheckCircle2, 
      color: 'text-forest-600', 
      bg: 'bg-forest-50' 
    },
    { 
      title: 'Doanh thu', 
      value: formatCurrency(totalRevenue), 
      icon: DollarSign, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50' 
    },
  ];

  // Thống kê trạng thái đơn hàng
  const orderStatusStats = [
    { label: 'Chờ xác nhận', value: pendingOrders, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Đã xác nhận', value: confirmedOrders, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Đang giao', value: shippingOrders, icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Đã giao', value: deliveredOrders, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Đã hủy', value: cancelledOrders, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  const recentOrders = orders?.slice(0, 5) || [];
  const pendingReviewsList = reviews?.filter(r => !r.reply).slice(0, 3) || [];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-forest-600 rounded-full animate-spin mx-auto" />
          <p className="mt-3 text-sm text-slate-500">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">📊 Tổng quan</h2>
          <p className="text-sm text-slate-500">Thống kê hoạt động kinh doanh</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Đang làm mới...' : 'Làm mới'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statsCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white border border-slate-100 rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">{card.title}</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{card.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${card.bg}`}>
                  <Icon size={22} className={card.color} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Status Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {orderStatusStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white border border-slate-100 rounded-xl p-4 text-center hover:shadow-md transition-shadow">
              <div className={`inline-flex p-2 rounded-xl ${stat.bg} mb-2`}>
                <Icon size={16} className={stat.color} />
              </div>
              <p className="text-xl font-bold text-slate-800">{stat.value}</p>
              <p className="text-[10px] text-slate-400">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div className="bg-white border border-slate-100 rounded-xl p-5">
        <RevenueChart />
      </div>

      {/* Recent Orders & Pending Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white border border-slate-100 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-800">🛒 Đơn hàng gần đây</h3>
            <button 
              onClick={() => router.push('/admin/orders')} 
              className="text-xs text-forest-600 hover:underline"
            >
              Xem tất cả
            </button>
          </div>
          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-center text-slate-400 py-6 text-sm">Chưa có đơn hàng nào</p>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-lg hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="font-mono text-xs font-semibold text-slate-700">{order.orderCode || `#${order.id}`}</p>
                    <p className="text-[11px] text-slate-500">{order.customer?.user?.fullName || 'Khách hàng'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-800">{formatCurrency(order.totalAmount || 0)}</p>
                    <StatusBadge status={order.orderStatus || 'pending'} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Reviews */}
        <div className="bg-white border border-slate-100 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-800">💬 Đánh giá chưa phản hồi</h3>
            <button 
              onClick={() => router.push('/admin/reviews')} 
              className="text-xs text-forest-600 hover:underline"
            >
              Xem tất cả
            </button>
          </div>
          <div className="space-y-3">
            {pendingReviewsList.length === 0 ? (
              <p className="text-center text-slate-400 py-6 text-sm">Không có đánh giá nào chưa phản hồi</p>
            ) : (
              pendingReviewsList.map((review) => (
                <div key={review.id} className="p-3 bg-amber-50/30 rounded-lg border border-amber-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">
                        {review.customer?.user?.fullName || 'Khách hàng'}
                      </p>
                      <p className="text-xs text-amber-600">★ {review.rating}/5</p>
                    </div>
                    <StatusBadge status="Chưa phản hồi" />
                  </div>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">"{review.content}"</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Sản phẩm: {review.product?.name || '—'}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}