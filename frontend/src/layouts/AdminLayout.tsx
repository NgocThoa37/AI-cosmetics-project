'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, Eye, EyeOff, AlertCircle, Leaf } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('📤 [ADMIN LOGIN] Attempt:', { username, password });
      
      // ✅ FIX: Đúng URL - /admin/login (AdminController riêng)
      const response = await axios.post('http://localhost:3000/api/admin/login', {
        username,
        password,
      });

      console.log('📦 [ADMIN LOGIN] Response:', response.data);

      const data = response.data;
      const accessToken = data.accessToken || data.data?.accessToken;
      const user = data.user || data.data?.user;

      console.log('👤 [ADMIN LOGIN] User:', user);
      console.log('📊 [ADMIN LOGIN] Role:', user?.role);

      if (!accessToken) {
        throw new Error('Không nhận được token từ server');
      }

      // Lưu token
      localStorage.setItem('admin_token', accessToken);
      
      // Lưu user
      const userData = {
        id: user?.id || 0,
        username: user?.username || username,
        role: user?.role || 'admin',
        fullName: user?.fullName || user?.username || username,
        email: user?.email || '',
      };
      
      localStorage.setItem('admin_user', JSON.stringify(userData));
      localStorage.setItem('user_role', userData.role);

      console.log('✅ [ADMIN LOGIN] Success!');
      toast.success('Đăng nhập thành công!');
      
      router.push('/admin');
      
    } catch (err: any) {
      console.error('❌ [ADMIN LOGIN] Error:', err);
      console.error('❌ [ADMIN LOGIN] Error response:', err.response?.data);
      
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Sai tên đăng nhập hoặc mật khẩu';
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-[#f3f4ee]">
      <div className="absolute top-[10%] left-[10%] w-44 h-64 bg-[#d0e0cf] rounded-[40px] opacity-75 -z-10" />
      <div className="absolute bottom-[10%] right-[10%] w-56 h-40 bg-[#e1ebe1] rounded-[36px] -z-10 translate-x-10 translate-y-10">
        <div className="absolute inset-0 border-2 border-dashed border-slate-300 rounded-[36px] translate-x-4 translate-y-4" />
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-forest-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Leaf size={28} className="text-forest-700" />
          </div>
          <h2 className="text-3xl font-serif text-forest-800 italic">Lumière Admin</h2>
          <p className="text-sm text-slate-400 mt-1">Đăng nhập hệ thống quản trị</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-rose-50 border-l-4 border-rose-500 p-3 rounded-r-lg flex items-center gap-2 text-rose-700 text-xs">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <Input
            icon={<User size={18} />}
            placeholder="Tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              icon={<Lock size={18} />}
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <Button type="submit" loading={loading} fullWidth className="py-3">
            Đăng nhập
          </Button>
        </form>
      </div>
    </div>
  );
}