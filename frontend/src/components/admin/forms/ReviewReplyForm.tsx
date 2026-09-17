'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Review } from '@/types/admin.types';

interface ReviewReplyFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (replyText: string) => void;
  review: Review | null;
  mode?: 'view' | 'reply'; // 🔥 THÊM PROP MODE
}

export const ReviewReplyForm: React.FC<ReviewReplyFormProps> = ({
  isOpen,
  onClose,
  onSave,
  review,
  mode = 'reply', // Mặc định là phản hồi
}) => {
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (review) {
      setReplyText(review.reply?.reply || '');
    }
  }, [review]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setLoading(true);
    try {
      await onSave(replyText);
      onClose();
    } catch (error) {
      console.error('Failed to save reply:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !review) return null;

  const hasReply = !!review.reply;
  const isViewMode = mode === 'view';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <h3 className="text-lg font-bold text-slate-800">
            {isViewMode ? 'Chi tiết đánh giá' : hasReply ? 'Cập nhật phản hồi' : 'Phản hồi đánh giá'}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Thông tin đánh giá */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-2">
            <div className="flex justify-between">
              <span className="font-semibold text-slate-700">
                {review.customer?.user?.fullName || '—'}
              </span>
              <span className="text-amber-500 text-sm font-semibold">
                {'★'.repeat(review.rating)} {review.rating}/5
              </span>
            </div>
            <p className="text-sm text-slate-600 italic">"{review.content}"</p>
            <p className="text-xs text-slate-400">
              Sản phẩm: {review.product?.name || '—'}
            </p>
            <p className="text-xs text-slate-400">
              Ngày: {review.createdAt ? new Date(review.createdAt).toLocaleString('vi-VN') : '—'}
            </p>
          </div>

          {/* Hiển thị phản hồi cũ nếu có */}
          {hasReply && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex justify-between">
                <span className="font-semibold text-blue-700">Phản hồi</span>
                <span className="text-xs text-blue-400">
                  {review.reply?.repliedAt ? new Date(review.reply.repliedAt).toLocaleString('vi-VN') : ''}
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-1">{review.reply?.reply}</p>
              {review.reply?.employee && (
                <p className="text-xs text-blue-400 mt-1">
                  Nhân viên: {review.reply.employee.user?.fullName || '—'}
                </p>
              )}
            </div>
          )}

          {/* Nếu là chế độ XEM: Không hiển thị form nhập */}
          {isViewMode ? (
            <div className="flex justify-end pt-4">
              <Button onClick={onClose}>Đóng</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                {hasReply ? 'Cập nhật phản hồi' : 'Phản hồi của bạn'}
              </label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={4}
                className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-forest-500 focus:outline-none"
                placeholder="Nhập phản hồi của bạn..."
                required
              />
              <div className="flex justify-end gap-3 pt-5">
                <Button type="button" variant="outline" onClick={onClose}>
                  Hủy
                </Button>
                <Button type="submit" loading={loading}>
                  {hasReply ? 'Cập nhật' : 'Gửi phản hồi'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};