// src/app/register/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { User, Mail, Lock, Leaf } from 'lucide-react';
import toast from 'react-hot-toast'; // ✅ THÊM IMPORT

export default function RegisterPage() {
  const { register, loading } = useCustomerAuth();
  const [formData, setFormData] = useState({ 
    username: '', 
    fullName: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) { 
      setError('Mật khẩu xác nhận không trùng khớp'); 
      return; 
    }
    if (formData.password.length < 6) { 
      setError('Mật khẩu phải có ít nhất 6 ký tự'); 
      return; 
    }

    try {
      const result = await register({ 
        username: formData.username, 
        fullName: formData.fullName, 
        email: formData.email, 
        password: formData.password 
      });

      if (result.meta.requestStatus === 'fulfilled') {
        // ✅ HIỂN THỊ TOAST THÀNH CÔNG
        toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
        // ✅ CHUYỂN HƯỚNG SAU 2 GIÂY
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        // ✅ HIỂN THỊ TOAST THẤT BẠI
        const errorMsg = result.payload as string || 'Đăng ký thất bại, vui lòng thử lại';
        toast.error(errorMsg);
        setError(errorMsg);
      }
    } catch (error: any) {
      // ✅ HIỂN THỊ TOAST LỖI
      const errorMsg = error?.response?.data?.message || 'Đăng ký thất bại, vui lòng thử lại';
      toast.error(errorMsg);
      setError(errorMsg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-forest-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Leaf size={28} className="text-forest-700" />
          </div>
          <h2 className="text-3xl font-serif text-forest-800 italic">Đăng ký</h2>
          <p className="text-sm text-brand-dark/50 mt-1">Tạo tài khoản khách hàng</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            icon={<User size={16} />} 
            placeholder="Tên đăng nhập" 
            value={formData.username} 
            onChange={(e) => setFormData({ ...formData, username: e.target.value })} 
            required 
          />
          <Input 
            placeholder="Họ và tên" 
            value={formData.fullName} 
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} 
            required 
          />
          <Input 
            type="email" 
            icon={<Mail size={16} />} 
            placeholder="Email" 
            value={formData.email} 
            onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
            required 
          />
          <Input 
            type="password" 
            icon={<Lock size={16} />} 
            placeholder="Mật khẩu" 
            value={formData.password} 
            onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
            required 
          />
          <Input 
            type="password" 
            icon={<Lock size={16} />} 
            placeholder="Xác nhận mật khẩu" 
            value={formData.confirmPassword} 
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} 
            required 
          />
          
          {error && (
            <div className="bg-rose-50 text-rose-600 text-xs p-3 rounded-lg">
              {error}
            </div>
          )}
          
          <Button type="submit" loading={loading} fullWidth className="py-3">
            Đăng ký
          </Button>
        </form>
        
        <div className="text-center mt-6">
          <p className="text-xs text-brand-dark/50">
            Đã có tài khoản?{' '}
            <Link href="/login" className="text-brand-accent font-bold hover:underline">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}