'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { BrandStatus } from '@/types/admin.types';

interface BrandFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

const statusOptions = [
  { value: BrandStatus.COOPERATING, label: 'Hợp tác' },
  { value: BrandStatus.SUSPENDED, label: 'Ngừng hợp tác' },
];

export const BrandForm: React.FC<BrandFormProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    brandCode: '',
    name: '',
    origin: '',
    status: BrandStatus.COOPERATING,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        brandCode: initialData.brandCode || '',
        name: initialData.name || '',
        origin: initialData.origin || '',
        status: initialData.status || BrandStatus.COOPERATING,
      });
    } else {
      setFormData({
        brandCode: '',
        name: '',
        origin: '',
        status: BrandStatus.COOPERATING,
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
      console.error('Failed to save brand:', error);
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
            {initialData ? 'Sửa thương hiệu' : 'Thêm thương hiệu mới'}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <Input
            label="Mã thương hiệu"
            value={formData.brandCode}
            onChange={(e) => setFormData({ ...formData, brandCode: e.target.value })}
            required
          />

          <Input
            label="Tên thương hiệu"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="Xuất xứ"
            value={formData.origin}
            onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
            placeholder="VD: Hàn Quốc, Pháp, Việt Nam..."
            required
          />

          <Select
            label="Trạng thái"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as BrandStatus })}
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