'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/admin/common/DataTable';
import { SearchFilterBar } from '@/components/admin/common/SearchFilterBar';
import { ConfirmModal } from '@/components/admin/common/ConfirmModal';
import { ColorForm } from '@/components/admin/forms/ColorForm';
import { adminService } from '@/services/api/admin.service';
import { Color } from '@/types/admin.types';
import toast from 'react-hot-toast';

export default function AdminColorsPage() {
  const [colors, setColors] = useState<Color[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingColor, setEditingColor] = useState<Color | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Color | null>(null);

  useEffect(() => {
    fetchColors();
  }, []);

  const fetchColors = async () => {
    try {
      const data = await adminService.getAllColors();
      setColors(data || []);
    } catch (error) {
      console.error('Failed to fetch colors:', error);
      toast.error('Không thể tải danh sách màu sắc');
      setColors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: Partial<Color>) => {
    try {
      if (editingColor) {
        await adminService.updateColor(editingColor.id, data);
        toast.success('Cập nhật màu sắc thành công');
      } else {
        await adminService.createColor(data as { name: string; code: string });
        toast.success('Thêm màu sắc thành công');
      }
      fetchColors();
      setIsFormOpen(false);
      setEditingColor(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi lưu màu sắc');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminService.deleteColor(deleteTarget.id);
      toast.success('Xóa màu sắc thành công');
      fetchColors();
      setDeleteTarget(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể xóa màu sắc');
    }
  };

  const filteredColors = colors.filter(c => {
    const name = c.name?.toLowerCase() || '';
    const code = c.code?.toLowerCase() || '';
    return name.includes(searchQuery.toLowerCase()) ||
      code.includes(searchQuery.toLowerCase());
  });

  const columns = [
    { key: 'id', header: 'ID', className: 'font-mono w-16' },
    { 
      key: 'color', 
      header: 'Màu sắc',
      render: (item: Color) => (
        <div className="flex items-center gap-3">
          <span 
            className="w-6 h-6 rounded-full border border-slate-200" 
            style={{ backgroundColor: item.code }}
          />
          <span className="font-semibold">{item.name}</span>
        </div>
      )
    },
    { 
      key: 'code', 
      header: 'Mã màu',
      render: (item: Color) => (
        <span className="font-mono text-sm">{item.code}</span>
      )
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-forest-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
      {/* Header - Chỉ có tiêu đề */}
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-800">Quản lý màu sắc</h3>
      </div>

      {/* SearchFilterBar - CÓ NÚT THÊM */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter="ALL"
        onStatusFilterChange={() => {}}
        statusOptions={[]}
        onReset={() => setSearchQuery('')}
        onAdd={() => {
          setEditingColor(null);
          setIsFormOpen(true);
        }}
        addButtonLabel=" Thêm màu sắc"
        placeholder="Tìm theo tên màu sắc hoặc mã màu"
      />

      <DataTable
        data={filteredColors}
        columns={columns}
        onEdit={(item) => {
          setEditingColor(item);
          setIsFormOpen(true);
        }}
        onDelete={(item) => setDeleteTarget(item)}
        isLoading={loading}
      />

      <ColorForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingColor(null);
        }}
        onSave={handleSave}
        initialData={editingColor}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Xác nhận xóa màu sắc"
        message={`Bạn có chắc chắn muốn xóa màu "${deleteTarget?.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}