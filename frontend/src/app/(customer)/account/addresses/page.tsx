'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { MapPin, Edit2, Trash2, Plus, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadAddresses();
  }, [isAuthenticated, router]);

  const loadAddresses = () => {
    const saved = localStorage.getItem('lumiere_addresses');
    if (saved) {
      setAddresses(JSON.parse(saved));
    } else {
      const defaultAddresses: Address[] = [
        {
          id: 'addr-1',
          name: 'Nguyễn Mỹ Linh',
          phone: '0987654321',
          address: 'Số 45 Ngõ 198, Đường Lê Hồng Phong',
          city: 'Quận Hà Đông, Hà Nội',
          isDefault: true,
        },
      ];
      setAddresses(defaultAddresses);
      localStorage.setItem('lumiere_addresses', JSON.stringify(defaultAddresses));
    }
    setLoading(false);
  };

  const saveAddresses = (newAddresses: Address[]) => {
    setAddresses(newAddresses);
    localStorage.setItem('lumiere_addresses', JSON.stringify(newAddresses));
  };

  const handleAdd = () => {
    if (!formData.name || !formData.phone || !formData.address || !formData.city) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    const newAddress: Address = {
      id: `addr-${Date.now()}`,
      ...formData,
      isDefault: addresses.length === 0,
    };
    saveAddresses([...addresses, newAddress]);
    setFormData({ name: '', phone: '', address: '', city: '' });
    setIsAdding(false);
    toast.success('Thêm địa chỉ thành công');
  };

  const handleUpdate = () => {
    if (!formData.name || !formData.phone || !formData.address || !formData.city) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    const updated = addresses.map(addr =>
      addr.id === editingId ? { ...addr, ...formData } : addr
    );
    saveAddresses(updated);
    setFormData({ name: '', phone: '', address: '', city: '' });
    setEditingId(null);
    toast.success('Cập nhật địa chỉ thành công');
  };

  const handleEdit = (address: Address) => {
    setEditingId(address.id);
    setFormData({
      name: address.name,
      phone: address.phone,
      address: address.address,
      city: address.city,
    });
  };

  const handleDelete = (id: string) => {
    const filtered = addresses.filter(addr => addr.id !== id);
    if (filtered.length > 0 && addresses.find(a => a.id === id)?.isDefault) {
      filtered[0].isDefault = true;
    }
    saveAddresses(filtered);
    toast.success('Xóa địa chỉ thành công');
  };

  const handleSetDefault = (id: string) => {
    const updated = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id,
    }));
    saveAddresses(updated);
    toast.success('Đặt làm địa chỉ mặc định');
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-serif text-2xl text-brand-dark">Địa chỉ giao hàng</h1>
        {!isAdding && !editingId && (
          <Button onClick={() => setIsAdding(true)} className="flex items-center gap-1">
            <Plus size={14} /> Thêm địa chỉ mới
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* Add Form */}
        {isAdding && (
          <div className="bg-[#FAF8F5] border border-brand-warm rounded-2xl p-5">
            <h3 className="font-bold text-brand-dark mb-4">Thêm địa chỉ mới</h3>
            <div className="space-y-3">
              <Input placeholder="Họ tên người nhận" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              <Input placeholder="Số điện thoại" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              <Input placeholder="Địa chỉ cụ thể" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
              <Input placeholder="Quận/Huyện, Tỉnh/Thành phố" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
              <div className="flex justify-end gap-3 pt-3">
                <Button variant="outline" onClick={() => { setIsAdding(false); setFormData({ name: '', phone: '', address: '', city: '' }); }}>Hủy</Button>
                <Button onClick={handleAdd}>Lưu địa chỉ</Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Form */}
        {editingId && (
          <div className="bg-[#FAF8F5] border border-brand-warm rounded-2xl p-5">
            <h3 className="font-bold text-brand-dark mb-4">Cập nhật địa chỉ</h3>
            <div className="space-y-3">
              <Input placeholder="Họ tên người nhận" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              <Input placeholder="Số điện thoại" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              <Input placeholder="Địa chỉ cụ thể" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
              <Input placeholder="Quận/Huyện, Tỉnh/Thành phố" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
              <div className="flex justify-end gap-3 pt-3">
                <Button variant="outline" onClick={() => { setEditingId(null); setFormData({ name: '', phone: '', address: '', city: '' }); }}>Hủy</Button>
                <Button onClick={handleUpdate}>Cập nhật</Button>
              </div>
            </div>
          </div>
        )}

        {/* Address List */}
        {addresses.map((addr) => (
          <div key={addr.id} className="bg-white border border-brand-warm rounded-2xl p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <MapPin size={20} className="text-brand-accent flex-shrink-0 mt-1" />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-brand-dark">{addr.name}</p>
                    <span className="text-xs text-brand-dark/50">| {addr.phone}</span>
                    {addr.isDefault && (
                      <span className="text-[10px] bg-brand-accent/10 text-brand-accent px-2 py-0.5 rounded-full">Mặc định</span>
                    )}
                  </div>
                  <p className="text-sm text-brand-dark/70 mt-1">{addr.address}</p>
                  <p className="text-xs text-brand-dark/50 mt-1">{addr.city}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {!addr.isDefault && (
                  <button onClick={() => handleSetDefault(addr.id)} className="p-1.5 text-brand-dark/40 hover:text-brand-accent transition-colors" title="Đặt mặc định">
                    <Check size={14} />
                  </button>
                )}
                <button onClick={() => handleEdit(addr)} className="p-1.5 text-brand-dark/40 hover:text-brand-accent transition-colors" title="Sửa">
                  <Edit2 size={14} />
                </button>
                {!addr.isDefault && (
                  <button onClick={() => handleDelete(addr.id)} className="p-1.5 text-brand-dark/40 hover:text-red-500 transition-colors" title="Xóa">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {addresses.length === 0 && !isAdding && (
          <div className="text-center py-12 bg-[#FAF8F5] rounded-2xl border border-brand-warm">
            <MapPin size={32} className="mx-auto text-brand-dark/30 mb-3" />
            <p className="text-brand-dark/50">Chưa có địa chỉ giao hàng nào</p>
            <Button onClick={() => setIsAdding(true)} className="mt-4">Thêm địa chỉ mới</Button>
          </div>
        )}
      </div>
    </div>
  );
}