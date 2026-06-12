'use client';

import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { login, logout, register } from '@/store/slices/auth.slice';
import { useRouter } from 'next/navigation';

export const useAuth = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, loading, error } = useAppSelector((state) => state.auth);

  const handleLogin = async (username: string, password: string) => {
    const result = await dispatch(login({ username, password }));
    if (result.meta.requestStatus === 'fulfilled') {
      router.push('/');
    }
    return result;
  };

  const handleRegister = async (data: any) => {
    const result = await dispatch(register(data));
    if (result.meta.requestStatus === 'fulfilled') {
      router.push('/login');
    }
    return result;
  };

  const handleLogout = async () => {
    await dispatch(logout());
    router.push('/login');
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