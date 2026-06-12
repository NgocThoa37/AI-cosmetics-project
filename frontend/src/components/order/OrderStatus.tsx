'use client';

import React from 'react';
import { OrderStatus as OrderStatusEnum } from '@/types';
import { CheckCircle2, Package, Truck, XCircle, Clock } from 'lucide-react';

interface OrderStatusProps {
  status: OrderStatusEnum;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

const statusConfig = {
  [OrderStatusEnum.PENDING]: { label: 'Chờ xác nhận', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
  [OrderStatusEnum.CONFIRMED]: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle2 },
  [OrderStatusEnum.SHIPPING]: { label: 'Đang giao hàng', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: Truck },
  [OrderStatusEnum.DELIVERED]: { label: 'Đã hoàn thành', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  [OrderStatusEnum.CANCELLED]: { label: 'Đã hủy', color: 'bg-rose-100 text-rose-700 border-rose-200', icon: XCircle },
};

export const OrderStatus: React.FC<OrderStatusProps> = ({ status, showIcon = true, size = 'md' }) => {
  const config = statusConfig[status];
  if (!config) return null;

  const Icon = config.icon;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-bold border ${config.color} ${sizeClasses}`}>
      {showIcon && <Icon size={size === 'sm' ? 10 : 12} />}
      {config.label}
    </span>
  );
};