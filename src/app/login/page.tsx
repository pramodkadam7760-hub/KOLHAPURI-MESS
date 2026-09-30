'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('unauthorized') === 'true') {
        toast.error('Access Denied: Please log in with Admin credentials to access the Admin ERP.');
      }
    }
  }, []);

  function setAdminSession() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('km_admin_auth', 'true');
      document.cookie = 'km_admin_session=authenticated; path=/; max-age=86400; SameSite=Lax';
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const inputUser = email.trim();
    const isLocalAdminUser = 
      inputUser.toUpperCase() === 'KOLHAPURIMESS' || 
      inputUser.toLowerCase() === 'admin@kolhapurimess.com' || 
      inputUser.toLowerCase() === 'admin';

    if (isLocalAdminUser) {
      if (password === 'KOLHAPURI@412002' || password === 'admin123') {
        setAdminSession();
        toast.success('Welcome back, Admin!');
        router.push('/admin/dashboard');
        setLoading(false);
        return;
      } else {
        toast.error('Invalid password for Kolhapuri Mess Admin.');
        setLoading(false);
        return;
      }
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: inputUser,
        password,
      });

      if (error) {
        toast.error(error.message || 'Invalid username or password.');
      } else {
        setAdminSession();
        toast.success('Logged in successfully');
        router.push('/admin/dashboard');
      }
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950 via-amber-900 to-orange-950 text-white flex items-center justify-center p-4 font-sans antialiased">
      <div className="w-full max-w-md bg-stone-900/90 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-8 space-y-6 shadow-2xl shadow-amber-950/80">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-600 to-orange-500 flex items-center justify-center text-white font-black text-2xl mx-auto shadow-xl shadow-orange-950/60 ring-4 ring-amber-500/30">
            KM
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white" style={{ fontFamily: 'var(--font-playfair, serif)' }}>
            Kolhapuri Mess Admin
          </h1>
          <p className="text-xs text-amber-200/80 font-medium">Sign in to manage student orders, billing, menu, and settlements.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-extrabold text-amber-100/90 block mb-1">Admin Username / Email</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-amber-400/80" />
              <input 
                type="text" 
                placeholder="e.g. KOLHAPURIMESS"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-stone-950/80 border border-amber-500/30 rounded-xl text-white text-sm font-medium placeholder-stone-500 focus:outline-none focus:border-amber-400 transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-extrabold text-amber-100/90 block mb-1">Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-amber-400/80" />
              <input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-stone-950/80 border border-amber-500/30 rounded-xl text-white text-sm font-medium placeholder-stone-500 focus:outline-none focus:border-amber-400 transition"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-stone-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-950/50 transition duration-200"
          >
            <span>{loading ? 'Signing in...' : 'Sign In to Admin ERP'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-amber-500/20 text-center flex flex-col gap-2">
          <a href="/" className="text-xs font-bold text-amber-300 hover:text-white inline-flex items-center justify-center gap-1">
            🌐 Back to Main Website
          </a>
          <a href="/portal" className="text-xs font-bold text-amber-400 hover:text-amber-300 hover:underline inline-flex items-center justify-center gap-1">
            Are you a student? Click here for Student Portal →
          </a>
        </div>
      </div>
    </div>
  );
}
