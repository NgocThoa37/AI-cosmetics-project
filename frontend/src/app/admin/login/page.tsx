'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, Eye, EyeOff, AlertCircle, Leaf } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { setAccessToken, setRefreshToken } from '@/helpers/storage.helper';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (username === 'admin' && password === 'admin123') {
        setAccessToken('mock_admin_token');
        setRefreshToken('mock_refresh_token');
        localStorage.setItem('admin_user', username);
        toast.success('Đăng nhập thành công!');
        router.push('/admin');
      } else {
        setError('Tên đăng nhập hoặc mật khẩu không chính xác');
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-[#f3f4ee]">
      <div className="absolute top-[10%] left-[10%] w-44 h-64 bg-[#d0e0cf] rounded-[40px] opacity-75 -z-10" />
      <div className="absolute bottom-[10%] right-[10%] w-56 h-40 bg-[#e1ebe1] rounded-[36px] -z-10 translate-x-10 translate-y-10"><div className="absolute inset-0 border-2 border-dashed border-slate-300 rounded-[36px] translate-x-4 translate-y-4" /></div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 z-10">
        <div className="text-center mb-8"><div className="w-16 h-16 bg-forest-100 rounded-full flex items-center justify-center mx-auto mb-4"><Leaf size={28} className="text-forest-700" /></div><h2 className="text-3xl font-serif text-forest-800 italic">Lumière</h2><h3 className="text-xl font-semibold text-slate-800 mt-1">Hệ thống quản trị</h3><p className="text-xs text-slate-400 mt-2">Vui lòng đăng nhập để tiếp tục</p></div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-rose-50 border-l-4 border-rose-500 p-3 rounded-r-lg flex items-center gap-2 text-rose-700 text-xs"><AlertCircle size={16} /><span>{error}</span></div>}
          <div className="border-b border-slate-300 py-2.5 flex items-center gap-3 focus-within:border-forest-600 transition-colors group"><User size={18} className="text-slate-400 group-focus-within:text-forest-700" /><input type="text" placeholder="Tên đăng nhập" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-transparent border-none outline-none text-sm text-slate-700" autoComplete="username" /></div>
          <div className="border-b border-slate-300 py-2.5 flex items-center gap-3 focus-within:border-forest-600 transition-colors group"><Lock size={18} className="text-slate-400 group-focus-within:text-forest-700" /><div className="flex-1 relative"><input type={showPassword ? 'text' : 'password'} placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent border-none outline-none text-sm text-slate-700 pr-8" autoComplete="current-password" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 text-slate-400 hover:text-slate-600">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div>
          <Button type="submit" loading={loading} fullWidth className="py-3">Đăng nhập</Button>
        </form>

        <div className="mt-6 p-3 rounded-lg bg-amber-50/50 border border-amber-100 text-[10px] text-amber-700 text-center"><p className="font-semibold">🔐 Tài khoản demo:</p><p>Username: <span className="font-bold">admin</span> | Password: <span className="font-bold">admin123</span></p></div>
      </div>
    </div>
  );
}