// frontend/src/app/admin/customers/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/admin/common/DataTable';
import { SearchFilterBar } from '@/components/admin/common/SearchFilterBar';
import { adminService } from '@/services/api/admin.service';
import { Customer } from '@/types/admin.types';
import toast from 'react-hot-toast';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const data = await adminService.getCustomers();
      setCustomers(data || []);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      toast.error('Không thể tải danh sách khách hàng');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const fullName = customer.user?.fullName || '';
    const email = customer.user?.email || '';
    const phone = customer.user?.phone || '';
    
    const matchesSearch = fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phone.includes(searchQuery);
    
    return matchesSearch;
  });

  const columns = [
    { key: 'id', header: 'ID', className: 'font-mono w-16' },
    { 
      key: 'fullName', 
      header: 'Họ và tên',
      render: (item: Customer) => item.user?.fullName || '—'
    },
    { 
      key: 'email', 
      header: 'Email',
      render: (item: Customer) => item.user?.email || '—'
    },
    { 
      key: 'phone', 
      header: 'Số điện thoại',
      render: (item: Customer) => item.user?.phone || '—'
    },
    { 
      key: 'createdAt', 
      header: 'Ngày đăng ký',
      render: (item: Customer) => item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : '—'
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-forest-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-800">Danh sách khách hàng</h3>
      </div>

      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter="ALL"
        onStatusFilterChange={() => {}}
        statusOptions={[]}
        onReset={() => setSearchQuery('')}
        placeholder="Tìm theo tên, email hoặc số điện thoại"
      />

      <DataTable
        data={filteredCustomers}
        columns={columns}
        isLoading={loading}
      />
    </div>
  );
}