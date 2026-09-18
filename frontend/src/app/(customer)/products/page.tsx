// src/app/products/page.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/product/ProductCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProducts, fetchCategories, fetchBrands } from '@/store/slices/product.slice';
import { addToCart } from '@/store/slices/cart.slice';
import { useRouter } from 'next/navigation';

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  
  const category = searchParams.get('category');
  const brand = searchParams.get('brand');
  const search = searchParams.get('search');
  
  const { products, categories, brands, loading } = useAppSelector((state) => state.product);
  const [activeCategory, setActiveCategory] = useState<string>(category || 'all');
  const [activeBrand, setActiveBrand] = useState<string>(brand || 'all');

  useEffect(() => {
    dispatch(fetchProducts({ 
      category: category || undefined,
      brand: brand || undefined,
      search: search || undefined,
    }));
    dispatch(fetchCategories());
    dispatch(fetchBrands());
  }, [dispatch, category, brand, search]);

  const handleAddToCart = (productDetailId: string) => {
    dispatch(addToCart({ productDetailId, quantity: 1 }));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2 mb-8 pb-4 border-b border-brand-warm">
        <button
          onClick={() => {
            setActiveCategory('all');
            setActiveBrand('all');
            router.push('/products');
          }}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
            activeCategory === 'all' && activeBrand === 'all'
              ? 'bg-brand-accent text-white'
              : 'bg-white border border-brand-warm hover:border-brand-accent'
          }`}
        >
          Tất cả
        </button>
        
        {/* Category Filters */}
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setActiveCategory(String(cat.id));
              setActiveBrand('all');
              router.push(`/products?category=${cat.slug || cat.id}`);
            }}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              activeCategory === String(cat.id)
                ? 'bg-brand-accent text-white'
                : 'bg-white border border-brand-warm hover:border-brand-accent'
            }`}
          >
            {cat.name}
          </button>
        ))}
        
        {/* Brand Filters */}
        {brands.map((brand) => (
          <button
            key={brand.id}
            onClick={() => {
              setActiveBrand(String(brand.id));
              setActiveCategory('all');
              router.push(`/products?brand=${brand.slug || brand.id}`);
            }}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              activeBrand === String(brand.id)
                ? 'bg-brand-accent text-white'
                : 'bg-white border border-brand-warm hover:border-brand-accent'
            }`}
          >
            {brand.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-brand-dark/50">Không tìm thấy sản phẩm nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={() => {
                const firstVariant = product.details?.[0];
                if (firstVariant) handleAddToCart(firstVariant.id);
              }}
              onSelect={() => router.push(`/products/${product.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>}>
      <ProductsContent />
    </Suspense>
  );
}