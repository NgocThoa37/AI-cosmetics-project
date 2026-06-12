'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Order, OrderStatus } from '@/types';
import { OrderStatus as OrderStatusComponent } from './OrderStatus';
import { formatCurrency, formatDate } from '@/helpers/format.helper';

interface OrderCardProps {
  order: Order;
  onCancel?: (orderId: number) => void;
  onRebuy?: (order: Order) => void;
  onReview?: (order: Order) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onCancel, onRebuy, onReview }) => {
  const canCancel = order.orderStatus === OrderStatus.PENDING || order.orderStatus === OrderStatus.CONFIRMED;
  const canReview = order.orderStatus === OrderStatus.DELIVERED;
  const canRebuy = order.orderStatus === OrderStatus.DELIVERED || order.orderStatus === OrderStatus.CANCELLED;

  const totalItems = order.details?.reduce((sum, d) => sum + d.quantity, 0) || 0;

  return (
    <div className="bg-[#FAF8F5] border border-brand-warm rounded-2xl p-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
        <div><p className="font-mono text-sm font-bold text-brand-dark/50">{order.orderCode}</p><p className="text-xs text-brand-dark/40">{formatDate(order.createdAt)}</p></div>
        <OrderStatusComponent status={order.orderStatus} />
      </div>

      <div className="flex gap-3 overflow-x-auto pb-3">
        {order.details?.slice(0, 3).map((detail) => (
          <Link key={detail.id} href={`/products/${detail.productId}`} className="block">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-white border border-brand-warm flex-shrink-0">
              <Image src={detail.product?.images?.find(img => img.isMain)?.imageUrl || '/placeholder.jpg'} alt="" width={64} height={64} className="object-cover" />
            </div>
          </Link>
        ))}
        {order.details && order.details.length > 3 && <div className="flex items-center text-xs text-brand-dark/50">+{order.details.length - 3}</div>}
      </div>

      <div className="flex flex-wrap justify-between items-center mt-3 pt-3 border-t border-brand-warm/50 gap-3">
        <div><span className="text-xs text-brand-dark/50">Tổng số tiền ({totalItems} sản phẩm):</span><span className="text-sm font-bold text-brand-accent ml-2">{formatCurrency(order.totalAmount)}</span></div>
        <div className="flex gap-2">
          {canCancel && onCancel && <button onClick={() => onCancel(order.id)} className="border border-red-500 text-red-600 hover:bg-red-50 px-4 py-1.5 rounded-lg text-[11px] font-bold transition-colors">Hủy đơn</button>}
          {canRebuy && onRebuy && <button onClick={() => onRebuy(order)} className="bg-brand-accent hover:bg-brand-accent/80 text-white px-4 py-1.5 rounded-lg text-[11px] font-bold transition-colors">Mua lại</button>}
          {canReview && onReview && <button onClick={() => onReview(order)} className="border border-brand-warm text-brand-dark hover:border-brand-accent hover:text-brand-accent px-4 py-1.5 rounded-lg text-[11px] font-bold transition-colors">Đánh giá</button>}
        </div>
      </div>
    </div>
  );
};