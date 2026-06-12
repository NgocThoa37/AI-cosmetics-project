'use client';

import React, { useState } from 'react';
import { Star, X, ImagePlus } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { reviewService } from '@/services/api/review.service';
import toast from 'react-hot-toast';

interface ReviewFormProps {
  orderItemId: number;
  productId: string;
  productName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ orderItemId, productId, productName, onSuccess, onCancel }) => {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Vui lòng nhập nội dung đánh giá');
      return;
    }
    setLoading(true);
    try {
      await reviewService.createReview({ orderItemId, rating, title, comment, imageUrls: images });
      toast.success('Cảm ơn bạn đã đánh giá sản phẩm!');
      onSuccess();
    } catch (error) {
      toast.error('Gửi đánh giá thất bại, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-brand-warm">
          <h3 className="font-bold text-brand-dark">Đánh giá sản phẩm</h3>
          <button onClick={onCancel} className="p-1 text-brand-dark/40 hover:text-brand-accent">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5 overflow-y-auto max-h-[70vh]">
          <div className="bg-brand-sand/20 p-4 rounded-xl">
            <p className="font-medium">{productName}</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-brand-dark mb-2">Đánh giá của bạn</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    size={28}
                    fill={(hoverRating || rating) >= star ? "#f59e0b" : "none"}
                    className={(hoverRating || rating) >= star ? "text-amber-500" : "text-gray-300"}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-brand-dark/60">{rating}/5 sao</span>
            </div>
          </div>

          <Input
            label="Tiêu đề đánh giá (không bắt buộc)"
            placeholder="Tóm tắt cảm nhận của bạn về sản phẩm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div>
            <label className="block text-sm font-bold text-brand-dark mb-2">Nội dung đánh giá</label>
            <textarea
              rows={4}
              placeholder="Chia sẻ trải nghiệm thực tế của bạn về sản phẩm..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-4 py-3 border border-brand-warm rounded-xl focus:outline-none focus:border-brand-accent text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-brand-dark mb-2">Hình ảnh (không bắt buộc)</label>
            <div className="flex gap-3 flex-wrap">
              {images.map((img, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-brand-warm">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImages(images.filter((_, i) => i !== idx))}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px]"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const url = prompt('Nhập URL hình ảnh:');
                  if (url) setImages([...images, url]);
                }}
                className="w-20 h-20 border-2 border-dashed border-brand-warm rounded-lg flex flex-col items-center justify-center text-brand-dark/40 hover:border-brand-accent hover:text-brand-accent transition-colors"
              >
                <ImagePlus size={20} />
                <span className="text-[10px] mt-1">Thêm ảnh</span>
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} fullWidth>
              Hủy
            </Button>
            <Button type="submit" loading={loading} fullWidth>
              Gửi đánh giá
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};