'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { CategoryStatus } from '@/types/admin.types';

interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
  parentCategories?: any[];
}

const statusOptions = [
  { value: CategoryStatus.VISIBLE, label: 'Hiển thị' },
  { value: CategoryStatus.HIDDEN, label: 'Ẩn' },
];

export const CategoryForm: React.FC<CategoryFormProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  parentCategories = [],
}) => {
  const [formData, setFormData] = useState({
    catCode: '',
    name: '',
    description: '',
    parentId: '',
    status: CategoryStatus.VISIBLE,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        catCode: initialData.catCode || '',
        name: initialData.name || '',
        description: initialData.description || '',
        parentId: initialData.parentId || '',
        status: initialData.status || CategoryStatus.VISIBLE,
      });
    } else {
      setFormData({
        catCode: '',
        name: '',
        description: '',
        parentId: '',
        status: CategoryStatus.VISIBLE,
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save category:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <h3 className="text-lg font-bold text-slate-800">
            {initialData ? 'Sửa danh mục' : 'Thêm danh mục mới'}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <Input
            label="Mã danh mục"
            value={formData.catCode}
            onChange={(e) => setFormData({ ...formData, catCode: e.target.value })}
            required
          />

          <Input
            label="Tên danh mục"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Select
            label="Danh mục cha"
            value={formData.parentId}
            onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
            options={[
              { value: '', label: 'Không có (Danh mục gốc)' },
              ...parentCategories.filter(c => c.id !== initialData?.id).map(cat => ({ value: cat.id, label: cat.name }))
            ]}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mô tả</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-forest-500"
            />
          </div>

          <Select
            label="Trạng thái"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as CategoryStatus })}
            options={statusOptions}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
            <Button type="submit" loading={loading}>{initialData ? 'Cập nhật' : 'Thêm mới'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};