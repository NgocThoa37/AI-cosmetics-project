// src/app/(customer)/account/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { useAppDispatch } from '@/store/hooks';
import { fetchMyProfile, updateMyProfile } from '@/store/slices/customerAuth.slice';
import AccountSidebar from '@/components/customer/AccountSidebar';
import { Camera } from 'lucide-react';
import toast from 'react-hot-toast';

const genderMap: { [key: string]: string } = {
  'Nam': 'male',
  'Nữ': 'female',
  'Khác': 'other'
};

const reverseGenderMap: { [key: string]: string } = {
  'male': 'Nam',
  'female': 'Nữ',
  'other': 'Khác'
};

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, loading } = useCustomerAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isMounted, setIsMounted] = useState(false); // ✅ Thêm state này

  useEffect(() => {
    setIsMounted(true); // ✅ Đánh dấu đã mount
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    dispatch(fetchMyProfile());
  }, [dispatch, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      const userData = user.user || user;
      setFullName(userData.fullName || '');
      setPhone(userData.phone || '');
      setGender(reverseGenderMap[userData.gender] || userData.gender || '');
      if (userData.dob) {
        const date = new Date(userData.dob);
        if (!isNaN(date.getTime())) {
          setDob(date.toISOString().split('T')[0]);
        }
      }
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let formattedDob = dob;
      if (dob) {
        const date = new Date(dob);
        if (!isNaN(date.getTime())) {
          formattedDob = date.toISOString().split('T')[0];
        }
      }

      const submitData = {
        fullName: fullName || undefined,
        phone: phone || undefined,
        gender: genderMap[gender] || gender || 'other',
        dob: formattedDob || undefined,
      };

      console.log('📤 [Profile] Submitting:', submitData);

      await dispatch(updateMyProfile(submitData)).unwrap();
      await dispatch(fetchMyProfile());
      toast.success('Cập nhật hồ sơ thành công!');
      setIsEditing(false);
    } catch (error: any) {
      console.error('❌ [Profile] Error:', error);
      toast.error(error.message || 'Cập nhật thất bại');
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ Hiển thị loading nếu chưa mount
  if (!isMounted || loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  const userData = user?.user || user || {};
  const fullNameDisplay = userData.fullName || 'Khách hàng';
  const emailDisplay = userData.email || '';
  const avatar = userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullNameDisplay)}&background=8B5CF6&color=fff&size=128&bold=true`;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <AccountSidebar />

        <div className="lg:col-span-3">
          <h1 className="font-serif text-2xl text-brand-dark mb-6">Hồ sơ cá nhân</h1>

          <div className="bg-[#FAF8F5] border border-brand-warm rounded-2xl p-6">
            {/* Avatar */}
            <div className="flex flex-col items-center mb-8 pb-6 border-b border-brand-warm">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-brand-sand">
                  <Image
                    src={avatar}
                    alt={fullNameDisplay}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                    unoptimized
                    suppressHydrationWarning // ✅ Thêm dòng này
                  />
                </div>
                <button className="absolute bottom-0 right-0 p-1.5 bg-brand-accent rounded-full text-white hover:bg-brand-accent/80 transition-colors">
                  <Camera size={14} />
                </button>
              </div>
              <p className="text-sm font-medium mt-2" suppressHydrationWarning>
                {emailDisplay}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Họ và tên"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={!isEditing}
                required
              />
              <Input
                label="Số điện thoại"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={!isEditing}
              />
              <div>
                <label className="block text-xs font-bold text-brand-dark/70 mb-1.5">Giới tính</label>
                <div className="flex gap-4">
                  {['Nam', 'Nữ', 'Khác'].map((option) => (
                    <label key={option} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="gender"
                        value={option}
                        checked={gender === option}
                        onChange={(e) => setGender(e.target.value)}
                        disabled={!isEditing}
                        className="text-brand-accent"
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
              <Input
                label="Ngày sinh"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                disabled={!isEditing}
              />

              <div className="flex justify-end gap-3 pt-4">
                {isEditing ? (
                  <>
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                      Hủy
                    </Button>
                    <Button type="submit" loading={isSaving}>
                      Lưu thay đổi
                    </Button>
                  </>
                ) : (
                  <Button type="button" onClick={() => setIsEditing(true)}>
                    Chỉnh sửa
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}