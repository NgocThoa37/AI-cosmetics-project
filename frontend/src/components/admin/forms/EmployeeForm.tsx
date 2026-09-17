'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { EmployeeStatus } from '@/types/admin.types';

interface EmployeeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

// 🔥 ĐỔI TÊN: roleOptions → positionOptions
const positionOptions = [
  { value: 'Quản lý', label: 'Quản lý' },
  { value: 'Nhân viên bán hàng', label: 'Nhân viên bán hàng' },
  { value: 'Chăm sóc khách hàng', label: 'Chăm sóc khách hàng' },
];

const statusOptions = [
  { value: 'active', label: 'Đang làm việc' },
  { value: 'inactive', label: 'Không hoạt động' },
];

export const EmployeeForm: React.FC<EmployeeFormProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData 
}) => {
  // 🔥 ĐỔI: role → position
  const [formData, setFormData] = useState({
    employeeCode: '',
    fullName: '',
    position: '',  // 🔥 Đổi từ role
    phone: '',
    email: '',
    status: 'active',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        employeeCode: initialData.employeeCode || '',
        fullName: initialData.user?.fullName || '',
        position: initialData.position || '',  // 🔥 Đổi từ role
        phone: initialData.user?.phone || '',
        email: initialData.user?.email || '',
        status: initialData.status || 'active',
      });
    } else {
      setFormData({
        employeeCode: '',
        fullName: '',
        position: '',
        phone: '',
        email: '',
        status: 'active',
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 🔥 GỬI position thay vì role
      await onSave({
        employeeCode: formData.employeeCode,
        fullName: formData.fullName,
        position: formData.position,  // 🔥 Đổi từ role
        phone: formData.phone,
        email: formData.email,
        status: formData.status,
      });
      onClose();
    } catch (error) {
      console.error('Failed to save employee:', error);
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
            {initialData ? 'Sửa nhân viên' : 'Thêm nhân viên mới'}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <Input
            label="Mã nhân viên"
            value={formData.employeeCode}
            onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
            required
            disabled={!!initialData}
          />

          <Input
            label="Họ và tên"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
          />

          {/* 🔥 ĐỔI: Select chức vụ dùng positionOptions */}
          <Select
            label="Chức vụ"
            value={formData.position}  // 🔥 Đổi từ role
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            options={positionOptions}  // 🔥 Đổi từ roleOptions
          />

          <Input
            label="Số điện thoại"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <Select
            label="Trạng thái"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={statusOptions}
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