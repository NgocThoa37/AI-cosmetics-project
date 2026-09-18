'use client';

import { useState, useEffect } from 'react';
import { RevenueChart } from '@/components/admin/charts/RevenueChart';
import { adminService } from '@/services/api/admin.service';
import { RevenueStat } from '@/types/admin.types';
import { DollarSign, Calendar, TrendingUp, Download, FileText, Filter, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

type GroupByType = 'day' | 'week' | 'month' | 'year';

const groupByOptions = [
  { value: 'day', label: 'Theo ngày' },
  { value: 'week', label: 'Theo tuần' },
  { value: 'month', label: 'Theo tháng' },
  { value: 'year', label: 'Theo năm' },
];

const formatCurrency = (amount: number) => {
  if (!amount || isNaN(amount)) return '0đ';
  return Number(amount || 0).toLocaleString('vi-VN') + 'đ';
};

export default function AdminRevenue() {
  const [revenueStats, setRevenueStats] = useState<RevenueStat[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [groupBy, setGroupBy] = useState<GroupByType>('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchRevenueStats();
  }, [groupBy, startDate, endDate]);

  const fetchRevenueStats = async () => {
    try {
      setLoading(true);
      const data = await adminService.getRevenueStats(
        startDate || undefined,
        endDate || undefined,
        groupBy
      );
      setRevenueStats(data || []);
      setTotalRevenue(data.reduce((sum, s) => sum + s.revenue, 0));
      setTotalOrders(data.reduce((sum, s) => sum + (s.orders || 0), 0));
    } catch (error) {
      console.error('Failed to fetch revenue stats:', error);
      toast.error('Không thể tải dữ liệu doanh thu');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchRevenueStats();
    toast.success('Đã làm mới dữ liệu');
  };

  const handleExportExcel = async () => {
    try {
      toast.loading('Đang xuất báo cáo Excel...');
      const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const end = endDate || new Date().toISOString().split('T')[0];
      const blob = await adminService.exportRevenueExcel(start, end);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `doanh-thu-${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.dismiss();
      toast.success('Xuất báo cáo Excel thành công!');
    } catch (error) {
      toast.dismiss();
      toast.error('Xuất báo cáo Excel thất bại');
    }
  };

  const handleExportPDF = async () => {
    try {
      toast.loading('Đang xuất báo cáo PDF...');
      const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const end = endDate || new Date().toISOString().split('T')[0];
      const blob = await adminService.exportRevenuePDF(start, end);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `doanh-thu-${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.dismiss();
      toast.success('Xuất báo cáo PDF thành công!');
    } catch (error) {
      toast.dismiss();
      toast.error('Xuất báo cáo PDF thất bại');
    }
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

  const averageRevenue = revenueStats.length > 0 ? totalRevenue / revenueStats.length : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">📊 Thống kê doanh thu</h2>
          <p className="text-sm text-slate-500">
            Báo cáo doanh thu {groupByOptions.find(g => g.value === groupBy)?.label.toLowerCase()}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-50"
          >
            <Filter size={14} /> Bộ lọc
          </button>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-50"
          >
            <RefreshCw size={14} /> Làm mới
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-emerald-700"
          >
            <FileText size={14} /> Excel
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-rose-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-rose-700"
          >
            <FileText size={14} /> PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-100 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-xl">
              <DollarSign size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Tổng doanh thu</p>
              <p className="text-2xl font-bold text-slate-800">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-xl">
              <Calendar size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Tổng số đơn hàng</p>
              <p className="text-2xl font-bold text-slate-800">{totalOrders.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-forest-50 rounded-xl">
              <TrendingUp size={20} className="text-forest-600" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Doanh thu TB tháng</p>
              <p className="text-2xl font-bold text-slate-800">{formatCurrency(averageRevenue)}</p>
            </div>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nhóm theo</label>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as GroupByType)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              >
                {groupByOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Từ ngày</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Đến ngày</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => { setStartDate(''); setEndDate(''); setGroupBy('month'); }}
                className="w-full bg-slate-100 text-slate-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-200"
              >
                Đặt lại
              </button>
            </div>
          </div>
        </div>
      )}

      <RevenueChart data={revenueStats} />

      <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Kỳ</th>
                <th className="p-4 text-right text-xs font-semibold text-slate-500 uppercase">Số đơn hàng</th>
                <th className="p-4 text-right text-xs font-semibold text-slate-500 uppercase">Doanh thu</th>
                <th className="p-4 text-right text-xs font-semibold text-slate-500 uppercase">Tăng trưởng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {revenueStats.map((stat, idx) => {
                const prevRevenue = idx > 0 ? revenueStats[idx - 1].revenue : stat.revenue;
                const growth = prevRevenue > 0 ? ((stat.revenue - prevRevenue) / prevRevenue * 100) : 0;
                const isPositive = growth >= 0;
                
                return (
                  <tr key={stat.period} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 font-semibold text-slate-800">{stat.period}</td>
                    <td className="p-4 text-right font-mono">{stat.orders || 0}</td>
                    <td className="p-4 text-right font-bold text-forest-700">{formatCurrency(stat.revenue)}</td>
                    <td className={`p-4 text-right font-semibold ${idx === 0 ? 'text-slate-400' : isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {idx === 0 ? '—' : `${isPositive ? '+' : ''}${growth.toFixed(1)}%`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}