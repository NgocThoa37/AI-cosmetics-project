'use client';

import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/hooks/useAuth';
import ChatBot from '@/components/ai/ChatBot';

interface CustomerLayoutProps {
  children: React.ReactNode;
}

export const CustomerLayout: React.FC<CustomerLayoutProps> = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-brand-beige">
      <Header user={user} />
      <main className="flex-1">{children}</main>
      <Footer />
      <ChatBot />
    </div>
  );
};