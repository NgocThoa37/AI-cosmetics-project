'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, KeyRound, ShoppingBag, Star } from 'lucide-react'; // ✅ Đã bỏ MapPin

const menuItems = [
  { href: '/account/profile', icon: User, label: 'Hồ sơ cá nhân' },
  // ❌ Đã xóa: { href: '/account/addresses', icon: MapPin, label: 'Địa chỉ giao hàng' },
  { href: '/account/change-password', icon: KeyRound, label: 'Đổi mật khẩu' },
  { href: '/account/orders', icon: ShoppingBag, label: 'Đơn hàng của tôi' },
  { href: '/account/reviews', icon: Star, label: 'Đánh giá của tôi' },
];

export default function AccountSidebar() {
  const pathname = usePathname();

  return (
    <aside className="lg:col-span-1">
      <div className="bg-[#FAF8F5] border border-brand-warm rounded-2xl p-5 sticky top-24">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  isActive 
                    ? 'bg-brand-accent text-white' 
                    : 'text-brand-dark/70 hover:bg-brand-sand hover:text-brand-dark'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} />
                  <span>{item.label}</span>
                </div>
                {!isActive && <span>›</span>}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}