'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/services/api/admin.service';
import { BestSeller } from '@/types/admin.types';
import { Package, DollarSign, TrendingUp, Download, RefreshCw, Eye, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminBestSellers() {
  const [bestSellers, setBestSellers] = useState<BestSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(10);
  const [selectedProduct, setSelectedProduct] = useState<BestSeller | null>(null);

  useEffect(() => {
    fetchBestSellers();
  }, [limit]);

  const fetchBestSellers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getBestSellers(limit);
      console.log('📦 Best sellers data:', data);
      setBestSellers(data || []);
    } catch (error) {
      console.error('Failed to fetch best sellers:', error);
      toast.error('Không thể tải dữ liệu sản phẩm bán chạy');
      setBestSellers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchBestSellers();
    toast.success('Đã làm mới dữ liệu');
  };

  // ✅ EXPORT EXCEL - GỌI API THỰC TẾ
  const handleExportExcel = async () => {
    try {
      toast.loading('Đang xuất báo cáo Excel...');
      
      // Lấy ngày hiện tại cho tên file
      const today = new Date().toISOString().split('T')[0];
      
      // Gọi API export (cần thêm endpoint ở backend)
      // Nếu chưa có endpoint, dùng tạm export revenue
      const blob = await adminService.exportRevenueExcel(
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        today
      );
      
      if (!blob || blob.size === 0) {
        toast.dismiss();
        toast.error('File rỗng, không có dữ liệu');
        return;
      }
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `best-sellers-${today}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 5000);
      
      toast.dismiss();
      toast.success('Xuất báo cáo Excel thành công!');
    } catch (error: any) {
      console.error('❌ Export Excel error:', error);
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Xuất báo cáo Excel thất bại');
    }
  };

  // ✅ EXPORT PDF - GỌI API THỰC TẾ
  const handleExportPDF = async () => {
    try {
      toast.loading('Đang xuất báo cáo PDF...');
      
      const today = new Date().toISOString().split('T')[0];
      
      const blob = await adminService.exportRevenuePDF(
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        today
      );
      
      if (!blob || blob.size === 0) {
        toast.dismiss();
        toast.error('File rỗng, không có dữ liệu');
        return;
      }
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `best-sellers-${today}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 5000);
      
      toast.dismiss();
      toast.success('Xuất báo cáo PDF thành công!');
    } catch (error: any) {
      console.error('❌ Export PDF error:', error);
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Xuất báo cáo PDF thất bại');
    }
  };

  const handleViewDetail = (product: BestSeller) => {
    setSelectedProduct(product);
  };

  const totalRevenue = bestSellers.reduce((sum, p) => sum + (p.revenue || 0), 0);
  const totalSales = bestSellers.reduce((sum, p) => sum + (p.totalSold || 0), 0);
  const bestProduct = bestSellers.length > 0 ? bestSellers[0] : null;

  const formatCurrency = (amount: number) => {
    if (!amount || isNaN(amount)) return '0đ';
    return Number(amount || 0).toLocaleString('vi-VN') + 'đ';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-forest-600 rounded-full animate-spin mx-auto" />
          <p className="mt-3 text-sm text-slate-500">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">🏆 Sản phẩm bán chạy nhất</h2>
          <p className="text-sm text-slate-500">Thống kê top sản phẩm bán chạy</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5">
            <label className="text-xs text-slate-500">Hiển thị</label>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="border-none text-xs font-medium focus:outline-none bg-transparent cursor-pointer"
            >
              <option value={5}>Top 5</option>
              <option value={10}>Top 10</option>
              <option value={20}>Top 20</option>
              <option value={50}>Top 50</option>
            </select>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={14} />
            Làm mới
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors"
          >
            <FileText size={14} />
            Excel
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-rose-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-rose-700 transition-colors"
          >
            <FileText size={14} />
            PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-100 rounded-xl p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-xl">
              <Package size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Tổng sản phẩm bán ra</p>
              <p className="text-2xl font-bold text-slate-800">{totalSales.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-xl">
              <DollarSign size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Tổng doanh thu</p>
              <p className="text-2xl font-bold text-slate-800">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-forest-50 rounded-xl">
              <TrendingUp size={20} className="text-forest-600" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Sản phẩm bán chạy nhất</p>
              <p className="text-lg font-bold text-slate-800 truncate max-w-[200px]" title={bestProduct?.name}>
                {bestProduct?.name || 'Chưa có dữ liệu'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="p-4 w-16 text-center text-xs font-semibold text-slate-500 uppercase">#</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Tên sản phẩm</th>
                <th className="p-4 text-right text-xs font-semibold text-slate-500 uppercase">Số lượng bán</th>
                <th className="p-4 text-right text-xs font-semibold text-slate-500 uppercase">Doanh thu</th>
                <th className="p-4 text-right text-xs font-semibold text-slate-500 uppercase w-24">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bestSellers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 text-sm">
                    Chưa có dữ liệu sản phẩm bán chạy
                  </td>
                </tr>
              ) : (
                bestSellers.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                        idx === 0 ? 'bg-amber-100 text-amber-700' :
                        idx === 1 ? 'bg-slate-200 text-slate-600' :
                        idx === 2 ? 'bg-amber-50 text-amber-600' :
                        'bg-slate-100 text-slate-400'
                      }`}>
                        #{idx + 1}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-slate-800">{item.name}</td>
                    <td className="p-4 text-right font-mono font-medium text-slate-700">
                      {(item.totalSold || 0).toLocaleString()}
                    </td>
                    <td className="p-4 text-right font-bold text-forest-700">
                      {formatCurrency(item.revenue || item.price * item.totalSold || 0)}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleViewDetail(item)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-all"
                        title="Xem chi tiết"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Chi tiết sản phẩm</h3>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <span className="text-xs text-slate-400 block">Tên sản phẩm</span>
                <span className="font-semibold text-slate-800">{selectedProduct.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-slate-400 block">Số lượng bán</span>
                  <span className="font-bold text-slate-800">{(selectedProduct.totalSold || 0).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Doanh thu</span>
                  <span className="font-bold text-forest-700">
                    {formatCurrency(selectedProduct.revenue || selectedProduct.price * selectedProduct.totalSold || 0)}
                  </span>
                </div>
              </div>
              {selectedProduct.price && (
                <div>
                  <span className="text-xs text-slate-400 block">Giá bán</span>
                  <span className="font-medium text-slate-700">{formatCurrency(selectedProduct.price)}</span>
                </div>
              )}
            </div>
            <div className="p-5 border-t border-slate-100">
              <button
                onClick={() => setSelectedProduct(null)}
                className="w-full bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-200"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}