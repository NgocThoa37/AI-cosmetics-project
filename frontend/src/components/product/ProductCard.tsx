import React from 'react';
import Image from 'next/image';
import { Product } from '@/types';
import { formatCurrency } from '@/helpers/format.helper';
import { RatingStars } from '@/components/common/RatingStars';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onAddToCart,
}) => {
  const mainImage = product.images?.find(img => img.isMain)?.imageUrl || '/placeholder.jpg';
  const avgRating = product.averageRating || 0;

  return (
    <div
      onClick={() => onSelect(product)}
      className="group bg-white rounded-2xl overflow-hidden border border-brand-warm/30 hover:shadow-lg transition-all cursor-pointer"
    >
      <div className="aspect-square overflow-hidden bg-brand-beige relative">
        <Image
          src={mainImage}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.totalSold > 100 && (
          <span className="absolute top-3 left-3 bg-[#DE6B6B] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            Best Seller
          </span>
        )}
      </div>

      <div className="p-4 space-y-2">
        <span className="text-[10px] font-bold text-[#DE6B6B] uppercase tracking-wider">
          {product.category?.name || 'Skincare'}
        </span>
        <h3 className="font-bold text-sm text-brand-dark line-clamp-1">
          {product.name}
        </h3>
        
        <div className="flex items-center gap-2">
          <RatingStars rating={avgRating} size={12} />
          <span className="text-[10px] text-brand-dark/50">
            ({Math.floor(product.totalSold || 0)} đã bán)
          </span>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="font-bold text-[#DE6B6B]">
            {formatCurrency(product.price)}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="px-3 py-1.5 bg-brand-dark text-white rounded-lg text-[10px] font-bold hover:bg-[#DE6B6B] transition-colors"
          >
            Thêm vào giỏ
          </button>
        </div>
      </div>
    </div>
  );
};