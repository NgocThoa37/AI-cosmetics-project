'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { RatingStars } from '@/components/common/RatingStars';
import { useAuth } from '@/hooks/useAuth';
import { reviewService } from '@/services/api/review.service';
import { orderService } from '@/services/api/order.service';
import { Review, Order, OrderDetail } from '@/types';
import { formatDate } from '@/helpers/format.helper';
import { Star, MessageSquare, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MyReviewsPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [pendingReviews, setPendingReviews] = useState<OrderDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'written' | 'pending'>('written');
  const [showReviewForm, setShowReviewForm] = useState<OrderDetail | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchReviews();
    fetchPendingReviews();
  }, [isAuthenticated, router]);

  const fetchReviews = async () => {
    try {
      const data = await reviewService.getMyReviews();
      setReviews(data);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  const fetchPendingReviews = async () => {
    try {
      const orders = await orderService.getMyOrders();
      // Get delivered orders that haven't been reviewed
      const deliveredOrders = orders.filter(o => o.orderStatus === 'delivered');
      const allItems: OrderDetail[] = [];
      for (const order of deliveredOrders) {
        if (order.details) {
          for (const detail of order.details) {
            // Check if this item has been reviewed
            const hasReviewed = await reviewService.checkReviewed(detail.id);
            if (!hasReviewed) {
              allItems.push(detail);
            }
          }
        }
      }
      setPendingReviews(allItems);
    } catch (error) {
      console.error('Failed to fetch pending reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmitted = () => {
    setShowReviewForm(null);
    fetchReviews();
    fetchPendingReviews();
    toast.success('Cảm ơn bạn đã đánh giá sản phẩm!');
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="font-serif text-2xl text-brand-dark mb-6">Đánh giá của tôi</h1>

      {/* Tabs */}
      <div className="flex gap-6 mb-6 border-b border-brand-warm">
        <button
          onClick={() => setActiveTab('written')}
          className={`pb-3 font-medium transition-all ${activeTab === 'written' ? 'text-brand-accent border-b-2 border-brand-accent' : 'text-brand-dark/50 hover:text-brand-dark'}`}
        >
          Đã đánh giá ({reviews.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 font-medium transition-all ${activeTab === 'pending' ? 'text-brand-accent border-b-2 border-brand-accent' : 'text-brand-dark/50 hover:text-brand-dark'}`}
        >
          Chờ đánh giá ({pendingReviews.length})
        </button>
      </div>

      {/* Written Reviews Tab */}
      {activeTab === 'written' && (
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-16 bg-[#FAF8F5] rounded-2xl border border-brand-warm">
              <MessageSquare size={40} className="mx-auto text-brand-dark/30 mb-3" />
              <p className="text-brand-dark/50">Bạn chưa có đánh giá nào</p>
              <button
                onClick={() => setActiveTab('pending')}
                className="mt-3 text-sm text-brand-accent hover:underline"
              >
                Xem sản phẩm có thể đánh giá
              </button>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="bg-white border border-brand-warm rounded-2xl p-5 hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                  <Link href={`/products/${review.productId}`} className="w-20 h-20 rounded-lg overflow-hidden bg-brand-sand flex-shrink-0">
                    <Image
                      src={review.product?.images?.find(img => img.isMain)?.imageUrl || '/placeholder.jpg'}
                      alt={review.product?.name || ''}
                      width={80}
                      height={80}
                      className="object-cover"
                    />
                  </Link>
                  <div className="flex-1">
                    <Link href={`/products/${review.productId}`}>
                      <h3 className="font-bold text-brand-dark hover:text-brand-accent transition-colors">
                        {review.product?.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <RatingStars rating={review.rating} size={14} />
                      <span className="text-xs text-brand-dark/50">{formatDate(review.createdAt)}</span>
                    </div>
                    {review.title && <p className="text-sm font-semibold text-brand-dark mt-2">{review.title}</p>}
                    <p className="text-sm text-brand-dark/70 mt-1">{review.comment}</p>
                    {review.replies && review.replies.length > 0 && (
                      <div className="mt-3 pl-3 border-l-2 border-brand-accent/30">
                        <p className="text-xs text-brand-accent font-semibold">Phản hồi từ Lumière:</p>
                        <p className="text-xs text-brand-dark/60">{review.replies[0].reply}</p>
                      </div>
                    )}
                  </div>
                  <Link href={`/products/${review.productId}`} className="text-brand-dark/40 hover:text-brand-accent">
                    <ChevronRight size={18} />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Pending Reviews Tab */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingReviews.length === 0 ? (
            <div className="text-center py-16 bg-[#FAF8F5] rounded-2xl border border-brand-warm">
              <Star size={40} className="mx-auto text-brand-dark/30 mb-3" />
              <p className="text-brand-dark/50">Không có sản phẩm nào chờ đánh giá</p>
              <Link href="/" className="mt-3 inline-block text-sm text-brand-accent hover:underline">
                Tiếp tục mua sắm
              </Link>
            </div>
          ) : (
            pendingReviews.map((item) => (
              <div key={item.id} className="bg-white border border-brand-warm rounded-2xl p-5 hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                  <Link href={`/products/${item.productId}`} className="w-20 h-20 rounded-lg overflow-hidden bg-brand-sand flex-shrink-0">
                    <Image
                      src={item.product?.images?.find(img => img.isMain)?.imageUrl || '/placeholder.jpg'}
                      alt={item.product?.name || ''}
                      width={80}
                      height={80}
                      className="object-cover"
                    />
                  </Link>
                  <div className="flex-1">
                    <Link href={`/products/${item.productId}`}>
                      <h3 className="font-bold text-brand-dark hover:text-brand-accent transition-colors">
                        {item.product?.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-brand-dark/50 mt-1">Đã mua ngày {formatDate(new Date().toISOString())}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => setShowReviewForm(item)}
                        className="bg-brand-accent hover:bg-brand-accent/80 text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Viết đánh giá
                      </button>
                    </div>
                  </div>
                  <Link href={`/products/${item.productId}`} className="text-brand-dark/40 hover:text-brand-accent">
                    <ChevronRight size={18} />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Review Form Modal */}
      {showReviewForm && (
        <ReviewFormModal
          orderItemId={showReviewForm.id}
          productId={showReviewForm.productId}
          productName={showReviewForm.product?.name || ''}
          onSuccess={handleReviewSubmitted}
          onCancel={() => setShowReviewForm(null)}
        />
      )}
    </div>
  );
}

// Review Form Modal Component
function ReviewFormModal({ orderItemId, productId, productName, onSuccess, onCancel }: {
  orderItemId: number;
  productId: string;
  productName: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
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
      await reviewService.createReview({
        orderItemId,
        rating,
        title: title || undefined,
        comment,
        imageUrls: images,
      });
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
            ✕
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
                    fill={(hoverRating || rating) >= star ? '#f59e0b' : 'none'}
                    className={(hoverRating || rating) >= star ? 'text-amber-500' : 'text-gray-300'}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-brand-dark/60">{rating}/5 sao</span>
            </div>
          </div>

          <input
            type="text"
            placeholder="Tiêu đề đánh giá (không bắt buộc)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 border border-brand-warm rounded-xl focus:outline-none focus:border-brand-accent text-sm"
          />

          <textarea
            rows={4}
            placeholder="Chia sẻ trải nghiệm thực tế của bạn về sản phẩm..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-4 py-3 border border-brand-warm rounded-xl focus:outline-none focus:border-brand-accent text-sm"
            required
          />

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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-[10px] mt-1">Thêm ảnh</span>
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onCancel} className="flex-1 px-4 py-2 border border-brand-warm rounded-lg text-sm font-medium hover:bg-brand-sand transition-colors">
              Hủy
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-brand-accent text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-accent/80 transition-colors disabled:opacity-50">
              {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}