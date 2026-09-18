'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { XCircle } from 'lucide-react';

function PaymentFailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get('message') || 'Thanh toán thất bại';
  const code = searchParams.get('code');
  const orderId = searchParams.get('orderId');

  // ✅ SỬA: Chuyển về DANH SÁCH đơn hàng, không phải chi tiết
  useEffect(() => {
    const timer = setTimeout(() => {
      // ✅ Luôn về danh sách đơn hàng
      router.push('/account/orders');
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle size={40} className="text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">❌ Thanh toán thất bại</h1>
        <p className="text-gray-500 mb-2">{decodeURIComponent(message)}</p>
        {code && <p className="text-sm text-gray-400 mb-6">Mã lỗi: {code}</p>}
        {orderId && (
          <p className="text-sm text-gray-500 mb-4">
            Đơn hàng: <span className="font-medium">{orderId}</span>
          </p>
        )}
        <p className="text-sm text-gray-400 mb-8">⏳ Đang chuyển về danh sách đơn hàng...</p>
        <div className="flex flex-col gap-3">
          <Button 
            variant="outline" 
            onClick={() => router.push('/account/orders')} 
            className="w-full"
          >
            📦 Xem danh sách đơn hàng
          </Button>
          <Button variant="outline" onClick={() => router.push('/')} className="w-full">
            🏠 Về trang chủ
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailPage() {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <PaymentFailContent />
    </Suspense>
  );
}