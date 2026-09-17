'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/admin/common/DataTable';
import { SearchFilterBar } from '@/components/admin/common/SearchFilterBar';
import { ConfirmModal } from '@/components/admin/common/ConfirmModal';
import { CategoryForm } from '@/components/admin/forms/CategoryForm';
import { adminService } from '@/services/api/admin.service';
import { Category, CategoryStatus } from '@/types/admin.types';
import toast from 'react-hot-toast';

const statusOptions = [
  { value: CategoryStatus.VISIBLE, label: 'Hiển thị' },
  { value: CategoryStatus.HIDDEN, label: 'Ẩn' },
];

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await adminService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Không thể tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: Partial<Category>) => {
    try {
      if (editingCategory) {
        await adminService.updateCategory(String(editingCategory.id), data);
        toast.success('Cập nhật danh mục thành công');
      } else {
        await adminService.createCategory(data);
        toast.success('Thêm danh mục thành công');
      }
      fetchCategories();
      setIsFormOpen(false);
      setEditingCategory(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi lưu danh mục');
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await adminService.updateCategory(String(id), { status });
      setCategories(prev => prev.map(c => c.id === id ? { ...c, status } : c));
      toast.success('Cập nhật trạng thái thành công');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi cập nhật trạng thái');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminService.deleteCategory(String(deleteTarget.id));
      toast.success('Xóa danh mục thành công');
      fetchCategories();
      setDeleteTarget(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể xóa danh mục vì đang có sản phẩm sử dụng');
    }
  };

  const filteredCategories = categories.filter(cat => {
    const matchesSearch = cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cat.catCode?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (cat.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || cat.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status: string) => {
    return status === CategoryStatus.VISIBLE
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : 'bg-slate-100 text-slate-500 border-slate-200';
  };

  const columns = [
    { key: 'id', header: 'ID', className: 'font-mono w-16' },
    { key: 'catCode', header: 'Mã danh mục', className: 'font-mono font-semibold' },
    { key: 'name', header: 'Tên danh mục', className: 'font-semibold' },
    { 
      key: 'parentId', 
      header: 'Danh mục cha',
      render: (item: Category) => {
        if (!item.parentId) return <span className="text-slate-400">—</span>;
        const parent = categories.find(c => c.id === item.parentId);
        return parent?.name || `#${item.parentId}`;
      }
    },
    { 
      key: 'description', 
      header: 'Mô tả', 
      render: (item: Category) => item.description?.slice(0, 50) || '---' 
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (item: Category) => (
        <select
          value={item.status}
          onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
          className={`px-2 py-1 rounded-full text-[10px] font-bold border cursor-pointer ${getStatusBadgeClass(item.status)}`}
        >
          <option value={CategoryStatus.VISIBLE}>Hiển thị</option>
          <option value={CategoryStatus.HIDDEN}>Ẩn</option>
        </select>
      ),
    },
  ];

  return (
    <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-800">Danh sách danh mục sản phẩm</h3>
      </div>

      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        statusOptions={statusOptions}
        onReset={() => { setSearchQuery(''); setStatusFilter('ALL'); }}
        onAdd={() => {
          setEditingCategory(null);
          setIsFormOpen(true);
        }}
        addButtonLabel=" Thêm danh mục"
      />

      <DataTable
        data={filteredCategories}
        columns={columns}
        onEdit={(item) => {
          setEditingCategory(item);
          setIsFormOpen(true);
        }}
        onDelete={(item) => setDeleteTarget(item)}
        onView={(item) => setSelectedCategory(item)}
        isLoading={loading}
      />

      <CategoryForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingCategory(null);
        }}
        onSave={handleSave}
        initialData={editingCategory}
        parentCategories={categories} 
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Xác nhận xóa danh mục"
        message={`Bạn có chắc chắn muốn xóa danh mục "${deleteTarget?.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Modal xem chi tiết */}
      {selectedCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Chi tiết danh mục</h3>
            <div className="space-y-3">
              <div><span className="font-semibold">ID:</span> {selectedCategory.id}</div>
              <div><span className="font-semibold">Mã danh mục:</span> {selectedCategory.catCode}</div>
              <div><span className="font-semibold">Tên danh mục:</span> {selectedCategory.name}</div>
              <div><span className="font-semibold">Danh mục cha:</span> {
                selectedCategory.parentId 
                  ? categories.find(c => c.id === selectedCategory.parentId)?.name || `#${selectedCategory.parentId}`
                  : '—'
              }</div>
              <div><span className="font-semibold">Mô tả:</span> {selectedCategory.description || '—'}</div>
              <div><span className="font-semibold">Trạng thái:</span> {selectedCategory.status === CategoryStatus.VISIBLE ? 'Hiển thị' : 'Ẩn'}</div>
            </div>
            <button
              onClick={() => setSelectedCategory(null)}
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