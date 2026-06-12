'use client';

import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  size?: number;
  showValue?: boolean;
}

export const RatingStars: React.FC<RatingStarsProps> = ({ rating, size = 14, showValue = false }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} size={size} fill="#f59e0b" className="text-amber-500" />
        ))}
        {hasHalfStar && (
          <div className="relative">
            <Star size={size} className="text-amber-500" />
            <div className="absolute inset-0 w-1/2 overflow-hidden">
              <Star size={size} fill="#f59e0b" className="text-amber-500" />
            </div>
          </div>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} size={size} className="text-gray-300" />
        ))}
      </div>
      {showValue && <span className="text-xs text-brand-dark/60">{rating.toFixed(1)}</span>}
    </div>
  );
};