'use client';

import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  'Hoạt động': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Khóa': 'bg-rose-50 text-rose-700 border-rose-200',
  'Đang làm việc': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Nghỉ phép': 'bg-amber-50 text-amber-700 border-amber-200',
  'Đã nghỉ việc': 'bg-slate-100 text-slate-500 border-slate-200',
  'Hiển thị': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Ẩn': 'bg-slate-100 text-slate-500 border-slate-200',
  'Còn hàng': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Hết hàng': 'bg-rose-50 text-rose-700 border-rose-200',
  'Ngừng bán': 'bg-slate-100 text-slate-500 border-slate-200',
  'Hợp tác': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Ngừng hợp tác': 'bg-amber-50 text-amber-700 border-amber-200',
  'Chờ xác nhận': 'bg-amber-50 text-amber-700 border-amber-200',
  'Đã xác nhận': 'bg-blue-50 text-blue-700 border-blue-200',
  'Đang giao': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Đã giao': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Đã hủy': 'bg-rose-50 text-rose-700 border-rose-200',
  'Chưa phản hồi': 'bg-amber-50 text-amber-700 border-amber-200',
  'Đã phản hồi': 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const style = statusStyles[status] || 'bg-slate-100 text-slate-600 border-slate-200';
  return <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-bold border ${style} ${className}`}>{status}</span>;
};