'use client';

import React, { useState } from 'react';
import { RevenueStat } from '@/types/admin.types';

interface RevenueChartProps {
  data?: RevenueStat[];
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data: propData }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const defaultData = [
    { period: 'Tháng 1', revenue: 72000000, orders: 85 },
    { period: 'Tháng 2', revenue: 22000000, orders: 30 },
    { period: 'Tháng 3', revenue: 45000000, orders: 55 },
    { period: 'Tháng 4', revenue: 105000000, orders: 112 },
    { period: 'Tháng 5', revenue: 135000000, orders: 145 },
  ];

  const data = propData || defaultData;
  const maxRevenue = Math.max(...data.map(d => d.revenue));
  const maxOrders = Math.max(...data.map(d => d.orders));

  const width = 600;
  const height = 300;
  const paddingX = 60;
  const paddingY = 40;
  const plotWidth = width - paddingX * 2;
  const plotHeight = height - paddingY * 2;

  const points = data.map((d, index) => {
    const x = paddingX + (index * plotWidth) / (data.length - 1);
    const barHeight = (d.revenue / maxRevenue) * plotHeight;
    const barY = height - paddingY - barHeight;
    const lineY = height - paddingY - (d.orders / maxOrders) * plotHeight;
    return { x, barY, barHeight, lineY, revenue: d.revenue, orders: d.orders, period: d.period };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.lineY}`).join(' ');
  const formatCurrency = (amount: number) => (amount / 1000000).toFixed(0) + 'tr';

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-xs">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h3 className="text-base font-semibold text-slate-800 font-serif">Doanh thu và số lượng đơn hàng theo tháng</h3>
          <p className="text-xs text-slate-500">Di chuột vào cột hoặc chấm để xem chi tiết</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-amber-400 rounded-sm"></span><span className="text-slate-600">Doanh thu (triệu VND)</span></div>
          <div className="flex items-center gap-1.5"><span className="w-3.5 h-0.5 bg-slate-500 relative"><span className="w-1.5 h-1.5 bg-slate-700 rounded-full absolute -top-0.5"></span></span><span className="text-slate-600">Số đơn hàng</span></div>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto py-2">
        <div style={{ minWidth: '550px', height: `${height}px` }}>
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const yValue = height - paddingY - ratio * plotHeight;
              const revLabel = Math.round(ratio * maxRevenue / 1000000);
              const orderLabel = Math.round(ratio * maxOrders);
              return (
                <g key={i}>
                  <line x1={paddingX} y1={yValue} x2={width - paddingX} y2={yValue} stroke="#f1f5f9" strokeWidth="1" />
                  <text x={paddingX - 12} y={yValue + 4} fill="#94a3b8" fontSize="10" textAnchor="end" className="font-mono">{revLabel}</text>
                  <text x={width - paddingX + 12} y={yValue + 4} fill="#94a3b8" fontSize="10" textAnchor="start" className="font-mono">{orderLabel}</text>
                </g>
              );
            })}
            {points.map((p, idx) => {
              const isHovered = hoveredIndex === idx;
              return (
                <g key={idx} onMouseEnter={() => setHoveredIndex(idx)} onMouseLeave={() => setHoveredIndex(null)}>
                  <rect x={p.x - 18} y={p.barY} width={36} height={p.barHeight} fill="#fabf35" rx="4" fillOpacity={isHovered ? 1 : 0.8} />
                  {isHovered && <rect x={p.x - 20} y={p.barY - 2} width={40} height={p.barHeight + 4} fill="none" stroke="#d97706" strokeWidth="1.5" rx="6" />}
                </g>
              );
            })}
            <path d={linePath} fill="none" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {points.map((p, idx) => (
              <circle key={idx} cx={p.x} cy={p.lineY} r={hoveredIndex === idx ? 7 : 5} fill="#1e293b" stroke="#fff" strokeWidth="2" onMouseEnter={() => setHoveredIndex(idx)} onMouseLeave={() => setHoveredIndex(null)} />
            ))}
            {points.map((p, idx) => <text key={idx} x={p.x} y={height - paddingY + 22} fill="#64748b" fontSize="11" textAnchor="middle" className="font-medium">{p.period}</text>)}
          </svg>
        </div>
      </div>

      {hoveredIndex !== null && (
        <div className="mt-4 bg-slate-50 border border-slate-100 rounded-lg p-3 flex items-center justify-around gap-4">
          <div><p className="text-xs text-slate-400">Thời gian</p><p className="font-bold">{data[hoveredIndex].period}</p></div>
          <div className="h-8 w-px bg-slate-200" />
          <div><p className="text-xs text-amber-600">Doanh thu</p><p className="font-bold">{formatCurrency(data[hoveredIndex].revenue)} VND</p></div>
          <div className="h-8 w-px bg-slate-200" />
          <div><p className="text-xs text-slate-600">Số đơn</p><p className="font-bold">{data[hoveredIndex].orders}</p></div>
        </div>
      )}
    </div>
  );
};