'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/admin/common/DataTable';
import { SearchFilterBar } from '@/components/admin/common/SearchFilterBar';
import { ConfirmModal } from '@/components/admin/common/ConfirmModal';
import { AccountForm } from '@/components/admin/forms/AccountForm';
import { adminService } from '@/services/api/admin.service';
import { Account, Role } from '@/types/admin.types';
import toast from 'react-hot-toast';

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

export default function AdminAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Account | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const data = await adminService.getAccounts();
      setAccounts(data || []);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: Partial<Account>) => {
    try {
      if (editingAccount) {
        await adminService.updateAccount(String(editingAccount.id), data);
        toast.success('Cập nhật tài khoản thành công');
      } else {
        await adminService.createAccount(data);
        toast.success('Thêm tài khoản thành công');
      }
      fetchAccounts();
      setIsFormOpen(false);
      setEditingAccount(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi lưu tài khoản');
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await adminService.updateAccountStatus(String(id), status);
      setAccounts(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      toast.success('Cập nhật trạng thái thành công');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi cập nhật trạng thái');
    }
  };

  const handleUpdateRole = async (id: number, role: string) => {
    try {
      await adminService.updateAccountRole(String(id), role);
      setAccounts(prev => prev.map(a => a.id === id ? { ...a, role } : a));
      toast.success('Cập nhật vai trò thành công');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi cập nhật vai trò');
    }
  };

  const handleToggleLock = async (id: number) => {
    try {
      const result = await adminService.toggleAccountLock(String(id));
      setAccounts(prev => prev.map(a => a.id === id ? { ...a, status: result.status } : a));
      toast.success(result.message);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi thao tác');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.role === 'admin') {
      toast.error('Không thể xóa tài khoản quản trị viên');
      setDeleteTarget(null);
      return;
    }
    try {
      await adminService.deleteAccount(String(deleteTarget.id));
      setAccounts(prev => prev.filter(a => a.id !== deleteTarget.id));
      toast.success('Xóa tài khoản thành công');
      setDeleteTarget(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi xóa tài khoản');
    }
  };

  const filteredAccounts = accounts.filter(account => {
    const fullName = account.user?.fullName || '';
    const email = account.user?.email || '';
    const phone = account.user?.phone || '';
    const username = account.username || '';
    
    const matchesSearch = fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phone.includes(searchQuery) ||
      username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || account.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'inactive': return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'banned': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Hoạt động';
      case 'inactive': return 'Không hoạt động';
      case 'banned': return 'Bị khóa';
      default: return status;
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-50 text-purple-700';
      case 'employee': return 'bg-blue-50 text-blue-700';
      default: return 'bg-slate-50 text-slate-700';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Quản trị viên';
      case 'employee': return 'Nhân viên';
      default: return 'Khách hàng';
    }
  };

  const columns = [
    { key: 'id', header: 'ID', className: 'font-mono w-16' },
    { key: 'username', header: 'Tên đăng nhập' },
    { 
      key: 'fullName', 
      header: 'Họ và tên',
      render: (item: Account) => item.user?.fullName || '—'
    },
    { 
      key: 'phone', 
      header: 'Số điện thoại',
      render: (item: Account) => item.user?.phone || '—'
    },
    { 
      key: 'email', 
      header: 'Email',
      render: (item: Account) => item.user?.email || '—'
    },
    { 
      key: 'role', 
      header: 'Vai trò',
      render: (item: Account) => (
        <select
          value={item.role}
          onChange={(e) => handleUpdateRole(item.id, e.target.value)}
          disabled={item.role === 'admin'}
          className={`px-2 py-1 rounded-md text-[10px] font-bold border cursor-pointer ${getRoleBadgeClass(item.role)} ${
            item.role === 'admin' ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {roleOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      )
    },
    { 
      key: 'createdAt', 
      header: 'Ngày đăng ký',
      render: (item: Account) => item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : '—'
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (item: Account) => (
        <div className="flex items-center gap-2">
          <select
            value={item.status}
            onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
            disabled={item.role === 'admin'}
            className={`px-2 py-1 rounded-md text-[10px] font-bold border cursor-pointer ${getStatusBadgeClass(item.status)} ${
              item.role === 'admin' ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {item.role !== 'admin' && (
            <button
              onClick={() => handleToggleLock(item.id)}
              className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                item.status === 'banned' 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                  : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
              }`}
            >
              {item.status === 'banned' ? 'Mở khóa' : 'Khóa'}
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
        <h3 className="text-sm font-bold text-slate-800">Danh sách tài khoản</h3>
      </div>

      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        statusOptions={statusOptions}
        onReset={() => { setSearchQuery(''); setStatusFilter('ALL'); }}
        onAdd={() => {
          setEditingAccount(null);
          setIsFormOpen(true);
        }}
        addButtonLabel=" Thêm tài khoản"
      />

      <DataTable
        data={filteredAccounts}
        columns={columns}
        onDelete={(item) => item.role !== 'admin' && setDeleteTarget(item)}
        onView={(item) => setSelectedAccount(item)}
        isLoading={loading}
      />

      <AccountForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingAccount(null);
        }}
        onSave={handleSave}
        initialData={editingAccount}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Xác nhận xóa tài khoản"
        message={`Bạn có chắc chắn muốn xóa tài khoản "${deleteTarget?.user?.fullName}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Modal xem chi tiết */}
      {selectedAccount && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Chi tiết tài khoản</h3>
            <div className="space-y-3">
              <div><span className="font-semibold">ID:</span> {selectedAccount.id}</div>
              <div><span className="font-semibold">Tên đăng nhập:</span> {selectedAccount.username}</div>
              <div><span className="font-semibold">Họ và tên:</span> {selectedAccount.user?.fullName}</div>
              <div><span className="font-semibold">Email:</span> {selectedAccount.user?.email}</div>
              <div><span className="font-semibold">Số điện thoại:</span> {selectedAccount.user?.phone || '—'}</div>
              <div><span className="font-semibold">Vai trò:</span> {getRoleLabel(selectedAccount.role)}</div>
              <div><span className="font-semibold">Trạng thái:</span> {getStatusLabel(selectedAccount.status)}</div>
              <div><span className="font-semibold">Ngày đăng ký:</span> {selectedAccount.createdAt ? new Date(selectedAccount.createdAt).toLocaleDateString('vi-VN') : '—'}</div>
            </div>
            <button
              onClick={() => setSelectedAccount(null)}
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