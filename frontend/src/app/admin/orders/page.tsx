// frontend/src/app/admin/orders/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/admin/common/DataTable';
import { SearchFilterBar } from '@/components/admin/common/SearchFilterBar';
import { ConfirmModal } from '@/components/admin/common/ConfirmModal';
import { adminService } from '@/services/api/admin.service';
import { Order, OrderStatus } from '@/types/admin.types';
import toast from 'react-hot-toast';

const statusOptions = [
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'shipped', label: 'Đang giao' },
  { value: 'delivered', label: 'Đã giao' },
  { value: 'cancelled', label: 'Đã hủy' },
];

const getStatusLabel = (status: string) => {
  switch(status) {
    case 'pending': return 'Chờ xác nhận';
    case 'confirmed': return 'Đã xác nhận';
    case 'shipped': return 'Đang giao';
    case 'delivered': return 'Đã giao';
    case 'cancelled': return 'Đã hủy';
    default: return status;
  }
};

const getStatusColor = (status: string) => {
  switch(status) {
    case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'confirmed': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'shipped': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'cancelled': return 'bg-rose-50 text-rose-700 border-rose-200';
    default: return 'bg-slate-100 text-slate-600';
  }
};

const canTransition = (current: string | undefined, target: string): boolean => {
  if (!current) return target === 'confirmed' || target === 'cancelled';
  if (current === target) return true;
  if (current === 'delivered' || current === 'cancelled') return false;
  if (current === 'pending') return target === 'confirmed' || target === 'cancelled';
  if (current === 'confirmed') return target === 'shipped' || target === 'cancelled';
  if (current === 'shipped') return target === 'delivered';
  return false;
};

