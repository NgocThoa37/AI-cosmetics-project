'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/admin/common/DataTable';
import { SearchFilterBar } from '@/components/admin/common/SearchFilterBar';
import { ConfirmModal } from '@/components/admin/common/ConfirmModal';
import { adminService } from '@/services/api/admin.service';
import { ProductVariant } from '@/types/admin.types';

export default function AdminVariantColors() {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<ProductVariant | null>(null);

  useEffect(() => {
    fetchVariants();
  }, []);

  const fetchVariants = async () => {
    try {
      const data = await adminService.getVariantsByType('Màu sắc');
      setVariants(data);
    } catch (error) {
      console.error('Failed to fetch color variants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminService.deleteVariant(deleteTarget.id);
      setVariants(prev => prev.filter(v => v.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error) {
      console.error('Failed to delete variant:', error);
    }
  };

  const filteredVariants = variants.filter(v => {
    return v.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.variantCode.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const columns = [
    { key: 'id', header: 'ID', className: 'font-mono w-16' },
    { key: 'variantCode', header: 'Mã', className: 'font-mono font-semibold' },
    { key: 'value', header: 'Màu sắc', className: 'font-semibold' },
  ];

  return (
    <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <h3 className="text-sm font-bold text-slate-800">Quản lý màu sắc</h3>
      </div>

      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter="ALL"
        onStatusFilterChange={() => {}}
        statusOptions={[]}
        onReset={() => setSearchQuery('')}
        placeholder="Tìm theo tên màu sắc"
      />

      <DataTable
        data={filteredVariants}
        columns={columns}
        onDelete={(item) => setDeleteTarget(item)}
        isLoading={loading}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Xác nhận xóa màu sắc"
        message={`Bạn có chắc chắn muốn xóa màu "${deleteTarget?.value}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}