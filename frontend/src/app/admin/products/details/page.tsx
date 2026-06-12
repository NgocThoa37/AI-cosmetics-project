'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/admin/common/DataTable';
import { SearchFilterBar } from '@/components/admin/common/SearchFilterBar';
import { ConfirmModal } from '@/components/admin/common/ConfirmModal';
import { adminService } from '@/services/api/admin.service';
import { ProductDetail } from '@/types/admin.types';

export default function AdminProductDetails() {
  const [details, setDetails] = useState<ProductDetail[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<ProductDetail | null>(null);

  useEffect(() => {
    fetchDetails();
  }, []);

  const fetchDetails = async () => {
    try {
      const data = await adminService.getProductDetails();
      setDetails(data);
    } catch (error) {
      console.error('Failed to fetch product details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminService.deleteProductDetail(deleteTarget.id);
      setDetails(prev => prev.filter(d => d.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error) {
      console.error('Failed to delete product detail:', error);
    }
  };

  const filteredDetails = details.filter(detail => {
    return detail.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      detail.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      detail.skinType.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const columns = [
    { key: 'id', header: 'ID', className: 'font-mono w-16' },
    { key: 'productName', header: 'Sản phẩm', className: 'font-semibold' },
    { key: 'skinType', header: 'Loại da' },
    { key: 'sku', header: 'SKU', className: 'font-mono' },
    { key: 'quantity', header: 'Tồn kho', render: (item: ProductDetail) => (
      <span className={item.quantity === 0 ? 'text-rose-600 font-bold' : ''}>{item.quantity}</span>
    ) },
    { key: 'color', header: 'Màu sắc', render: (item: ProductDetail) => item.color || '---' },
    { key: 'size', header: 'Kích thước', render: (item: ProductDetail) => item.size || '---' },
  ];

  return (
    <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <h3 className="text-sm font-bold text-slate-800">Chi tiết sản phẩm</h3>
      </div>

      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter="ALL"
        onStatusFilterChange={() => {}}
        statusOptions={[]}
        onReset={() => setSearchQuery('')}
        placeholder="Tìm theo sản phẩm, SKU hoặc loại da"
      />

      <DataTable
        data={filteredDetails}
        columns={columns}
        onDelete={(item) => setDeleteTarget(item)}
        isLoading={loading}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Xác nhận xóa chi tiết sản phẩm"
        message={`Bạn có chắc chắn muốn xóa chi tiết của "${deleteTarget?.productName}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}       