'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/admin/common/DataTable';
import { SearchFilterBar } from '@/components/admin/common/SearchFilterBar';
import { adminService } from '@/services/api/admin.service';
import { Order, OrderStatus } from '@/types/admin.types';
import toast from 'react-hot-toast';

const statusOptions = [
  { value: OrderStatus.PENDING, label: 'Chờ xác nhận' },
  { value: OrderStatus.CONFIRMED, label: 'Đã xác nhận' },
  { value: OrderStatus.SHIPPING, label: 'Đang giao' },
  { value: OrderStatus.DELIVERED, label: 'Đã giao' },
  { value: OrderStatus.CANCELLED, label: 'Đã hủy' },
];

const canTransition = (current: OrderStatus, target: OrderStatus): boolean => {
  if (current === target) return true;
  if (current === OrderStatus.DELIVERED || current === OrderStatus.CANCELLED) return false;
  if (current === OrderStatus.PENDING) return target === OrderStatus.CONFIRMED || target === OrderStatus.CANCELLED;
  if (current === OrderStatus.CONFIRMED) return target === OrderStatus.SHIPPING || target === OrderStatus.CANCELLED;
  if (current === OrderStatus.SHIPPING) return target === OrderStatus.DELIVERED;
  return false;
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await adminService.getOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    if (!canTransition(order.status, newStatus)) {
      setError(`Không thể chuyển từ "${order.status}" sang "${newStatus}"`);
      setTimeout(() => setError(''), 3000);
      return;
    }
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      toast.success(`Cập nhật trạng thái đơn hàng thành ${newStatus}`);
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    { key: 'id', header: 'ID', className: 'font-mono w-16' },
    { key: 'orderCode', header: 'Mã đơn', className: 'font-mono font-semibold' },
    { key: 'customerName', header: 'Khách hàng' },
    { key: 'address', header: 'Địa chỉ', render: (item: Order) => <span className="truncate max-w-[200px] block">{item.address}</span> },
    { key: 'totalPrice', header: 'Tổng tiền', render: (item: Order) => `${item.totalPrice.toLocaleString()}đ` },
    { key: 'createdDate', header: 'Ngày tạo' },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (item: Order) => (
        <select
          value={item.status}
          onChange={(e) => handleUpdateStatus(item.id, e.target.value as OrderStatus)}
          className={`px-2 py-1 rounded-md text-[10px] font-bold border cursor-pointer ${
            item.status === OrderStatus.PENDING ? 'bg-amber-50 text-amber-700 border-amber-200' :
            item.status === OrderStatus.CONFIRMED ? 'bg-blue-50 text-blue-700 border-blue-200' :
            item.status === OrderStatus.SHIPPING ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
            item.status === OrderStatus.DELIVERED ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
            'bg-rose-50 text-rose-700 border-rose-200'
          }`}
        >
          <option value={OrderStatus.PENDING}>{OrderStatus.PENDING}</option>
          <option value={OrderStatus.CONFIRMED}>{OrderStatus.CONFIRMED}</option>
          <option value={OrderStatus.SHIPPING}>{OrderStatus.SHIPPING}</option>
          <option value={OrderStatus.DELIVERED}>{OrderStatus.DELIVERED}</option>
          <option value={OrderStatus.CANCELLED}>{OrderStatus.CANCELLED}</option>
        </select>
      ),
    },
  ];

  return (
    <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <h3 className="text-sm font-bold text-slate-800">Danh sách đơn hàng</h3>
      </div>

      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        statusOptions={statusOptions}
        onReset={() => { setSearchQuery(''); setStatusFilter('ALL'); }}
        placeholder="Tìm theo mã đơn hoặc tên khách hàng"
      />

      {error && <div className="mx-4 mt-3 p-2 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-lg">{error}</div>}

      <DataTable data={filteredOrders} columns={columns} isLoading={loading} />
    </div>
  );
}