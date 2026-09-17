// frontend/src/components/admin/charts/RevenueChart.tsx

'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  ComposedChart,
} from 'recharts';
import { RevenueStat } from '@/types/admin.types';

interface RevenueChartProps {
  data?: RevenueStat[];
}

const formatCurrency = (value: number) => {
  if (!value || isNaN(value)) return '0';
  return (value / 1000000).toFixed(1);
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-slate-100">
        <p className="font-semibold text-slate-800 text-sm mb-2">{label}</p>
        <div className="space-y-1">
          <p className="text-xs text-amber-600">
            Doanh thu: <span className="font-bold">{formatCurrency(payload[0]?.value || 0)} triệu VND</span>
          </p>
          <p className="text-xs text-slate-600">
            Số đơn: <span className="font-bold">{payload[1]?.value || 0}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export const RevenueChart: React.FC<RevenueChartProps> = ({ data: propData }) => {
  const defaultData = [
    { period: 'Tháng 1', revenue: 72000000, orders: 85 },
    { period: 'Tháng 2', revenue: 22000000, orders: 30 },
    { period: 'Tháng 3', revenue: 45000000, orders: 55 },
    { period: 'Tháng 4', revenue: 105000000, orders: 112 },
    { period: 'Tháng 5', revenue: 135000000, orders: 145 },
    { period: 'Tháng 6', revenue: 98000000, orders: 98 },
  ];

  const data = propData?.length ? propData : defaultData;

  // Làm sạch dữ liệu
  const cleanData = data.map(item => ({
    period: item.period || 'Không xác định',
    revenue: typeof item.revenue === 'number' && !isNaN(item.revenue) ? item.revenue : 0,
    orders: typeof item.orders === 'number' && !isNaN(item.orders) ? item.orders : 0,
  }));

  if (cleanData.length === 0 || cleanData.every(d => d.revenue === 0 && d.orders === 0)) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 p-6">
        <h3 className="text-base font-semibold text-slate-800 mb-4">Doanh thu và số lượng đơn hàng theo tháng</h3>
        <div className="flex justify-center items-center h-[300px] text-slate-400 text-sm">
          Không có dữ liệu doanh thu
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h3 className="text-base font-semibold text-slate-800">📊 Doanh thu và số lượng đơn hàng theo tháng</h3>
          <p className="text-xs text-slate-500">Di chuột vào biểu đồ để xem chi tiết</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-emerald-500 rounded-sm"></span>
            <span className="text-slate-600">Doanh thu (triệu VND)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-blue-500 rounded-sm"></span>
            <span className="text-slate-600">Số đơn hàng</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={cleanData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis 
            dataKey="period" 
            tick={{ fontSize: 12, fill: '#64748b' }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
          />
          <YAxis 
            yAxisId="left"
            tickFormatter={formatCurrency}
            tick={{ fontSize: 12, fill: '#64748b' }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
            label={{ 
              value: 'Triệu VND', 
              angle: -90, 
              position: 'insideLeft',
              style: { fontSize: 11, fill: '#94a3b8' }
            }}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12, fill: '#64748b' }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
            label={{ 
              value: 'Số đơn', 
              angle: 90, 
              position: 'insideRight',
              style: { fontSize: 11, fill: '#94a3b8' }
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            yAxisId="left"
            dataKey="revenue" 
            name="Doanh thu" 
            fill="#10b981" 
            radius={[4, 4, 0, 0]}
            barSize={40}
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="orders" 
            name="Số đơn hàng" 
            stroke="#3b82f6" 
            strokeWidth={3}
            dot={{ fill: '#3b82f6', r: 5 }}
            activeDot={{ r: 7 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};