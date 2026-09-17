'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Select } from '@/components/common/Select';
import { ProductImage, Product } from '@/types/admin.types';
import { adminService } from '@/services/api/admin.service';
import toast from 'react-hot-toast';

interface ProductImageFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  onUploadSuccess?: () => void;
  initialData?: ProductImage | null;
  products?: Product[];
}

export const ProductImageForm: React.FC<ProductImageFormProps> = ({
  isOpen,
  onClose,
  onSave,
  onUploadSuccess,
  initialData,
  products = [],
}) => {
  const [formData, setFormData] = useState({
    productId: '',
    productDetailId: '',  // ✅ THÊM
    imageUrl: '',
    isMain: false,
    displayOrder: 0,
    altText: '',
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ RESET form khi mở modal
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          productId: initialData.productId || '',
          productDetailId: initialData.productDetailId || '',  // ✅ THÊM
          imageUrl: initialData.imageUrl || '',
          isMain: initialData.isMain || false,
          displayOrder: initialData.displayOrder || 0,
          altText: initialData.altText || '',
        });
        setPreviewUrl(initialData.imageUrl || '');
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        setFormData({
          productId: '',
          productDetailId: '',
          imageUrl: '',
          isMain: false,
          displayOrder: 0,
          altText: '',
        });
        setPreviewUrl('');
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  }, [isOpen, initialData]);

  // ✅ Xử lý khi chọn sản phẩm
  const handleProductChange = (productId: string) => {
    const selectedProduct = products.find(p => String(p.id) === productId);
    const firstDetail = selectedProduct?.details?.[0];
    
    setFormData({
      ...formData,
      productId: productId,
      productDetailId: firstDetail?.id || '',  // ✅ TỰ ĐỘNG LẤY detail đầu tiên
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile && !previewUrl) {
      toast.error('Vui lòng chọn ảnh để tải lên');
      return;
    }
    if (!formData.productId || formData.productId === '') {
      toast.error('Vui lòng chọn sản phẩm');
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        productId: formData.productId,
        productDetailId: formData.productDetailId || null,  // ✅ THÊM DÒNG NÀY
        isMain: formData.isMain,
        displayOrder: Number(formData.displayOrder) || 0,
        altText: formData.altText || '',
      };

      if (selectedFile) {
        setUploading(true);
        const uploadResult = await adminService.uploadProductImage(selectedFile, formData.productId);
        payload.imageUrl = uploadResult.imageUrl;
        
        if (initialData && initialData.imageUrl) {
          try {
            await adminService.deleteFile(initialData.imageUrl);
          } catch (deleteError) {
            console.warn('⚠️ Không thể xóa file cũ:', deleteError);
          }
        }
        setUploading(false);
      } else {
        payload.imageUrl = formData.imageUrl;
      }

      await onSave(payload);
      toast.success(initialData ? 'Cập nhật ảnh thành công!' : 'Thêm ảnh thành công!');

      if (onUploadSuccess) {
        onUploadSuccess();
      }
      onClose();
    } catch (error) {
      console.error('❌ Lỗi:', error);
      toast.error(error instanceof Error ? error.message : 'Lỗi khi lưu ảnh');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setFormData(prev => ({ ...prev, imageUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <h3 className="text-lg font-bold text-slate-800">
            {initialData ? '✏️ Sửa ảnh sản phẩm' : '➕ Thêm ảnh sản phẩm'}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <Select
            label="Sản phẩm *"
            value={formData.productId}
            onChange={(e) => handleProductChange(e.target.value)}  // ✅ SỬA
            options={[
              { value: '', label: 'Chọn sản phẩm' },
              ...products.map(p => ({ value: String(p.id), label: p.name }))
            ]}
            required
            disabled={!!initialData}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ảnh sản phẩm *
            </label>
            
            {previewUrl ? (
              <div className="relative border rounded-lg overflow-hidden">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full h-48 object-cover" 
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="2"%3E%3Crect x="3" y="3" width="18" height="18" rx="2"%3E%3C/rect%3E%3Ccircle cx="8.5" cy="8.5" r="1.5"%3E%3C/circle%3E%3Cpath d="M21 15l-5-5L5 21"%3E%3C/path%3E%3C/svg%3E';
                  }}
                />
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  title="Xóa ảnh"
                >
                  <Trash2 size={16} />
                </button>
                {selectedFile && (
                  <span className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                    Ảnh mới
                  </span>
                )}
              </div>
            ) : (
              <label className="block w-full border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-forest-500 transition-colors">
                <Upload size={32} className="mx-auto text-slate-400 mb-2" />
                <p className="text-sm text-slate-500">Click để chọn ảnh</p>
                <p className="text-xs text-slate-400">(JPG, PNG, WEBP, tối đa 5MB)</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isMain}
                onChange={(e) => setFormData({ ...formData, isMain: e.target.checked })}
                className="w-4 h-4 accent-forest-600 cursor-pointer"
              />
              Ảnh chính
            </label>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Thứ tự</label>
              <input
                type="number"
                value={formData.displayOrder}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (!isNaN(val) && val >= 0) {
                    setFormData({ ...formData, displayOrder: val });
                  }
                }}
                min={0}
                className="w-20 border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:ring-1 focus:ring-forest-500 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Chú thích (Alt text)</label>
            <input
              type="text"
              value={formData.altText}
              onChange={(e) => setFormData({ ...formData, altText: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-forest-500 focus:outline-none"
              placeholder="Mô tả ngắn về ảnh (SEO)"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" loading={loading || uploading}>
              {uploading ? 'Đang tải ảnh...' : (initialData ? 'Cập nhật' : 'Thêm mới')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};