'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';

interface AccountFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

const statusOptions = [
  { value: 'active', label: 'Hoạt động' },
  { value: 'inactive', label: 'Không hoạt động' },
  { value: 'banned', label: 'Bị khóa' },
];

const roleOptions = [
  { value: 'admin', label: 'Quản trị viên' },
  { value: 'employee', label: 'Nhân viên' },
  { value: 'customer', label: 'Khách hàng' },
];

export const AccountForm: React.FC<AccountFormProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData 
}) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    phone: '',
    email: '',
    role: 'customer',
    status: 'active',
  });
  const [loading, setLoading] = useState(false);

  // 🔥 QUAN TRỌNG: SỬA useEffect NÀY
  useEffect(() => {
    if (initialData) {
      setFormData({
        username: initialData.username || '',
        password: '', // Không fill password khi sửa
        fullName: initialData.user?.fullName || '', // ✅ Lấy từ user
        phone: initialData.user?.phone || '',       // ✅ Lấy từ user
        email: initialData.user?.email || '',       // ✅ Lấy từ user
        role: initialData.role || 'customer',
        status: initialData.status || 'active',
      });
    } else {
      setFormData({
        username: '',
        password: '',
        fullName: '',
        phone: '',
        email: '',
        role: 'customer',
        status: 'active',
      });
    }
  }, [initialData, isOpen]); // ✅ Thêm isOpen

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save account:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <h3 className="text-lg font-bold text-slate-800">
            {initialData ? 'Sửa tài khoản' : 'Thêm tài khoản mới'}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <Input
            label="Tên đăng nhập"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required={!initialData}
            disabled={!!initialData}
          />

          <Input
            label={initialData ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu'}
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required={!initialData}
          />

          <Input
            label="Họ và tên"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
          />

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <Input
            label="Số điện thoại"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          <Select
            label="Vai trò"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            options={roleOptions}
            disabled={initialData?.role === 'admin'}
          />

          <Select
            label="Trạng thái"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={statusOptions}
            disabled={initialData?.role === 'admin'}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" loading={loading}>
              {initialData ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};