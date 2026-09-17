'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/admin/common/DataTable';
import { SearchFilterBar } from '@/components/admin/common/SearchFilterBar';
import { ConfirmModal } from '@/components/admin/common/ConfirmModal';
import { ProductForm } from '@/components/admin/forms/ProductForm';
import { adminService } from '@/services/api/admin.service';
import { Product, Category, Brand } from '@/types/admin.types';
import toast from 'react-hot-toast';

const statusOptions = [
  { value: 'active', label: 'Đang bán' },
  { value: 'inactive', label: 'Ngừng bán' },
  { value: 'out_of_stock', label: 'Hết hàng' },
];

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsData, categoriesData, brandsData] = await Promise.all([
        adminService.getProducts(),
        adminService.getCategories(),
        adminService.getBrands(),
      ]);
      
      console.log('📦 [fetchData] productsData:', productsData);
      
      setProducts(productsData || []);
      setCategories(categoriesData || []);
      setBrands(brandsData || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Không thể tải dữ liệu');
      setProducts([]);
      setCategories([]);
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: Partial<Product>) => {
    try {
      console.log('🔍 [handleSave] Mode:', editingProduct ? 'EDIT' : 'CREATE');
      console.log('🔍 [handleSave] editingProduct:', editingProduct);
      console.log('🔍 [handleSave] data:', data);
      
      if (editingProduct) {
        console.log('📤 [handleSave] UPDATE ID:', editingProduct.id);
        const result = await adminService.updateProduct(editingProduct.id, data);
        console.log('✅ [handleSave] Update result:', result);
        toast.success('Cập nhật sản phẩm thành công');
      } else {
        console.log('📤 [handleSave] CREATE');
        const result = await adminService.createProduct(data);
        console.log('✅ [handleSave] Create result:', result);
        toast.success('Thêm sản phẩm thành công');
      }
      
      // ✅ AWAIT fetchData
      await fetchData();
      
      setIsFormOpen(false);
      setEditingProduct(null);
    } catch (error: any) {
      console.error('❌ [handleSave] Error:', error);
      console.error('❌ [handleSave] Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Lỗi khi lưu sản phẩm');
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await adminService.updateProduct(id, { status });
      setProducts(prev => prev.map(p => p.id === id ? { ...p, status } : p));
      toast.success('Cập nhật trạng thái thành công');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi cập nhật trạng thái');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminService.deleteProduct(deleteTarget.id);
      toast.success('Xóa sản phẩm thành công');
      await fetchData();
      setDeleteTarget(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể xóa sản phẩm');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'active': return 'Đang bán';
      case 'inactive': return 'Ngừng bán';
      case 'out_of_stock': return 'Hết hàng';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'inactive': return 'bg-slate-100 text-slate-500 border-slate-200';
      case 'out_of_stock': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const columns = [
    { key: 'id', header: 'ID', className: 'font-mono w-16' },
    { key: 'name', header: 'Tên sản phẩm', className: 'font-semibold' },
    { 
      key: 'price', 
      header: 'Giá',
      render: (item: Product) => `${item.price?.toLocaleString('vi-VN') || 0}đ`
    },
    { 
      key: 'category', 
      header: 'Danh mục',
      render: (item: Product) => item.category?.name || '—'
    },
    { 
      key: 'brand', 
      header: 'Thương hiệu',
      render: (item: Product) => item.brand?.name || '—'
    },
    { 
      key: 'totalSold', 
      header: 'Đã bán',
      render: (item: Product) => item.totalSold || 0
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (item: Product) => (
        <select
          value={item.status || 'active'}
          onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
          className={`px-2 py-1 rounded-md text-[10px] font-bold border cursor-pointer ${getStatusColor(item.status || 'active')}`}
        >
          <option value="active">Đang bán</option>
          <option value="inactive">Ngừng bán</option>
          <option value="out_of_stock">Hết hàng</option>
        </select>
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
        onAdd={() => {
          console.log('➕ [AdminProducts] Add clicked');
          setEditingProduct(null);
          setIsFormOpen(true);
        }}
        addButtonLabel=" Thêm sản phẩm"
        placeholder="Tìm theo tên sản phẩm"
      />

      <DataTable
        data={filteredProducts}
        columns={columns}
        onView={(item) => {
          setSelectedProduct(item);
          setIsViewOpen(true);
        }}
        onEdit={(item) => {
          console.log('✏️ [AdminProducts] Edit clicked:', item);
          setEditingProduct(item);
          setIsFormOpen(true);
        }}
        onDelete={(item) => setDeleteTarget(item)}
        isLoading={loading}
      />

      <ProductForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSave}
        initialData={editingProduct}
        categories={categories}
        brands={brands}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Xác nhận xóa sản phẩm"
        message={`Bạn có chắc chắn muốn xóa sản phẩm "${deleteTarget?.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {isViewOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Chi tiết sản phẩm</h3>
              <button onClick={() => { setIsViewOpen(false); setSelectedProduct(null); }} className="p-1">✕</button>
            </div>
            <div className="p-5 space-y-3">
              <div><span className="font-semibold">ID:</span> {selectedProduct.id}</div>
              <div><span className="font-semibold">Tên:</span> {selectedProduct.name}</div>
              <div><span className="font-semibold">Giá:</span> {selectedProduct.price?.toLocaleString('vi-VN') || 0}đ</div>
              <div><span className="font-semibold">Danh mục:</span> {selectedProduct.category?.name || '—'}</div>
              <div><span className="font-semibold">Thương hiệu:</span> {selectedProduct.brand?.name || '—'}</div>
              <div><span className="font-semibold">Trạng thái:</span> {getStatusLabel(selectedProduct.status || 'active')}</div>
              <button onClick={() => { setIsViewOpen(false); setSelectedProduct(null); }} className="mt-4 w-full bg-slate-100 px-4 py-2 rounded-lg">Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}