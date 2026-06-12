'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Product } from '@/types/admin.types';

interface ProductImageFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
  products: Product[];
}

export const ProductImageForm: React.FC<ProductImageFormProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  products,
}) => {
  const [formData, setFormData] = useState({
    productId: '',
    imageUrl: '',
    isMain: false,
    displayOrder: 0,
    altText: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        productId: initialData.productId || '',
        imageUrl: initialData.imageUrl || '',
        isMain: initialData.isMain || false,
        displayOrder: initialData.displayOrder || 0,
        altText: initialData.altText || '',
      });
    } else {
      setFormData({
        productId: '',
        imageUrl: '',
        isMain: false,
        displayOrder: 0,
        altText: '',
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
      console.error('Failed to save product image:', error);
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
            {initialData ? 'Sửa ảnh sản phẩm' : 'Thêm ảnh sản phẩm'}
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
            label="URL hình ảnh"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            placeholder="https://..."
            required
          />

          <Input
            label="Chú thích ảnh (Alt)"
            value={formData.altText}
            onChange={(e) => setFormData({ ...formData, altText: e.target.value })}
            placeholder="Mô tả ngắn về ảnh"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.isMain}
                  onChange={(e) => setFormData({ ...formData, isMain: e.target.checked })}
                  className="rounded border-slate-300 text-forest-600"
                />
                Ảnh đại diện chính
              </label>
            </div>

            <Input
              label="Thứ tự hiển thị"
              type="number"
              value={formData.displayOrder}
              onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
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