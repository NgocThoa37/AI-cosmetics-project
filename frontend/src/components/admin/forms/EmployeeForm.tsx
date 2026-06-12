'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { EmployeeRole, EmployeeStatus } from '@/types/admin.types';

interface EmployeeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

const roleOptions = [
  { value: EmployeeRole.MANAGER, label: 'Quản lý' },
  { value: EmployeeRole.SALES, label: 'Nhân viên bán hàng' },
  { value: EmployeeRole.SUPPORT, label: 'Chăm sóc khách hàng' },
];

const statusOptions = [
  { value: EmployeeStatus.WORKING, label: 'Đang làm việc' },
  { value: EmployeeStatus.ON_LEAVE, label: 'Nghỉ phép' },
  { value: EmployeeStatus.RESIGNED, label: 'Đã nghỉ việc' },
];

export const EmployeeForm: React.FC<EmployeeFormProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    empCode: '',
    fullName: '',
    role: EmployeeRole.SALES,
    phone: '',
    email: '',
    status: EmployeeStatus.WORKING,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        empCode: initialData.empCode || '',
        fullName: initialData.fullName || '',
        role: initialData.role || EmployeeRole.SALES,
        phone: initialData.phone || '',
        email: initialData.email || '',
        status: initialData.status || EmployeeStatus.WORKING,
      });
    } else {
      setFormData({
        empCode: '',
        fullName: '',
        role: EmployeeRole.SALES,
        phone: '',
        email: '',
        status: EmployeeStatus.WORKING,
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
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
            value={formData.empCode}
            onChange={(e) => setFormData({ ...formData, empCode: e.target.value })}
            required
          />

          <Input
            label="Họ và tên"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
          />

          <Select
            label="Chức vụ"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as EmployeeRole })}
            options={roleOptions}
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
            onChange={(e) => setFormData({ ...formData, status: e.target.value as EmployeeStatus })}
            options={statusOptions}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
            <Button type="submit" loading={loading}>{initialData ? 'Cập nhật' : 'Thêm mới'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};