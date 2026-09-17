'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/admin/common/DataTable';
import { SearchFilterBar } from '@/components/admin/common/SearchFilterBar';
import { ConfirmModal } from '@/components/admin/common/ConfirmModal';
import { ProductDetailForm } from '@/components/admin/forms/ProductDetailForm';
import { adminService } from '@/services/api/admin.service';
import { ProductDetail, Product, Color, Size } from '@/types/admin.types';
import toast from 'react-hot-toast';

const statusOptions = [
  { value: 'all', label: 'Tất cả' },
  { value: 'in_stock', label: 'Còn hàng' },
  { value: 'out_of_stock', label: 'Hết hàng' },
];

export default function AdminProductDetails() {
  const [details, setDetails] = useState<ProductDetail[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDetail, setEditingDetail] = useState<ProductDetail | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductDetail | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<ProductDetail | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [detailsData, productsData, colorsData, sizesData] = await Promise.all([
        adminService.getProductDetails(),
        adminService.getProducts(),
        adminService.getAllColors(),
        adminService.getAllSizes(),
      ]);
      setDetails(detailsData || []);
      setProducts(productsData || []);
      setColors(colorsData || []);
      setSizes(sizesData || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Không thể tải dữ liệu');
      setDetails([]);
      setProducts([]);
      setColors([]);
      setSizes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: Partial<ProductDetail>) => {
    try {
      if (editingDetail) {
        await adminService.updateProductDetail(editingDetail.id, data);
        toast.success('Cập nhật chi tiết sản phẩm thành công');
      } else {
        await adminService.createProductDetail(data);
        toast.success('Thêm chi tiết sản phẩm thành công');
      }
      fetchData();
      setIsFormOpen(false);
      setEditingDetail(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi lưu chi tiết sản phẩm');
    }
  };

  const handleUpdateQuantity = async (id: string, quantity: number) => {
    try {
      await adminService.updateProductQuantity(id, quantity);
      setDetails(prev => prev.map(d => d.id === id ? { ...d, quantity } : d));
      toast.success('Cập nhật số lượng thành công');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi cập nhật số lượng');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminService.deleteProductDetail(deleteTarget.id);
      toast.success('Xóa chi tiết sản phẩm thành công');
      fetchData();
      setDeleteTarget(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể xóa chi tiết sản phẩm');
    }
  };

  const filteredDetails = details.filter(detail => {
    const productName = detail.product?.name || '';
    const sku = detail.sku || '';
    const colorName = detail.color?.name || '';
    const sizeName = detail.size?.name || '';
    
    const matchesSearch = productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      colorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sizeName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStock = stockFilter === 'all' ||
      (stockFilter === 'in_stock' && detail.quantity > 0) ||
      (stockFilter === 'out_of_stock' && detail.quantity === 0);
    
    return matchesSearch && matchesStock;
  });

  const columns = [
    { key: 'id', header: 'ID', className: 'font-mono w-16' },
    { 
      key: 'productName', 
      header: 'Sản phẩm', 
      className: 'font-semibold',
      render: (item: ProductDetail) => item.product?.name || '—'
    },
    { 
      key: 'color', 
      header: 'Màu sắc', 
      render: (item: ProductDetail) => {
        const colorName = item.color?.name || '';
        const colorCode = item.color?.code;
        return (
          <div className="flex items-center gap-2">
            {colorCode && (
              <span 
                className="w-4 h-4 rounded-full border border-slate-200" 
                style={{ backgroundColor: colorCode }}
              />
            )}
            <span>{colorName || '—'}</span>
          </div>
        );
      }
    },
    { 
      key: 'size', 
      header: 'Kích thước', 
      render: (item: ProductDetail) => item.size?.name || '—'
    },
    { key: 'sku', header: 'SKU', className: 'font-mono' },
    { 
      key: 'quantity', 
      header: 'Tồn kho',
      render: (item: ProductDetail) => (
        <div className="flex items-center gap-2">
          <span className={item.quantity === 0 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
            {item.quantity}
          </span>
          <button
            onClick={() => {
              const newQty = prompt('Nhập số lượng mới:', String(item.quantity));
              if (newQty !== null && !isNaN(Number(newQty))) {
                handleUpdateQuantity(item.id, Number(newQty));
              }
            }}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            ✏️
          </button>
        </div>
      )
    },
    // ❌ ĐÃ XÓA CỘT GIÁ
  ];

  return (
    <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-800">Chi tiết sản phẩm</h3>
      </div>

      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={stockFilter}
        onStatusFilterChange={setStockFilter}
        statusOptions={statusOptions}
        onReset={() => { setSearchQuery(''); setStockFilter('all'); }}
        onAdd={() => {
          setEditingDetail(null);
          setIsFormOpen(true);
        }}
        addButtonLabel=" Thêm chi tiết"
        placeholder="Tìm theo tên sản phẩm, SKU, màu sắc, kích thước..."
      />

      <DataTable
        data={filteredDetails}
        columns={columns}
        onEdit={(item) => {
          setEditingDetail(item);
          setIsFormOpen(true);
        }}
        onDelete={(item) => setDeleteTarget(item)}
        onView={(item) => setSelectedDetail(item)}
        isLoading={loading}
      />

      <ProductDetailForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingDetail(null);
        }}
        onSave={handleSave}
        initialData={editingDetail}
        products={products}
        colors={colors}
        sizes={sizes}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Xác nhận xóa chi tiết sản phẩm"
        message={`Bạn có chắc chắn muốn xóa chi tiết của "${deleteTarget?.product?.name || 'sản phẩm này'}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {selectedDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Chi tiết sản phẩm</h3>
            <div className="space-y-3">
              <div><span className="font-semibold">ID:</span> {selectedDetail.id}</div>
              <div><span className="font-semibold">Sản phẩm:</span> {selectedDetail.product?.name || '—'}</div>
              <div><span className="font-semibold">SKU:</span> {selectedDetail.sku}</div>
              <div><span className="font-semibold">Màu sắc:</span> {selectedDetail.color?.name || '—'}</div>
              <div><span className="font-semibold">Kích thước:</span> {selectedDetail.size?.name || '—'}</div>
              <div><span className="font-semibold">Số lượng:</span> {selectedDetail.quantity}</div>
              {/* ❌ ĐÃ XÓA DÒNG GIÁ */}
            </div>
            <button
              onClick={() => setSelectedDetail(null)}
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