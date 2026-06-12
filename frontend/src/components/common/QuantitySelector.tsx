'use client';

import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  max?: number;
  min?: number;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  onIncrease,
  onDecrease,
  max = 999,
  min = 1,
}) => {
  return (
    <div className="flex items-center border border-brand-warm rounded-lg bg-white">
      <button
        onClick={onDecrease}
        disabled={quantity <= min}
        className="px-3 py-1.5 hover:text-brand-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Minus size={12} />
      </button>
      <span className="w-10 text-center text-sm font-medium">{quantity}</span>
      <button
        onClick={onIncrease}
        disabled={quantity >= max}
        className="px-3 py-1.5 hover:text-brand-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Plus size={12} />
      </button>
    </div>
  );
};