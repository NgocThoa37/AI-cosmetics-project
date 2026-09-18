'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

function VnpayReturnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    const vnpResponseCode = searchParams.get('vnp_ResponseCode');
    const vnpTxnRef = searchParams.get('vnp_TxnRef');
    
    console.log('🔍 [VNPAY RETURN] vnpResponseCode:', vnpResponseCode);
    console.log('🔍 [VNPAY RETURN] vnpTxnRef:', vnpTxnRef);
    
    if (vnpResponseCode === '00') {
      setStatus('success');
      setOrderId(vnpTxnRef || '');
      toast.success('Thanh toán VNPAY thành công!');
    } else {
      setStatus('failed');
      toast.error('Thanh toán VNPAY thất bại hoặc bị hủy');
    }
  }, [searchParams]);

  // ✅ SỬA: Chuyển về DANH SÁCH đơn hàng, không phải chi tiết
  useEffect(() => {
    const timer = setTimeout(() => {
      // ✅ Luôn về danh sách đơn hàng
      router.push('/account/orders');
    }, 2000);
    return () => clearTimeout(timer);
  }, [router]);

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
              Đơn hàng {orderId} đã được thanh toán qua VNPAY.
              <br />
              Đang chuyển đến danh sách đơn hàng...
            </p>
            <Button onClick={() => router.push('/account/orders')}>
              Xem danh sách đơn hàng
            </Button>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle size={32} className="text-rose-600" />
            </div>
            <h2 className="text-xl font-bold text-brand-dark">Thanh toán thất bại</h2>
            <p className="text-sm text-brand-dark/60 mt-2 mb-6">
              Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.
              <br />
              Đang chuyển đến danh sách đơn hàng...
            </p>
            <Button variant="outline" onClick={() => router.push('/account/orders')}>
              Xem danh sách đơn hàng
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default function VnpayReturnPage() {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <VnpayReturnContent />
    </Suspense>
  );
}