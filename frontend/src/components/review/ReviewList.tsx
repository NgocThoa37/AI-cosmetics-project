'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Star, ThumbsUp, Flag, ChevronLeft, ChevronRight } from 'lucide-react';
import { reviewService } from '@/services/api/review.service';
import { RatingStars } from '@/components/common/RatingStars';
import { formatDate } from '@/helpers/format.helper';
import { Review } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface ReviewListProps {
  productId: string;
}

export const ReviewList: React.FC<ReviewListProps> = ({ productId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchReviews();
  }, [productId, page]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await reviewService.getReviewsByProduct(productId);
      // Filter only approved reviews
      const approvedReviews = data.filter(r => r.isApproved);
      const start = (page - 1) * itemsPerPage;
      const paginated = approvedReviews.slice(start, start + itemsPerPage);
      setReviews(paginated);
      setHasMore(start + itemsPerPage < approvedReviews.length);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      // Mock data for demo - đã thêm dob và gender
      const mockReviews: Review[] = [
        {
          id: 1,
          orderItemId: 1,
          customerId: 1,
          productId: productId,
          rating: 5,
          title: 'Sản phẩm tuyệt vời!',
          comment: 'Mình đã dùng serum này được 2 tuần, da mình căng bóng và mịn màng hơn hẳn. Rất thích!',
          imageUrls: [],
          reviewDate: new Date().toISOString(),
          isVerifiedPurchase: true,
          isApproved: true,
          createdAt: new Date().toISOString(),
          customer: {
            id: 1,
            userId: 1,
            totalOrder: 5,
            totalSpent: 2500000,
            user: {
              id: 1,
              fullName: 'Nguyễn Thị Hương',
              email: 'huong@example.com',
              phone: '0987654321',
              avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
              createdAt: '',
              dob: null,  // ✅ Thêm
              gender: null,  // ✅ Thêm
            }
          },
          replies: []
        },
        {
          id: 2,
          orderItemId: 2,
          customerId: 2,
          productId: productId,
          rating: 4,
          title: 'Tốt nhưng hơi đắt',
          comment: 'Chất lượng sản phẩm tốt, đóng gói đẹp. Nhưng giá hơi cao so với mặt bằng chung.',
          imageUrls: [],
          reviewDate: new Date().toISOString(),
          isVerifiedPurchase: true,
          isApproved: true,
          createdAt: new Date().toISOString(),
          customer: {
            id: 2,
            userId: 2,
            totalOrder: 3,
            totalSpent: 1200000,
            user: {
              id: 2,
              fullName: 'Trần Văn Nam',
              email: 'nam@example.com',
              phone: '0912345678',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
              createdAt: '',
              dob: null,  // ✅ Thêm
              gender: null,  // ✅ Thêm
            }
          },
          replies: [{
            id: 1,
            reviewId: 2,
            employeeId: 1,
            reply: 'Cảm ơn đánh giá của bạn! Chúng tôi sẽ cố gắng mang đến nhiều ưu đãi hơn trong thời gian tới.',
            repliedAt: new Date().toISOString(),
            isEdited: false,
            editAt: null,
          }]
        },
      ];
      setReviews(mockReviews);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const handleLoadLess = () => {
    setPage(prev => Math.max(1, prev - 1));
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => {
    const count = reviews.filter(r => r.rating === star).length;
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { star, count, percentage };
  });

  if (loading && page === 1) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 bg-brand-sand/30 rounded-2xl">
        <p className="text-brand-dark/50">Chưa có đánh giá nào cho sản phẩm này.</p>
        <p className="text-xs text-brand-dark/40 mt-1">Hãy là người đầu tiên đánh giá sản phẩm!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Rating Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-brand-sand/30 rounded-2xl border border-brand-warm/30">
        {/* Left - Average Rating */}
        <div className="text-center md:text-left">
          <div className="text-5xl font-bold text-brand-dark">{averageRating.toFixed(1)}</div>
          <RatingStars rating={averageRating} size={18} showValue={false} />
          <p className="text-sm text-brand-dark/50 mt-2">Dựa trên {reviews.length} đánh giá</p>
        </div>

        {/* Right - Rating Distribution */}
        <div className="space-y-2">
          {ratingDistribution.map(({ star, count, percentage }) => (
            <div key={star} className="flex items-center gap-3">
              <div className="w-12 text-sm font-medium text-brand-dark/70">{star} sao</div>
              <div className="flex-1 h-2 bg-brand-warm rounded-full overflow-hidden">
                <div className="h-full bg-brand-accent rounded-full" style={{ width: `${percentage}%` }} />
              </div>
              <div className="w-12 text-xs text-brand-dark/50">{count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-brand-warm pb-6 last:border-0">
            {/* Customer Info */}
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-brand-sand flex-shrink-0">
                <Image
                  src={review.customer?.user?.avatar || '/avatar-placeholder.jpg'}
                  alt={review.customer?.user?.fullName || 'Khách hàng'}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="font-semibold text-brand-dark">
                      {review.customer?.user?.fullName || 'Khách hàng'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <RatingStars rating={review.rating} size={12} />
                      {review.isVerifiedPurchase && (
                        <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                          Đã mua hàng
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-brand-dark/40">{formatDate(review.reviewDate)}</p>
                </div>
              </div>
            </div>

            {/* Review Content */}
            {review.title && (
              <h4 className="font-bold text-brand-dark mb-1">{review.title}</h4>
            )}
            <p className="text-sm text-brand-dark/70 leading-relaxed">{review.comment}</p>

            {/* Review Images */}
            {review.imageUrls && review.imageUrls.length > 0 && (
              <div className="flex gap-2 mt-3">
                {review.imageUrls.slice(0, 3).map((url, idx) => (
                  <div key={idx} className="w-16 h-16 rounded-lg overflow-hidden bg-brand-sand border border-brand-warm">
                    <Image src={url} alt={`Review image ${idx + 1}`} width={64} height={64} className="object-cover" />
                  </div>
                ))}
              </div>
            )}

            {/* Admin Reply */}
            {review.replies && review.replies.length > 0 && (
              <div className="mt-3 pl-4 border-l-2 border-brand-accent/30">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-brand-accent">Phản hồi từ Lumière</span>
                </div>
                <p className="text-xs text-brand-dark/60">{review.replies[0].reply}</p>
                <p className="text-[10px] text-brand-dark/40 mt-1">{formatDate(review.replies[0].repliedAt)}</p>
              </div>
            )}

            {/* Helpful buttons */}
            <div className="flex items-center gap-4 mt-3">
              <button className="flex items-center gap-1 text-xs text-brand-dark/40 hover:text-brand-accent transition-colors">
                <ThumbsUp size={12} />
                <span>Hữu ích</span>
              </button>
              <button className="flex items-center gap-1 text-xs text-brand-dark/40 hover:text-brand-accent transition-colors">
                <Flag size={12} />
                <span>Báo cáo</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-3 pt-4">
        {page > 1 && (
          <button
            onClick={handleLoadLess}
            className="flex items-center gap-1 px-4 py-2 border border-brand-warm rounded-lg text-xs font-medium hover:border-brand-accent transition-colors"
          >
            <ChevronLeft size={14} />
            Trước
          </button>
        )}
        {hasMore && (
          <button
            onClick={handleLoadMore}
            className="flex items-center gap-1 px-4 py-2 border border-brand-warm rounded-lg text-xs font-medium hover:border-brand-accent transition-colors"
          >
            Xem thêm
            <ChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
};