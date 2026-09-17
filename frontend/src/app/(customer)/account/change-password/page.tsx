'use client';

import { useState, useEffect } from 'react'; // ✅ THÊM useEffect
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import AccountSidebar from '@/components/customer/AccountSidebar';
import { authService } from '@/services/api/auth.service';
import { KeyRound, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { isAuthenticated } = useCustomerAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ✅ DÙNG useEffect để xử lý redirect
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // ✅ Nếu chưa xác thực, không render gì (chờ redirect)
  if (!isAuthenticated) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới không trùng khớp');
      return;
    }
    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword(oldPassword, newPassword);
      toast.success('Đổi mật khẩu thành công');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Đổi mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <AccountSidebar />

        <div className="lg:col-span-3">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-brand-sand rounded-full flex items-center justify-center mx-auto mb-4">
                <KeyRound size={28} className="text-brand-accent" />
              </div>
              <h1 className="font-serif text-2xl text-brand-dark">Đổi mật khẩu</h1>
              <p className="text-sm text-brand-dark/50 mt-1">Vui lòng không chia sẻ mật khẩu với bất kỳ ai</p>
            </div>

            <div className="bg-[#FAF8F5] border border-brand-warm rounded-2xl p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="password"
                  label="Mật khẩu hiện tại"
                  icon={<Lock size={16} />}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
                <Input
                  type="password"
                  label="Mật khẩu mới"
                  icon={<Lock size={16} />}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <Input
                  type="password"
                  label="Xác nhận mật khẩu mới"
                  icon={<Lock size={16} />}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />

                {error && <p className="text-xs text-red-500">{error}</p>}

                <Button type="submit" loading={loading} fullWidth className="mt-4">
                  Cập nhật mật khẩu
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}