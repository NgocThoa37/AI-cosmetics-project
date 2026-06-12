'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Mail, Lock, Leaf } from 'lucide-react';

export default function LoginPage() {
  const { login, loading, error } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(username, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-forest-100 rounded-full flex items-center justify-center mx-auto mb-4"><Leaf size={28} className="text-forest-700" /></div>
          <h2 className="text-3xl font-serif text-forest-800 italic">Lumière</h2>
          <h3 className="text-xl font-semibold text-slate-800 mt-1">Đăng nhập</h3>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input icon={<Mail size={16} />} placeholder="Tên đăng nhập / Email" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <Input type="password" icon={<Lock size={16} />} placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <div className="bg-rose-50 text-rose-600 text-xs p-3 rounded-lg">{error}</div>}
          <div className="flex justify-between items-center"><label className="flex items-center gap-2"><input type="checkbox" className="rounded border-brand-warm text-brand-accent" /><span className="text-xs text-brand-dark/60">Ghi nhớ</span></label><Link href="/forgot-password" className="text-xs text-brand-accent hover:underline">Quên mật khẩu?</Link></div>
          <Button type="submit" loading={loading} fullWidth className="py-3">Đăng nhập</Button>
        </form>
        <div className="text-center mt-6"><p className="text-xs text-brand-dark/50">Chưa có tài khoản? <Link href="/register" className="text-brand-accent font-bold hover:underline">Đăng ký ngay</Link></p></div>
      </div>
    </div>
  );
}