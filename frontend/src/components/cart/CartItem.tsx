'use client';

import React from 'react';
import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/helpers/format.helper';
import { CartDetail } from '@/types';

interface CartItemProps {
  item: CartDetail;
  onUpdateQuantity: (productDetailId: string, quantity: number) => void;
  onRemove: (productDetailId: string) => void;
}

export const CartItem: React.FC<CartItemProps> = ({ item, onUpdateQuantity, onRemove }) => {
  const product = item.product;
  const variant = item.productDetail;
  const price = product?.price || 0;
  const imageUrl = product?.images?.find(img => img.isMain)?.imageUrl || '/placeholder.jpg';

  return (
    <div className="flex gap-3 p-3 border border-brand-warm rounded-xl">
      <div className="w-16 h-16 rounded-lg overflow-hidden bg-brand-sand flex-shrink-0">
        <Image src={imageUrl} alt={product?.name || ''} width={64} height={64} className="object-cover" />
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-sm line-clamp-1">{product?.name}</h4>
        <p className="text-xs text-brand-dark/50">
          {variant?.color?.name && `${variant.color.name}`}
          {variant?.size?.name && ` / ${variant.size.name}`}
        </p>
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center border border-brand-warm rounded-full">
            <button
              onClick={() => onUpdateQuantity(item.productDetailId, item.quantity - 1)}
              className="px-2 py-1 hover:text-brand-accent"
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