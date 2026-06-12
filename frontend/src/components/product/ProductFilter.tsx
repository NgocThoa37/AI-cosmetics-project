'use client';

import React, { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Category, SkinType } from '@/types';
import { getSkinTypeLabel } from '@/helpers/format.helper';

interface ProductFilterProps {
  categories: Category[];
  onFilterChange: (filters: FilterOptions) => void;
  onClose?: () => void;
  isMobile?: boolean;
}

export interface FilterOptions {
  categoryId: string;
  skinType: string;
  minPrice: number;
  maxPrice: number;
  sortBy: 'newest' | 'price_asc' | 'price_desc' | 'popular';
}

const defaultFilters: FilterOptions = {
  categoryId: 'all',
  skinType: 'all',
  minPrice: 0,
  maxPrice: 5000000,
  sortBy: 'newest',
};

export const ProductFilter: React.FC<ProductFilterProps> = ({ categories, onFilterChange, onClose, isMobile = false }) => {
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);
  const [showMore, setShowMore] = useState(false);

  const handleChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const skinTypes: string[] = ['all', 'oily', 'dry', 'combination', 'sensitive', 'normal'];

  return (
    <div className={`${isMobile ? 'p-4' : 'bg-white border border-brand-warm rounded-2xl p-5 sticky top-24'}`}>
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-2"><Filter size={16} className="text-brand-accent" /><h3 className="font-bold text-brand-dark">Bộ lọc sản phẩm</h3></div>
        {isMobile && onClose && <button onClick={onClose} className="p-1"><X size={18} /></button>}
        {!isMobile && <button onClick={handleReset} className="text-xs text-brand-accent hover:underline">Đặt lại</button>}
      </div>

      <div className="space-y-5">
        {/* Danh mục */}
        <div><label className="block text-xs font-bold text-brand-dark/70 mb-2 uppercase tracking-wider">Danh mục</label><select value={filters.categoryId} onChange={(e) => handleChange('categoryId', e.target.value)} className="w-full text-xs px-3 py-2.5 bg-white border border-brand-warm rounded-xl focus:outline-none focus:border-brand-accent"><option value="all">Tất cả danh mục</option>{categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}</select></div>

        {/* Loại da */}
        <div><label className="block text-xs font-bold text-brand-dark/70 mb-2 uppercase tracking-wider">Loại da</label><select value={filters.skinType} onChange={(e) => handleChange('skinType', e.target.value)} className="w-full text-xs px-3 py-2.5 bg-white border border-brand-warm rounded-xl focus:outline-none focus:border-brand-accent">{skinTypes.map((type) => (<option key={type} value={type}>{getSkinTypeLabel(type)}</option>))}</select></div>

        {/* Khoảng giá */}
        <div><label className="block text-xs font-bold text-brand-dark/70 mb-2 uppercase tracking-wider">Khoảng giá</label><div className="flex gap-3"><div className="flex-1"><span className="text-[10px] text-brand-dark/50">Từ</span><input type="number" value={filters.minPrice} onChange={(e) => handleChange('minPrice', Number(e.target.value))} className="w-full text-xs px-3 py-2 bg-white border border-brand-warm rounded-xl focus:outline-none focus:border-brand-accent" /></div><div className="flex-1"><span className="text-[10px] text-brand-dark/50">Đến</span><input type="number" value={filters.maxPrice} onChange={(e) => handleChange('maxPrice', Number(e.target.value))} className="w-full text-xs px-3 py-2 bg-white border border-brand-warm rounded-xl focus:outline-none focus:border-brand-accent" /></div></div></div>

        {/* Sắp xếp */}
        <div><label className="block text-xs font-bold text-brand-dark/70 mb-2 uppercase tracking-wider">Sắp xếp</label><select value={filters.sortBy} onChange={(e) => handleChange('sortBy', e.target.value as any)} className="w-full text-xs px-3 py-2.5 bg-white border border-brand-warm rounded-xl focus:outline-none focus:border-brand-accent"><option value="newest">Mới nhất</option><option value="popular">Phổ biến nhất</option><option value="price_asc">Giá tăng dần</option><option value="price_desc">Giá giảm dần</option></select></div>

        {isMobile && <div className="pt-4 flex gap-3"><Button onClick={() => onClose?.()} fullWidth>Áp dụng</Button><Button variant="outline" onClick={handleReset} fullWidth>Đặt lại</Button></div>}
      </div>
    </div>
  );
};