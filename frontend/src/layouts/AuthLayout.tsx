'use client';

import React from 'react';
import { Leaf } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 overflow-hidden bg-[#f3f4ee]">
      {/* Background decorations */}
      <div className="absolute top-[10%] left-[10%] w-44 h-64 bg-[#d0e0cf] rounded-[40px] opacity-75 -z-10" />
      <div className="absolute bottom-[10%] right-[10%] w-56 h-40 bg-[#e1ebe1] rounded-[36px] -z-10 translate-x-10 translate-y-10">
        <div className="absolute inset-0 border-2 border-dashed border-slate-300 rounded-[36px] translate-x-4 translate-y-4" />
      </div>

      {/* Content */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 z-10">
        {title && (
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-forest-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Leaf size={28} className="text-forest-700" />
            </div>
            <h2 className="text-3xl font-serif text-forest-800 italic">{title}</h2>
            {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
};