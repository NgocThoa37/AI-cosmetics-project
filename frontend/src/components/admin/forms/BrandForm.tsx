'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { BrandStatus } from '@/types/admin.types';

interface BrandFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

// 🔥 SỬA: VALUE LÀ GIÁ TRỊ ENUM CỦA BACK-END
const statusOptions = [
  { value: 'cooperating', label: 'Hợp tác' },
  { value: 'suspended', label: 'Ngừng hợp tác' },
];

export const BrandForm: React.FC<BrandFormProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    origin: '',
    status: 'cooperating', // 🔥 MẶC ĐỊNH LÀ 'cooperating'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        origin: initialData.origin || '',
        status: initialData.status || 'cooperating',
      });
    } else {
      setFormData({
        name: '',
        origin: '',
        status: 'cooperating',
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        name: formData.name,
        origin: formData.origin,
        status: formData.status,
      });
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
          <button 
            onClick={onClose} 
            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {initialData && (
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <p className="text-xs font-semibold text-slate-500">Mã thương hiệu (ID)</p>
              <p className="text-sm font-bold text-slate-800">{initialData.id}</p>
            </div>
          )}

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
            required
          />

          <Select
            label="Trạng thái"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={statusOptions}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                initialData ? 'Cập nhật' : 'Thêm mới'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};