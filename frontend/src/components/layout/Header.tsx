'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ShoppingBag, User, Search, Menu, X, LogOut, UserCircle, Package, KeyRound, ChevronDown } from 'lucide-react';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { useAuth } from '@/hooks/useAuth';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCategories, fetchBrands } from '@/store/slices/product.slice';
import { fetchCart } from '@/store/slices/cart.slice';

interface HeaderProps {
  user: any;
}

export const Header: React.FC<HeaderProps> = ({ user }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { logout: adminLogout } = useAuth();
  const { logout: customerLogout } = useCustomerAuth();
  const { categories, brands } = useAppSelector((state) => state.product);
  const { itemCount } = useAppSelector((state) => state.cart);
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isBrandOpen, setIsBrandOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMounted, setIsMounted] = useState(false); // ✅ THÊM

  const categoryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const brandTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsMounted(true); // ✅ SET MOUNTED
    dispatch(fetchCategories());
    dispatch(fetchBrands());
    if (user) {
      dispatch(fetchCart());
    }
  }, [dispatch, user]);

  const handleLogout = async () => {
    if (user?.role === 'admin' || user?.role === 'employee') {
      await adminLogout();
    } else {
      await customerLogout();
    }
    router.push('/login');
    setIsDropdownOpen(false);
  };

  const handleCategoryOpen = () => {
    if (categoryTimeoutRef.current) {
      clearTimeout(categoryTimeoutRef.current);
      categoryTimeoutRef.current = null;
    }
    setIsCategoryOpen(true);
  };

  const handleCategoryClose = () => {
    if (categoryTimeoutRef.current) {
      clearTimeout(categoryTimeoutRef.current);
      categoryTimeoutRef.current = null;
    }
    categoryTimeoutRef.current = setTimeout(() => {
      setIsCategoryOpen(false);
      categoryTimeoutRef.current = null;
    }, 300);
  };

  const handleBrandOpen = () => {
    if (brandTimeoutRef.current) {
      clearTimeout(brandTimeoutRef.current);
      brandTimeoutRef.current = null;
    }
    setIsBrandOpen(true);
  };

  const handleBrandClose = () => {
    if (brandTimeoutRef.current) {
      clearTimeout(brandTimeoutRef.current);
      brandTimeoutRef.current = null;
    }
    brandTimeoutRef.current = setTimeout(() => {
      setIsBrandOpen(false);
      brandTimeoutRef.current = null;
    }, 300);
  };

  const handleDropdownOpen = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setIsDropdownOpen(true);
  };

  const handleDropdownClose = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    dropdownTimeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
      dropdownTimeoutRef.current = null;
    }, 300);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const displayName = user?.fullName || user?.user?.fullName || 'Khách hàng';
  const displayEmail = user?.email || user?.user?.email || '';
  const avatarUrl = user?.avatar || user?.user?.avatar || 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=8B5CF6&color=fff&size=64&bold=true`;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-brand-warm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <span className="font-serif text-2xl font-bold text-brand-dark">Lumière</span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              {/* ... Danh mục và Thương hiệu giữ nguyên ... */}
              <div 
                className="relative"
                onMouseEnter={handleCategoryOpen}
                onMouseLeave={handleCategoryClose}
              >
                <button className="flex items-center gap-1 text-sm font-medium text-brand-dark hover:text-brand-accent transition-colors">
                  Danh mục
                  <ChevronDown size={14} className={`transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
                </button>
                {isCategoryOpen && (
                  <div 
                    className="absolute left-0 mt-2 w-56 bg-white border border-brand-warm rounded-xl shadow-lg z-50 py-2"
                    onMouseEnter={handleCategoryOpen}
                    onMouseLeave={handleCategoryClose}
                  >
                    <Link
                      href="/products"
                      className="block px-4 py-2 text-sm hover:bg-brand-beige transition-colors font-semibold"
                      onClick={() => setIsCategoryOpen(false)}
                    >
                      📋 Tất cả
                    </Link>
                    {categories.length > 0 ? (
                      categories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/products?category=${cat.slug || cat.id}`}
                          className="block px-4 py-2 text-sm hover:bg-brand-beige transition-colors"
                          onClick={() => setIsCategoryOpen(false)}
                        >
                          {cat.name}
                        </Link>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-sm text-brand-dark/50">Đang tải...</div>
                    )}
                  </div>
                )}
              </div>

              <div 
                className="relative"
                onMouseEnter={handleBrandOpen}
                onMouseLeave={handleBrandClose}
              >
                <button className="flex items-center gap-1 text-sm font-medium text-brand-dark hover:text-brand-accent transition-colors">
                  Thương hiệu
                  <ChevronDown size={14} className={`transition-transform ${isBrandOpen ? 'rotate-180' : ''}`} />
                </button>
                {isBrandOpen && (
                  <div 
                    className="absolute left-0 mt-2 w-56 bg-white border border-brand-warm rounded-xl shadow-lg z-50 py-2"
                    onMouseEnter={handleBrandOpen}
                    onMouseLeave={handleBrandClose}
                  >
                    <Link
                      href="/products"
                      className="block px-4 py-2 text-sm hover:bg-brand-beige transition-colors font-semibold"
                      onClick={() => setIsBrandOpen(false)}
                    >
                      📋 Tất cả
                    </Link>
                    {brands.length > 0 ? (
                      brands.map((brand) => (
                        <Link
                          key={brand.id}
                          href={`/products?brand=${brand.slug || brand.id}`}
                          className="block px-4 py-2 text-sm hover:bg-brand-beige transition-colors"
                          onClick={() => setIsBrandOpen(false)}
                        >
                          {brand.name}
                        </Link>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-sm text-brand-dark/50">Đang tải...</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleSearch} className="hidden md:flex items-center bg-brand-beige rounded-full px-4 py-2 w-80">
              <Search size={18} className="text-brand-dark/40" />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm px-2 flex-1"
              />
            </form>

            <div className="flex items-center gap-4">
              <button onClick={() => setIsCartOpen(true)} className="relative p-2 hover:bg-brand-beige rounded-full transition-colors">
                <ShoppingBag size={20} className="text-brand-dark" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* ✅ CHỈ RENDER SAU KHI MOUNT */}
              {isMounted && (
                user ? (
                  <div 
                    className="relative"
                    onMouseEnter={handleDropdownOpen}
                    onMouseLeave={handleDropdownClose}
                  >
                    <button className="flex items-center gap-2 p-2 rounded-full hover:bg-brand-beige transition-colors">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-brand-sand flex items-center justify-center border border-brand-warm">
                        <Image
                          src={avatarUrl}
                          alt={displayName}
                          width={32}
                          height={32}
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <span className="hidden lg:block text-sm font-medium text-brand-dark">
                        {displayName.split(' ').slice(-1)[0]}
                      </span>
                    </button>

                    {isDropdownOpen && (
                      <div 
                        className="absolute right-0 mt-2 w-56 bg-white border border-brand-warm rounded-xl shadow-lg z-50 overflow-hidden"
                        onMouseEnter={handleDropdownOpen}
                        onMouseLeave={handleDropdownClose}
                      >
                        <div className="px-4 py-3 border-b border-brand-warm bg-brand-beige/30">
                          <p className="text-sm font-semibold text-brand-dark">{displayName}</p>
                          <p className="text-xs text-brand-dark/50 truncate">{displayEmail}</p>
                        </div>
                        <div className="py-2">
                          <Link href="/account" className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-brand-beige">
                            <UserCircle size={16} /> Tài khoản của tôi
                          </Link>
                          <Link href="/account/orders" className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-brand-beige">
                            <Package size={16} /> Đơn hàng của tôi
                          </Link>
                          <Link href="/account/change-password" className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-brand-beige">
                            <KeyRound size={16} /> Đổi mật khẩu
                          </Link>
                          <hr className="my-1 border-brand-warm" />
                          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50">
                            <LogOut size={16} /> Đăng xuất
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link href="/login" className="p-2 hover:bg-brand-beige rounded-full transition-colors">
                    <User size={20} className="text-brand-dark" />
                  </Link>
                )
              )}

              {/* ✅ FALLBACK KHI CHƯA MOUNT */}
              {!isMounted && (
                <Link href="/login" className="p-2 hover:bg-brand-beige rounded-full transition-colors">
                  <User size={20} className="text-brand-dark" />
                </Link>
              )}

              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2">
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-brand-warm p-4 space-y-3">
            <div className="space-y-2">
              <p className="font-semibold text-brand-dark">Danh mục</p>
              <div className="pl-4 space-y-1">
                <Link href="/products" className="block py-1 text-sm font-semibold">Tất cả</Link>
                {categories.slice(0, 5).map((cat) => (
                  <Link key={cat.id} href={`/products?category=${cat.slug || cat.id}`} className="block py-1 text-sm">
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-brand-dark">Thương hiệu</p>
              <div className="pl-4 space-y-1">
                <Link href="/products" className="block py-1 text-sm font-semibold">Tất cả</Link>
                {brands.slice(0, 5).map((brand) => (
                  <Link key={brand.id} href={`/products?brand=${brand.slug || brand.id}`} className="block py-1 text-sm">
                    {brand.name}
                  </Link>
                ))}
              </div>
            </div>
            <form onSubmit={handleSearch} className="flex items-center bg-brand-beige rounded-full px-4 py-2">
              <Search size={18} className="text-brand-dark/40" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm px-2 flex-1"
              />
            </form>
          </div>
        )}
      </header>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Header;