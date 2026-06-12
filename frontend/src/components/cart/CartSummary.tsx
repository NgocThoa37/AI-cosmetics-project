'use client';

import React from 'react';
import { formatCurrency } from '@/helpers/format.helper';

interface CartSummaryProps {
  subtotal: number;
  shippingFee: number;
  total: number;
  isFreeShipping: boolean;
  onCheckout: () => void;
}

export const CartSummary: React.FC<CartSummaryProps> = ({ subtotal, shippingFee, total, isFreeShipping, onCheckout }) => {
  return (
    <div className="bg-brand-sand/30 rounded-xl p-5">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-brand-dark/60">Tạm tính</span>
          <span className="font-mono">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-brand-dark/60">Phí vận chuyển</span>
          <span className="font-mono">{isFreeShipping ? 'Miễn phí' : formatCurrency(shippingFee)}</span>
        </div>
        <div className="border-t border-brand-warm my-3" />
        <div className="flex justify-between items-baseline">
          <span className="font-bold">Tổng cộng</span>
          <span className="text-xl font-bold text-brand-accent">{formatCurrency(total)}</span>
        </div>
      </div>
      <button
        onClick={onCheckout}
        className="w-full mt-5 bg-brand-dark hover:bg-brand-accent text-white py-3 rounded-full text-xs font-bold tracking-wider transition-colors"
      >
        TIẾN HÀNH THANH TOÁN
      </button>
    </div>
  );
};