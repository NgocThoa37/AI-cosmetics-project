'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/admin/common/DataTable';
import { SearchFilterBar } from '@/components/admin/common/SearchFilterBar';
import { ConfirmModal } from '@/components/admin/common/ConfirmModal';
import { BrandForm } from '@/components/admin/forms/BrandForm';
import { adminService } from '@/services/api/admin.service';
import { Brand, BrandStatus } from '@/types/admin.types';
import toast from 'react-hot-toast';

// 🔥 SỬA: DÙNG GIÁ TRỊ ENUM CỦA BACK-END
const statusOptions = [
  { value: 'cooperating', label: 'Hợp tác' },
  { value: 'suspended', label: 'Ngừng hợp tác' },
];

export default function AdminBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Brand | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const data = await adminService.getBrands();
      setBrands(data || []);
    } catch (error) {
      console.error('Failed to fetch brands:', error);
      toast.error('Không thể tải danh sách thương hiệu');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: Partial<Brand>) => {
    try {
      if (editingBrand) {
        await adminService.updateBrand(String(editingBrand.id), data);
        toast.success('Cập nhật thương hiệu thành công');
      } else {
        await adminService.createBrand(data);
        toast.success('Thêm thương hiệu thành công');
      }
      await fetchBrands();
      setIsFormOpen(false);
      setEditingBrand(null);
    } catch (error: any) {
      console.error('Lỗi khi lưu:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi lưu thương hiệu');
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await adminService.updateBrand(String(id), { status });
      setBrands(prev => prev.map(b => b.id === id ? { ...b, status } : b));
      toast.success('Cập nhật trạng thái thành công');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi cập nhật trạng thái');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminService.deleteBrand(String(deleteTarget.id));
      toast.success('Xóa thương hiệu thành công');
      await fetchBrands();
      setDeleteTarget(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể xóa thương hiệu vì đang có sản phẩm sử dụng');
    }
  };

  const filteredBrands = brands.filter(brand => {
    const matchesSearch = brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brand.brandCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brand.origin?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || brand.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status: string) => {
    return status === 'cooperating'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : 'bg-amber-50 text-amber-700 border-amber-200';
  };

  const getStatusLabel = (status: string) => {
    return status === 'cooperating' ? 'Hợp tác' : 'Ngừng hợp tác';
  };

  const columns = [
    { key: 'id', header: 'ID', className: 'font-mono w-16' },
    { key: 'brandCode', header: 'Mã thương hiệu', className: 'font-mono font-semibold' },
    { key: 'name', header: 'Tên thương hiệu', className: 'font-semibold' },
    { key: 'origin', header: 'Xuất xứ' },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (item: Brand) => (
        <select
          value={item.status}
          onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
          className={`px-2 py-1 rounded-full text-[10px] font-bold border cursor-pointer ${getStatusBadgeClass(item.status)}`}
        >
          <option value="cooperating">Hợp tác</option>
          <option value="suspended">Ngừng hợp tác</option>
        </select>
      ),
    },
  ];

  return (
    <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-800">Danh sách thương hiệu</h3>
      </div>

      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        statusOptions={statusOptions}
        onReset={() => { setSearchQuery(''); setStatusFilter('ALL'); }}
        onAdd={() => {
          setEditingBrand(null);
          setIsFormOpen(true);
        }}
        addButtonLabel=" Thêm thương hiệu"
        placeholder="Tìm theo mã, tên hoặc xuất xứ thương hiệu"
      />

      <DataTable
        data={filteredBrands}
        columns={columns}
        onEdit={(item) => {
          setEditingBrand(item);
          setIsFormOpen(true);
        }}
        onDelete={(item) => setDeleteTarget(item)}
        onView={(item) => setSelectedBrand(item)}
        isLoading={loading}
      />

      <BrandForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingBrand(null);
        }}
        onSave={handleSave}
        initialData={editingBrand}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Xác nhận xóa thương hiệu"
        message={`Bạn có chắc chắn muốn xóa thương hiệu "${deleteTarget?.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {selectedBrand && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Chi tiết thương hiệu</h3>
            <div className="space-y-3">
              <div><span className="font-semibold">ID:</span> {selectedBrand.id}</div>
              <div><span className="font-semibold">Mã thương hiệu:</span> {selectedBrand.brandCode}</div>
              <div><span className="font-semibold">Tên thương hiệu:</span> {selectedBrand.name}</div>
              <div><span className="font-semibold">Xuất xứ:</span> {selectedBrand.origin || '—'}</div>
              <div><span className="font-semibold">Trạng thái:</span> {getStatusLabel(selectedBrand.status)}</div>
            </div>
            <button
              onClick={() => setSelectedBrand(null)}
              className="mt-4 w-full bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-200"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}