const formatCurrency = (amount: number) => {
  if (!amount || isNaN(amount)) return '0đ';
  return Number(amount || 0).toLocaleString('vi-VN') + 'đ';
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await adminService.getOrders();
      setOrders(data || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setOrders([]);
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    const order = orders.find(o => String(o.id) === orderId);
    if (!order) return;
    
    if (!canTransition(order.orderStatus, newStatus)) {
      setError(`Không thể chuyển từ "${getStatusLabel(order.orderStatus || 'pending')}" sang "${getStatusLabel(newStatus)}"`);
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => String(o.id) === orderId ? { ...o, orderStatus: newStatus as OrderStatus } : o));
      toast.success(`Cập nhật trạng thái đơn hàng thành ${getStatusLabel(newStatus)}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi cập nhật trạng thái');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminService.deleteOrder(String(deleteTarget.id));
      toast.success('Xóa đơn hàng thành công');
      fetchOrders();
      setDeleteTarget(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể xóa đơn hàng');
    }
  };

  const handleDeleteMultiple = async () => {
    if (selectedOrders.length === 0) return;
    try {
      const ids = selectedOrders.map(Number);
      await adminService.deleteMultipleOrders(ids);
      toast.success(`Xóa ${selectedOrders.length} đơn hàng thành công`);
      setSelectedOrders([]);
      fetchOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi xóa nhiều đơn hàng');
    }
  };

  const handleViewDetail = async (id: string) => {
    try {
      const order = await adminService.getOrderById(id);
      console.log('📦 Order details:', order);
      console.log('📦 Order details items:', order?.details);
      setSelectedOrder(order);
    } catch (error) {
      toast.error('Không thể tải chi tiết đơn hàng');
    }
  };

  const filteredOrders = orders.filter(order => {
    const orderCode = order.orderCode || String(order.id);
    const customerName = order.customer?.user?.fullName || '';
    const phone = order.customer?.user?.phone || '';
    
    const matchesSearch = orderCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phone.includes(searchQuery);
    const matchesStatus = statusFilter === 'ALL' || order.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    { key: 'id', header: 'ID', className: 'font-mono w-16' },
    { 
      key: 'orderCode', 
      header: 'Mã đơn', 
      className: 'font-mono font-semibold',
      render: (item: Order) => item.orderCode || `#${item.id}`
    },
    { 
      key: 'customerName', 
      header: 'Khách hàng',
      render: (item: Order) => item.customer?.user?.fullName || '—'
    },
    { 
      key: 'phone', 
      header: 'SĐT',
      render: (item: Order) => item.customer?.user?.phone || '—'
    },
    { 
      key: 'totalAmount', 
      header: 'Tổng tiền', 
      render: (item: Order) => formatCurrency(item.totalAmount || 0)
    },
    { 
      key: 'createdAt', 
      header: 'Ngày tạo',
      render: (item: Order) => item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : '—'
    },
    {
      key: 'orderStatus',
      header: 'Trạng thái',
      render: (item: Order) => (
        <select
          value={item.orderStatus || 'pending'}
          onChange={(e) => handleUpdateStatus(String(item.id), e.target.value)}
          className={`px-2 py-1 rounded-md text-[10px] font-bold border cursor-pointer ${getStatusColor(item.orderStatus || 'pending')}`}
        >
          <option value="pending">Chờ xác nhận</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="shipped">Đang giao</option>
          <option value="delivered">Đã giao</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      ),
    },
  ];

  return (
    <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
        <h3 className="text-sm font-bold text-slate-800">Danh sách đơn hàng</h3>
        {selectedOrders.length > 0 && (
          <button
            onClick={handleDeleteMultiple}
            className="bg-rose-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-rose-700 transition-colors"
          >
            Xóa {selectedOrders.length} đơn đã chọn
          </button>
        )}
      </div>

      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        statusOptions={statusOptions}
        onReset={() => { setSearchQuery(''); setStatusFilter('ALL'); }}
        placeholder="Tìm theo mã đơn, tên khách hàng hoặc SĐT"
      />

      {error && <div className="mx-4 mt-3 p-2 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-lg">{error}</div>}

      <DataTable
        data={filteredOrders}
        columns={columns}
        onView={(item) => handleViewDetail(String(item.id))}
        onDelete={(item) => setDeleteTarget(item)}
        isLoading={loading}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Xác nhận xóa đơn hàng"
        message={`Bạn có chắc chắn muốn xóa đơn hàng "${deleteTarget?.orderCode || deleteTarget?.id}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Modal chi tiết đơn hàng */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold">Chi tiết đơn hàng #{selectedOrder.orderCode || selectedOrder.id}</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold">Mã đơn:</span> {selectedOrder.orderCode || `#${selectedOrder.id}`}
                </div>
                <div>
                  <span className="font-semibold">Ngày tạo:</span> {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString('vi-VN') : '—'}
                </div>
                <div>
                  <span className="font-semibold">Khách hàng:</span> {selectedOrder.customer?.user?.fullName || '—'}
                </div>
                <div>
                  <span className="font-semibold">SĐT:</span> {selectedOrder.customer?.user?.phone || '—'}
                </div>
                <div>
                  <span className="font-semibold">Tổng tiền:</span> {formatCurrency(selectedOrder.totalAmount || 0)}
                </div>
                <div>
                  <span className="font-semibold">Trạng thái:</span> {getStatusLabel(selectedOrder.orderStatus || 'pending')}
                </div>
              </div>
              
              {selectedOrder.details && selectedOrder.details.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Chi tiết sản phẩm</h4>
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="p-2 text-left">Sản phẩm</th>
                        <th className="p-2 text-right">Số lượng</th>
                        <th className="p-2 text-right">Đơn giá</th>
                        <th className="p-2 text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.details.map((item, idx) => {
                        // Lấy tên sản phẩm từ product hoặc productDetail
                        const productName = item.product?.name || 
                                            item.productDetail?.product?.name || 
                                            'Không xác định';
                        // Lấy giá từ unitPrice hoặc productDetail
                        const price = item.unitPrice || 
                                      item.productDetail?.price || 
                                      0;
                        const quantity = item.quantity || 1;
                        const subtotal = item.subtotal || (quantity * price);
                        
                        return (
                          <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
                            <td className="p-2 font-medium">{productName}</td>
                            <td className="p-2 text-right">{quantity}</td>
                            <td className="p-2 text-right">{formatCurrency(price)}</td>
                            <td className="p-2 text-right font-semibold text-forest-700">
                              {formatCurrency(subtotal)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-200"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}