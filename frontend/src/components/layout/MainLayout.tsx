'use client';

import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { ChatBox } from '@/components/chat/ChatBox';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { itemCount } = useCart();
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-brand-beige">
      <Header cartCount={itemCount} user={user} />
      <main className="flex-1">{children}</main>
      <Footer />
      <ChatBox />
    </div>
  );
};