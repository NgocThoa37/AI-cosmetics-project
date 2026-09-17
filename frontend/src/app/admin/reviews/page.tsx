'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { DataTable } from '@/components/admin/common/DataTable';
import { SearchFilterBar } from '@/components/admin/common/SearchFilterBar';
import { ConfirmModal } from '@/components/admin/common/ConfirmModal';
import { ReviewReplyForm } from '@/components/admin/forms/ReviewReplyForm';
import { adminService } from '@/services/api/admin.service';
import { Review } from '@/types/admin.types';
import toast from 'react-hot-toast';

const statusOptions = [
  { value: 'pending', label: 'Chưa phản hồi' },
  { value: 'replied', label: 'Đã phản hồi' },
];

const ratingOptions = [
  { value: 'all', label: 'Tất cả' },
  { value: '5', label: '⭐ 5 sao' },
  { value: '4', label: '⭐ 4 sao' },
  { value: '3', label: '⭐ 3 sao' },
  { value: '2', label: '⭐ 2 sao' },
  { value: '1', label: '⭐ 1 sao' },
];

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'reply'>('reply');
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const data = await adminService.getReviews();
      setReviews(data || []);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      setReviews([]);
      toast.error('Không thể tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminService.deleteReview(String(deleteTarget.id));
      toast.success('Xóa đánh giá thành công');
      fetchReviews();
      setDeleteTarget(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xóa thất bại');
    }
  };

  const filteredReviews = reviews.filter(review => {
    const customerName = review.customer?.user?.fullName || '';
    const productName = review.product?.name || '';
    const content = review.content || '';
    
    const matchesSearch = customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || 
      (statusFilter === 'pending' && !review.reply) ||
      (statusFilter === 'replied' && review.reply);
    
    const matchesRating = ratingFilter === 'all' || review.rating === Number(ratingFilter);
    
    return matchesSearch && matchesStatus && matchesRating;
  });

  // 🔥 columns KHÔNG CÓ CỘT "THAO TÁC"
  const columns = [
    { key: 'id', header: 'ID', className: 'font-mono w-16' },
    { 
      key: 'customerName', 
      header: 'Khách hàng',
      render: (item: Review) => item.customer?.user?.fullName || '—'
    },
    { 
      key: 'productName', 
      header: 'Sản phẩm',
      render: (item: Review) => item.product?.name || '—'
    },
    { 
      key: 'rating', 
      header: 'Đánh giá', 
      render: (item: Review) => (
        <span className="text-amber-500 font-semibold flex items-center gap-1">
          <Star size={14} className="fill-amber-400 text-amber-400" />
          <span>{item.rating}</span>
        </span>
      ) 
    },
    { 
      key: 'content', 
      header: 'Nội dung', 
      render: (item: Review) => (
        <span className="truncate max-w-[200px] block">{item.content || '—'}</span>
      ) 
    },
    { 
      key: 'createdAt', 
      header: 'Ngày tạo',
      render: (item: Review) => item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : '—'
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (item: Review) => (
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${
          item.reply
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-amber-50 text-amber-700 border-amber-200'
        }`}>
          {item.reply ? 'Đã phản hồi' : 'Chưa phản hồi'}
        </span>
      ),
    },
    // ❌ ĐÃ XÓA CỘT "THAO TÁC" (actions)
  ];

  return (
    <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <h3 className="text-sm font-bold text-slate-800">Quản lý đánh giá sản phẩm</h3>
      </div>

      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        statusOptions={statusOptions}
        onReset={() => { setSearchQuery(''); setStatusFilter('ALL'); setRatingFilter('all'); }}
        placeholder="Tìm theo tên khách hàng, sản phẩm hoặc nội dung"
        extraFilters={
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-forest-500"
          >
            {ratingOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        }
      />

      {/* 🔥 DataTable dùng onView, onEdit, onDelete để tự tạo cột Thao tác */}
      <DataTable
        data={filteredReviews}
        columns={columns}
        onView={(item) => {
          setSelectedReview(item);
          setReplyText(item.reply?.reply || '');
          setModalMode('view');
          setIsReplyOpen(true);
        }}
        onEdit={(item) => {
          setSelectedReview(item);
          setReplyText(item.reply?.reply || '');
          setModalMode('reply');
          setIsReplyOpen(true);
        }}
        onDelete={(item) => setDeleteTarget(item)}
        isLoading={loading}
      />

      <ReviewReplyForm
        isOpen={isReplyOpen}
        mode={modalMode}
        onClose={() => {
          setIsReplyOpen(false);
          setSelectedReview(null);
          setReplyText('');
        }}
        onSave={async (replyText: string) => {
          if (!selectedReview) return;
          try {
            await adminService.replyToReview(String(selectedReview.id), replyText);
            toast.success(selectedReview.reply ? 'Cập nhật phản hồi thành công' : 'Phản hồi thành công');
            setIsReplyOpen(false);
            setSelectedReview(null);
            await fetchReviews();
          } catch (error: any) {
            toast.error(error.response?.data?.message || 'Phản hồi thất bại');
          }
        }}
        review={selectedReview}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Xác nhận xóa đánh giá"
        message={`Bạn có chắc muốn xóa đánh giá của "${deleteTarget?.customer?.user?.fullName}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}