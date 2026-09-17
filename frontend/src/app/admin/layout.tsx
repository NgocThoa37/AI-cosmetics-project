'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/layout/AdminSidebar';
import { AdminHeader } from '@/components/admin/layout/AdminHeader';
import { AdminTab } from '@/types/admin.types';
import toast from 'react-hot-toast';

// Map pathname -> AdminTab
const pathToTab: Record<string, AdminTab> = {
  '/admin': 'dashboard',
  '/admin/dashboard': 'dashboard',
  '/admin/accounts': 'accounts',
  '/admin/employees': 'employees',
  '/admin/customers': 'customers',
  '/admin/categories': 'categories',
  '/admin/brands': 'brands',
  '/admin/colors': 'colors',
  '/admin/sizes': 'sizes',
  '/admin/products': 'products',
  '/admin/products/details': 'product_details',
  '/admin/products/images': 'product_images',
  '/admin/orders': 'orders',
  '/admin/reviews': 'reviews',
  '/admin/statistics': 'statistics',
  '/admin/statistics/best-sellers': 'stats_best_sellers',
  '/admin/statistics/revenue': 'stats_revenue',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentTab, setCurrentTab] = useState<AdminTab>('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra token
    const token = localStorage.getItem('admin_token');
    const userStr = localStorage.getItem('admin_user');
    
    if (!token && pathname !== '/admin/login') {
      router.push('/admin/login');
      return;
    }

    // ✅ FIX: Cho phép cả admin và employee
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        
        console.log('👤 [AdminLayout] User:', user);
        console.log('📊 [AdminLayout] Role:', user.role);
        
        // ✅ FIX: Cho phép admin và employee
        if (user.role !== 'admin' && user.role !== 'employee' && pathname !== '/admin/login') {
          console.log('❌ [AdminLayout] Role không hợp lệ:', user.role);
          toast.error('Tài khoản không có quyền truy cập trang admin');
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
          router.push('/admin/login');
          return;
        }
      } catch (error) {
        console.error('❌ [AdminLayout] Invalid user data:', error);
        localStorage.removeItem('admin_user');
        router.push('/admin/login');
        return;
      }
    }

    // Xác định tab từ pathname
    const tab = pathToTab[pathname] || 'dashboard';
    setCurrentTab(tab);
    setIsLoading(false);
  }, [pathname, router]);

  // Xử lý logout
  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('user_role');
    toast.success('Đăng xuất thành công');
    router.push('/admin/login');
  };

  // Xử lý khi tab thay đổi
  const handleTabChange = (tab: AdminTab) => {
    setCurrentTab(tab);
    const path = Object.keys(pathToTab).find(key => pathToTab[key] === tab);
    if (path) {
      router.push(path);
    }
  };

  // Nếu đang ở trang login, không hiển thị layout
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Nếu đang kiểm tra token
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-forest-600 rounded-full animate-spin mx-auto" />
          <p className="mt-3 text-sm text-slate-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#fafbfa]">
      <AdminSidebar 
        currentTab={currentTab} 
        onTabChange={handleTabChange} 
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader 
          currentTab={currentTab} 
          onLogout={handleLogout} 
        />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}