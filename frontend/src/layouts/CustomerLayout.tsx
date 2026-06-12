'use client';

import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ChatBox } from '@/components/chat/ChatBox';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';

interface CustomerLayoutProps {
  children: React.ReactNode;
}

export const CustomerLayout: React.FC<CustomerLayoutProps> = ({ children }) => {
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