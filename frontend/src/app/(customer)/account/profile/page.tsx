'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch } from '@/store/hooks';
import { fetchMyProfile, updateMyProfile } from '@/store/slices/auth.slice';
import { Camera } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, loading } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    dispatch(fetchMyProfile());
  }, [dispatch, isAuthenticated, router]);

  useEffect(() => {
    if (user?.user) {
      setFullName(user.user.fullName || '');
      setPhone(user.user.phone || '');
      setGender(user.user.gender || '');
      setDob(user.user.dob ? user.user.dob.split('T')[0] : '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await dispatch(updateMyProfile({ fullName, phone, gender, dob })).unwrap();
      toast.success('Cập nhật hồ sơ thành công!');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || 'Cập nhật thất bại');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="font-serif text-2xl text-brand-dark mb-6">Hồ sơ cá nhân</h1>

      <div className="bg-[#FAF8F5] border border-brand-warm rounded-2xl p-6">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-8 pb-6 border-b border-brand-warm">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-brand-sand">
              <Image
                src={user?.user?.avatar || '/avatar-placeholder.jpg'}
                alt={fullName}
                width={96}
                height={96}
                className="object-cover"
              />
            </div>
            <button className="absolute bottom-0 right-0 p-1.5 bg-brand-accent rounded-full text-white hover:bg-brand-accent/80 transition-colors">
              <Camera size={14} />
            </button>
          </div>
          <p className="text-sm font-medium mt-2">{user?.user?.email}</p>
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
  );
}