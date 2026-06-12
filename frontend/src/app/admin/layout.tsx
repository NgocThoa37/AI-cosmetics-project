'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/layout/AdminSidebar';
import { AdminHeader } from '@/components/admin/layout/AdminHeader';
import { AdminTab } from '@/types/admin.types';
import { getAccessToken } from '@/helpers/storage.helper';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentTab, setCurrentTab] = useState<AdminTab>('dashboard');

  useEffect(() => {
    const token = getAccessToken();
    if (!token && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.push('/admin/login');
  };

  // Don't show sidebar on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#fafbfa]">
      <AdminSidebar currentTab={currentTab} onTabChange={setCurrentTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader currentTab={currentTab} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}