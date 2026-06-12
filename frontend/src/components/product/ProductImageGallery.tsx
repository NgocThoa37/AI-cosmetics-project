'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ProductImage } from '@/types';

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
}

export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({ images, productName }) => {
  const [activeImage, setActiveImage] = useState(images.find(img => img.isMain)?.imageUrl || images[0]?.imageUrl || '/placeholder.jpg');

  if (images.length === 0) {
    return (
      <div className="aspect-square rounded-2xl overflow-hidden bg-brand-beige relative">
        <Image src="/placeholder.jpg" alt={productName} fill className="object-cover" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="aspect-square rounded-2xl overflow-hidden bg-brand-beige relative">
        <Image src={activeImage} alt={productName} fill className="object-cover" />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((img) => (
            <button
              key={img.id}
              onClick={() => setActiveImage(img.imageUrl)}
              className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${activeImage === img.imageUrl ? 'border-brand-accent' : 'border-transparent'}`}
            >
              <Image src={img.imageUrl} alt={img.altText || ''} width={80} height={80} className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};