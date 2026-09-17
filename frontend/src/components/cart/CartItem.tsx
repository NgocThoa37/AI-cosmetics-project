'use client';

import React from 'react';
import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/helpers/format.helper';
import { CartDetail } from '@/types';

// ✅ Định nghĩa placeholder image
const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Crect width="200" height="200" fill="%23f5f0eb"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="14"%3ENo Image%3C/text%3E%3C/svg%3E';

interface CartItemProps {
  item: CartDetail;
  onUpdateQuantity: (productDetailId: string, quantity: number) => void;
  onRemove: (productDetailId: string) => void;
}

export const CartItem: React.FC<CartItemProps> = ({ item, onUpdateQuantity, onRemove }) => {
  // ✅ Lấy product từ item hoặc từ productDetail
  const product = (item as any).product;
  const productDetail = item.productDetail;
  const productFromDetail = (productDetail as any)?.product;
  const finalProduct = product || productFromDetail;
  
  const price = finalProduct?.price || 0;
  const productName = finalProduct?.name || 'Sản phẩm';
  const variant = productDetail;

  // ✅ Hàm lấy ảnh an toàn
  const getImageUrl = (): string => {
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

  const imageUrl = getImageUrl();

  return (
    <div className="flex gap-3 p-3 border border-brand-warm rounded-xl">
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
              onClick={() => onUpdateQuantity(item.productDetailId, item.quantity - 1)}
              className="px-2 py-1 hover:text-brand-accent"
              disabled={item.quantity <= 1}
            >
              <Minus size={10} />
            </button>
            <span className="w-8 text-center text-xs">{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(item.productDetailId, item.quantity + 1)}
              className="px-2 py-1 hover:text-brand-accent"
            >
              <Plus size={10} />
            </button>
          </div>
          <span className="font-bold text-brand-accent text-sm">{formatCurrency(price * item.quantity)}</span>
        </div>
      </div>
      <button onClick={() => onRemove(item.productDetailId)} className="text-gray-400 hover:text-red-500">
        <Trash2 size={14} />
      </button>
    </div>
  );
};