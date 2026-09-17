'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Minus, Plus, Trash2, ShoppingBag, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/hooks/useCart';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/helpers/format.helper';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

// ✅ Định nghĩa placeholder image
const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Crect width="200" height="200" fill="%23f5f0eb"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="14"%3ENo Image%3C/text%3E%3C/svg%3E';

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { cart, updateQuantity, removeItem } = useCart();
  const details = cart?.details || [];

  const subtotal = details.reduce((sum, item) => {
    const product = (item as any).product;
    const productDetail = item.productDetail;
    const productFromDetail = (productDetail as any)?.product;
    const finalProduct = product || productFromDetail;
    const price = finalProduct?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  const freeShippingThreshold = 500000;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const missingForFreeShipping = freeShippingThreshold - subtotal;

  // ✅ Xử lý thanh toán - Lấy tất cả ID sản phẩm
  const handleCheckout = () => {
    console.log('🛒 [CartDrawer] handleCheckout called');
    console.log('📦 details:', details);
    
    if (details.length === 0) {
      alert('Giỏ hàng trống!');
      return;
    }
    
    // ✅ Lấy tất cả ID sản phẩm trong giỏ
    const ids = details.map((item) => item.id);
    console.log('🛒 [CartDrawer] Checkout with ids:', ids);
    
    onClose();
    router.push(`/checkout?ids=${ids.join(',')}`);
  };

  // ✅ Xử lý xem giỏ hàng chi tiết
  const handleViewCart = () => {
    onClose();
    router.push('/cart');
  };

  // ✅ Hàm lấy ảnh an toàn
  const getImageUrl = (item: any): string => {
    const product = item.product;
    const productDetail = item.productDetail;
    const productFromDetail = (productDetail as any)?.product;
    const finalProduct = product || productFromDetail;
    
    if (finalProduct?.images && finalProduct.images.length > 0) {
      const mainImage = finalProduct.images.find((img: any) => img.isMain);
      if (mainImage?.imageUrl) return mainImage.imageUrl;
      if (finalProduct.images[0]?.imageUrl) return finalProduct.images[0].imageUrl;
    }
    
    if (productDetail?.images && productDetail.images.length > 0) {
      const mainImage = productDetail.images.find((img: any) => img.isMain);
      if (mainImage?.imageUrl) return mainImage.imageUrl;
      if (productDetail.images[0]?.imageUrl) return productDetail.images[0].imageUrl;
    }
    
    return PLACEHOLDER_IMAGE;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-screen max-w-md bg-white shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-brand-warm flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={20} className="text-brand-accent" />
                  <h2 className="font-serif text-lg">Giỏ hàng</h2>
                  <span className="bg-brand-sand text-xs font-bold px-2 py-0.5 rounded-full">
                    {details.reduce((sum, i) => sum + i.quantity, 0)}
                  </span>
                </div>
                <button onClick={onClose} className="p-1 hover:text-brand-accent">
                  <X size={18} />
                </button>
              </div>

              {details.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-16 h-16 bg-brand-beige rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag size={28} className="text-brand-dark/30" />
                  </div>
                  <p className="text-sm text-brand-dark/50">Giỏ hàng trống</p>
                  <button onClick={onClose} className="mt-4 border border-brand-dark px-6 py-2 rounded-full text-xs font-bold">
                    TIẾP TỤC MUA SẮM
                  </button>
                </div>
              ) : (
                <>
                  {/* Free shipping */}
                  <div className="px-6 py-4 bg-brand-sand/30 border-b border-brand-warm">
                    {isFreeShipping ? (
                      <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold">
                        <Gift size={14} />
                        Chúc mừng! Bạn được miễn phí giao hàng
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-xs">Mua thêm <strong>{formatCurrency(missingForFreeShipping)}</strong> để được miễn phí ship</p>
                        <div className="w-full bg-brand-warm h-1.5 rounded-full overflow-hidden">
                          <div className="bg-brand-accent h-full transition-all" style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Items */}
                  <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                    {details.map((item) => {
                      const product = (item as any).product;
                      const productDetail = item.productDetail;
                      const productFromDetail = (productDetail as any)?.product;
                      const finalProduct = product || productFromDetail;
                      
                      const price = finalProduct?.price || 0;
                      const productName = finalProduct?.name || 'Sản phẩm';
                      const imageUrl = getImageUrl(item);
                      const variant = productDetail;

                      return (
                        <div key={item.id} className="flex gap-3 p-3 border border-brand-warm rounded-xl">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-brand-sand flex-shrink-0">
                            <Image 
                              src={imageUrl} 
                              alt={productName} 
                              width={64} 
                              height={64} 
                              className="object-cover"
                              onError={(e) => {
                                e.currentTarget.src = PLACEHOLDER_IMAGE;
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm line-clamp-1">{productName}</h4>
                            <p className="text-xs text-brand-dark/50">
                              {variant?.color?.name && `${variant.color.name}`}
                              {variant?.size?.name && ` / ${variant.size.name}`}
                            </p>
                            <div className="flex justify-between items-center mt-2">
                              <div className="flex items-center border border-brand-warm rounded-full">
                                <button
                                  onClick={() => updateQuantity(item.productDetailId, item.quantity - 1)}
                                  className="px-2 py-1 hover:text-brand-accent"
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus size={10} />
                                </button>
                                <span className="w-8 text-center text-xs">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.productDetailId, item.quantity + 1)}
                                  className="px-2 py-1 hover:text-brand-accent"
                                >
                                  <Plus size={10} />
                                </button>
                              </div>
                              <span className="font-bold text-brand-accent text-sm">{formatCurrency(price * item.quantity)}</span>
                            </div>
                          </div>
                          <button onClick={() => removeItem(item.productDetailId)} className="text-gray-400 hover:text-red-500">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer - CÓ NÚT XEM GIỎ HÀNG */}
                  <div className="p-6 border-t border-brand-warm bg-brand-beige/20">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-brand-dark/60">Tạm tính</span>
                      <span className="text-sm">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-brand-dark/60">Phí vận chuyển</span>
                      <span className="text-sm">{isFreeShipping ? 'Miễn phí' : formatCurrency(30000)}</span>
                    </div>
                    <div className="flex justify-between mb-4 pt-2 border-t border-brand-warm">
                      <span className="text-sm font-bold">Tổng cộng</span>
                      <span className="text-xl font-bold text-brand-accent">{formatCurrency(subtotal + (isFreeShipping ? 0 : 30000))}</span>
                    </div>

                    {/* ✅ Nút XEM GIỎ HÀNG */}
                    <button
                      onClick={handleViewCart}
                      className="w-full border border-brand-dark text-brand-dark hover:bg-brand-dark hover:text-white py-3 rounded-full text-xs font-bold tracking-wider transition-colors mb-2"
                    >
                      XEM GIỎ HÀNG
                    </button>

                    {/* ✅ Nút THANH TOÁN */}
                    <button
                      onClick={handleCheckout}
                      className="w-full bg-brand-dark hover:bg-brand-accent text-white py-3 rounded-full text-xs font-bold tracking-wider transition-colors"
                    >
                      TIẾN HÀNH THANH TOÁN
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};