// src/app/forgot-password/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Mail, ShieldCheck, Lock, Leaf } from 'lucide-react';
import { customerAuthService } from '@/services/api/customerAuth.service';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState(''); // ✅ THÊM STATE LỖI

  // ✅ HÀM KIỂM TRA EMAIL HỢP LỆ
  const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');

    // ✅ KIỂM TRA EMAIL RỖNG
    if (!email) {
      setEmailError('Vui lòng nhập email');
      toast.error('Vui lòng nhập email');
      return;
    }

    // ✅ KIỂM TRA ĐỊNH DẠNG EMAIL
    if (!validateEmail(email)) {
      setEmailError('Email không hợp lệ (ví dụ: ten@email.com)');
      toast.error('Email không hợp lệ');
      return;
    }

    setLoading(true);
    try {
      await customerAuthService.forgotPassword(email);
      toast.success('Mã OTP đã được gửi đến email của bạn');
      setStep(2);
    } catch (error: any) {
      // ✅ HIỂN THỊ LỖI CỤ THỂ TỪ BACKEND
      const message = error?.response?.data?.message || 'Gửi mã thất bại';
      if (message.includes('not found') || message.includes('không tồn tại')) {
        setEmailError('Email không tồn tại trong hệ thống');
        toast.error('Email không tồn tại trong hệ thống');
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { 
      toast.error('Mật khẩu xác nhận không trùng khớp'); 
      return; 
    }
    if (newPassword.length < 6) { 
      toast.error('Mật khẩu phải có ít nhất 6 ký tự'); 
      return; 
    }
    setLoading(true);
    try {
      await customerAuthService.resetPassword(email, otp, newPassword);
      toast.success('Đặt lại mật khẩu thành công!');
      window.location.href = '/login';
    } catch (error: any) {
      toast.error(error.message || 'Đặt lại mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-forest-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Leaf size={28} className="text-forest-700" />
          </div>
          <h2 className="text-3xl font-serif text-forest-800 italic">Quên mật khẩu</h2>
          <p className="text-sm text-brand-dark/50 mt-1">
            {step === 1 ? 'Nhập email để nhận mã OTP' : 'Nhập mã OTP và mật khẩu mới'}
          </p>
        </div>
        
        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <Input 
                type="email" 
                icon={<Mail size={16} />} 
                placeholder="Email đăng ký" 
                value={email} 
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError(''); // ✅ XÓA LỖI KHI NHẬP LẠI
                }}
                required 
              />
              {/* ✅ HIỂN THỊ LỖI EMAIL */}
              {emailError && (
                <p className="text-xs text-red-500 mt-1">{emailError}</p>
              )}
            </div>
            <Button type="submit" loading={loading} fullWidth>
              Gửi mã OTP
            </Button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <Input 
              icon={<ShieldCheck size={16} />} 
              placeholder="Mã OTP" 
              value={otp} 
              onChange={(e) => setOtp(e.target.value)} 
              required 
            />
            <Input 
              type="password" 
              icon={<Lock size={16} />} 
              placeholder="Mật khẩu mới" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              required 
            />
            <Input 
              type="password" 
              icon={<Lock size={16} />} 
              placeholder="Xác nhận mật khẩu" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required 
            />
            <Button type="submit" loading={loading} fullWidth>
              Đặt lại mật khẩu
            </Button>
          </form>
        )}
        
        <div className="text-center mt-6">
          <Link href="/login" className="text-xs text-brand-accent hover:underline">
            ← Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}