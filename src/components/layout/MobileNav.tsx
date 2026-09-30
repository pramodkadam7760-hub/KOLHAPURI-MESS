'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, UtensilsCrossed, Users, Receipt, CreditCard, Clock } from 'lucide-react';

const MOBILE_NAV = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Queue', href: '/admin/orders', icon: Clock },
  { name: 'Order Entry', href: '/admin/attendance', icon: UtensilsCrossed },
  { name: 'Students', href: '/admin/students', icon: Users },
  { name: 'Payments', href: '/admin/payments', icon: CreditCard },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-amber-200/80 z-40 px-2 py-1 shadow-lg">
      <div className="flex items-center justify-around">
        {MOBILE_NAV.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs font-bold transition ${
                isActive ? 'text-amber-700 font-extrabold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-amber-600' : 'text-slate-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
