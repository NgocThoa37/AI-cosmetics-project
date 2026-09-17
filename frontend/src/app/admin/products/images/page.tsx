'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/admin/common/DataTable';
import { SearchFilterBar } from '@/components/admin/common/SearchFilterBar';
import { ConfirmModal } from '@/components/admin/common/ConfirmModal';
import { ProductImageForm } from '@/components/admin/forms/ProductImageForm';
import { adminService } from '@/services/api/admin.service';
import { ProductImage, Product } from '@/types/admin.types';
import toast from 'react-hot-toast';

export default function AdminProductImages() {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<ProductImage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductImage | null>(null);
  const [selectedImage, setSelectedImage] = useState<ProductImage | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [imagesData, productsData] = await Promise.all([
        adminService.getProductImages(),
        adminService.getProducts(),
      ]);
      setImages(Array.isArray(imagesData) ? imagesData : []);
      setProducts(productsData || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Không thể tải dữ liệu');
      setImages([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: Partial<ProductImage>) => {
    try {
      console.log('🔍 handleSave - editingImage:', editingImage);
      console.log('🔍 handleSave - data:', data);
      
      if (editingImage) {
        // UPDATE MODE
        console.log('📤 UPDATING image ID:', editingImage.id);
        console.log('📤 Update data:', data);
        
        await adminService.updateProductImage(String(editingImage.id), data);
        toast.success('Cập nhật ảnh sản phẩm thành công');
      } else {
        // CREATE MODE
        console.log('📤 CREATING new image');
        console.log('📤 Create data:', data);
        
        await adminService.createProductImage(data);
        toast.success('Thêm ảnh sản phẩm thành công');
      }
      
      await fetchData();
      setIsFormOpen(false);
      setEditingImage(null);
    } catch (error: any) {
      console.error('❌ Save error:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi lưu ảnh sản phẩm');
    }
  };

  const handleToggleMain = async (id: number, isMain: boolean) => {
    try {
      if (isMain) {
        const image = images.find(i => i.id === id);
        if (image) {
          const sameProductImages = images.filter(i => i.productId === image.productId);
          for (const img of sameProductImages) {
            if (img.id !== id) {
              await adminService.updateProductImage(String(img.id), { isMain: false });
            }
          }
        }
      }
      
      await adminService.updateProductImage(String(id), { isMain });
      setImages(prev => prev.map(i => i.id === id ? { ...i, isMain } : i));
      toast.success(isMain ? 'Đặt làm ảnh chính thành công' : 'Bỏ ảnh chính thành công');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi cập nhật ảnh chính');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminService.deleteProductImage(String(deleteTarget.id));
      toast.success('Xóa ảnh sản phẩm thành công');
      await fetchData();
      setDeleteTarget(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể xóa ảnh sản phẩm');
    }
  };

  const filteredImages = images.filter(img => {
    const productName = img.product?.name || '';
    const altText = img.altText || '';
    return productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      altText.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const columns = [
    { key: 'id', header: 'ID', className: 'font-mono w-16' },
    {
      key: 'image',
      header: 'Hình ảnh',
      render: (item: ProductImage) => {
        const imageUrl = item.imageUrl || '';
        if (!imageUrl) {
          return <span className="text-slate-400 text-xs">—</span>;
        }
        return (
          <img
            src={imageUrl}
            alt={item.altText || 'Product image'}
            className="w-10 h-10 object-cover rounded-lg border border-slate-200"
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="2"%3E%3Crect x="3" y="3" width="18" height="18" rx="2"%3E%3C/rect%3E%3Ccircle cx="8.5" cy="8.5" r="1.5"%3E%3C/circle%3E%3Cpath d="M21 15l-5-5L5 21"%3E%3C/path%3E%3C/svg%3E';
            }}
          />
        );
      }
    },
    {
      key: 'productName',
      header: 'Sản phẩm',
      className: 'font-semibold',
      render: (item: ProductImage) => item.product?.name || '—'
    },
    {
      key: 'isMain',
      header: 'Loại',
      render: (item: ProductImage) => (
        <button
          onClick={() => handleToggleMain(item.id, !item.isMain)}
          className={`px-2 py-1 rounded-full text-[10px] font-bold border transition-colors ${
            item.isMain
              ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
          }`}
        >
          {item.isMain ? '⭐ Ảnh chính' : 'Ảnh phụ'}
        </button>
      )
    },
    {
      key: 'displayOrder',
      header: 'Thứ tự',
      render: (item: ProductImage) => (
        <span className="text-sm font-medium text-slate-700 text-center block">
          {item.displayOrder || 0}
        </span>
      )
    },
    {
      key: 'altText',
      header: 'Chú thích',
      render: (item: ProductImage) => item.altText?.slice(0, 30) || '—'
    },
  ];

  return (
    <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-800">Ảnh sản phẩm</h3>
      </div>

      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter="ALL"
        onStatusFilterChange={() => {}}
        statusOptions={[]}
        onReset={() => setSearchQuery('')}
        onAdd={() => {
          console.log('➕ ADD button clicked');
          setEditingImage(null);
          setIsFormOpen(true);
        }}
        addButtonLabel=" Thêm ảnh"
        placeholder="Tìm theo tên sản phẩm hoặc chú thích"
      />

      <DataTable
        data={filteredImages}
        columns={columns}
        onEdit={(item) => {
          console.log('✏️ EDIT clicked:', item);
          setEditingImage(item);
          setIsFormOpen(true);
        }}
        onDelete={(item) => setDeleteTarget(item)}
        onView={(item) => setSelectedImage(item)}
        isLoading={loading}
      />

      <ProductImageForm
        isOpen={isFormOpen}
        onClose={() => {
          console.log('❌ Form closed');
          setIsFormOpen(false);
          setEditingImage(null);
        }}
        onSave={handleSave}
        onUploadSuccess={fetchData}
        initialData={editingImage}
        products={products}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Xác nhận xóa ảnh"
        message={`Bạn có chắc chắn muốn xóa ảnh của "${deleteTarget?.product?.name || 'sản phẩm'}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {selectedImage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Chi tiết ảnh sản phẩm</h3>
            <div className="flex justify-center mb-4">
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.altText || 'Product image'}
                className="w-48 h-48 object-cover rounded-lg border border-slate-200"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div className="space-y-3">
              <div><span className="font-semibold">ID:</span> {selectedImage.id}</div>
              <div><span className="font-semibold">Sản phẩm:</span> {selectedImage.product?.name || '—'}</div>
              <div><span className="font-semibold">Loại:</span> {selectedImage.isMain ? 'Ảnh chính' : 'Ảnh phụ'}</div>
              <div><span className="font-semibold">Thứ tự:</span> {selectedImage.displayOrder || 0}</div>
              <div><span className="font-semibold">Chú thích:</span> {selectedImage.altText || '—'}</div>
              <div><span className="font-semibold">URL:</span> <span className="text-xs break-all">{selectedImage.imageUrl}</span></div>
            </div>
            <button
              onClick={() => setSelectedImage(null)}
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