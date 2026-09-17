'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ProductImage } from '@/types';

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
}

export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({ images, productName }) => {
  // ✅ SỬA: Xử lý URL ảnh từ backend
  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return null;
    
    // Nếu đã là URL đầy đủ
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Nếu là đường dẫn tương đối từ backend
    if (imagePath.startsWith('/uploads/')) {
      return imagePath; // Next.js sẽ rewrite
    }
    
    // Nếu chỉ có tên file
    return `/uploads/${imagePath}`;
  };

  // ✅ SỬA: Lấy ảnh chính hoặc ảnh đầu tiên
  const mainImage = images.find(img => img.isMain)?.imageUrl || images[0]?.imageUrl;
  const [activeImage, setActiveImage] = useState(getImageUrl(mainImage) || null);

  // ✅ SỬA: Hiển thị placeholder đẹp khi không có ảnh
  if (images.length === 0 || !mainImage) {
    return (
      <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-brand-beige to-brand-sand relative flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto text-brand-dark/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm text-brand-dark/30 mt-2 block">Không có ảnh</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Ảnh chính */}
      <div className="aspect-square rounded-2xl overflow-hidden bg-brand-beige relative">
        <Image 
          src={activeImage || getImageUrl(mainImage) || ''} 
          alt={productName} 
          fill 
          className="object-cover"
          onError={() => {
            // Nếu ảnh lỗi, hiển thị placeholder
            setActiveImage(null);
          }}
        />
      </div>
      
      {/* Danh sách ảnh nhỏ */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((img) => {
            const imgUrl = getImageUrl(img.imageUrl);
            return (
              <button
                key={img.id}
                onClick={() => setActiveImage(imgUrl)}
                className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                  activeImage === imgUrl ? 'border-brand-accent' : 'border-transparent hover:border-brand-warm'
                }`}
              >
                <Image 
                  src={imgUrl || ''} 
                  alt={img.altText || productName} 
                  fill 
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};