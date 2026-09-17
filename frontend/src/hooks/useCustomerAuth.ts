// src/hooks/useCustomerAuth.ts
'use client';

import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { customerLogin, customerRegister, customerLogout } from '@/store/slices/customerAuth.slice';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react'; // ✅ THÊM

export const useCustomerAuth = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, loading, error } = useAppSelector((state) => state.customerAuth);

  // ✅ THÊM LOG ĐỂ DEBUG
  console.log('🔍 [useCustomerAuth] isAuthenticated:', isAuthenticated);
  console.log('🔍 [useCustomerAuth] user:', user);
  console.log('🔍 [useCustomerAuth] token:', typeof window !== 'undefined' ? localStorage.getItem('customer_token') ? 'CÓ' : 'KHÔNG' : 'SERVER');

  // ✅ KHÔNG CÓ useEffect REDIRECT

  const login = async (username: string, password: string) => {
    const result = await dispatch(customerLogin({ username, password }));
    if (result.meta.requestStatus === 'fulfilled') {
      const redirectTo = sessionStorage.getItem('redirect_after_login') || '/';
      sessionStorage.removeItem('redirect_after_login');
      router.push(redirectTo);
    }
    return result;
  };

  const register = async (data: any) => {
    const result = await dispatch(customerRegister(data));
    if (result.meta.requestStatus === 'fulfilled') {
      router.push('/login');
    }
    return result;
  };

  const logout = async () => {
    await dispatch(customerLogout());
    router.push('/');
  };

  return {
    isAuthenticated,
    user,
    loading,
    error,
    login,
    register,
    logout,
  };
};