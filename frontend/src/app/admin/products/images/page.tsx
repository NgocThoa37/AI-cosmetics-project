'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { DataTable } from '@/components/admin/common/DataTable';
import { SearchFilterBar } from '@/components/admin/common/SearchFilterBar';
import { ConfirmModal } from '@/components/admin/common/ConfirmModal';
import { adminService } from '@/services/api/admin.service';
import { ProductImage } from '@/types/admin.types';

export default function AdminProductImages() {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<ProductImage | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const data = await adminService.getProductImages();
      setImages(data);
    } catch (error) {
      console.error('Failed to fetch product images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminService.deleteProductImage(deleteTarget.id);
      setImages(prev => prev.filter(i => i.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error) {
      console.error('Failed to delete product image:', error);
    }
  };

  const filteredImages = images.filter(img => {
    return img.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.altText.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const columns = [
    { key: 'id', header: 'ID', className: 'font-mono w-16' },
    { key: 'image', header: 'Hình ảnh', render: (item: ProductImage) => (
      <Image src={item.imageUrl} alt={item.altText} width={40} height={40} className="w-10 h-10 object-cover rounded-lg border border-slate-200" />
    ) },
    { key: 'productName', header: 'Sản phẩm', className: 'font-semibold' },
    { key: 'isMain', header: 'Loại', render: (item: ProductImage) => (
      <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${item.isMain ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
        {item.isMain ? 'Ảnh chính' : 'Ảnh phụ'}
      </span>
    ) },
    { key: 'displayOrder', header: 'Thứ tự' },
    { key: 'altText', header: 'Chú thích', render: (item: ProductImage) => item.altText.slice(0, 30) },
  ];

  return (
    <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <h3 className="text-sm font-bold text-slate-800">Ảnh sản phẩm</h3>
      </div>

      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter="ALL"
        onStatusFilterChange={() => {}}
        statusOptions={[]}
        onReset={() => setSearchQuery('')}
        placeholder="Tìm theo sản phẩm hoặc chú thích"
      />

      <DataTable
        data={filteredImages}
        columns={columns}
        onDelete={(item) => setDeleteTarget(item)}
        isLoading={loading}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Xác nhận xóa ảnh"
        message={`Bạn có chắc chắn muốn xóa ảnh của "${deleteTarget?.productName}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}