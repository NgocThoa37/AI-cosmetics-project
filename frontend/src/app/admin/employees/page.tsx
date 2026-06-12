'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/admin/common/DataTable';
import { SearchFilterBar } from '@/components/admin/common/SearchFilterBar';
import { ConfirmModal } from '@/components/admin/common/ConfirmModal';
import { adminService } from '@/services/api/admin.service';
import { Employee, EmployeeStatus } from '@/types/admin.types';

const statusOptions = [
  { value: EmployeeStatus.WORKING, label: 'Đang làm việc' },
  { value: EmployeeStatus.ON_LEAVE, label: 'Nghỉ phép' },
  { value: EmployeeStatus.RESIGNED, label: 'Đã nghỉ việc' },
];

export default function AdminEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const data = await adminService.getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminService.deleteEmployee(deleteTarget.id);
      setEmployees(prev => prev.filter(e => e.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error) {
      console.error('Failed to delete employee:', error);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.empCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || emp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    { key: 'id', header: 'ID', className: 'font-mono w-16' },
    { key: 'empCode', header: 'Mã NV', className: 'font-mono font-semibold' },
    { key: 'fullName', header: 'Họ và tên' },
    { key: 'role', header: 'Chức vụ' },
    { key: 'phone', header: 'Số điện thoại' },
    { key: 'email', header: 'Email' },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (item: Employee) => (
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${
          item.status === EmployeeStatus.WORKING
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : item.status === EmployeeStatus.ON_LEAVE
            ? 'bg-amber-50 text-amber-700 border-amber-200'
            : 'bg-slate-100 text-slate-500 border-slate-200'
        }`}>
          {item.status}
        </span>
      ),
    },
  ];

  return (
    <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <h3 className="text-sm font-bold text-slate-800">Danh sách nhân viên</h3>
      </div>

      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        statusOptions={statusOptions}
        onReset={() => { setSearchQuery(''); setStatusFilter('ALL'); }}
      />

      <DataTable
        data={filteredEmployees}
        columns={columns}
        onDelete={(item) => setDeleteTarget(item)}
        isLoading={loading}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Xác nhận xóa nhân viên"
        message={`Bạn có chắc chắn muốn xóa nhân viên "${deleteTarget?.fullName}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}