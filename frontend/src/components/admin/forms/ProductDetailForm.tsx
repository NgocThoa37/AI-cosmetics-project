'use client';

import React, { useState, useEffect } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Product, Color, Size } from '@/types/admin.types';
import { adminService } from '@/services/api/admin.service';

interface ProductDetailFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
  products?: Product[];
  colors?: Color[];
  sizes?: Size[];
}

const SKIN_TYPE_OPTIONS = [
  { value: 'oily', label: 'Da dầu' },
  { value: 'dry', label: 'Da khô' },
  { value: 'combination', label: 'Da hỗn hợp' },
  { value: 'sensitive', label: 'Da nhạy cảm' },
  { value: 'normal', label: 'Da thường' },
  { value: 'all', label: 'Mọi loại da' },
];

const generateSku = (productName: string, colorName: string, sizeName: string) => {
  const productCode = productName
    .toUpperCase()
    .split(' ')
    .map(word => word[0])
    .join('')
    .slice(0, 4);
  const colorCode = colorName ? colorName.toUpperCase().slice(0, 2) : 'XX';
  const sizeCode = sizeName ? sizeName.toUpperCase().slice(0, 2) : 'XX';
  const timestamp = Date.now().toString().slice(-4);
  return `${productCode}-${colorCode}-${sizeCode}-${timestamp}`;
};

export const ProductDetailForm: React.FC<ProductDetailFormProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  products = [],
  colors = [],
  sizes = [],
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
        quantity: Number(initialData.quantity) || 0,
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

  const handleGenerateSku = () => {
    if (!formData.productId) {
      alert('Vui lòng chọn sản phẩm trước!');
      return;
    }
    const product = products.find(p => p.id === formData.productId);
    if (!product) return;

    const color = colors.find(c => String(c.id) === formData.colorId);
    const size = sizes.find(s => String(s.id) === formData.sizeId);

    const newSku = generateSku(
      product.name,
      color?.name || '',
      size?.name || ''
    );
    setFormData(prev => ({ ...prev, sku: newSku }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalSku = formData.sku;
      if (!finalSku && formData.productId) {
        const product = products.find(p => p.id === formData.productId);
        const color = colors.find(c => String(c.id) === formData.colorId);
        const size = sizes.find(s => String(s.id) === formData.sizeId);
        if (product) {
          finalSku = generateSku(product.name, color?.name || '', size?.name || '');
        }
      }
      
      await onSave({
        ...formData,
        sku: finalSku,
        productId: formData.productId,
        colorId: formData.colorId ? Number(formData.colorId) : undefined,
        sizeId: formData.sizeId ? Number(formData.sizeId) : undefined,
        quantity: Number(formData.quantity),
      });
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
            label="Sản phẩm *"
            value={formData.productId}
            onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
            options={[
              { value: '', label: 'Chọn sản phẩm' },
              ...products.map(p => ({ value: p.id, label: p.name }))
            ]}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">SKU *</label>
            <div className="flex gap-2">
              <Input
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                required
                placeholder="Nhập SKU hoặc bấm Tạo SKU"
                className="flex-1"
              />
              <button
                type="button"
                onClick={handleGenerateSku}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap flex items-center gap-1"
              >
                <RefreshCw size={14} />
                Tạo SKU
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1">Bấm "Tạo SKU" để tự động sinh mã từ sản phẩm + màu + size</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Số lượng *</label>
              <input
                type="number"
                value={Number(formData.quantity) || 0}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (e.target.value === '') {
                    setFormData({ ...formData, quantity: 0 });
                  } else if (!isNaN(val) && val >= 0) {
                    setFormData({ ...formData, quantity: val });
                  }
                }}
                min={0}
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-forest-500 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="Nhập số lượng"
              />
            </div>

            {/* ❌ ĐÃ XÓA Ô GIÁ */}
          </div>

          <Select
            label="Loại da"
            value={formData.skinType}
            onChange={(e) => setFormData({ ...formData, skinType: e.target.value })}
            options={SKIN_TYPE_OPTIONS}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Màu sắc"
              value={formData.colorId}
              onChange={(e) => setFormData({ ...formData, colorId: e.target.value })}
              options={[
                { value: '', label: 'Không chọn' },
                ...colors.map(c => ({ value: String(c.id), label: c.name }))
              ]}
            />

            <Select
              label="Kích thước"
              value={formData.sizeId}
              onChange={(e) => setFormData({ ...formData, sizeId: e.target.value })}
              options={[
                { value: '', label: 'Không chọn' },
                ...sizes.map(s => ({ value: String(s.id), label: s.name }))
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mô tả</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-forest-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Thành phần</label>
            <textarea
              value={formData.ingredients}
              onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
              rows={3}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-forest-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Hướng dẫn sử dụng</label>
            <textarea
              value={formData.usage}
              onChange={(e) => setFormData({ ...formData, usage: e.target.value })}
              rows={3}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-forest-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Công dụng</label>
            <textarea
              value={formData.benefits}
              onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
              rows={3}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-forest-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Bảo quản</label>
            <textarea
              value={formData.storage}
              onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
              rows={2}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-forest-500 focus:outline-none"
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