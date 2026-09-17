'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Category, Brand } from '@/types/admin.types';
import toast from 'react-hot-toast';

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
  categories: Category[];
  brands: Brand[];
}

const statusOptions = [
  { value: 'active', label: 'Đang bán' },
  { value: 'inactive', label: 'Ngừng bán' },
  { value: 'out_of_stock', label: 'Hết hàng' },
];

export const ProductForm: React.FC<ProductFormProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  categories,
  brands,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    brandId: '',
    price: 0,
    status: 'active',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      console.log('✏️ [ProductForm] EDIT MODE - initialData:', initialData);
      setFormData({
        name: initialData.name || '',
        categoryId: initialData.categoryId || initialData.category_id || '',
        brandId: initialData.brandId || initialData.brand_id || '',
        price: initialData.price || 0,
        status: initialData.status || 'active',
      });
    } else {
      console.log('➕ [ProductForm] CREATE MODE');
      setFormData({
        name: '',
        categoryId: '',
        brandId: '',
        price: 0,
        status: 'active',
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔍 [ProductForm] Submit - Mode:', initialData ? 'EDIT' : 'CREATE');
    console.log('🔍 [ProductForm] formData:', formData);
    
    if (!formData.categoryId || formData.categoryId === '') {
      toast.error('Vui lòng chọn danh mục sản phẩm');
      return;
    }

    if (formData.price <= 0) {
      toast.error('Giá sản phẩm phải lớn hơn 0');
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        name: formData.name,
        price: Number(formData.price),
        status: formData.status,
        category_id: Number(formData.categoryId),
      };

      if (formData.brandId && formData.brandId !== '') {
        payload.brand_id = Number(formData.brandId);
      }

      console.log('📤 [ProductForm] Payload:', payload);

      await onSave(payload);
      onClose();
    } catch (error) {
      console.error('❌ [ProductForm] Save error:', error);
      toast.error('Lỗi khi lưu sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <h3 className="text-lg font-bold text-slate-800">
            {initialData ? '✏️ Sửa sản phẩm' : '➕ Thêm sản phẩm mới'}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[70vh]">
          <Input
            label="Tên sản phẩm *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Danh mục *"
              value={formData.categoryId || ''}
              onChange={(e) => {
                console.log('📦 [ProductForm] Chọn danh mục ID:', e.target.value);
                setFormData({ ...formData, categoryId: e.target.value });
              }}
              options={[
                { value: '', label: 'Chọn danh mục' },
                ...categories.map(cat => ({ value: String(cat.id), label: cat.name }))
              ]}
              required
            />

            <Select
              label="Thương hiệu"
              value={formData.brandId}
              onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
              options={[
                { value: '', label: 'Chọn thương hiệu' },
                ...brands.map(brand => ({ value: String(brand.id), label: brand.name }))
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Giá bán (VNĐ) *</label>
              <input
                type="number"
                value={formData.price || ''}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (e.target.value === '' || e.target.value === '-') {
                    setFormData({ ...formData, price: 0 });
                    return;
                  }
                  if (!isNaN(value) && value > 0) {
                    setFormData({ ...formData, price: value });
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === '-' || e.key === 'e') {
                    e.preventDefault();
                  }
                }}
                min={1000}
                step="any"
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-forest-500 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="Nhập giá bán"
              />
              <p className="text-[10px] text-slate-400 mt-1">Giá phải lớn hơn 0</p>
            </div>

            <Select
              label="Trạng thái"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={statusOptions}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" loading={loading}>
              {initialData ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};