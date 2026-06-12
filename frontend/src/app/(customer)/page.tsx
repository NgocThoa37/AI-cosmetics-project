'use client';

import { useEffect, useState } from 'react';
import { Hero } from '@/components/home/Hero';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProducts, fetchCategories } from '@/store/slices/product.slice';
import { addToCart } from '@/store/slices/cart.slice';
import { useRouter, useSearchParams } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { products, categories, loading } = useAppSelector((state) => state.product);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'bestseller'>('all');
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    dispatch(fetchProducts({ search: searchQuery || undefined }));
    dispatch(fetchCategories());
  }, [dispatch, searchQuery]);

  const filteredProducts = products.filter((product) => {
    if (activeCategory !== 'all' && product.categoryId !== Number(activeCategory)) return false;
    if (activeTab === 'bestseller' && !(product.totalSold > 100)) return false;
    return true;
  });

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
    <>
      <Hero />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8 pb-4 border-b border-brand-warm">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              activeCategory === 'all' ? 'bg-brand-accent text-white' : 'bg-white border border-brand-warm hover:border-brand-accent'
            }`}
          >
            Tất cả
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(String(cat.id))}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                activeCategory === String(cat.id) ? 'bg-brand-accent text-white' : 'bg-white border border-brand-warm hover:border-brand-accent'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-6 mb-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`font-serif text-lg transition-all ${activeTab === 'all' ? 'text-brand-dark font-bold border-b-2 border-brand-accent' : 'text-brand-dark/40 hover:text-brand-dark'}`}
          >
            Tất cả sản phẩm
          </button>
          <button
            onClick={() => setActiveTab('bestseller')}
            className={`font-serif text-lg transition-all ${activeTab === 'bestseller' ? 'text-brand-dark font-bold border-b-2 border-brand-accent' : 'text-brand-dark/40 hover:text-brand-dark'}`}
          >
            Bán chạy
          </button>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-brand-dark/50">Không tìm thấy sản phẩm nào.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={() => {
                  const firstVariant = product.details?.[0];
                  if (firstVariant) handleAddToCart(firstVariant.id);
                }}
                onSelect={() => {}}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}