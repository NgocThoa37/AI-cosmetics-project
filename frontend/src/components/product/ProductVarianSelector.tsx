import React, { useState } from 'react';
import { ProductDetail, Color, Size } from '@/types';
import { getSkinTypeLabel } from '@/helpers/format.helper';

interface ProductVariantSelectorProps {
  variants: ProductDetail[];
  colors: Color[];
  sizes: Size[];
  onSelect: (variant: ProductDetail) => void;
  selectedVariant?: ProductDetail | null;
}

export const ProductVariantSelector: React.FC<ProductVariantSelectorProps> = ({
  variants,
  colors,
  sizes,
  onSelect,
  selectedVariant,
}) => {
  const [selectedColorId, setSelectedColorId] = useState<number | null>(
    selectedVariant?.colorId || null
  );
  const [selectedSizeId, setSelectedSizeId] = useState<number | null>(
    selectedVariant?.sizeId || null
  );

  const filteredVariants = variants.filter(v => {
    if (selectedColorId && v.colorId !== selectedColorId) return false;
    if (selectedSizeId && v.sizeId !== selectedSizeId) return false;
    return true;
  });

  const availableColors = colors.filter(color =>
    variants.some(v => v.colorId === color.id)
  );

  const availableSizes = sizes.filter(size =>
    variants.some(v => v.sizeId === size.id)
  );

  const handleSelectColor = (colorId: number) => {
    setSelectedColorId(colorId);
    setSelectedSizeId(null);
  };

  const handleSelectSize = (sizeId: number) => {
    setSelectedSizeId(sizeId);
    const matched = variants.find(
      v => v.colorId === selectedColorId && v.sizeId === sizeId
    );
    if (matched) onSelect(matched);
  };

  return (
    <div className="space-y-4">
      {/* Màu sắc */}
      {availableColors.length > 0 && (
        <div>
          <label className="block text-xs font-bold text-brand-dark/70 mb-2">
            Màu sắc
          </label>
          <div className="flex flex-wrap gap-2">
            {availableColors.map((color) => (
              <button
                key={color.id}
                onClick={() => handleSelectColor(color.id)}
                className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                  selectedColorId === color.id
                    ? 'bg-[#DE6B6B] text-white'
                    : 'bg-white border border-brand-warm text-brand-dark hover:border-[#DE6B6B]'
                }`}
              >
                {color.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Kích thước / Dung tích */}
      {availableSizes.length > 0 && (
        <div>
          <label className="block text-xs font-bold text-brand-dark/70 mb-2">
            Dung tích
          </label>
          <div className="flex flex-wrap gap-2">
            {availableSizes.map((size) => (
              <button
                key={size.id}
                onClick={() => handleSelectSize(size.id)}
                disabled={!variants.some(v => v.colorId === selectedColorId && v.sizeId === size.id)}
                className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                  selectedSizeId === size.id
                    ? 'bg-[#DE6B6B] text-white'
                    : 'bg-white border border-brand-warm text-brand-dark hover:border-[#DE6B6B] disabled:opacity-40 disabled:cursor-not-allowed'
                }`}
              >
                {size.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loại da phù hợp */}
      {filteredVariants.length === 1 && filteredVariants[0].skinType && (
        <div className="bg-brand-sand/50 rounded-xl p-3">
          <span className="text-xs font-bold text-brand-dark/70">Phù hợp với: </span>
          <span className="text-xs text-brand-accent">
            {getSkinTypeLabel(filteredVariants[0].skinType)}
          </span>
        </div>
      )}
    </div>
  );
};