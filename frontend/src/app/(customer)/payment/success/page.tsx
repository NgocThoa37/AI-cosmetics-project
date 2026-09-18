'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { CheckCircle } from 'lucide-react';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const transactionId = searchParams.get('transactionId');
  const method = searchParams.get('method') || 'VNPAY';

  useEffect(() => {
    const timer = setTimeout(() => {
      if (orderId) {
        router.push(`/account/orders/${orderId}`);
      } else {
        router.push('/account/orders');
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [router, orderId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">✅ Thanh toán thành công!</h1>
        <p className="text-gray-500 mb-1">Phương thức: <span className="font-medium text-gray-700">{method}</span></p>
        {orderId && (
          <p className="text-gray-500 mb-1">
            Mã đơn hàng: <span className="font-medium text-gray-700">{orderId}</span>
          </p>
        )}
        {transactionId && (
          <p className="text-gray-500 mb-6">
            Mã giao dịch: <span className="font-medium text-gray-700">{transactionId}</span>
          </p>
        )}
        <p className="text-sm text-gray-400 mb-8">⏳ Đang chuyển về trang đơn hàng...</p>
        <div className="flex flex-col gap-3">
          {orderId && (
            <Button onClick={() => router.push(`/account/orders/${orderId}`)} className="w-full">
              📦 Xem đơn hàng
            </Button>
          )}
          <Button variant="outline" onClick={() => router.push('/')} className="w-full">
            🏠 Về trang chủ
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}