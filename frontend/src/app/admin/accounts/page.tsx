'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/admin/common/DataTable';
import { SearchFilterBar } from '@/components/admin/common/SearchFilterBar';
import { ConfirmModal } from '@/components/admin/common/ConfirmModal';
import { adminService } from '@/services/api/admin.service';
import { Account, AccountStatus } from '@/types/admin.types';

const statusOptions = [
  { value: AccountStatus.ACTIVE, label: 'Hoạt động' },
  { value: AccountStatus.LOCKED, label: 'Khóa' },
];

export default function AdminAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Account | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const data = await adminService.getAccounts();
      setAccounts(data);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: AccountStatus) => {
    try {
      await adminService.updateAccountStatus(id, status);
      setAccounts(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    } catch (error) {
      console.error('Failed to update account status:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminService.deleteAccount(deleteTarget.id);
      setAccounts(prev => prev.filter(a => a.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error) {
      console.error('Failed to delete account:', error);
    }
  };

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.phone.includes(searchQuery);
    const matchesStatus = statusFilter === 'ALL' || account.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    { key: 'id', header: 'ID', className: 'font-mono w-16' },
    { key: 'fullName', header: 'Họ và tên' },
    { key: 'phone', header: 'Số điện thoại' },
    { key: 'email', header: 'Email' },
    { key: 'joinedDate', header: 'Ngày đăng ký' },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (item: Account) => (
        <select
          value={item.status}
          onChange={(e) => handleUpdateStatus(item.id, e.target.value as AccountStatus)}
          className={`px-2 py-1 rounded-md text-[10px] font-bold border cursor-pointer ${
            item.status === AccountStatus.ACTIVE
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}
        >
          <option value={AccountStatus.ACTIVE}>{AccountStatus.ACTIVE}</option>
          <option value={AccountStatus.LOCKED}>{AccountStatus.LOCKED}</option>
        </select>
      ),
    },
  ];

  return (
    <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <h3 className="text-sm font-bold text-slate-800">Danh sách tài khoản khách hàng</h3>
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
        data={filteredAccounts}
        columns={columns}
        onDelete={(item) => setDeleteTarget(item)}
        isLoading={loading}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Xác nhận xóa tài khoản"
        message={`Bạn có chắc chắn muốn xóa tài khoản "${deleteTarget?.fullName}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}