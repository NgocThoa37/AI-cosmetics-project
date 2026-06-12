'use client';

import React from 'react';
import { Search, Filter, RefreshCw, Plus } from 'lucide-react';

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  statusOptions: { value: string; label: string }[];
  onReset?: () => void;
  onAdd?: () => void;
  addButtonLabel?: string;
  placeholder?: string;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchQuery, onSearchChange, statusFilter, onStatusFilterChange, statusOptions, onReset, onAdd, addButtonLabel = 'Thêm mới', placeholder = 'Tìm kiếm...',
}) => {
  return (
    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-md">
        <div className="relative w-full"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" placeholder={placeholder} value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-forest-500 focus:outline-none" /></div>
        {(searchQuery || statusFilter !== 'ALL') && onReset && (<button onClick={onReset} className="p-2 text-slate-500 hover:bg-slate-200 rounded-lg transition-colors" title="Đặt lại bộ lọc"><RefreshCw size={14} /></button>)}
      </div>
      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1.5"><Filter size={12} className="text-slate-400" /><select value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value)} className="border-none text-xs text-slate-600 font-medium focus:outline-none bg-transparent cursor-pointer"><option value="ALL">Tất cả trạng thái</option>{statusOptions.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}</select></div>
        {onAdd && (<button onClick={onAdd} className="bg-forest-700 hover:bg-forest-800 text-white rounded-lg px-4 py-2 text-xs font-semibold flex items-center gap-1.5 transition-colors"><Plus size={14} /><span>{addButtonLabel}</span></button>)}
      </div>
    </div>
  );
};