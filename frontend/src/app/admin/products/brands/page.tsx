'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/admin/common/DataTable';
import { SearchFilterBar } from '@/components/admin/common/SearchFilterBar';
import { ConfirmModal } from '@/components/admin/common/ConfirmModal';
import { adminService } from '@/services/api/admin.service';
import { Brand, BrandStatus } from '@/types/admin.types';

const statusOptions = [
  { value: BrandStatus.COOPERATING, label: 'Hợp tác' },
  { value: BrandStatus.SUSPENDED, label: 'Ngừng hợp tác' },
];

export default function AdminBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Brand | null>(null);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const data = await adminService.getBrands();
      setBrands(data);
    } catch (error) {
      console.error('Failed to fetch brands:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminService.deleteBrand(deleteTarget.id);
      setBrands(prev => prev.filter(b => b.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error) {
      console.error('Failed to delete brand:', error);
    }
  };

  const filteredBrands = brands.filter(brand => {
    const matchesSearch = brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brand.brandCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brand.origin.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || brand.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    { key: 'id', header: 'ID', className: 'font-mono w-16' },
    { key: 'brandCode', header: 'Mã thương hiệu', className: 'font-mono font-semibold' },
    { key: 'name', header: 'Tên thương hiệu', className: 'font-semibold' },
    { key: 'origin', header: 'Xuất xứ' },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (item: Brand) => (
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${
          item.status === BrandStatus.COOPERATING
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-amber-50 text-amber-700 border-amber-200'
        }`}>
          {item.status}
        </span>
      ),
    },
  ];

  return (
    <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <h3 className="text-sm font-bold text-slate-800">Danh sách thương hiệu</h3>
      </div>

      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        statusOptions={statusOptions}
        onReset={() => { setSearchQuery(''); setStatusFilter('ALL'); }}
      />

      <DataTable
        data={filteredBrands}
        columns={columns}
        onDelete={(item) => setDeleteTarget(item)}
        isLoading={loading}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Xác nhận xóa thương hiệu"
        message={`Bạn có chắc chắn muốn xóa thương hiệu "${deleteTarget?.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}