'use client';

import { useState, useEffect } from 'react';
import { Calendar, Menu, Home, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';

export default function AdminHeader({ onMobileMenuToggle }: { onMobileMenuToggle?: () => void }) {
  const router = useRouter();
  const [todayDate, setTodayDate] = useState('');

  useEffect(() => {
    const d = new Date();
    setTodayDate(d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }));
  }, []);

  async function handleLogout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('km_admin_auth');
      document.cookie = 'km_admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    }
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (e) {
      // ignore
    }
    toast.success('Logged out from Admin ERP.');
    router.push('/login');
  }

  return (
    <header className="h-16 bg-white/95 backdrop-blur border-b border-amber-200/60 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-3">
        <button 
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-xl bg-amber-50 text-slate-700 hover:bg-amber-100"
        >
          <Menu className="w-5 h-5 text-amber-800" />
        </button>
        
        <div className="flex items-center gap-2 text-xs text-amber-900 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200/80 font-bold">
          <Calendar className="w-4 h-4 text-amber-600" />
          <span>{todayDate || 'Today'}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Quick Website & Portal Link */}
        <Link 
          href="/" 
          className="hidden sm:flex items-center gap-1.5 text-xs font-extrabold px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 transition"
        >
          <Home className="w-3.5 h-3.5 text-amber-600" />
          <span>Main Website</span>
        </Link>

        {/* User Info & Logout */}
        <div className="flex items-center gap-3 border-l border-amber-200/80 pl-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
            KM
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-extrabold text-slate-900 leading-tight">Mess Admin</p>
            <p className="text-[10px] text-amber-800 font-semibold">Kolhapuri Mess</p>
          </div>
          <button
            onClick={handleLogout}
            title="Log out from Admin ERP"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition ml-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
