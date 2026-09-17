'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserCog,
  User,
  FolderTree,
  Package,
  ShoppingBag,
  Star,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Leaf,
  Image,
  Tag,
  Paintbrush,
  Ruler,
  TrendingUp,
  DollarSign,
  Layers,
} from 'lucide-react';
import { AdminTab } from '@/types/admin.types';

interface AdminSidebarProps {
  currentTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ currentTab, onTabChange }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isProductsOpen, setIsProductsOpen] = useState(true);
  const [isStatsOpen, setIsStatsOpen] = useState(true);
  const [adminInfo, setAdminInfo] = useState<{ fullName?: string; email?: string } | null>(null);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('admin_user');
      if (userStr) {
        setAdminInfo(JSON.parse(userStr));
      }
    } catch {
      setAdminInfo(null);
    }
  }, []);

  const isProductsActive = currentTab === 'products' || 
    currentTab === 'product_details' || 
    currentTab === 'product_images' || 
    currentTab === 'brands' || 
    currentTab === 'colors' || 
    currentTab === 'sizes';

  const isStatsActive = currentTab === 'stats_best_sellers' || 
    currentTab === 'stats_revenue';

  const handleNavigate = (tab: AdminTab, path: string) => {
    onTabChange(tab);
    router.push(path);
  };

  const menuItems = [
    { id: 'dashboard' as AdminTab, label: 'Dashboard Tổng quan', icon: LayoutDashboard, path: '/admin' },
    { id: 'accounts' as AdminTab, label: 'Quản lý tài khoản', icon: Users, path: '/admin/accounts' },
    { id: 'employees' as AdminTab, label: 'Quản lý nhân viên', icon: UserCog, path: '/admin/employees' },
    { id: 'customers' as AdminTab, label: 'Quản lý khách hàng', icon: User, path: '/admin/customers' },
    { id: 'categories' as AdminTab, label: 'Quản lý danh mục', icon: FolderTree, path: '/admin/categories' },
    { id: 'orders' as AdminTab, label: 'Quản lý đơn hàng', icon: ShoppingBag, path: '/admin/orders' },
    { id: 'reviews' as AdminTab, label: 'Quản lý đánh giá', icon: Star, path: '/admin/reviews' },
  ];

  const displayName = adminInfo?.fullName || 'Admin';
  const displayEmail = adminInfo?.email || 'admin@lumiere.vn';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <aside className="w-72 bg-white border-r border-slate-100 flex flex-col shrink-0 overflow-y-auto h-screen sticky top-0">
      {/* Logo */}
      <div className="p-5 border-b border-slate-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-forest-600 flex items-center justify-center text-white shadow-md">
          <Leaf size={18} />
        </div>
        <div>
          <h1 className="text-xl font-bold font-serif text-forest-700">Lumière</h1>
          <p className="text-[9px] text-slate-400 font-mono tracking-wider">ADMIN DASHBOARD</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id || pathname === item.path;
          return (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id, item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-forest-50 text-forest-700 font-semibold' 
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50/60'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-forest-600' : 'text-slate-400'} />
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* Products Section */}
        <div>
          <button
            onClick={() => setIsProductsOpen(!isProductsOpen)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isProductsActive 
                ? 'bg-forest-50/70 text-forest-700 font-semibold' 
                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <Package size={18} className={isProductsActive ? 'text-forest-600' : 'text-slate-400'} />
              <span>Quản lý sản phẩm</span>
            </div>
            {isProductsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {isProductsOpen && (
            <div className="pl-9 mt-1 space-y-1 border-l border-slate-100 ml-4">
              <button 
                onClick={() => handleNavigate('products', '/admin/products')} 
                className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium ${
                  currentTab === 'products' 
                    ? 'text-forest-700 font-bold bg-slate-100/80' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Package size={12} />
                  <span>Thông tin sản phẩm</span>
                </div>
              </button>
              
              <button 
                onClick={() => handleNavigate('product_details', '/admin/products/details')} 
                className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium ${
                  currentTab === 'product_details' 
                    ? 'text-forest-700 font-bold bg-slate-100/80' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Layers size={12} />
                  <span>Chi tiết sản phẩm</span>
                </div>
              </button>
              
              <button 
                onClick={() => handleNavigate('product_images', '/admin/products/images')} 
                className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium ${
                  currentTab === 'product_images' 
                    ? 'text-forest-700 font-bold bg-slate-100/80' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Image size={12} />
                  <span>Ảnh sản phẩm</span>
                </div>
              </button>
              
              <button 
                onClick={() => handleNavigate('brands', '/admin/brands')} 
                className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium ${
                  currentTab === 'brands' 
                    ? 'text-forest-700 font-bold bg-slate-100/80' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Tag size={12} />
                  <span>Thương hiệu</span>
                </div>
              </button>
              
              <button 
                onClick={() => handleNavigate('colors', '/admin/colors')} 
                className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium ${
                  currentTab === 'colors' 
                    ? 'text-forest-700 font-bold bg-slate-100/80' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Paintbrush size={12} />
                  <span>Màu sắc</span>
                </div>
              </button>
              
              <button 
                onClick={() => handleNavigate('sizes', '/admin/sizes')} 
                className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium ${
                  currentTab === 'sizes' 
                    ? 'text-forest-700 font-bold bg-slate-100/80' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Ruler size={12} />
                  <span>Kích thước</span>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Statistics Section */}
        <div>
          <button
            onClick={() => setIsStatsOpen(!isStatsOpen)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isStatsActive 
                ? 'bg-forest-50/70 text-forest-700 font-semibold' 
                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <BarChart3 size={18} className={isStatsActive ? 'text-forest-600' : 'text-slate-400'} />
              <span>Báo cáo, Thống kê</span>
            </div>
            {isStatsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          
          {isStatsOpen && (
            <div className="pl-9 mt-1 space-y-1 border-l border-slate-100 ml-4">
              <button 
                onClick={() => handleNavigate('stats_best_sellers', '/admin/statistics/best-sellers')} 
                className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium ${
                  currentTab === 'stats_best_sellers' 
                    ? 'text-forest-700 font-bold bg-slate-100/80' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <TrendingUp size={12} className="inline mr-2" />
                Sản phẩm bán chạy
              </button>
              
              <button 
                onClick={() => handleNavigate('stats_revenue', '/admin/statistics/revenue')} 
                className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium ${
                  currentTab === 'stats_revenue' 
                    ? 'text-forest-700 font-bold bg-slate-100/80' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <DollarSign size={12} className="inline mr-2" />
                Doanh thu
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* User Info Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-forest-100 flex items-center justify-center text-forest-700 font-semibold">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-700 truncate">{displayName}</p>
            <p className="text-[10px] text-slate-400 truncate">{displayEmail}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};