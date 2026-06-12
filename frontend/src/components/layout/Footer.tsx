'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Phone, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const FacebookIcon = () => (
    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/>
    </svg>
  );

  const InstagramIcon = () => (
    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  );

  const TikTokIcon = () => (
    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23-.74.24-1.44.58-2.11.99a8.98 8.98 0 011.66 3.7c1.37-.17 2.75-.41 4.12-.66V13c-1.37.11-2.74.27-4.11.45.01 1.05.02 2.1-.01 3.15-.06 2.06-1.12 3.99-2.9 5.04-2.22 1.39-5.28 1.01-7.04-1.01-1.63-1.89-1.55-4.88.13-6.68a5.2 5.2 0 014.54-1.45V8.16a8.9 8.9 0 00-6.42 2.91C1.04 13.9 1.13 18.25 3.4 21.01c2.72 3.32 7.78 3.71 10.98 1.05 2.53-2.11 3.63-5.59 2.76-8.77l-.02-8.31a8.9 8.9 0 005.15-2.26l-1.35-3.32a5.2 5.2 0 01-3.4 1.59V.02z"/>
    </svg>
  );

  const YoutubeIcon = () => (
    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );

  return (
    <footer className="bg-brand-sand border-t border-brand-warm pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 5 cột trên desktop, 2 cột trên tablet, 1 cột trên mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 pb-8 border-b border-brand-warm">
          
          {/* Cột 1: Brand */}
          <div>
            <span onClick={handleScrollTop} className="font-serif text-2xl font-bold text-brand-dark cursor-pointer">
              Lumière
            </span>
            <p className="text-xs text-brand-dark/60 mt-3 leading-relaxed">
              Lumière mang đến các liệu pháp dưỡng da thuần organic kết tinh từ thực vật quý giá.
            </p>
            <div className="flex items-center gap-2 mt-4 text-[11px] text-brand-dark/50">
              <ShieldCheck size={14} className="text-brand-accent" />
              <span>Sản phẩm đạt kiểm định Bộ Y Tế</span>
            </div>
          </div>

          {/* Cột 2: Thông tin liên hệ */}
          <div>
            <h3 className="font-serif text-base font-medium text-brand-dark mb-4">Thông tin liên hệ</h3>
            <ul className="space-y-3 text-xs text-brand-dark/70">
              <li className="flex items-start gap-2">
                <Phone size={13} className="text-brand-accent mt-0.5 flex-shrink-0" />
                <div>
                  <span>Hotline: 1900 636 510</span>
                  <p className="text-[10px] text-brand-dark/45">(Mở cửa từ 8:00 - 21:00 hàng ngày)</p>
                </div>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={13} className="text-brand-accent flex-shrink-0" />
                <a href="mailto:abc@gmail.com" className="hover:text-brand-accent break-all">abc@gmail.com</a>
              </li>
            </ul>
          </div>

          {/* Cột 3: Danh mục */}
          <div>
            <h3 className="font-serif text-base font-medium text-brand-dark mb-4">Danh mục</h3>
            <ul className="space-y-2 text-xs">
              <li><button onClick={handleScrollTop} className="hover:text-brand-accent transition-colors">Trang chủ</button></li>
              <li><Link href="/products" className="hover:text-brand-accent transition-colors">Sản phẩm nổi bật</Link></li>
              <li><Link href="/brands" className="hover:text-brand-accent transition-colors">Thương hiệu đối tác</Link></li>
            </ul>
          </div>

          {/* Cột 4: Về chúng tôi */}
          <div>
            <h3 className="font-serif text-base font-medium text-brand-dark mb-4">Về chúng tôi</h3>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-brand-accent transition-colors">Giới thiệu</a></li>
              <li><a href="#" className="hover:text-brand-accent transition-colors">Phương thức thanh toán</a></li>
              <li><a href="#" className="hover:text-brand-accent transition-colors">Chính sách đổi trả</a></li>
              <li><a href="#" className="hover:text-brand-accent transition-colors">Liên hệ</a></li>
            </ul>
          </div>

          {/* Cột 5: Kết nối (Social) */}
          <div>
            <h3 className="font-serif text-base font-medium text-brand-dark mb-4">Kết nối</h3>
            <div className="flex gap-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-brand-dark text-white flex items-center justify-center hover:bg-brand-accent transition-colors">
                <FacebookIcon />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600 text-white flex items-center justify-center hover:opacity-90 transition-opacity">
                <InstagramIcon />
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:bg-brand-accent transition-colors">
                <TikTokIcon />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors">
                <YoutubeIcon />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 text-center text-[10px] text-brand-dark/40 uppercase tracking-wider">
          <p>© 2026 LUMIÈRE SKINCARE. ALL RIGHTS RESERVED.</p>
          <div className="flex justify-center gap-4 mt-2">
            <a href="#" className="hover:text-brand-accent transition-colors">ĐIỀU KHOẢN BẢO MẬT</a>
            <span>•</span>
            <a href="#" className="hover:text-brand-accent transition-colors">QUY CHẾ HOẠT ĐỘNG</a>
          </div>
        </div>
      </div>
    </footer>
  );
};