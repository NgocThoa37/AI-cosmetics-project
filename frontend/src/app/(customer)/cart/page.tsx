'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/helpers/format.helper';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { cart, loading, updateQuantity, removeItem } = useCart();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (cart?.details) {
      setSelectedItems(new Set(cart.details.map(item => String(item.id))));
    }
  }, [cart]);

  const details = cart?.details || [];
  const selectedDetails = details.filter(item => selectedItems.has(String(item.id)));
  const subtotal = selectedDetails.reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  const handleToggleSelect = (id: number) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(String(id))) next.delete(String(id));
      else next.add(String(id));
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedItems.size === details.length) setSelectedItems(new Set());
    else setSelectedItems(new Set(details.map(item => String(item.id))));
  };

  const handleProceedToCheckout = () => {
    const selectedIds = Array.from(selectedItems).map(Number);
    router.push(`/customer/checkout?ids=${selectedIds.join(',')}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (details.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-brand-sand rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingBag size={32} className="text-brand-dark/40" />
        </div>
        <h2 className="font-serif text-xl text-brand-dark mb-2">Giỏ hàng trống</h2>
        <p className="text-sm text-brand-dark/50 mb-6">Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
        <Button onClick={() => router.push('/')}>Tiếp tục mua sắm</Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-serif text-2xl text-brand-dark mb-6">Giỏ hàng</h1>

      <div className="bg-[#FAF8F5] border border-brand-warm rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[40px_2fr_1fr_1fr_1fr_40px] gap-4 px-4 py-3 bg-brand-sand/50 border-b border-brand-warm text-xs font-bold text-brand-dark/50">
          <div>
            <input 
              type="checkbox" 
              checked={selectedItems.size === details.length && details.length > 0} 
              onChange={handleToggleSelectAll} 
              className="w-4 h-4 rounded border-brand-warm text-brand-accent" 
            />
          </div>
          <div>Sản phẩm</div>
          <div className="text-center">Đơn giá</div>
          <div className="text-center">Số lượng</div>
          <div className="text-right">Thành tiền</div>
          <div />
        </div>

        {/* Items */}
        <div className="divide-y divide-brand-warm">
          {details.map((item) => {
            const product = item.product;
            const variant = item.productDetail;
            const price = product?.price || 0;
            const isSelected = selectedItems.has(String(item.id));
            const imageUrl = product?.images?.find(img => img.isMain)?.imageUrl || '/placeholder.jpg';

            return (
              <div key={item.id} className="grid grid-cols-[40px_2fr_1fr_1fr_1fr_40px] gap-4 px-4 py-4 items-center">
                <div>
                  <input 
                    type="checkbox" 
                    checked={isSelected} 
                    onChange={() => handleToggleSelect(item.id)} 
                    className="w-4 h-4 rounded border-brand-warm text-brand-accent" 
                  />
                </div>
                <div className="flex gap-3">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-white border border-brand-warm">
                    <Image 
                      src={imageUrl} 
                      alt={product?.name || ''} 
                      width={56} 
                      height={56} 
                      className="object-cover" 
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-brand-accent uppercase">
                      {product?.category?.name}
                    </span>
                    <p className="font-bold text-sm">{product?.name}</p>
                    {variant?.color?.name && (
                      <p className="text-xs text-brand-dark/50">
                        {variant.color.name}{variant?.size?.name && ` / ${variant.size.name}`}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-center font-medium">{formatCurrency(price)}</div>
                <div className="flex justify-center">
                  <div className="flex items-center border border-brand-warm rounded-lg bg-white">
                    <button 
                      onClick={() => updateQuantity(item.productDetailId, item.quantity - 1)} 
                      className="px-3 py-1.5 hover:text-brand-accent"
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-10 text-center text-sm">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.productDetailId, item.quantity + 1)} 
                      className="px-3 py-1.5 hover:text-brand-accent"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
                <div className="text-right font-bold text-brand-accent">
                  {formatCurrency(price * item.quantity)}
                </div>
                <div>
                  <button 
                    onClick={() => removeItem(item.productDetailId)} 
                    className="p-1.5 text-brand-dark/30 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-brand-warm bg-white flex flex-col sm:flex-row justify-between items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={selectedItems.size === details.length && details.length > 0} 
              onChange={handleToggleSelectAll} 
              className="w-4 h-4 rounded border-brand-warm text-brand-accent" 
            />
            <span className="text-xs font-medium">Chọn tất cả</span>
          </label>
          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-4">
              <span className="text-sm text-brand-dark/60">Tổng thanh toán:</span>
              <span className="text-xl font-bold text-brand-accent">{formatCurrency(subtotal)}</span>
            </div>
            <Button 
              onClick={handleProceedToCheckout} 
              disabled={selectedItems.size === 0} 
              className="w-full sm:w-56"
            >
              Thanh toán
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}