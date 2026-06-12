'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { DataTable } from '@/components/admin/common/DataTable';
import { SearchFilterBar } from '@/components/admin/common/SearchFilterBar';
import { ConfirmModal } from '@/components/admin/common/ConfirmModal';
import { adminService } from '@/services/api/admin.service';
import { Product, ProductStatus } from '@/types/admin.types';

const statusOptions = [
  { value: ProductStatus.IN_STOCK, label: 'Còn hàng' },
  { value: ProductStatus.OUT_OF_STOCK, label: 'Hết hàng' },
  { value: ProductStatus.DISCONTINUED, label: 'Ngừng bán' },
];

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await adminService.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    try {
      await adminService.updateProductQuantity(productId, newQuantity);
      setProducts(prev => prev.map(p => {
        if (p.id === productId) {
          let newStatus = p.status;
          if (newQuantity === 0) newStatus = ProductStatus.OUT_OF_STOCK;
          else if (p.status === ProductStatus.OUT_OF_STOCK) newStatus = ProductStatus.IN_STOCK;
          return { ...p, quantity: newQuantity, status: newStatus };
        }
        return p;
      }));
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminService.deleteProduct(deleteTarget.id);
      setProducts(prev => prev.filter(p => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.brandName && product.brandName.toLowerCase().includes(searchQuery.toLowerCase()));
    let matchesFilter = true;
    if (statusFilter !== 'ALL') {
      if (statusFilter === ProductStatus.IN_STOCK) matchesFilter = product.quantity > 0 && product.status !== ProductStatus.DISCONTINUED;
      else if (statusFilter === ProductStatus.OUT_OF_STOCK) matchesFilter = product.quantity === 0;
      else matchesFilter = product.status === statusFilter;
    }
    return matchesSearch && matchesFilter;
  });

  const columns = [
    { key: 'id', header: 'ID', className: 'font-mono w-16' },
    { key: 'image', header: 'Ảnh', render: (item: Product) => (
      <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100">
        <Image src={item.image || '/product-placeholder.jpg'} alt={item.name} width={40} height={40} className="object-cover" />
      </div>
    ) },
    { key: 'brandName', header: 'Thương hiệu' },
    { key: 'categoryName', header: 'Danh mục' },
    { key: 'name', header: 'Tên sản phẩm', className: 'font-semibold' },
    { key: 'price', header: 'Giá bán', render: (item: Product) => `${item.price.toLocaleString()}đ` },
    { key: 'quantity', header: 'Tồn kho', render: (item: Product) => (
      <input type="number" min={0} value={item.quantity} onChange={(e) => handleUpdateQuantity(item.id, Math.max(0, Number(e.target.value)))} className="w-20 border border-slate-200 rounded-md py-1 px-2 text-center text-xs" />
    ) },
    { key: 'updatedDate', header: 'Cập nhật' },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (item: Product) => (
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${
          item.quantity === 0 ? 'bg-rose-50 text-rose-700 border-rose-200' :
          item.status === ProductStatus.IN_STOCK ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
          'bg-slate-100 text-slate-500 border-slate-200'
        }`}>
          {item.quantity === 0 ? ProductStatus.OUT_OF_STOCK : item.status}
        </span>
      ),
    },
  ];

  return (
    <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <h3 className="text-sm font-bold text-slate-800">Danh sách sản phẩm</h3>
      </div>

      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        statusOptions={statusOptions}
        onReset={() => { setSearchQuery(''); setStatusFilter('ALL'); }}
        placeholder="Tìm theo tên sản phẩm hoặc thương hiệu"
      />

      <DataTable
        data={filteredProducts}
        columns={columns}
        onDelete={(item) => setDeleteTarget(item)}
        isLoading={loading}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Xác nhận xóa sản phẩm"
        message={`Bạn có chắc chắn muốn xóa sản phẩm "${deleteTarget?.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}