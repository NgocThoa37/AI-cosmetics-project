'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, User, Search, Menu, X, LogOut, UserCircle, Package, KeyRound } from 'lucide-react';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';

interface HeaderProps {
  cartCount: number;
  user: any;
}

export const Header: React.FC<HeaderProps> = ({ cartCount, user }) => {
  const router = useRouter();
  const { logout } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
    setIsDropdownOpen(false);
  };

  const displayName = user?.user?.fullName || user?.fullName || 'Khách hàng';
  const displayEmail = user?.user?.email || user?.email || '';

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-brand-warm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <span className="font-serif text-2xl font-bold text-brand-dark">Lumière</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-sm font-medium text-brand-dark hover:text-brand-accent transition-colors">
                Trang chủ
              </Link>
              <Link href="/products" className="text-sm font-medium text-brand-dark hover:text-brand-accent transition-colors">
                Sản phẩm
              </Link>
            </nav>

            {/* Search Bar */}
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

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button onClick={() => setIsCartOpen(true)} className="relative p-2">
                <ShoppingBag size={20} className="text-brand-dark" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 p-2 rounded-full hover:bg-brand-beige transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-sand flex items-center justify-center text-brand-dark border border-brand-warm">
                      <User size={16} />
                    </div>
                    <span className="hidden lg:block text-sm font-medium text-brand-dark">
                      {displayName.split(' ').slice(-1)[0]}
                    </span>
                  </button>

                  {isDropdownOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-30" 
                        onClick={() => setIsDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white border border-brand-warm rounded-xl shadow-lg z-40 overflow-hidden">
                        <div className="px-4 py-3 border-b border-brand-warm bg-brand-beige/30">
                          <p className="text-sm font-semibold text-brand-dark">{displayName}</p>
                          <p className="text-xs text-brand-dark/50 truncate">{displayEmail}</p>
                        </div>
                        <div className="py-2">
                          <Link
                            href="/account"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-brand-dark hover:bg-brand-beige transition-colors"
                          >
                            <UserCircle size={16} />
                            Tài khoản của tôi
                          </Link>
                          <Link
                            href="/account/orders"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-brand-dark hover:bg-brand-beige transition-colors"
                          >
                            <Package size={16} />
                            Đơn hàng của tôi
                          </Link>
                          <Link
                            href="/account/change-password"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-brand-dark hover:bg-brand-beige transition-colors"
                          >
                            <KeyRound size={16} />
                            Đổi mật khẩu
                          </Link>
                          <hr className="my-1 border-brand-warm" />
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <LogOut size={16} />
                            Đăng xuất
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link href="/login" className="p-2 hover:bg-brand-beige rounded-full transition-colors">
                  <User size={20} className="text-brand-dark" />
                </Link>
              )}

              {/* Mobile menu button */}
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2">
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-brand-warm p-4 space-y-3">
            <Link href="/" className="block py-2 text-sm">Trang chủ</Link>
            <Link href="/products" className="block py-2 text-sm">Sản phẩm</Link>
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