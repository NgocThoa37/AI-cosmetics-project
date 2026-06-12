'use client';

import React from 'react';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  isLoading?: boolean;
}

export function DataTable<T extends { id: string }>({ data, columns, onEdit, onDelete, onView, isLoading = false }: DataTableProps<T>) {
  if (isLoading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-slate-200 border-t-forest-600 rounded-full animate-spin" /></div>;
  if (data.length === 0) return <div className="text-center py-12 text-slate-400 text-sm">Không có dữ liệu</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs text-slate-600">
        <thead className="bg-slate-50 border-b border-slate-100"><tr>{columns.map((col, idx) => (<th key={idx} className="p-3 font-semibold text-slate-500 uppercase tracking-wider">{col.header}</th>))}{(onEdit || onDelete || onView) && <th className="p-3 text-center w-24">Thao tác</th>}</tr></thead>
        <tbody className="divide-y divide-slate-100">{data.map((item) => (<tr key={item.id} className="hover:bg-slate-50/70 transition-colors">{columns.map((col, idx) => (<td key={idx} className={`p-3 ${col.className || ''}`}>{col.render ? col.render(item) : String(item[col.key as keyof T] ?? '')}</td>))}{(onEdit || onDelete || onView) && (<td className="p-3 text-center"><div className="flex items-center justify-center gap-1.5">{onView && <button onClick={() => onView(item)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100" title="Xem chi tiết">👁️</button>}{onEdit && <button onClick={() => onEdit(item)} className="p-1.5 text-slate-400 hover:text-forest-600 rounded-lg hover:bg-slate-100" title="Chỉnh sửa">✏️</button>}{onDelete && <button onClick={() => onDelete(item)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100" title="Xóa">🗑️</button>}</div></td>)}</tr>))}</tbody>
      </table>
    </div>
  );
}