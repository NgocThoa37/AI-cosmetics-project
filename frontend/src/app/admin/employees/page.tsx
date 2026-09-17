'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/admin/common/DataTable';
import { SearchFilterBar } from '@/components/admin/common/SearchFilterBar';
import { ConfirmModal } from '@/components/admin/common/ConfirmModal';
import { EmployeeForm } from '@/components/admin/forms/EmployeeForm';
import { adminService } from '@/services/api/admin.service';
import { Employee } from '@/types/admin.types';
import toast from 'react-hot-toast';

const statusOptions = [
  { value: 'active', label: 'Đang làm việc' },
  { value: 'inactive', label: 'Không hoạt động' },
];

export default function AdminEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const data = await adminService.getEmployees();
      setEmployees(data || []);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      setEmployees([]);
      toast.error('Không thể tải danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: Partial<Employee>) => {
    try {
      if (editingEmployee) {
        await adminService.updateEmployee(String(editingEmployee.id), data);
        toast.success('Cập nhật nhân viên thành công');
      } else {
        await adminService.createEmployee(data);
        toast.success('Thêm nhân viên thành công');
      }
      fetchEmployees();
      setIsFormOpen(false);
      setEditingEmployee(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi lưu nhân viên');
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await adminService.updateEmployee(String(id), { status });
      setEmployees(prev => prev.map(e => e.id === id ? { ...e, status } : e));
      toast.success('Cập nhật trạng thái thành công');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi cập nhật trạng thái');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminService.deleteEmployee(String(deleteTarget.id));
      toast.success('Xóa nhân viên thành công');
      fetchEmployees();
      setDeleteTarget(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể xóa nhân viên');
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const fullName = emp.user?.fullName || '';
    const email = emp.user?.email || '';
    const phone = emp.user?.phone || '';
    const employeeCode = emp.employeeCode || '';
    
    const matchesSearch = fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phone.includes(searchQuery);
    const matchesStatus = statusFilter === 'ALL' || emp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status: string) => {
    return status === 'active'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : 'bg-slate-100 text-slate-500 border-slate-200';
  };

  const getStatusLabel = (status: string) => {
    return status === 'active' ? 'Đang làm việc' : 'Không hoạt động';
  };

  const columns = [
    { key: 'id', header: 'ID', className: 'font-mono w-16' },
    { key: 'employeeCode', header: 'Mã NV', className: 'font-mono font-semibold' },
    { 
      key: 'fullName', 
      header: 'Họ và tên',
      render: (item: Employee) => item.user?.fullName || '—'
    },
    { 
      key: 'email', 
      header: 'Email',
      render: (item: Employee) => item.user?.email || '—'
    },
    { 
      key: 'phone', 
      header: 'Số điện thoại',
      render: (item: Employee) => item.user?.phone || '—'
    },
    { 
      key: 'hireDate', 
      header: 'Ngày vào làm',
      render: (item: Employee) => item.hireDate ? new Date(item.hireDate).toLocaleDateString('vi-VN') : '—'
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (item: Employee) => (
        <select
          value={item.status || 'active'}
          onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
          className={`px-2 py-1 rounded-full text-[10px] font-bold border cursor-pointer ${getStatusBadgeClass(item.status || 'active')}`}
        >
          <option value="active">Đang làm việc</option>
          <option value="inactive">Không hoạt động</option>
        </select>
      ),
    },
  ];

  return (
    <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-800">Danh sách nhân viên</h3>
      </div>

      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        statusOptions={statusOptions}
        onReset={() => { setSearchQuery(''); setStatusFilter('ALL'); }}
        onAdd={() => {
          setEditingEmployee(null);
          setIsFormOpen(true);
        }}
        addButtonLabel=" Thêm nhân viên"
      />

      <DataTable
        data={filteredEmployees}
        columns={columns}
        onEdit={(item) => {
          setEditingEmployee(item);
          setIsFormOpen(true);
        }}
        onDelete={(item) => setDeleteTarget(item)}
        onView={(item) => setSelectedEmployee(item)}
        isLoading={loading}
      />

      <EmployeeForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingEmployee(null);
        }}
        onSave={handleSave}
        initialData={editingEmployee}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Xác nhận xóa nhân viên"
        message={`Bạn có chắc chắn muốn xóa nhân viên "${deleteTarget?.user?.fullName}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Modal xem chi tiết */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Chi tiết nhân viên</h3>
            <div className="space-y-3">
              <div><span className="font-semibold">ID:</span> {selectedEmployee.id}</div>
              <div><span className="font-semibold">Mã nhân viên:</span> {selectedEmployee.employeeCode}</div>
              <div><span className="font-semibold">Họ và tên:</span> {selectedEmployee.user?.fullName}</div>
              <div><span className="font-semibold">Email:</span> {selectedEmployee.user?.email}</div>
              <div><span className="font-semibold">Số điện thoại:</span> {selectedEmployee.user?.phone || '—'}</div>
              <div><span className="font-semibold">Ngày vào làm:</span> {selectedEmployee.hireDate ? new Date(selectedEmployee.hireDate).toLocaleDateString('vi-VN') : '—'}</div>
              <div><span className="font-semibold">Trạng thái:</span> {getStatusLabel(selectedEmployee.status || 'active')}</div>
            </div>
            <button
              onClick={() => setSelectedEmployee(null)}
              className="mt-4 w-full bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-200"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}