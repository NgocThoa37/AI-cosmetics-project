'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Review } from '@/types/admin.types';

interface ReviewReplyFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (replyText: string) => void;
  review: Review | null;
}

export const ReviewReplyForm: React.FC<ReviewReplyFormProps> = ({
  isOpen,
  onClose,
  onSave,
  review,
}) => {
  const [replyText, setReplyText] = useState(review?.replyText || '');
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <h3 className="text-lg font-bold text-slate-800">Phản hồi đánh giá</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-2">
            <div className="flex justify-between">
              <span className="font-semibold text-slate-700">{review.customerName}</span>
              <span className="text-amber-500 text-sm">★ {review.rating}/5</span>
            </div>
            <p className="text-sm text-slate-600 italic">"{review.content}"</p>
            <p className="text-xs text-slate-400">Sản phẩm: {review.productName}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Phản hồi của bạn</label>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={4}
              className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-forest-500 focus:outline-none"
              placeholder="Nhập phản hồi của bạn..."
              required
            />

            <div className="flex justify-end gap-3 pt-5">
              <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
              <Button type="submit" loading={loading}>Gửi phản hồi</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};