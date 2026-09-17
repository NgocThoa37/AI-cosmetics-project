'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProductImageGallery } from '@/components/product/ProductImageGallery';
import { ProductVariantSelector } from '@/components/product/ProductVarianSelector';
import { RatingStars } from '@/components/common/RatingStars';
import { Button } from '@/components/common/Button';
import { QuantitySelector } from '@/components/common/QuantitySelector';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ReviewList } from '@/components/review/ReviewList';
import { ProductCard } from '@/components/product/ProductCard';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { LoginRequiredModal } from '@/components/common/LoginRequiredModal'; // ✅ THÊM
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProductById, fetchColors, fetchSizes, fetchProducts } from '@/store/slices/product.slice';
import { addToCart } from '@/store/slices/cart.slice';
import { formatCurrency } from '@/helpers/format.helper';
import { ProductDetail as ProductDetailType } from '@/types';
import toast from 'react-hot-toast';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';

// Helper để parse JSON và format
const parseJsonField = (value: any): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    return value.map(item => `• ${item}`).join('\n');
  }
  if (typeof value === 'object' && value !== null) {
    const values = Object.values(value);
    if (!values || values.length === 0) return '';
    return values.map(item => `• ${item}`).join('\n');
  }
  return String(value);
};

// Helper render content với bullet points và format
const renderContent = (content: string) => {
  if (!content || content === '') {
    return <p className="text-sm text-brand-dark/50 italic">Đang cập nhật...</p>;
  }
  
  const lines = content.split('\n').filter(line => line.trim());
  const hasBullets = lines.some(line => line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('[ ]') || line.trim().startsWith('['));
  
  if (hasBullets) {
    return (
      <ul className="list-disc pl-5 space-y-1.5 text-sm text-brand-dark/70 leading-relaxed">
        {lines.map((line, index) => {
          const cleanLine = line.replace(/^[•\-\[\]]\s*/, '').replace(/^[•\-]\s*/, '').trim();
          if (!cleanLine) return null;
          return <li key={index}>{cleanLine}</li>;
        })}
      </ul>
    );
  }
  
  return <p className="text-sm text-brand-dark/70 leading-relaxed whitespace-pre-line">{content}</p>;
};

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useCustomerAuth();
  const { selectedProduct, colors, sizes, loading, products } = useAppSelector((state) => state.product);
  const [selectedVariant, setSelectedVariant] = useState<ProductDetailType | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false); // ✅ THÊM

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
      dispatch(fetchColors());
      dispatch(fetchSizes());
      dispatch(fetchProducts({ limit: 8 }));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (selectedProduct?.details?.length) {
      setSelectedVariant(selectedProduct.details[0]);
    }
  }, [selectedProduct]);

  // ✅ HÀM THÊM VÀO GIỎ - HIỂN THỊ MODAL
  const handleAddToCart = (productDetailId: string) => {
    if (!isAuthenticated) {
      setShowLoginModal(true); // ✅ HIỂN THỊ MODAL
      return;
    }
    
    dispatch(addToCart({ productDetailId, quantity: 1 }));
    toast.success('Đã thêm vào giỏ hàng!');
    setIsCartOpen(true);
  };

  const handleAddToCartWithQuantity = (productDetailId: string) => {
    if (!isAuthenticated) {
      setShowLoginModal(true); // ✅ HIỂN THỊ MODAL
      return;
    }
    
    dispatch(addToCart({ productDetailId, quantity }));
    toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
    setIsCartOpen(true);
  };

  const handleBuyNow = () => {
    console.log('🔥🔥🔥 [MUA NGAY] BẤM NÚT 🔥🔥🔥');
    console.log('selectedVariant:', selectedVariant);
    console.log('quantity:', quantity);
    
    if (!selectedVariant) {
      toast.error('Vui lòng chọn phân loại sản phẩm');
      return;
    }

    // ✅ CHUYỂN THẲNG SANG CHECKOUT
    const url = `/checkout?productDetailId=${selectedVariant.id}&quantity=${quantity}`;
    console.log('🔍 [MUA NGAY] URL:', url);
    
    router.push(url);
  };

  if (loading || !selectedProduct) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const avgRating = selectedProduct.averageRating || 0;
  const images = selectedProduct.details?.[0]?.images || [];
  const variant = selectedVariant || selectedProduct.details?.[0];

  const skinTypeMap: Record<string, string> = {
    oily: 'Da dầu',
    dry: 'Da khô',
    combination: 'Da hỗn hợp',
    sensitive: 'Da nhạy cảm',
    normal: 'Da thường',
    all: 'Mọi loại da',
  };

  const suggestedProducts = products
    .filter(p => p.categoryId === selectedProduct.categoryId && p.id !== selectedProduct.id)
    .slice(0, 4);

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <ProductImageGallery images={images} productName={selectedProduct.name} />

          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-brand-accent uppercase tracking-wider">
                {selectedProduct.category?.name}
              </span>
              <h1 className="font-serif text-3xl text-brand-dark mt-2">{selectedProduct.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                <RatingStars rating={avgRating} size={16} />
                <span className="text-xs text-brand-dark/50">({selectedProduct.totalSold || 0} đã bán)</span>
              </div>
            </div>

            <div className="border-t border-b border-brand-warm py-4">
              <span className="text-2xl font-bold text-brand-accent">
                {formatCurrency(selectedProduct.price)}
              </span>
            </div>

            {selectedProduct.details && selectedProduct.details.length > 0 && (
              <ProductVariantSelector
                variants={selectedProduct.details}
                colors={colors}
                sizes={sizes}
                selectedVariant={selectedVariant}
                onSelect={setSelectedVariant}
              />
            )}

            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-brand-dark/70">Số lượng:</span>
              <QuantitySelector 
                quantity={quantity} 
                onIncrease={() => setQuantity(q => q + 1)} 
                onDecrease={() => setQuantity(q => Math.max(1, q - 1))} 
              />
              {variant && (
                <span className="text-xs text-brand-dark/50">Còn lại: {variant.quantity}</span>
              )}
            </div>

            <div className="flex gap-4">
              <Button 
                variant="primary" 
                size="lg" 
                className="flex-1" 
                onClick={() => {
                  if (variant) handleAddToCartWithQuantity(variant.id);
                }}
              >
                Thêm vào giỏ hàng
              </Button>
              <Button variant="outline" size="lg" className="flex-1" onClick={handleBuyNow}>
                Mua ngay
              </Button>
            </div>

            <div className="space-y-4 pt-4 border-t border-brand-warm">
              <div>
                <h4 className="text-xs font-bold text-brand-dark/50 uppercase tracking-wider">Mã sản phẩm</h4>
                <p className="text-sm text-brand-dark font-mono">{variant?.sku || 'Đang cập nhật...'}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-brand-dark/50 uppercase tracking-wider">Loại da</h4>
                <p className="text-sm text-brand-dark">
                  {variant?.skinType ? (skinTypeMap[variant.skinType] || variant.skinType) : 'Đang cập nhật...'}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-brand-dark/50 uppercase tracking-wider">Mô tả sản phẩm</h4>
                {renderContent(variant?.description || '')}
              </div>

              <div>
                <h4 className="text-xs font-bold text-brand-dark/50 uppercase tracking-wider">Thành phần</h4>
                {renderContent(variant?.ingredients || '')}
              </div>

              <div>
                <h4 className="text-xs font-bold text-brand-dark/50 uppercase tracking-wider">Công dụng</h4>
                {renderContent(parseJsonField(variant?.benefits))}
              </div>

              <div>
                <h4 className="text-xs font-bold text-brand-dark/50 uppercase tracking-wider">Hướng dẫn sử dụng</h4>
                {renderContent(parseJsonField(variant?.usage))}
              </div>

              <div>
                <h4 className="text-xs font-bold text-brand-dark/50 uppercase tracking-wider">Bảo quản</h4>
                {renderContent(variant?.storage || '')}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-brand-warm">
          <h2 className="font-serif text-2xl text-brand-dark mb-6">Đánh giá sản phẩm</h2>
          <ReviewList productId={selectedProduct.id} />
        </div>

        {suggestedProducts.length > 0 && (
          <div className="mt-16 pt-8 border-t border-brand-warm">
            <h2 className="font-serif text-2xl text-brand-dark mb-6">✨ Sản phẩm gợi ý</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {suggestedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={() => {
                    const firstVariant = product.details?.[0];
                    if (firstVariant) handleAddToCart(firstVariant.id);
                  }}
                  onSelect={() => window.location.href = `/products/${product.id}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* ✅ MODAL YÊU CẦU ĐĂNG NHẬP */}
      <LoginRequiredModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </>
  );
}