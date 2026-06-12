'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMyOrders } from '@/store/slices/order.slice';
import { formatCurrency, formatDate, getOrderStatusLabel, getOrderStatusColor } from '@/helpers/format.helper';
import { Search } from 'lucide-react';

export default function OrdersPage() {
  const { isAuthenticated } = useAuth();
  const dispatch = useAppDispatch();
  const { orders, loading } = useAppSelector((state) => state.order);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchMyOrders());
  }, [isAuthenticated, dispatch]);

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
    <div className="max-w-5xl mx-auto px-4 py-10">
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
                  <div key={detail.id} className="w-14 h-14 rounded-lg overflow-hidden bg-white border border-brand-warm flex-shrink-0">
                    <Image
                      src={detail.product?.images?.find(img => img.isMain)?.imageUrl || '/placeholder.jpg'}
                      alt=""
                      width={56}
                      height={56}
                      className="object-cover"
                    />
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
  );
}