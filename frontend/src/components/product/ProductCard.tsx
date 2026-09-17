import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { Product } from '@/types';
import { formatCurrency } from '@/helpers/format.helper';
import { RatingStars } from '@/components/common/RatingStars';
import toast from 'react-hot-toast';
import { LoginRequiredModal } from '@/components/common/LoginRequiredModal'; // ✅ THÊM

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
  const router = useRouter();
  const { isAuthenticated } = useCustomerAuth();
  const [imgError, setImgError] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false); // ✅ THÊM
  
  const getImageUrl = (imagePath?: string) => {
    if (!imagePath || imgError) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    if (imagePath.startsWith('/uploads/')) {
      return imagePath;
    }
    return `/uploads/${imagePath}`;
  };

  const mainImage = product.details?.[0]?.images?.find((img: any) => img.isMain)?.imageUrl 
    || product.details?.[0]?.images?.[0]?.imageUrl;
  
  const imageUrl = getImageUrl(mainImage);

  // ✅ HÀM XỬ LÝ THÊM VÀO GIỎ
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // ✅ KIỂM TRA ĐĂNG NHẬP - HIỂN THỊ MODAL
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    
    // Đã login -> thêm vào giỏ
    onAddToCart(product);
    toast.success('Đã thêm vào giỏ hàng!');
  };

  return (
    <>
      <div
        onClick={() => onSelect(product)}
        className="group bg-white rounded-2xl overflow-hidden border border-brand-warm/30 hover:shadow-2xl hover:border-brand-accent/50 transition-all duration-300 cursor-pointer hover:-translate-y-1"
      >
        <div className="aspect-square overflow-hidden bg-brand-beige relative">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              loading="eager"
              className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              onError={() => setImgError(true)}
              priority={false}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-beige to-brand-sand">
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto text-brand-dark/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs text-brand-dark/30 mt-1 block">No Image</span>
              </div>
            </div>
          )}
          
          {product.totalSold > 100 && (
            <span className="absolute top-3 left-3 bg-[#DE6B6B] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
              Best Seller
            </span>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <div className="p-4 space-y-2 group-hover:bg-brand-beige/30 transition-colors duration-300">
          <span className="text-[10px] font-bold text-[#DE6B6B] uppercase tracking-wider group-hover:text-brand-accent transition-colors">
            {product.category?.name || 'Skincare'}
          </span>
          <h3 className="font-bold text-sm text-brand-dark line-clamp-1 group-hover:text-brand-accent transition-colors">
            {product.name}
          </h3>
          
          <div className="flex items-center gap-2">
            <RatingStars rating={product.averageRating || 0} size={12} />
            <span className="text-[10px] text-brand-dark/50">
              ({Math.floor(product.totalSold || 0)} đã bán)
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-brand-warm/20 group-hover:border-brand-accent/20 transition-colors">
            <span className="font-bold text-[#DE6B6B] group-hover:text-brand-accent transition-colors">
              {formatCurrency(product.price)}
            </span>
            <button
              onClick={handleAddToCart}
              className="px-3 py-1.5 bg-brand-dark text-white rounded-lg text-[10px] font-bold hover:bg-[#DE6B6B] transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95"
            >
              Thêm vào giỏ
            </button>
          </div>
        </div>
      </div>

      {/* ✅ MODAL YÊU CẦU ĐĂNG NHẬP */}
      <LoginRequiredModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </>
  );
};