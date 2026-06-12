'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function MomoReturnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    const resultCode = searchParams.get('resultCode');
    const moOrderId = searchParams.get('orderId');
    if (resultCode === '0') { 
      setStatus('success'); 
      setOrderId(moOrderId || ''); 
    } else { 
      setStatus('failed'); 
    }
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-brand-warm border-t-brand-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        {status === 'success' ? (
          <>
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-brand-dark">Thanh toán thành công!</h2>
            <p className="text-sm text-brand-dark/60 mt-2 mb-6">
              Đơn hàng {orderId} đã được thanh toán qua MoMo.
            </p>
            <Button onClick={() => router.push(`/account/orders/${orderId}`)}>
              Xem chi tiết đơn hàng
            </Button>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle size={32} className="text-rose-600" />
            </div>
            <h2 className="text-xl font-bold text-brand-dark">Thanh toán thất bại</h2>
            <p className="text-sm text-brand-dark/60 mt-2 mb-6">
              Có lỗi xảy ra, vui lòng thử lại.
            </p>
            <Button variant="outline" onClick={() => router.push('/cart')}>
              Quay lại giỏ hàng
            </Button>
          </>
        )}
      </div>
    </div>
  );
}