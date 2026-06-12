'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Product, ProductDetail as ProductDetailType } from '@/types';
import { Button } from '@/components/common/Button';
import { QuantitySelector } from '@/components/common/QuantitySelector';
import { RatingStars } from '@/components/common/RatingStars';
import { ProductVariantSelector } from './ProductVarianSelector';
import { ProductImageGallery } from './ProductImageGallery';
import { formatCurrency, getSkinTypeLabel } from '@/helpers/format.helper';

interface ProductDetailProps {
  product: Product;
  onAddToCart: (variant: ProductDetailType, quantity: number) => void;
  onBuyNow: (variant: ProductDetailType, quantity: number) => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ product, onAddToCart, onBuyNow }) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductDetailType | null>(product.details?.[0] || null);
  const [quantity, setQuantity] = useState(1);

  const avgRating = product.averageRating || 0;
  const images = product.images || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <ProductImageGallery images={images} productName={product.name} />

        <div className="space-y-6">
          <div><span className="text-xs font-bold text-brand-accent uppercase tracking-wider">{product.category?.name}</span><h1 className="font-serif text-3xl text-brand-dark mt-2">{product.name}</h1><div className="flex items-center gap-3 mt-2"><RatingStars rating={avgRating} size={16} /><span className="text-xs text-brand-dark/50">({product.totalSold || 0} đã bán)</span></div></div>

          <div className="border-t border-b border-brand-warm py-4"><span className="text-2xl font-bold text-brand-accent">{formatCurrency(product.price)}</span></div>

          {product.details && product.details.length > 0 && selectedVariant && (
            <ProductVariantSelector variants={product.details} colors={[]} sizes={[]} selectedVariant={selectedVariant} onSelect={setSelectedVariant} />
          )}

          <div className="flex items-center gap-4"><span className="text-xs font-bold text-brand-dark/70">Số lượng:</span><QuantitySelector quantity={quantity} onIncrease={() => setQuantity(q => q + 1)} onDecrease={() => setQuantity(q => Math.max(1, q - 1))} /></div>

          <div className="flex gap-4"><Button variant="primary" size="lg" className="flex-1" onClick={() => selectedVariant && onAddToCart(selectedVariant, quantity)}>Thêm vào giỏ hàng</Button><Button variant="outline" size="lg" className="flex-1" onClick={() => selectedVariant && onBuyNow(selectedVariant, quantity)}>Mua ngay</Button></div>

          <div className="space-y-4 pt-4"><h3 className="font-bold text-brand-dark">Mô tả sản phẩm</h3><p className="text-sm text-brand-dark/70 leading-relaxed">{product.details?.[0]?.description || 'Đang cập nhật...'}</p></div>

          {selectedVariant?.skinType && <div className="bg-brand-sand/50 rounded-xl p-3"><span className="text-xs font-bold text-brand-dark/70">Phù hợp với: </span><span className="text-xs text-brand-accent">{getSkinTypeLabel(selectedVariant.skinType)}</span></div>}
        </div>
      </div>
    </div>
  );
};