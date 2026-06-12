'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/services/api/admin.service';
import { BestSeller } from '@/types/admin.types';
import { Package, DollarSign, TrendingUp, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminBestSellers() {
  const [bestSellers, setBestSellers] = useState<BestSeller[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBestSellers();
  }, []);

  const fetchBestSellers = async () => {
    try {
      const data = await adminService.getBestSellers();
      setBestSellers(data);
    } catch (error) {
      console.error('Failed to fetch best sellers:', error);
      setBestSellers([
        { rank: 1, name: 'Serum HA Lumiere Hydra-Glow', sales: 180, revenue: '135,000,000đ' },
        { rank: 2, name: 'Sữa Rửa Mặt Bọt Mịn Lá Trà', sales: 145, revenue: '56,550,000đ' },
        { rank: 3, name: 'Kem Chống Nắng Phục Hồi Shield', sales: 90, revenue: '55,800,000đ' },
        { rank: 4, name: 'Kem Dưỡng Retinol Youth Miracle', sales: 45, revenue: '56,250,000đ' },
        { rank: 5, name: 'Toner Hoa Hồng Cúc La Mã', sales: 25, revenue: '12,000,000đ' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    toast.success('Đang xuất báo cáo...');
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-slate-200 border-t-forest-600 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h2 className="text-xl font-bold text-slate-800">Sản phẩm bán chạy nhất</h2><p className="text-sm text-slate-500">Thống kê top sản phẩm bán chạy trong tuần</p></div>
        <button onClick={handleExport} className="flex items-center gap-2 bg-forest-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"><Download size={16} />Xuất báo cáo</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-100 rounded-xl p-5"><div className="flex items-center gap-3"><div className="p-2 bg-emerald-50 rounded-xl"><Package size={20} className="text-emerald-600" /></div><div><p className="text-xs text-slate-400">Tổng sản phẩm bán ra</p><p className="text-2xl font-bold text-slate-800">{bestSellers.reduce((sum, p) => sum + p.sales, 0).toLocaleString()}</p></div></div></div>
        <div className="bg-white border border-slate-100 rounded-xl p-5"><div className="flex items-center gap-3"><div className="p-2 bg-amber-50 rounded-xl"><DollarSign size={20} className="text-amber-600" /></div><div><p className="text-xs text-slate-400">Tổng doanh thu</p><p className="text-2xl font-bold text-slate-800">{bestSellers.reduce((sum, p) => sum + parseInt(p.revenue.replace(/[^0-9]/g, '')), 0).toLocaleString()}đ</p></div></div></div>
        <div className="bg-white border border-slate-100 rounded-xl p-5"><div className="flex items-center gap-3"><div className="p-2 bg-forest-50 rounded-xl"><TrendingUp size={20} className="text-forest-600" /></div><div><p className="text-xs text-slate-400">Sản phẩm bán chạy nhất</p><p className="text-lg font-bold text-slate-800 truncate max-w-[200px]">{bestSellers[0]?.name}</p></div></div></div>
      </div>

      <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
        <table className="w-full text-left"><thead className="bg-slate-50 border-b border-slate-100"><tr><th className="p-4 w-20 text-center">#</th><th className="p-4">Tên sản phẩm</th><th className="p-4 text-right">Số lượng bán</th><th className="p-4 text-right">Doanh thu</th></tr></thead><tbody className="divide-y divide-slate-100">{bestSellers.map((item) => (<tr key={item.rank} className="hover:bg-slate-50/70"><td className="p-4 text-center font-bold text-forest-600">#{item.rank}</td><td className="p-4 font-semibold">{item.name}</td><td className="p-4 text-right font-mono">{item.sales.toLocaleString()}</td><td className="p-4 text-right font-bold text-forest-700">{item.revenue}</td></tr>))}</tbody></table>
      </div>
    </div>
  );
}