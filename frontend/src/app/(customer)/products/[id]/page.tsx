'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ProductImageGallery } from '@/components/product/ProductImageGallery';
import { ProductVariantSelector } from '@/components/product/ProductVarianSelector';
import { RatingStars } from '@/components/common/RatingStars';
import { Button } from '@/components/common/Button';
import { QuantitySelector } from '@/components/common/QuantitySelector';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ReviewList } from '@/components/review/ReviewList';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProductById, fetchColors, fetchSizes } from '@/store/slices/product.slice';
import { addToCart } from '@/store/slices/cart.slice';
import { formatCurrency } from '@/helpers/format.helper';
import { ProductDetail as ProductDetailType } from '@/types';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const dispatch = useAppDispatch();
  const { selectedProduct, colors, sizes, loading } = useAppSelector((state) => state.product);
  const [selectedVariant, setSelectedVariant] = useState<ProductDetailType | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
      dispatch(fetchColors());
      dispatch(fetchSizes());
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (selectedProduct?.details?.length) {
      setSelectedVariant(selectedProduct.details[0]);
    }
  }, [selectedProduct]);

  const handleAddToCart = () => {
    if (selectedVariant) {
      dispatch(addToCart({ productDetailId: selectedVariant.id, quantity }));
      toast.success('Đã thêm vào giỏ hàng!');
    }
  };

  const handleBuyNow = () => {
    if (selectedVariant) {
      // Redirect to checkout with this item
      toast.success('Chuyển sang trang thanh toán...');
    }
  };

  if (loading || !selectedProduct) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const avgRating = selectedProduct.averageRating || 0;
  const images = selectedProduct.images || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <ProductImageGallery images={images} productName={selectedProduct.name} />

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-bold text-brand-accent uppercase tracking-wider">{selectedProduct.category?.name}</span>
            <h1 className="font-serif text-3xl text-brand-dark mt-2">{selectedProduct.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              <RatingStars rating={avgRating} size={16} />
              <span className="text-xs text-brand-dark/50">({selectedProduct.totalSold || 0} đã bán)</span>
            </div>
          </div>

          <div className="border-t border-b border-brand-warm py-4">
            <span className="text-2xl font-bold text-brand-accent">{formatCurrency(selectedProduct.price)}</span>
          </div>

          {/* Variant Selector */}
          {selectedProduct.details && selectedProduct.details.length > 0 && (
            <ProductVariantSelector
              variants={selectedProduct.details}
              colors={colors}
              sizes={sizes}
              selectedVariant={selectedVariant}
              onSelect={setSelectedVariant}
            />
          )}

          {/* Quantity */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-brand-dark/70">Số lượng:</span>
            <QuantitySelector 
              quantity={quantity} 
              onIncrease={() => setQuantity(q => q + 1)} 
              onDecrease={() => setQuantity(q => Math.max(1, q - 1))} 
            />
            {selectedVariant && <span className="text-xs text-brand-dark/50">Còn lại: {selectedVariant.quantity}</span>}
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button variant="primary" size="lg" className="flex-1" onClick={handleAddToCart}>
              Thêm vào giỏ hàng
            </Button>
            <Button variant="outline" size="lg" className="flex-1" onClick={handleBuyNow}>
              Mua ngay
            </Button>
          </div>

          {/* Description */}
          <div className="space-y-4 pt-4">
            <h3 className="font-bold text-brand-dark">Mô tả sản phẩm</h3>
            <p className="text-sm text-brand-dark/70 leading-relaxed">
              {selectedProduct.details?.[0]?.description || 'Đang cập nhật...'}
            </p>

            {selectedVariant?.ingredients && (
              <>
                <h3 className="font-bold text-brand-dark">Thành phần</h3>
                <p className="text-sm text-brand-dark/70">{selectedVariant.ingredients}</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16 pt-8 border-t border-brand-warm">
        <h2 className="font-serif text-2xl text-brand-dark mb-6">Đánh giá sản phẩm</h2>
        <ReviewList productId={selectedProduct.id} />
      </div>
    </div>
  );
}