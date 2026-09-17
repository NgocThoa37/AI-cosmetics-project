'use client';

import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { login, logout, register } from '@/store/slices/auth.slice';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useCustomerAuth } from './useCustomerAuth';

// ✅ Các route công khai (không cần đăng nhập)
const PUBLIC_ROUTES = [
  '/',
  '/products',
  '/chatbot',
];

export const useAuth = () => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, loading, error } = useAppSelector((state) => state.auth);
  const { isAuthenticated: isCustomerAuthenticated } = useCustomerAuth();

  useEffect(() => {
    console.log('🔍 [useAuth] pathname:', pathname);
    console.log('🔍 [useAuth] isCustomerAuthenticated:', isCustomerAuthenticated);
    
    if (loading) return;

    // ✅ Admin routes: dùng admin auth
    if (pathname?.startsWith('/admin')) {
      if (!isAuthenticated) {
        router.push('/auth/login');
        return;
      }
      return;
    }

    // ✅ Customer routes: KHÔNG REDIRECT, cho phép tất cả
    const customerRoutes = ['/cart', '/orders', '/profile', '/payment', '/checkout', '/account', '/reviews'];
    const isCustomerRoute = customerRoutes.some(route => pathname?.startsWith(route));
    
    if (isCustomerRoute) {
      console.log('✅ [useAuth] Customer route, allow access:', pathname);
      return;
    }

    // ✅ Public routes: cho phép tất cả
    const isPublicRoute = PUBLIC_ROUTES.some(route => 
      pathname === route || pathname?.startsWith(route + '/')
    );
    
    if (isPublicRoute) {
      return;
    }

    // ✅ Nếu đã login customer mà vào trang login -> redirect về home
    if (isCustomerAuthenticated && pathname === '/login') {
      router.push('/');
      return;
    }
    
    if (isAuthenticated && pathname === '/auth/login') {
      router.push('/admin/dashboard');
      return;
    }
    
  }, [pathname, isAuthenticated, isCustomerAuthenticated, loading, router]);

  const handleLogin = async (username: string, password: string) => {
    const result = await dispatch(login({ username, password }));
    if (result.meta.requestStatus === 'fulfilled') {
      const from = sessionStorage.getItem('redirect_after_login') || '/';
      sessionStorage.removeItem('redirect_after_login');
      router.push(from);
    }
    return result;
  };

  const handleRegister = async (data: any) => {
    const result = await dispatch(register(data));
    if (result.meta.requestStatus === 'fulfilled') {
      router.push('/auth/login');
    }
    return result;
  };

  const handleLogout = async () => {
    await dispatch(logout());
    router.push('/');
  };

  return {
    isAuthenticated,
    user,
    loading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  };
};