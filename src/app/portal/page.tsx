'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataService } from '@/lib/data-service';
import { UtensilsCrossed, Search, ArrowRight, ShieldCheck, QrCode, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentPortalLookupPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    const student = await DataService.getStudentByIdOrPhone(query);
    setLoading(false);

    if (student) {
      router.push(`/portal/${student.id}`);
    } else {
      toast.error('No student found matching this Student ID or Phone Number.');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950 via-amber-900 to-orange-950 text-amber-50 flex flex-col justify-between p-4 sm:p-8 font-sans antialiased">
      {/* Top Brand Header */}
      <div className="max-w-md mx-auto w-full pt-4 space-y-3">
        <div className="flex justify-between items-center">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900/90 border border-amber-500/30 text-xs font-bold text-amber-200 hover:text-white transition"
          >
            🌐 Main Website
          </a>
          <a
            href="/order"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-xs font-bold text-amber-300 hover:text-white transition"
          >
            🍱 Order Meal
          </a>
        </div>

        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-600 to-orange-500 flex items-center justify-center text-white font-black text-2xl mx-auto shadow-xl shadow-orange-950/60 ring-4 ring-amber-500/30">
          KM
        </div>
        <div className="space-y-1 text-center">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" /> Kolhapuri Mess
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight" style={{ fontFamily: 'var(--font-playfair, serif)' }}>
            Student Self-Service Portal
          </h1>
          <p className="text-xs text-amber-200/80 font-medium">View your monthly mess bill, itemized menu card with rates, and pay via Paytm UPI QR.</p>
        </div>
      </div>

      {/* Lookup Card */}
      <div className="max-w-md mx-auto w-full my-auto py-6 space-y-6">
        <div className="bg-stone-900/90 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-950/80 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold text-white">Find Your Mess Bill & Rates</h2>
            <p className="text-xs text-amber-200/70">Enter your Student ID (e.g. KM-101) or Registered Mobile Number</p>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-amber-400/80" />
              <input 
                type="text"
                placeholder="e.g. KM-101 or 9822101010"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-stone-950/80 border border-amber-500/30 rounded-2xl text-white text-base font-medium placeholder-stone-500 focus:outline-none focus:border-amber-400 shadow-inner"
                required
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-stone-950 font-black text-base shadow-xl shadow-amber-950/50 flex items-center justify-center gap-2 transition duration-200"
            >
              <span>{loading ? 'Searching...' : 'View My Bill & Menu Card'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="pt-4 border-t border-amber-500/20 text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-xs text-amber-200/80 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Official Paytm Business UPI Payment Portal</span>
            </div>
            <p className="text-[11px] text-amber-300/60 font-medium">Payee: SUVARNA KADAM • Kolhapuri Mess</p>
          </div>
        </div>

        {/* Quick Rate Glance Card */}
        <div className="bg-amber-950/40 border border-amber-500/20 rounded-2xl p-4 text-center space-y-2">
          <p className="text-xs font-bold text-amber-300 flex items-center justify-center gap-1.5">
            <UtensilsCrossed className="w-3.5 h-3.5 text-amber-400" /> Quick Mess Rates Glance:
          </p>
          <div className="grid grid-cols-3 gap-2 text-[11px] font-semibold text-amber-100/90">
            <div className="bg-stone-900/60 p-2 rounded-xl border border-amber-500/20">
              <span className="text-amber-400 block text-[10px]">Veg Thali</span>
              ₹70 / meal
            </div>
            <div className="bg-stone-900/60 p-2 rounded-xl border border-amber-500/20">
              <span className="text-amber-400 block text-[10px]">Chicken Thali</span>
              ₹150 / meal
            </div>
            <div className="bg-stone-900/60 p-2 rounded-xl border border-amber-500/20">
              <span className="text-amber-400 block text-[10px]">Egg Thali</span>
              ₹70 - ₹80
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-amber-300/50 py-4 font-medium">
        Kolhapuri Mess — Homestyle Maharashtrian Meals • Belagavi
      </footer>
    </div>
  );
}
