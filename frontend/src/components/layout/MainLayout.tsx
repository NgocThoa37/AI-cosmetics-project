'use client';

import React from 'react';
import Header from './Header';
import { Footer } from './Footer';
import { useAuth } from '@/hooks/useAuth';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import ChatBot from '@/components/ai/ChatBot';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user: adminUser } = useAuth();
  const { user: customerUser } = useCustomerAuth();

  // ✅ Ưu tiên customer user, nếu không có thì dùng admin user
  const user = customerUser || adminUser;

  return (
    <div className="min-h-screen flex flex-col bg-brand-beige">
      <Header user={user} />
      <main className="flex-1">{children}</main>
      <Footer />
      <ChatBot />
    </div>
  );
};

export default MainLayout;