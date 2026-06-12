'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Bell, User, LogOut, Shield, Clock } from 'lucide-react';
import { AdminTab } from '@/types/admin.types';

interface AdminHeaderProps {
  currentTab: AdminTab;
  onLogout: () => void;
}

const getHeaderTitle = (pathname: string): string => {
  if (pathname === '/admin') return 'Tổng quan hệ thống';
  if (pathname === '/admin/accounts') return 'Quản lý tài khoản khách hàng';
  if (pathname === '/admin/employees') return 'Quản lý nhân viên';
  if (pathname === '/admin/categories') return 'Quản lý danh mục sản phẩm';
  if (pathname === '/admin/products') return 'Quản lý thông tin sản phẩm';
  if (pathname === '/admin/products/details') return 'Chi tiết sản phẩm';
  if (pathname === '/admin/products/images') return 'Ảnh sản phẩm';
  if (pathname === '/admin/products/brands') return 'Quản lý thương hiệu';
  if (pathname === '/admin/products/variants/colors') return 'Quản lý màu sắc';
  if (pathname === '/admin/products/variants/sizes') return 'Quản lý kích thước';
  if (pathname === '/admin/products/variants/skin-types') return 'Quản lý loại da';
  if (pathname === '/admin/orders') return 'Quản lý đơn hàng';
  if (pathname === '/admin/reviews') return 'Quản lý đánh giá';
  if (pathname === '/admin/statistics/best-sellers') return 'Sản phẩm bán chạy nhất';
  if (pathname === '/admin/statistics/revenue') return 'Thống kê doanh thu';
  return 'Quản lý bán hàng Lumière';
};

export const AdminHeader: React.FC<AdminHeaderProps> = ({ currentTab, onLogout }) => {
  const pathname = usePathname();
  const [time, setTime] = useState(new Date());
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const formatDate = (date: Date) => date.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <header className="bg-white border-b border-slate-100 h-16 px-6 flex items-center justify-between sticky top-0 z-20">
      <div><h2 className="text-lg font-bold font-serif text-slate-800">{getHeaderTitle(pathname)}</h2><p className="text-[10px] text-slate-400 font-mono uppercase">Lumière Skincare • Admin Panel</p></div>
      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-600"><Clock size={14} className="text-forest-600" /><span>{formatTime(time)}</span><span className="text-slate-300">|</span><span className="text-slate-500 text-[10px]">{formatDate(time)}</span></div>
        <div className="relative p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"><Bell size={18} /><span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full animate-pulse" /></div>
        <div className="relative"><button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center gap-2 group"><div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200"><User size={16} /></div><div className="hidden sm:block text-left"><p className="text-xs font-semibold text-slate-700">Admin Lumière</p><p className="text-[10px] text-emerald-600 flex items-center gap-1"><Shield size={10} /> Online</p></div></button>{showDropdown && (<><div className="fixed inset-0 z-30" onClick={() => setShowDropdown(false)} /><div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-lg shadow-lg py-1 z-40"><div className="px-3 py-2 border-b border-slate-100"><p className="text-xs font-bold text-slate-800">Admin Lumière</p><p className="text-[10px] text-slate-400 truncate">admin@lumiere.vn</p></div><button onClick={() => { setShowDropdown(false); onLogout(); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50"><LogOut size={14} /><span>Đăng xuất</span></button></div></>)}</div>
      </div>
    </header>
  );
};