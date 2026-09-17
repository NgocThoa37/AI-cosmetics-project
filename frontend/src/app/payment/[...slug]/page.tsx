'use client';

import { useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { CheckCircle, XCircle } from 'lucide-react';

export default function PaymentCatchAll() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const slug = params.slug as string[];
  const type = slug?.[0] || 'unknown';
  const isSuccess = type === 'success';
  
  const orderId = searchParams.get('orderId');
  const transactionId = searchParams.get('transactionId');
  const method = searchParams.get('method') || 'VNPAY';
  const message = searchParams.get('message') || 'Thanh toán thất bại';
  const code = searchParams.get('code');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (orderId) router.push(`/account/orders/${orderId}`);
      else router.push('/account/orders');
    }, 4000);
    return () => clearTimeout(timer);
  }, [router, orderId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        {isSuccess ? (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">✅ Thanh toán thành công!</h1>
            <p className="text-gray-500 mb-1">Phương thức: <span className="font-medium">{method}</span></p>
            {orderId && <p className="text-gray-500 mb-1">Mã đơn: <span className="font-medium">{orderId}</span></p>}
            {transactionId && <p className="text-gray-500 mb-6">Mã GD: <span className="font-medium">{transactionId}</span></p>}
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle size={40} className="text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">❌ Thanh toán thất bại</h1>
            <p className="text-gray-500 mb-2">{decodeURIComponent(message)}</p>
            {code && <p className="text-sm text-gray-400 mb-6">Mã lỗi: {code}</p>}
          </>
        )}
        <p className="text-sm text-gray-400 mb-8">⏳ Đang chuyển về trang đơn hàng...</p>
        <Button variant="outline" onClick={() => router.push('/')}>🏠 Về trang chủ</Button>
      </div>
    </div>
  );
}