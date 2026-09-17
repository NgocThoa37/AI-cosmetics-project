'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useCart } from '@/hooks/useCart';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { formatCurrency } from '@/helpers/format.helper';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';

interface CartItem {
  id: number;
  cartId: number;
  productDetailId: string;
  quantity: number;
  product?: any;
  productDetail?: any;
  createdAt?: string;
  updatedAt?: string;
}

const FALLBACK_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="2"%3E%3Crect x="3" y="3" width="18" height="18" rx="2"%3E%3C/rect%3E%3Ccircle cx="8.5" cy="8.5" r="1.5"%3E%3C/circle%3E%3Cpath d="M21 15l-5-5L5 21"%3E%3C/path%3E%3C/svg%3E';

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated } = useCustomerAuth();
  const { cart, loading, updateQuantity, removeItem } = useCart();
  
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // ✅ SỬA: Kiểm tra token thay vì isAuthenticated
  useEffect(() => {
    const token = localStorage.getItem('customer_token');
    console.log('🔍 [CartPage] Token:', token ? 'CÓ' : 'KHÔNG');
    console.log('🔍 [CartPage] isAuthenticated:', isAuthenticated);
    
    // ✅ Nếu không có token, chuyển về trang chủ
    if (!token) {
      console.log('⚠️ [CartPage] No token, redirect to home');
      router.push('/');
      return;
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (cart?.details && cart.details.length > 0) {
      const allIds = cart.details.map((item: CartItem) => item.id);
      setSelectedIds(new Set(allIds));
    }
  }, [cart]);

  const details: CartItem[] = cart?.details || [];
  const selectedDetails = details.filter((item) => selectedIds.has(item.id));
  
  const subtotal = selectedDetails.reduce((sum, item) => {
    const productDetail = item.productDetail;
    const product = productDetail?.product;
    const price = product?.price || 0;
    return sum + (price || 0) * item.quantity;
  }, 0);

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === details.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(details.map((item) => item.id)));
    }
  };

  const handleProceedToCheckout = () => {
    console.log('🛒 [CHECKOUT] Selected IDs:', Array.from(selectedIds));
    
    if (selectedIds.size === 0) {
      alert('Vui lòng chọn ít nhất 1 sản phẩm');
      return;
    }
    
    const ids = Array.from(selectedIds);
    router.push(`/checkout?ids=${ids.join(',')}`);
  };

  const getImageUrl = (item: CartItem): string => {
    const productDetail = item.productDetail;
    const product = productDetail?.product;
    
    if (productDetail?.images && productDetail.images.length > 0) {
      const mainImage = productDetail.images.find((img: any) => img.isMain);
      if (mainImage?.imageUrl) return mainImage.imageUrl;
      if (productDetail.images[0]?.imageUrl) return productDetail.images[0].imageUrl;
      if (typeof productDetail.images[0] === 'string') return productDetail.images[0];
    }
    
    if (product?.images && product.images.length > 0) {
      const mainImage = product.images.find((img: any) => img.isMain);
      if (mainImage?.imageUrl) return mainImage.imageUrl;
      if (product.images[0]?.imageUrl) return product.images[0].imageUrl;
      if (typeof product.images[0] === 'string') return product.images[0];
    }
    
    if (product?.image) {
      return product.image;
    }
    
    if (productDetail?.image) {
      return productDetail.image;
    }
    
    return FALLBACK_IMAGE;
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

      {subtotal > 0 && subtotal < 500000 && (
        <div className="bg-brand-sand/50 border border-brand-warm rounded-xl p-4 mb-6 text-center">
          <p className="text-sm text-brand-dark/70">
            🚚 Mua thêm <span className="font-bold text-brand-accent">{formatCurrency(500000 - subtotal)}</span> để được miễn phí vận chuyển
          </p>
        </div>
      )}

      <div className="bg-[#FAF8F5] border border-brand-warm rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[40px_2fr_1fr_1fr_1fr_40px] gap-4 px-4 py-3 bg-brand-sand/50 border-b border-brand-warm text-xs font-bold text-brand-dark/50">
          <div>Chọn</div>
          <div>Sản phẩm</div>
          <div className="text-center">Đơn giá</div>
          <div className="text-center">Số lượng</div>
          <div className="text-right">Thành tiền</div>
          <div />
        </div>

        {/* Items */}
        <div className="divide-y divide-brand-warm">
          {details.map((item) => {
            const productDetail = item.productDetail;
            const product = productDetail?.product;
            
            const productName = product?.name || 'Sản phẩm';
            const price = product?.price || 0;
            const categoryName = product?.category?.name || '';
            const imageUrl = getImageUrl(item);
            const isSelected = selectedIds.has(item.id);

            return (
              <div 
                key={item.id} 
                className={`grid grid-cols-[40px_2fr_1fr_1fr_1fr_40px] gap-4 px-4 py-4 items-center ${
                  isSelected ? 'bg-brand-sand/5' : 'opacity-60'
                }`}
              >
                <div>
                  <input 
                    type="checkbox" 
                    checked={isSelected} 
                    onChange={() => handleToggleSelect(item.id)}
                    className="w-4 h-4 rounded border-brand-warm text-brand-accent cursor-pointer"
                  />
                </div>

                <div className="flex gap-3">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-white border border-brand-warm flex-shrink-0">
                    <img 
                      src={imageUrl} 
                      alt={productName} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                      }}
                    />
                  </div>
                  <div>
                    {categoryName && (
                      <span className="text-[10px] font-bold text-brand-accent uppercase">
                        {categoryName}
                      </span>
                    )}
                    <p className="font-bold text-sm">{productName}</p>
                    {productDetail?.color?.name && (
                      <p className="text-xs text-brand-dark/50">
                        {productDetail.color.name}{productDetail?.size?.name && ` / ${productDetail.size.name}`}
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
                  {formatCurrency((price || 0) * item.quantity)}
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
              checked={selectedIds.size === details.length && details.length > 0} 
              onChange={handleSelectAll}
              className="w-4 h-4 rounded border-brand-warm text-brand-accent cursor-pointer"
            />
            <span className="text-xs font-medium">
              {selectedIds.size === details.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </span>
            <span className="text-xs text-brand-dark/40">
              ({selectedIds.size}/{details.length})
            </span>
          </label>
          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-4">
              <span className="text-sm text-brand-dark/60">Tổng thanh toán:</span>
              <span className="text-xl font-bold text-brand-accent">{formatCurrency(subtotal)}</span>
            </div>
            <Button 
              onClick={handleProceedToCheckout} 
              disabled={selectedIds.size === 0} 
              className="w-full sm:w-56"
            >
              Tiến hành thanh toán ({selectedIds.size} sản phẩm)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}