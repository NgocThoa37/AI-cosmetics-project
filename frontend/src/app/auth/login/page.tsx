// src/app/auth/login/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Mail, Lock, Leaf } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('📤 [LOGIN PAGE] Submitting:', { username, password });
    
    const result = await login(username, password);
    
    // ✅ Sau khi login thành công, chuyển sang trang admin
    if (result.meta.requestStatus === 'fulfilled') {
      router.push('/admin');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-forest-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Leaf size={28} className="text-forest-700" />
          </div>
          <h2 className="text-3xl font-serif text-forest-800 italic">Lumière</h2>
          <h3 className="text-xl font-semibold text-slate-800 mt-1">Đăng nhập Admin</h3>
          <p className="text-sm text-brand-dark/50 mt-1">Quản trị hệ thống</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input 
            icon={<Mail size={16} />} 
            placeholder="Tên đăng nhập" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
          />
          
          <Input 
            type="password" 
            icon={<Lock size={16} />} 
            placeholder="Mật khẩu" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          
          {error && (
            <div className="bg-rose-50 text-rose-600 text-xs p-3 rounded-lg">
              {error}
            </div>
          )}
          
          <Button type="submit" loading={loading} fullWidth className="py-3">
            Đăng nhập Admin
          </Button>
        </form>
        
        <div className="text-center mt-6">
          <Link href="/" className="text-xs text-brand-dark/40 hover:underline">
            ← Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}