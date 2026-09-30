'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  Users, 
  UtensilsCrossed, 
  Receipt, 
  CreditCard, 
  UserMinus, 
  BarChart3, 
  Settings, 
  ExternalLink,
  ChefHat,
  Home,
  UserCheck,
  Clock,
  LogOut
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Live Order Queue', href: '/admin/orders', icon: Clock },
  { name: 'Daily Order Entry', href: '/admin/attendance', icon: UtensilsCrossed },
  { name: 'Students Roster', href: '/admin/students', icon: Users },
  { name: 'Online Registrations', href: '/admin/registrations', icon: UserCheck },
  { name: 'Menu & Prices', href: '/admin/menu', icon: ChefHat },
  { name: 'Monthly Bills', href: '/admin/billing', icon: Receipt },
  { name: 'Payments & Dues', href: '/admin/payments', icon: CreditCard },
  { name: 'Final Settlements', href: '/admin/settlements', icon: UserMinus },
  { name: 'Reports & Exports', href: '/admin/reports', icon: BarChart3 },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-amber-200/80 min-h-screen text-slate-700 shadow-sm">
      {/* Brand Header */}
      <div className="p-6 border-b border-amber-100 flex items-center gap-3 bg-gradient-to-b from-amber-50/50 to-white">
        <div className="relative w-11 h-11 rounded-full overflow-hidden border border-amber-300 shadow-md flex-shrink-0 bg-white">
          <Image 
            src="/images/kolhapuri_mess_logo_new.jpg" 
            alt="Kolhapuri Mess Logo" 
            fill 
            className="object-contain p-0.5"
          />
        </div>
        <div>
          <h1 className="font-extrabold text-slate-900 tracking-wide text-base leading-tight">Kolhapuri Mess</h1>
          <span className="text-[10px] text-amber-700 font-extrabold tracking-widest uppercase block">Admin ERP</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold text-amber-800/60 uppercase tracking-wider">
          Management
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-white shadow-md shadow-amber-500/20'
                  : 'hover:bg-amber-50/70 text-slate-600 hover:text-amber-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-amber-700/80'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Website & Logout Links */}
      <div className="p-4 border-t border-amber-100 bg-amber-50/40 space-y-2">
        <Link
          href="/"
          className="flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-amber-50 border border-amber-200/80 text-xs font-bold text-amber-800 shadow-sm transition"
        >
          <span className="flex items-center gap-2">
            <Home className="w-4 h-4 text-amber-600" />
            Main Website
          </span>
          <ExternalLink className="w-3.5 h-3.5 text-amber-600" />
        </Link>
        <button
          onClick={() => {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('km_admin_auth');
              document.cookie = 'km_admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
            }
            window.location.href = '/login';
          }}
          className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-bold text-rose-700 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
