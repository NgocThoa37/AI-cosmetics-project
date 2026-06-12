'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { User, Mail, Lock, Leaf } from 'lucide-react';

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const [formData, setFormData] = useState({ username: '', fullName: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) { setError('Mật khẩu xác nhận không trùng khớp'); return; }
    if (formData.password.length < 6) { setError('Mật khẩu phải có ít nhất 6 ký tự'); return; }
    await register({ username: formData.username, fullName: formData.fullName, email: formData.email, password: formData.password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8"><div className="w-16 h-16 bg-forest-100 rounded-full flex items-center justify-center mx-auto mb-4"><Leaf size={28} className="text-forest-700" /></div><h2 className="text-3xl font-serif text-forest-800 italic">Đăng ký</h2></div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input icon={<User size={16} />} placeholder="Tên đăng nhập" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required />
          <Input placeholder="Họ và tên" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required />
          <Input type="email" icon={<Mail size={16} />} placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
          <Input type="password" icon={<Lock size={16} />} placeholder="Mật khẩu" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
          <Input type="password" icon={<Lock size={16} />} placeholder="Xác nhận mật khẩu" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} required />
          {error && <div className="bg-rose-50 text-rose-600 text-xs p-3 rounded-lg">{error}</div>}
          <Button type="submit" loading={loading} fullWidth className="py-3">Đăng ký</Button>
        </form>
        <div className="text-center mt-6"><p className="text-xs text-brand-dark/50">Đã có tài khoản? <Link href="/login" className="text-brand-accent font-bold hover:underline">Đăng nhập ngay</Link></p></div>
      </div>
    </div>
  );
}