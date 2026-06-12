'use client';

import React from 'react';
import { ArrowRight, Sparkles, Shield, Truck, Leaf } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/common/Button';

interface HeroProps {
  onScrollToProducts?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onScrollToProducts }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-beige via-brand-sand to-brand-beige">
      {/* Background decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-brand-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-brand-warm/30 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Content */}
          <div className="text-left space-y-5">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-brand-warm rounded-full px-4 py-2">
              <Sparkles size={14} className="text-brand-accent" />
              <span className="text-xs font-medium text-brand-dark/70">Dưỡng da hữu cơ thuần khiết</span>
            </div>

            {/* Heading */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-brand-dark leading-tight">
              Khám phá vẻ đẹp
              <span className="block text-brand-accent">thuần khiết từ thiên nhiên</span>
            </h1>

            {/* Description */}
            <p className="text-sm text-brand-dark/60 leading-relaxed max-w-lg">
              Lumière mang đến những sản phẩm dưỡng da cao cấp từ các thương hiệu uy tín, 
              kết hợp công nghệ AI tư vấn cá nhân hóa giúp bạn tìm ra sản phẩm phù hợp nhất.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-2">
              <Button 
                size="lg" 
                onClick={onScrollToProducts}
                className="group"
              >
                Khám phá sản phẩm
                <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => {
                  const chatBtn = document.querySelector('[class*="fixed bottom-6 right-6"] button');
                  if (chatBtn) (chatBtn as HTMLButtonElement).click();
                }}
              >
                <Sparkles size={16} className="mr-2" />
                Tư vấn cùng AI
              </Button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-5 pt-4 border-t border-brand-warm/30">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-brand-accent" />
                <span className="text-xs text-brand-dark/50">Sản phẩm chính hãng</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck size={16} className="text-brand-accent" />
                <span className="text-xs text-brand-dark/50">Giao hàng toàn quốc</span>
              </div>
              <div className="flex items-center gap-2">
                <Leaf size={16} className="text-brand-accent" />
                <span className="text-xs text-brand-dark/50">Thành phần organic</span>
              </div>
            </div>
          </div>

          {/* Right Image - Giới hạn chiều cao */}
          <div className="relative flex justify-center">
            <div className="relative rounded-2xl overflow-hidden shadow-xl max-h-[380px] md:max-h-[420px] w-full max-w-md lg:max-w-lg">
              <Image
                src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80"
                alt="Lumière Skincare - Sản phẩm dưỡng da cao cấp"
                width={550}
                height={420}
                className="object-cover w-full h-full"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/10 to-transparent" />
            </div>
            
            {/* Floating badge nhỏ gọn */}
            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-2 flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-accent/10 rounded-full flex items-center justify-center">
                <Leaf size={16} className="text-brand-accent" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-brand-dark">100% Organic</p>
                <p className="text-[8px] text-brand-dark/50">Chứng nhận hữu cơ</p>
              </div>
            </div>

            <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-2 flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-50 rounded-full flex items-center justify-center">
                <Sparkles size={16} className="text-amber-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-brand-dark">4.9/5</p>
                <p className="text-[8px] text-brand-dark/50">Từ 10k+ đánh giá</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave separator */}
      <div className="relative h-12">
        <svg
          className="absolute bottom-0 w-full h-12 text-brand-beige"
          preserveAspectRatio="none"
          viewBox="0 0 1440 54"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0 22L60 26.7C120 31.3 240 40.7 360 42.7C480 44.7 600 39.3 720 34.7C840 30 960 26 1080 24C1200 22 1320 22 1380 22H1440V54H1380C1320 54 1200 54 1080 54C960 54 840 54 720 54C600 54 480 54 360 54C240 54 120 54 60 54H0V22Z" />
        </svg>
      </div>
    </section>
  );
};