'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/layout/AdminSidebar';
import AdminHeader from '@/components/layout/AdminHeader';
import MobileNav from '@/components/layout/MobileNav';
import { Lock, ShieldAlert } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasAuthStorage = localStorage.getItem('km_admin_auth') === 'true';
      const hasAuthCookie = document.cookie.includes('km_admin_session=authenticated');

      if (hasAuthStorage || hasAuthCookie) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        router.replace('/login?unauthorized=true');
      }
    }
  }, [router]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-stone-950 text-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-bold text-amber-200 uppercase tracking-widest">Checking Admin Security...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-stone-950 text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black">Admin Access Restricted</h2>
        <p className="text-xs text-amber-200/70 max-w-sm">You must log in with Mess Admin credentials to view this page.</p>
        <a 
          href="/login"
          className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs transition"
        >
          Go to Admin Login
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-slate-900 flex font-sans antialiased">
      <AdminSidebar />

      {/* Mobile Slide-Over Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" 
            onClick={() => setMobileMenuOpen(false)} 
          />
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl z-10 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-amber-100">
              <span className="font-black text-slate-900 text-sm">Navigation Menu</span>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg bg-amber-50 text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto" onClick={() => setMobileMenuOpen(false)}>
              <AdminSidebar />
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        <AdminHeader onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {children}
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
