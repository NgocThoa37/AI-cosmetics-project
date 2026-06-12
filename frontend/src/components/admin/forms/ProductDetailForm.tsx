'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Product, ProductVariant } from '@/types/admin.types';

interface ProductDetailFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
  products: Product[];
  colors: ProductVariant[];
  sizes: ProductVariant[];
  skinTypes: string[];
}

const SKIN_TYPE_OPTIONS = [
  { value: 'oily', label: 'Da dầu' },
  { value: 'dry', label: 'Da khô' },
  { value: 'combination', label: 'Da hỗn hợp' },
  { value: 'sensitive', label: 'Da nhạy cảm' },
  { value: 'normal', label: 'Da thường' },
  { value: 'all', label: 'Mọi loại da' },
];

export const ProductDetailForm: React.FC<ProductDetailFormProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  products,
  colors,
  sizes,
}) => {
  const [formData, setFormData] = useState({
    productId: '',
    sku: '',
    quantity: 0,
    skinType: 'all',
    colorId: '',
    sizeId: '',
    description: '',
    ingredients: '',
    usage: '',
    benefits: '',
    storage: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        productId: initialData.productId || '',
        sku: initialData.sku || '',
        quantity: initialData.quantity || 0,
        skinType: initialData.skinType || 'all',
        colorId: initialData.colorId || '',
        sizeId: initialData.sizeId || '',
        description: initialData.description || '',
        ingredients: initialData.ingredients || '',
        usage: initialData.usage || '',
        benefits: initialData.benefits || '',
        storage: initialData.storage || '',
      });
    } else {
      setFormData({
        productId: '',
        sku: '',
        quantity: 0,
        skinType: 'all',
        colorId: '',
        sizeId: '',
        description: '',
        ingredients: '',
        usage: '',
        benefits: '',
        storage: '',
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
      console.error('Failed to save product detail:', error);
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
            {initialData ? 'Sửa chi tiết sản phẩm' : 'Thêm chi tiết sản phẩm'}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[70vh]">
          <Select
            label="Sản phẩm"
            value={formData.productId}
            onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
            options={[
              { value: '', label: 'Chọn sản phẩm' },
              ...products.map(p => ({ value: p.id, label: p.name }))
            ]}
            required
          />

          <Input
            label="SKU"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Số lượng"
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
              required
            />

            <Select
              label="Loại da"
              value={formData.skinType}
              onChange={(e) => setFormData({ ...formData, skinType: e.target.value })}
              options={SKIN_TYPE_OPTIONS}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Màu sắc"
              value={formData.colorId}
              onChange={(e) => setFormData({ ...formData, colorId: e.target.value })}
              options={[
                { value: '', label: 'Không chọn' },
                ...colors.map(c => ({ value: c.id, label: c.value }))
              ]}
            />

            <Select
              label="Kích thước"
              value={formData.sizeId}
              onChange={(e) => setFormData({ ...formData, sizeId: e.target.value })}
              options={[
                { value: '', label: 'Không chọn' },
                ...sizes.map(s => ({ value: s.id, label: s.value }))
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mô tả</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-forest-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Thành phần</label>
            <textarea
              value={formData.ingredients}
              onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
              rows={3}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-forest-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Hướng dẫn sử dụng</label>
            <textarea
              value={formData.usage}
              onChange={(e) => setFormData({ ...formData, usage: e.target.value })}
              rows={3}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-forest-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Công dụng</label>
            <textarea
              value={formData.benefits}
              onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
              rows={3}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-forest-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Bảo quản</label>
            <textarea
              value={formData.storage}
              onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
              rows={2}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-forest-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
            <Button type="submit" loading={loading}>{initialData ? 'Cập nhật' : 'Thêm mới'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};