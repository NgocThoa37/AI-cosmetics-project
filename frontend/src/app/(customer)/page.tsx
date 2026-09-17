'use client';

import { useEffect, useState } from 'react';
import { Hero } from '@/components/home/Hero';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProducts, fetchCategories, fetchBestSellers } from '@/store/slices/product.slice';
import { addToCart } from '@/store/slices/cart.slice';
import { useRouter, useSearchParams } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { 
    products, 
    categories, 
    loading, 
    pagination, 
    bestSellers, 
    loadingBestSellers 
  } = useAppSelector((state) => state.product);
  
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'bestseller'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const searchQuery = searchParams.get('search') || '';

  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    dispatch(fetchProducts({ 
      search: searchQuery || undefined,
      page: currentPage,
      limit: ITEMS_PER_PAGE,
    }));
    dispatch(fetchCategories());
    dispatch(fetchBestSellers(8));
  }, [dispatch, searchQuery, currentPage]);

  // Lọc theo category
  const filteredProducts = products.filter((product) => {
    if (activeCategory !== 'all' && product.categoryId !== Number(activeCategory)) return false;
    return true;
  });

  // Lọc sản phẩm bán chạy từ danh sách hiện tại
  const bestSellingProducts = filteredProducts
    .filter(p => (p.totalSold || 0) > 0)
    .sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0));

  // Products hiển thị theo tab
  const displayProducts = activeTab === 'bestseller' ? bestSellingProducts : filteredProducts;

  const handleAddToCart = (productDetailId: string) => {
    dispatch(addToCart({ productDetailId, quantity: 1 }));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

      {/* Best Sellers Section - Luôn hiển thị khi có sản phẩm bán chạy */}
      {bestSellers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-2xl md:text-3xl text-brand-dark">
              🌟 Sản phẩm bán chạy
            </h2>
            <button 
              onClick={() => setActiveTab('bestseller')}
              className="text-sm text-brand-accent hover:underline"
            >
              Xem tất cả
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {bestSellers.slice(0, 8).map((product) => (
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
        </section>
      )}

      {/* All Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8 pb-4 border-b border-brand-warm">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              activeCategory === 'all' 
                ? 'bg-brand-accent text-white' 
                : 'bg-white border border-brand-warm hover:border-brand-accent'
            }`}
          >
            Tất cả
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(String(cat.id))}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                activeCategory === String(cat.id) 
                  ? 'bg-brand-accent text-white' 
                  : 'bg-white border border-brand-warm hover:border-brand-accent'
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
            className={`font-serif text-lg transition-all ${
              activeTab === 'all' 
                ? 'text-brand-dark font-bold border-b-2 border-brand-accent' 
                : 'text-brand-dark/40 hover:text-brand-dark'
            }`}
          >
            Tất cả sản phẩm
          </button>
          <button
            onClick={() => setActiveTab('bestseller')}
            className={`font-serif text-lg transition-all ${
              activeTab === 'bestseller' 
                ? 'text-brand-dark font-bold border-b-2 border-brand-accent' 
                : 'text-brand-dark/40 hover:text-brand-dark'
            }`}
          >
            Bán chạy
          </button>
        </div>

        {/* Products Grid */}
        {displayProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-brand-dark/50">Không tìm thấy sản phẩm nào.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayProducts.map((product) => (
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

            {/* Pagination - Chỉ hiển thị khi tab "Tất cả sản phẩm" */}
            {activeTab === 'all' && pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === 1
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-white border border-brand-warm hover:bg-brand-beige'
                  }`}
                >
                  Trước
                </button>
                
                {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-brand-accent text-white'
                          : 'bg-white border border-brand-warm hover:bg-brand-beige'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === pagination.totalPages
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-white border border-brand-warm hover:bg-brand-beige'
                  }`}
                >
                  Sau
                </button>
              </div>
            )}

            {/* Hiển thị số lượng sản phẩm */}
            <div className="text-center text-sm text-brand-dark/50 mt-4">
              Hiển thị {displayProducts.length} sản phẩm
              {activeTab === 'all' && pagination.totalItems > 0 && ` / ${pagination.totalItems} sản phẩm`}
            </div>
          </>
        )}
      </section>
    </>
  );
}