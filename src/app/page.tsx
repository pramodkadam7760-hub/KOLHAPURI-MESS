'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { DataService } from '@/lib/data-service';
import { Student, Bill } from '@/lib/types';
import { MESS_DETAILS, UPI_DETAILS, WEBSITE_THALI_CATEGORIES, INITIAL_MENU_ITEMS } from '@/lib/constants';
import {
  UtensilsCrossed,
  Sparkles,
  Truck,
  ShieldCheck,
  QrCode,
  PhoneCall,
  MapPin,
  Clock,
  Search,
  ChefHat,
  User,
  Lock,
  Mail,
  Menu as MenuIcon,
  X,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  Phone,
  Flame,
  Award,
  Heart,
  Star,
  Leaf,
  ChevronLeft,
  ChevronRight,
  Play,
  Receipt,
  Package,
  PartyPopper,
  Building2,
  GraduationCap,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Intersection Observer Hook for scroll reveal ────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    // Small delay so all elements are mounted before we observe
    const timer = setTimeout(() => {
      const elements = document.querySelectorAll('.reveal-on-scroll, .reveal-left, .reveal-right, .reveal-scale');
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target); // stop watching after reveal
            }
          });
        },
        { threshold: 0.05, rootMargin: '0px 0px 0px 0px' }
      );
      elements.forEach((el) => {
        observer.observe(el);
      });

      // Fallback timer so elements are GUARANTEED to show on mobile browsers
      const fallback = setTimeout(() => {
        elements.forEach((el) => el.classList.add('is-visible'));
      }, 300);

      return () => {
        observer.disconnect();
        clearTimeout(fallback);
      };
    }, 100);
    return () => clearTimeout(timer);
  }, []);
}

// ─── Typewriter Hook for Cycling Taglines (#12) ──────────────────────────────
const TYPEWRITER_TAGLINES = [
  'Authentic Homestyle Maharashtrian Meals',
  'Signature Tambda & Pandhra Rassa Specials',
  'Hot & Fresh Hostel Delivery to Your Door',
];

function useTypewriter(phrases: string[], typingSpeed = 60, deletingSpeed = 35, pauseMs = 2200) {
  const [displayText, setDisplayText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];
    let timeout: NodeJS.Timeout;

    if (!isDeleting && charIndex < currentPhrase.length) {
      // Typing forward
      timeout = setTimeout(() => {
        setDisplayText(currentPhrase.slice(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      }, typingSpeed + Math.random() * 30);
    } else if (!isDeleting && charIndex === currentPhrase.length) {
      // Pause at end of phrase
      timeout = setTimeout(() => setIsDeleting(true), pauseMs);
    } else if (isDeleting && charIndex > 0) {
      // Deleting backward
      timeout = setTimeout(() => {
        setDisplayText(currentPhrase.slice(0, charIndex - 1));
        setCharIndex(charIndex - 1);
      }, deletingSpeed);
    } else if (isDeleting && charIndex === 0) {
      // Move to next phrase
      setIsDeleting(false);
      setPhraseIndex((phraseIndex + 1) % phrases.length);
    }

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, phraseIndex, phrases, typingSpeed, deletingSpeed, pauseMs]);

  return displayText;
}

// ─── Button Ripple Effect Helper (#6) ────────────────────────────────────────
function createRipple(e: React.MouseEvent<HTMLElement>) {
  const btn = e.currentTarget;
  const circle = document.createElement('span');
  const diameter = Math.max(btn.clientWidth, btn.clientHeight);
  const radius = diameter / 2;
  const rect = btn.getBoundingClientRect();

  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${e.clientX - rect.left - radius}px`;
  circle.style.top = `${e.clientY - rect.top - radius}px`;
  circle.classList.add('ripple-circle');

  // Remove any old ripple
  const existing = btn.querySelector('.ripple-circle');
  if (existing) existing.remove();

  btn.appendChild(circle);
  // Auto-cleanup
  setTimeout(() => circle.remove(), 700);
}

// ─── Animated Counter Hook ───────────────────────────────────────────────────
function useCounter(target: number, duration: number = 2000, start: boolean = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(target);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

// ─── Thali Counter Section ───────────────────────────────────────────────────
function AnimatedCounter({ target, suffix, label }: { target: number; suffix: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const count = useCounter(target, 2200, started);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setStarted(true); observer.disconnect(); }
    }, { threshold: 0.05 });
    observer.observe(el);

    // Fallback timer so counter animation starts on mobile even without scroll
    const fallbackTimer = setTimeout(() => {
      setStarted(true);
    }, 300);

    return () => {
      observer.disconnect();
      clearTimeout(fallbackTimer);
    };
  }, []);

  return (
    <div ref={ref} className={`reveal-scale ${started ? 'is-visible' : ''} flex flex-col items-center justify-center text-center w-full`}>
      <div className="text-4xl sm:text-5xl md:text-6xl font-black text-amber-700 bg-clip-text text-transparent bg-gradient-to-br from-amber-600 via-amber-500 to-yellow-600 tabular-nums leading-tight tracking-tight">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="mt-2 text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider max-w-[220px] leading-snug">{label}</div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function KolhapuriMessWebsite() {
  const router = useRouter();

  // Nav & Modals
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Thali carousel
  const [activeThaliIdx, setActiveThaliIdx] = useState(0);
  const [thaliTransitioning, setThaliTransitioning] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Student Login
  const [studentQuery, setStudentQuery] = useState('');
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [studentBill, setStudentBill] = useState<Bill | null>(null);
  const [searchingStudent, setSearchingStudent] = useState(false);
  const [studentModalTab, setStudentModalTab] = useState<'bill' | 'menu'>('bill');

  // Admin Login
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);

  const [scrollPercent, setScrollPercent] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useScrollReveal();

  // #12 — Typewriter tagline cycling
  const typewriterText = useTypewriter(TYPEWRITER_TAGLINES, 55, 30, 2400);

  // Scroll detection for navbar and scroll-driven progress bar
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60);
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolledRatio = height > 0 ? (winScroll / height) * 100 : 0;
      setScrollPercent(scrolledRatio);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Cursor Glow Spotlight ──────────────────────────────────────────────────
  useEffect(() => {
    const glow = document.getElementById('cursor-glow');
    if (!glow) return;
    const onMove = (e: MouseEvent) => {
      glow.style.background = `radial-gradient(600px at ${e.clientX}px ${e.clientY}px, rgba(245,158,11,0.09) 0%, transparent 75%)`;
    };
    const onEnter = () => { glow.style.opacity = '1'; };
    const onLeave = () => { glow.style.opacity = '0'; };
    window.addEventListener('mousemove', onMove, { passive: true });
    document.documentElement.addEventListener('mouseenter', onEnter);
    document.documentElement.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.documentElement.removeEventListener('mouseenter', onEnter);
      document.documentElement.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  // ── Stagger Card Observer ──────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              (entry.target as HTMLElement).style.animationPlayState = 'running';
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.06, rootMargin: '0px 0px -40px 0px' }
      );
      document.querySelectorAll('.card-stagger').forEach((el) => {
        (el as HTMLElement).style.animationPlayState = 'paused';
        observer.observe(el);
      });
      return () => observer.disconnect();
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  // Auto-advance thali carousel
  const goToThali = useCallback((idx: number) => {
    setThaliTransitioning(true);
    setTimeout(() => {
      setActiveThaliIdx(idx);
      setThaliTransitioning(false);
    }, 250);
  }, []);

  useEffect(() => {
    autoPlayRef.current = setInterval(() => {
      setActiveThaliIdx((prev) => {
        const next = (prev + 1) % WEBSITE_THALI_CATEGORIES.length;
        goToThali(next);
        return prev; // goToThali handles the update
      });
    }, 4000);
    return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); };
  }, [goToThali]);

  const selectedThali = WEBSITE_THALI_CATEGORIES[activeThaliIdx];

  // Student login handler
  async function handleStudentLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!studentQuery.trim()) return;
    setSearchingStudent(true);
    const std = await DataService.getStudentByIdOrPhone(studentQuery.trim());
    if (std) {
      toast.success(`Welcome ${std.name}! 🎓`);
      setSearchingStudent(false);
      setStudentModalOpen(false);
      // Redirect to full dedicated student portal page
      router.push(`/portal/${std.student_id}`);
      return;
    } else {
      toast.error('Student ID or mobile number not found.');
    }
    setSearchingStudent(false);
  }

  // Admin login handler
  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    setAdminLoading(true);
    await new Promise(r => setTimeout(r, 600));
    toast.success('Access Granted! Welcome.');
    router.push('/admin/dashboard');
    setAdminLoading(false);
  }

  const balanceOwed = studentBill ? (studentBill.total_amount - (studentBill.paid_amount || 0)) : 0;
  const upiUri = `upi://pay?pa=${UPI_DETAILS.upiId}&pn=${encodeURIComponent(UPI_DETAILS.payeeName)}&am=${balanceOwed > 0 ? balanceOwed : 0}&cu=INR`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiUri)}`;

  // Marquee text items
  const marqueeItems = [
    '🎓 1,000+ Happy Students Served', '🌶 Kolhapuri Tambda Rassa', '🍗 Chicken Full Thali',
    '🫓 Fresh Hot Chapatis', '🐑 Mutton Pandhra Rassa', '⭐ 4.9★ Rated in Belagavi',
    '🥗 Veg Thali', '🥚 Egg Bhurji Special', '🏠 Hostel Parcel Delivery',
    '⚡ Daily Fresh Cooking', '🌿 Homestyle Masalas', '💛 Authentic Maharashtrian Taste',
    '🔥 Traditional Spices', '✅ 100% Hygienic Kitchen', '📦 Bulk & Party Orders Available',
  ];

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-slate-900 antialiased selection:bg-amber-300/60 selection:text-amber-950" style={{ fontFamily: 'var(--font-inter, Inter, system-ui, sans-serif)' }}>

      {/* ──────── CURSOR GLOW SPOTLIGHT ──────── */}
      <div id="cursor-glow" aria-hidden="true" />

      {/* ──────── SCROLL-DRIVEN PROGRESS BAR ──────── */}
      <div id="scroll-progress" style={{ width: `${scrollPercent}%` }} />

      {/* ──────── FLOATING WHATSAPP BUTTON ──────── */}
      <a
        href={MESS_DETAILS.whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 group"
        title="Chat on WhatsApp"
      >
        <div className="relative flex items-center gap-2 px-4 py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-2xl shadow-emerald-600/40 transition-all duration-300 hover:scale-110 hover:pr-5">
          <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-30 group-hover:opacity-0" />
          <MessageCircle className="w-5 h-5 relative z-10" />
          <span className="relative z-10 text-xs font-black hidden group-hover:inline whitespace-nowrap">Chat on WhatsApp</span>
        </div>
      </a>

      {/* ──────── STICKY NAVBAR ──────── */}
      <header className={`sticky top-0 z-40 transition-all duration-500 ${scrolled ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-amber-500/8 border-b border-amber-200/60' : 'bg-transparent border-b border-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">

          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400/80 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-300 flex-shrink-0 bg-white">
              <Image 
                src="/images/kolhapuri_mess_logo_new.jpg" 
                alt="Kolhapuri Mess Logo" 
                fill 
                className="object-contain p-0.5" 
              />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-black text-slate-900 tracking-wider text-lg" style={{ fontFamily: 'var(--font-playfair, serif)' }}>
                KOLHAPURI MESS
              </span>
              <span className="text-[10px] text-amber-700 font-extrabold tracking-[0.2em] uppercase">
                Authentic Maharashtrian Meals
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden xl:flex items-center gap-5 text-xs lg:text-sm font-extrabold text-slate-600">
            {['About Us', 'Our Thalis', 'Timings', 'Gallery', 'Bulk Orders', 'Location'].map((label, i) => (
              <a
                key={label}
                href={['#about', '#thali-menu', '#timings', '#gallery', '#bulk-orders', '#location'][i]}
                className="nav-link hover:text-amber-700 transition-colors duration-200 py-1"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-2.5 ml-6 xl:ml-10 pl-6 border-l border-amber-300/60">
            <Link
              href="/order"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-extrabold text-xs shadow-md transition-all duration-200 hover:scale-105"
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              Order Meal Online
            </Link>
            <Link
              href="/portal"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-extrabold transition-all duration-200 hover:border-amber-400"
            >
              <User className="w-3.5 h-3.5 text-amber-600" />
              Student Portal
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 rounded-xl bg-amber-50 text-slate-700 hover:bg-amber-100 border border-amber-200 transition"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-amber-800" /> : <MenuIcon className="w-5 h-5 text-amber-800" />}
          </button>
        </div>
      </header>

      {/* Mobile Slide-over Drawer Side Section */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          {/* Dark Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)} 
          />

          {/* Side Drawer Panel */}
          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto z-10 border-l border-amber-200">
            <div>
              <div className="flex items-center justify-between border-b border-amber-100 pb-4 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-black text-sm shadow">
                    KM
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm">Kolhapuri Mess</h3>
                    <p className="text-[10px] text-amber-700 font-bold uppercase">Nath Pai Circle, Belagavi</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl bg-amber-50 text-slate-700 hover:bg-amber-100 border border-amber-200 font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2.5">
                <Link 
                  href="/order" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-black text-sm shadow-md flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">🚀 Order Meal / Parcel</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>

                <Link 
                  href="/portal" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="w-full py-3.5 px-4 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-black text-sm flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">🎓 Student Bill Ledger</span>
                  <ChevronRight className="w-4 h-4 text-amber-600" />
                </Link>

                <div className="py-2 border-t border-amber-100 my-3 space-y-1">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider px-3 mb-1.5">Quick Navigation</p>
                  {[
                    ['About Us', '#about'], 
                    ['Our Thalis', '#thali-menu'], 
                    ['Mess Plans', '#plans'], 
                    ['Location & Directions', '#location']
                  ].map(([label, href]) => (
                    <a 
                      key={label} 
                      href={href} 
                      onClick={() => setMobileMenuOpen(false)} 
                      className="flex items-center justify-between py-3 px-3 rounded-xl text-sm font-bold text-slate-800 hover:bg-amber-50 transition"
                    >
                      <span>{label}</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-amber-100">
              <a
                href="tel:7676866399"
                className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2"
              >
                📞 Call Helpline: 7676866399
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          1. HERO SECTION — Dynamic, animated, cinematic
         ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden min-h-[92vh] flex items-center hero-bg-animated">

        {/* Big glow orbs */}
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 70%)', animation: 'pulse-glow 5s ease-in-out infinite' }} />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.14) 0%, transparent 70%)', animation: 'pulse-glow 7s ease-in-out infinite 2s' }} />

        {/* Rotating decorative rings */}
        <div className="absolute top-16 right-24 w-64 h-64 rounded-full border border-amber-300/20 animate-spin-slow pointer-events-none hidden lg:block" />
        <div className="absolute top-24 right-32 w-44 h-44 rounded-full border border-amber-400/15 animate-spin-reverse pointer-events-none hidden lg:block" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

            {/* ── LEFT: Text Content ── */}
            <div className="lg:col-span-7 space-y-7 text-center lg:text-left">

              {/* Top Badge */}
              <div className="animate-fade-up inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full glass border border-amber-300/60 text-amber-900 text-xs font-black uppercase tracking-widest shadow-lg shadow-amber-500/10">
                <Flame className="w-4 h-4 text-red-500 animate-flame" />
                Nath Pai Circle • Shahapur, Belagavi
                <Sparkles className="w-4 h-4 text-amber-600" />
              </div>

              {/* Main Headline */}
              <div className="animate-slide-in-left delay-100">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.08] tracking-tight" style={{ fontFamily: 'var(--font-playfair, serif)' }}>
                  <span className="block text-slate-900">Authentic</span>
                  <span className="block text-shimmer py-1">Kolhapuri</span>
                  <span className="block text-slate-800">Homestyle</span>
                  <span className="block text-3xl sm:text-4xl lg:text-5xl font-black text-amber-700 mt-1" style={{ fontFamily: 'var(--font-inter, sans-serif)' }}>
                    Meals ✦ Cooked Fresh Daily
                  </span>
                  {/* #12 — Typewriter tagline */}
                  <span className="block text-base sm:text-lg font-bold text-amber-600/80 mt-3 h-7" style={{ fontFamily: 'var(--font-inter, sans-serif)' }}>
                    {typewriterText}<span className="typewriter-cursor" />
                  </span>
                </h1>
              </div>

              {/* Animated golden divider */}
              <div className="animate-fade-up delay-300 flex justify-center lg:justify-start">
                <div className="gold-divider" style={{ width: '80px', animation: 'hero-line-grow 1.2s 0.5s ease forwards', opacity: 0 }} />
              </div>

              {/* Subtext */}
              <p className="animate-fade-up delay-400 text-slate-600 text-lg max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
                Welcome to <strong className="text-amber-800 font-extrabold">Kolhapuri Mess</strong> — Belagavi's favourite destination for authentic Maharashtrian thalis. Tambda Rassa, Pandhra Rassa, Jowar Bhakri, fresh chapatis — every dish cooked with love.
              </p>

              {/* Feature pills */}
              <div className="animate-fade-up delay-500 flex flex-wrap gap-2.5 justify-center lg:justify-start">
                {[
                  { icon: Truck, label: 'Hostel Parcel Delivery' },
                  { icon: Heart, label: 'Homestyle Cooking' },
                  { icon: Leaf, label: 'Fresh Daily' },
                  { icon: Award, label: 'Authentic Maharashtrian Spices' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-amber-200 text-xs font-bold text-slate-700 shadow-sm hover:border-amber-400 hover:bg-amber-50 transition-all duration-200">
                    <Icon className="w-3.5 h-3.5 text-amber-600" />
                    {label}
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="animate-fade-up delay-600 flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <a
                  href="#thali-menu"
                  className="ripple-btn relative group px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-white font-black text-sm shadow-xl shadow-amber-500/30 overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/40"
                  onClick={(e) => createRipple(e)}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                  <span className="relative flex items-center gap-2">
                    <UtensilsCrossed className="w-4 h-4" /> Explore Our Thalis
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </a>
                <button
                  onClick={(e) => { createRipple(e); setStudentModalOpen(true); }}
                  className="ripple-btn px-8 py-4 rounded-2xl bg-white/90 backdrop-blur-sm hover:bg-white border-2 border-amber-300 hover:border-amber-500 text-amber-950 font-extrabold text-sm flex items-center gap-2 shadow-md transition-all duration-300 hover:scale-105"
                >
                  <QrCode className="w-4 h-4 text-amber-600" /> View My Bill
                </button>
              </div>

              {/* Contact bar */}
              <div className="animate-fade-up delay-700 pt-4 border-t border-amber-200/60 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-bold text-slate-600">
                {MESS_DETAILS.callPhones.map(phone => (
                  <a key={phone} href={`tel:${phone}`} className="flex items-center gap-1.5 text-amber-900 hover:text-amber-700 transition group">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition">
                      <Phone className="w-3.5 h-3.5 text-amber-700" />
                    </div>
                    {phone}
                  </a>
                ))}
                <a href={MESS_DETAILS.whatsappLink} target="_blank" className="flex items-center gap-1.5 text-emerald-700 hover:text-emerald-600 transition group">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                  </div>
                  WhatsApp
                </a>
              </div>
            </div>

            {/* ── RIGHT: Interactive Thali Showcase ── */}
            <div className="lg:col-span-5 animate-scale-in delay-300">
              <div className="relative mx-auto max-w-sm lg:max-w-none">

                {/* Main image card */}
                <div className="relative rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl shadow-amber-500/20 animate-pulse-glow-gold group">
                  <div className={`transition-opacity duration-300 ${thaliTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                    <Image
                      src={selectedThali.image}
                      alt={selectedThali.name}
                      width={620}
                      height={650}
                      className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                      priority
                    />
                  </div>

                  {/* ── STEAM WISPS — rising hot food effect ── */}
                  <div aria-hidden="true">
                    <div className="steam-wisp steam-wisp-1" />
                    <div className="steam-wisp steam-wisp-2" />
                    <div className="steam-wisp steam-wisp-3" />
                    <div className="steam-wisp steam-wisp-4" />
                    <div className="steam-wisp steam-wisp-5" />
                  </div>

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                  {/* Bottom info overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className={`transition-all duration-300 ${thaliTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                      <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest">{selectedThali.tagline}</span>
                      <h3 className="text-2xl font-black text-white mt-1" style={{ fontFamily: 'var(--font-playfair, serif)' }}>{selectedThali.name}</h3>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {selectedThali.highlights.map(h => (
                          <span key={h} className="px-2.5 py-1 rounded-lg glass-dark text-amber-200 text-[10px] font-bold border border-amber-500/30">
                            ✦ {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Dot indicators */}
                  <div className="absolute top-4 right-4 flex gap-1.5">
                    {WEBSITE_THALI_CATEGORIES.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); goToThali(i); }}
                        className={`h-2 rounded-full transition-all duration-300 ${i === activeThaliIdx ? 'w-6 bg-amber-400' : 'w-2 bg-white/50 hover:bg-white/80'}`}
                      />
                    ))}
                  </div>

                  {/* Arrow controls */}
                  <button
                    onClick={() => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); goToThali((activeThaliIdx - 1 + WEBSITE_THALI_CATEGORIES.length) % WEBSITE_THALI_CATEGORIES.length); }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full glass-dark flex items-center justify-center text-white hover:bg-amber-500/80 transition opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); goToThali((activeThaliIdx + 1) % WEBSITE_THALI_CATEGORIES.length); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full glass-dark flex items-center justify-center text-white hover:bg-amber-500/80 transition opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Floating badges */}
                <div className="absolute -top-5 -left-5 animate-float">
                  <div className="glass border border-amber-300/60 rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900">100% Hygienic</p>
                      <p className="text-[10px] text-slate-500 font-semibold">Homestyle Quality</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -right-4 animate-float-delay">
                  <div className="glass border border-amber-300/60 rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
                      <Truck className="w-5 h-5 text-amber-700" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900">Hostel Delivery</p>
                      <p className="text-[10px] text-amber-700 font-bold">₹10/day Extra</p>
                    </div>
                  </div>
                </div>

                <div className="absolute top-1/2 -right-6 -translate-y-1/2 animate-float-slow hidden xl:block">
                  <div className="glass border border-red-300/40 rounded-2xl px-3 py-2.5 shadow-lg flex items-center gap-2">
                    <Flame className="w-5 h-5 text-red-500 animate-flame" />
                    <div>
                      <p className="text-xs font-black text-slate-900">Spicy &amp; Fresh</p>
                      <p className="text-[10px] text-slate-500">Kolhapuri Style</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          2. MARQUEE RUNNING TEXT STRIP
         ═══════════════════════════════════════════════════════════════════════ */}
      <div className="py-4 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 overflow-hidden">
        <div className="marquee-wrapper">
          <div className="marquee-track animate-marquee">
            {[...marqueeItems, ...marqueeItems].map((item, i) => (
              <span key={i} className="inline-flex items-center gap-3 px-6 text-white font-extrabold text-sm whitespace-nowrap">
                {item}
                <span className="text-amber-200 text-xs">✦</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          3. ANIMATED STATS SECTION
         ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-14 relative overflow-hidden bg-gradient-to-b from-amber-50/40 via-amber-100/20 to-[#FFFDF9]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px gold-divider" />
          <div className="absolute bottom-0 left-0 right-0 h-px gold-divider" />
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center items-center justify-center">
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/90 border border-amber-200/80 shadow-sm hover:shadow-md hover:border-amber-400 transition-all duration-300">
              <AnimatedCounter target={1000} suffix="+" label="Happy Students & Customers" />
            </div>
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/90 border border-amber-200/80 shadow-sm hover:shadow-md hover:border-amber-400 transition-all duration-300">
              <AnimatedCounter target={5} suffix="+" label="Years of Authentic Trust" />
            </div>
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/90 border border-amber-200/80 shadow-sm hover:shadow-md hover:border-amber-400 transition-all duration-300">
              <AnimatedCounter target={100} suffix="%" label="Fresh Daily Homestyle Cooking" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          4. THALI SHOWCASE — Interactive 4-card grid with 3D tilt
         ═══════════════════════════════════════════════════════════════════════ */}
      <section id="thali-menu" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16 reveal-on-scroll">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-300/80 text-amber-900 text-xs font-black uppercase tracking-widest">
            <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-600" /> Mess Specialities
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'var(--font-playfair, serif)' }}>
            Our Special <span className="text-shimmer">Thali Varieties</span>
          </h2>
          <p className="text-base text-slate-600 font-medium leading-relaxed">
            Prepared fresh daily with authentic Kolhapuri spices, hot chapatis or jowar bhakris, rich rassa, and love.
          </p>
          <div className="flex justify-center"><div className="gold-divider w-20 h-0.5" /></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {WEBSITE_THALI_CATEGORIES.map((thali, i) => (
            <div
              key={thali.id}
              onClick={() => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); goToThali(i); }}
              className={`card-stagger stagger-d${i} tilt-card bg-white border-2 rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 group ${
                activeThaliIdx === i
                  ? 'border-amber-400 ring-4 ring-amber-400/20 shadow-2xl shadow-amber-500/20 scale-[1.02]'
                  : 'border-amber-100 hover:border-amber-300 shadow-lg hover:shadow-xl'
              }`}
            >
              {/* Image area */}
              <div className="relative h-52 overflow-hidden">
                <Image
                  src={thali.image}
                  alt={thali.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-900/70 backdrop-blur-sm text-amber-300 font-extrabold text-[10px] uppercase tracking-widest">
                    {thali.name}
                  </span>
                </div>
                {activeThaliIdx === i && (
                  <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center shadow-lg animate-badge-pop">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5 space-y-3">
                <div>
                  <h3 className="text-lg font-black text-slate-900" style={{ fontFamily: 'var(--font-playfair, serif)' }}>{thali.name}</h3>
                  <p className="text-xs font-extrabold text-amber-700 mt-0.5">{thali.tagline}</p>
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-3">{thali.description}</p>
                <div className="pt-3 border-t border-amber-100 space-y-2">
                  {thali.highlights.map((h, hi) => (
                    <div key={hi} className="flex items-center gap-2 text-[11px] font-bold text-slate-700">
                      <div className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-2.5 h-2.5 text-amber-600" />
                      </div>
                      {h}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA below thalis */}
        <div className="mt-10 text-center reveal-on-scroll">
          <button
            onClick={() => setStudentModalOpen(true)}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-white font-black text-sm shadow-xl shadow-amber-500/25 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/35 transition-all duration-300"
          >
            <QrCode className="w-4 h-4" /> Check My Mess Bill Online
          </button>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          5. ABOUT & WHY CHOOSE US — with icon animations
         ═══════════════════════════════════════════════════════════════════════ */}
      <section id="about" className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0F0A00 0%, #1C1000 40%, #0F0700 100%)' }}>

        {/* Decorative gold rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-amber-600/10 animate-spin-slow pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full border border-amber-500/15 animate-spin-reverse pointer-events-none" />
        <div className="absolute top-1/4 right-10 w-48 h-48 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 reveal-on-scroll">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-900/40 border border-amber-600/40 text-amber-400 text-xs font-black uppercase tracking-widest mb-4">
              <Flame className="w-3.5 h-3.5 animate-flame" /> Why Kolhapuri Mess?
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight" style={{ fontFamily: 'var(--font-playfair, serif)' }}>
              Quality, Hygiene &amp; <span className="text-shimmer">Pure Taste</span>
            </h2>
            <p className="mt-4 text-amber-200/70 font-medium text-base leading-relaxed">
              We believe food is love. Every meal at Kolhapuri Mess is prepared with fresh ingredients, traditional masalas, and the care of a home kitchen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { emoji: '🍲', title: 'Fresh Daily Cooking', desc: 'Hot, freshly cooked meals prepared daily with authentic Maharashtrian taste.', stagger: 0 },
              { emoji: '🌶️', title: 'Authentic Kolhapuri Masalas', desc: 'Hand-ground spice blends and traditional recipes for an unforgettable Tambda-Pandhra Rassa.', stagger: 1 },
              { emoji: '🚚', title: 'Hostel Room Delivery', desc: 'Dinner parcels delivered to hostel rooms for groups of min. 5 hostel students. Dinner only.', stagger: 2 },
              { emoji: '📱', title: 'Digital Bill & UPI Pay', desc: 'Check your itemized bill online anytime. Pay via Paytm UPI QR with one scan.', stagger: 3 },
            ].map(({ emoji, title, desc, stagger }) => (
              <div
                key={title}
                className={`card-stagger stagger-d${stagger} group p-7 rounded-3xl border border-amber-800/30 hover:border-amber-600/60 transition-all duration-400 cursor-default`}
                style={{ background: 'rgba(20,12,0,0.6)', backdropFilter: 'blur(12px)' }}
              >
                <div className="text-4xl mb-5 group-hover:scale-125 transition-transform duration-300 inline-block">{emoji}</div>
                <h3 className="font-black text-white text-base mb-2">{title}</h3>
                <p className="text-amber-200/60 text-sm font-medium leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          6. SECOND MARQUEE (reversed)
         ═══════════════════════════════════════════════════════════════════════ */}
      <div className="py-3 bg-slate-950 overflow-hidden border-y border-amber-900/40">
        <div className="marquee-wrapper">
          <div className="marquee-track animate-marquee-reverse">
            {[...marqueeItems, ...marqueeItems].map((item, i) => (
              <span key={i} className="inline-flex items-center gap-3 px-6 text-amber-400/80 font-bold text-xs whitespace-nowrap">
                {item}
                <span className="text-amber-700 text-[10px]">◆</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          7. STUDENT MESS PLAN SECTION
         ═══════════════════════════════════════════════════════════════════════ */}
      <section id="plans" className="py-24 bg-gradient-to-br from-amber-50 via-yellow-50/50 to-amber-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

            <div className="lg:col-span-7 space-y-8 reveal-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-amber-300 text-amber-900 text-xs font-black uppercase tracking-widest shadow-sm">
                Monthly Mess Enrollment
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'var(--font-playfair, serif)' }}>
                Itemized Billing +<br />
                <span className="text-shimmer">Hostel Room Delivery</span>
              </h2>
              <p className="text-slate-600 text-base font-medium leading-relaxed max-w-xl">
                No rigid fixed packages. You are billed only for the exact dishes you eat each day — Full Thali, Chicken, Mutton, Egg, or any item from our menu. Transparent, fair, and flexible.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: Truck, color: 'amber', title: 'Hostel Parcel Service', desc: 'Dinner only. Available for hostel students in groups of minimum 5 students.' },
                  { icon: ShieldCheck, color: 'emerald', title: '₹1,000 Security Deposit', desc: 'One-time refundable deposit. Applied against final bill when leaving.' },
                  { icon: QrCode, color: 'blue', title: 'Online Bill Access', desc: 'Check your current month bill anytime via Student Portal.' },
                  { icon: Award, color: 'purple', title: 'Per-Item Billing', desc: 'Billed for exactly what you order — daily dish tracking by staff.' },
                ].map(({ icon: Icon, color, title, desc }) => (
                  <div key={title} className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-amber-200/80 shadow-sm hover:shadow-md hover:border-amber-300 transition-all duration-300 group">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-${color}-100 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-5 h-5 text-${color}-600`} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{title}</h4>
                      <p className="text-xs text-slate-500 font-medium mt-1">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bill Portal Card */}
            <div className="lg:col-span-5 reveal-right">
              <div className="relative">
                {/* Glow behind card */}
                <div className="absolute -inset-4 rounded-[2.5rem] blur-2xl opacity-30" style={{ background: 'radial-gradient(circle, #F59E0B 0%, transparent 70%)' }} />
                <div className="relative bg-white rounded-[2rem] border-2 border-amber-300 shadow-2xl shadow-amber-500/15 overflow-hidden">
                  {/* Top gradient strip */}
                  <div className="h-2 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600" />
                  <div className="p-8 text-center space-y-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 text-white font-black text-2xl mx-auto flex items-center justify-center shadow-lg shadow-amber-500/30 animate-pulse-glow-gold">
                      KM
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900" style={{ fontFamily: 'var(--font-playfair, serif)' }}>Check Your Bill</h3>
                      <p className="text-sm text-slate-500 font-medium mt-1">Enter Student ID or Mobile number</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-sm text-slate-600 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0" /> View itemized daily meal log
                      </div>
                      <div className="flex items-center gap-3 p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-sm text-slate-600 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0" /> See total amount &amp; balance due
                      </div>
                      <div className="flex items-center gap-3 p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-sm text-slate-600 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0" /> Scan Paytm QR to pay instantly
                      </div>
                    </div>

                    <button
                      onClick={() => { setStudentModalOpen(true); setStudentData(null); }}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-white font-black text-base shadow-xl shadow-amber-500/25 hover:scale-105 hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <User className="w-5 h-5" /> Open Student Portal
                    </button>
                    <p className="text-[11px] text-slate-400 font-medium">Free access · No password needed · Just your ID or phone</p>

                    {/* New Student Registration */}
                    <div className="border-t border-slate-100 pt-3 text-center">
                      <p className="text-xs text-slate-500 mb-2">New student? Want to join?</p>
                      <a
                        href="/register"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold text-xs rounded-xl border border-emerald-200 transition"
                      >
                        📝 Fill Online Registration Form
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════════════════
          7.5 WHATSAPP COMMUNITY CTA SECTION
         ═══════════════════════════════════════════════════════════════════════ */}
      <section id="community" className="py-24 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#075E54] via-[#128C7E] to-[#25D366]" />
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%),
                              radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 40%)`
          }}
        />
        <div className="absolute top-8 left-8 w-32 h-32 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute bottom-12 right-16 w-48 h-48 rounded-full bg-white/5 blur-3xl" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left — Copy */}
            <div className="text-white">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/30 backdrop-blur-sm text-white text-xs font-black uppercase tracking-widest mb-6">
                <span className="w-2 h-2 rounded-full bg-[#A8FFD4] animate-pulse" />
                Join Our WhatsApp Community
              </div>

              <h2 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight mb-5"
                style={{ fontFamily: 'var(--font-playfair, serif)' }}>
                Stay Updated,{' '}
                <span className="text-[#A8FFD4]">Never Miss</span>{' '}
                a Meal 🍽️
              </h2>

              <p className="text-white/80 text-base font-medium leading-relaxed mb-8 max-w-lg">
                Join the <strong className="text-white">Kolhapuri Mess WhatsApp Group</strong> and get daily menu updates,
                holiday notices, special meal days, and fee reminders — straight to your phone.
              </p>

              <ul className="space-y-3 mb-10">
                {[
                  { emoji: '🥘', text: "Today's lunch & dinner menu — posted every morning" },
                  { emoji: '🎉', text: 'Special meal days & festival thali announcements' },
                  { emoji: '📅', text: 'Mess holiday & schedule change notices' },
                  { emoji: '💰', text: 'Fee reminders & payment confirmations' },
                  { emoji: '📣', text: 'Exclusive offers for monthly plan students' },
                ].map(({ emoji, text }) => (
                  <li key={text} className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0 mt-0.5">{emoji}</span>
                    <span className="text-white/85 text-sm font-semibold leading-snug">{text}</span>
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-5 text-white/60 text-xs font-bold flex-wrap">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#25D366]" />
                  Free to join
                </span>
                <span>•</span>
                <span>No spam, only mess updates</span>
                <span>•</span>
                <span>Leave anytime</span>
              </div>
            </div>

            {/* Right — CTA Card */}
            <div className="flex flex-col items-center lg:items-end">
              <div className="w-full max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl text-center">
                {/* WhatsApp animated icon */}
                <div className="relative mx-auto w-24 h-24 mb-6">
                  <div className="absolute inset-0 rounded-full bg-[#25D366]/30 animate-ping" />
                  <div className="relative w-24 h-24 rounded-full bg-[#25D366] shadow-2xl shadow-[#25D366]/50 flex items-center justify-center">
                    <svg viewBox="0 0 32 32" className="w-12 h-12 fill-white" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16.003 3C9.375 3 4 8.373 4 15c0 2.385.664 4.61 1.818 6.51L4 29l7.688-1.787A11.946 11.946 0 0 0 16.003 28C22.63 28 28 22.627 28 16S22.63 3 16.003 3Zm0 2.182c5.42 0 9.818 4.396 9.818 9.818 0 5.421-4.398 9.818-9.818 9.818a9.77 9.77 0 0 1-5.055-1.404l-.362-.22-3.76.875.918-3.646-.24-.378A9.77 9.77 0 0 1 6.185 15c0-5.422 4.397-9.818 9.818-9.818Zm-3.11 5.09c-.186 0-.486.07-.74.35-.255.278-.974.95-.974 2.317 0 1.367.997 2.688 1.136 2.874.139.186 1.944 3.07 4.762 4.182 2.818 1.112 2.818.74 3.327.693.509-.046 1.64-.67 1.872-1.318.231-.648.231-1.203.162-1.32-.07-.116-.255-.185-.532-.325-.278-.14-1.64-.812-1.895-.904-.255-.092-.44-.139-.625.139-.185.278-.717.904-.878 1.09-.162.185-.324.208-.601.07-.278-.14-1.172-.432-2.233-1.378-.825-.736-1.382-1.644-1.544-1.922-.162-.278-.017-.428.122-.567.124-.124.278-.324.416-.486.14-.162.186-.278.278-.463.093-.185.047-.347-.023-.486-.07-.139-.617-1.51-.856-2.065-.232-.556-.47-.463-.625-.463Z"/>
                    </svg>
                  </div>
                </div>

                <h3 className="text-white font-black text-xl mb-2" style={{ fontFamily: 'var(--font-playfair, serif)' }}>
                  Join Our WhatsApp Group
                </h3>
                <p className="text-white/70 text-sm font-medium mb-6 leading-relaxed">
                  Get daily menu updates &amp; mess notices instantly. Free &amp; easy.
                </p>

                <div className="flex items-center justify-center gap-2 mb-6 px-4 py-2.5 rounded-2xl bg-white/10 border border-white/20">
                  <span className="text-white/60 text-xs font-bold">📱</span>
                  <span className="text-white font-black tracking-widest text-sm">+91 {MESS_DETAILS.whatsappPhone}</span>
                </div>

                <a
                  href={MESS_DETAILS.whatsappGroupLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-[#25D366] hover:bg-[#1ebe5c] text-white font-black text-sm shadow-xl shadow-[#25D366]/30 hover:shadow-[#25D366]/50 hover:scale-105 active:scale-95 transition-all duration-300 mb-3"
                >
                  <svg viewBox="0 0 32 32" className="w-5 h-5 fill-white flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.003 3C9.375 3 4 8.373 4 15c0 2.385.664 4.61 1.818 6.51L4 29l7.688-1.787A11.946 11.946 0 0 0 16.003 28C22.63 28 28 22.627 28 16S22.63 3 16.003 3Zm0 2.182c5.42 0 9.818 4.396 9.818 9.818 0 5.421-4.398 9.818-9.818 9.818a9.77 9.77 0 0 1-5.055-1.404l-.362-.22-3.76.875.918-3.646-.24-.378A9.77 9.77 0 0 1 6.185 15c0-5.422 4.397-9.818 9.818-9.818Zm-3.11 5.09c-.186 0-.486.07-.74.35-.255.278-.974.95-.974 2.317 0 1.367.997 2.688 1.136 2.874.139.186 1.944 3.07 4.762 4.182 2.818 1.112 2.818.74 3.327.693.509-.046 1.64-.67 1.872-1.318.231-.648.231-1.203.162-1.32-.07-.116-.255-.185-.532-.325-.278-.14-1.64-.812-1.895-.904-.255-.092-.44-.139-.625.139-.185.278-.717.904-.878 1.09-.162.185-.324.208-.601.07-.278-.14-1.172-.432-2.233-1.378-.825-.736-1.382-1.644-1.544-1.922-.162-.278-.017-.428.122-.567.124-.124.278-.324.416-.486.14-.162.186-.278.278-.463.093-.185.047-.347-.023-.486-.07-.139-.617-1.51-.856-2.065-.232-.556-.47-.463-.625-.463Z"/>
                  </svg>
                  Join WhatsApp Group
                </a>

                <a
                  href={MESS_DETAILS.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/25 text-white/90 font-bold text-xs transition-all duration-300"
                >
                  💬 Chat Directly to Enquire
                </a>

                <p className="text-white/40 text-[10px] font-medium mt-4">
                  Tap the button above to open WhatsApp on your phone
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          8A. MEAL TIMINGS SECTION
         ═══════════════════════════════════════════════════════════════════════ */}
      <section id="timings" className="py-20 bg-gradient-to-b from-[#FFFDF9] to-amber-50/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 reveal-on-scroll">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black uppercase tracking-widest mb-4">
              <Clock className="w-3.5 h-3.5 text-amber-700" /> Serving Hours
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'var(--font-playfair, serif)' }}>
              When We <span className="text-shimmer">Serve</span>
            </h2>
            <p className="mt-4 text-slate-600 font-medium">Fresh meals served daily — on time, every time.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Lunch */}
            <div className="card-stagger stagger-d0 group relative overflow-hidden rounded-3xl border-2 border-amber-200 bg-white shadow-lg hover:shadow-2xl hover:shadow-amber-500/15 hover:border-amber-400 transition-all duration-400 p-8 text-center">
              <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-amber-50 group-hover:bg-amber-100 transition-colors duration-400" />
              <div className="relative">
                <div className="text-5xl mb-4">☀️</div>
                <h3 className="font-black text-slate-900 text-xl mb-1" style={{ fontFamily: 'var(--font-playfair, serif)' }}>Lunch</h3>
                <div className="text-3xl font-black text-amber-600 my-3">11:30 AM – 3:00 PM</div>
                <p className="text-sm text-slate-500 font-medium">Veg Thali served Mon–Sat. Timings may vary based on food availability.</p>
                <div className="mt-4 space-y-2">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-extrabold">
                    🍽️ Mon – Sun (Lunch Only)
                  </div>
                  <div className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs font-bold">
                    🥗 Veg only on Mon, Wed, Thu, Sat
                  </div>
                  <div className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold">
                    🍗 Non-Veg on Tue, Fri & Sun
                  </div>
                </div>
              </div>
            </div>

            {/* Dinner */}
            <div className="card-stagger stagger-d1 group relative overflow-hidden rounded-3xl border-2 border-slate-800 bg-gradient-to-br from-slate-900 to-slate-800 shadow-lg hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-400 p-8 text-center">
              <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-amber-900/20" />
              <div className="relative">
                <div className="text-5xl mb-4">🌙</div>
                <h3 className="font-black text-white text-xl mb-1" style={{ fontFamily: 'var(--font-playfair, serif)' }}>Dinner</h3>
                <div className="text-3xl font-black text-amber-400 my-3">7:00 – 10:00 PM</div>
                <p className="text-sm text-amber-200/70 font-medium">Hot dinner served at the mess. Timings subject to food availability.</p>
                <div className="mt-4 space-y-2">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-900/30 border border-amber-700/50 text-amber-400 text-xs font-extrabold">
                    🌙 Mon – Sat Only
                  </div>
                  <div className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl bg-red-900/30 border border-red-700/40 text-red-300 text-xs font-bold">
                    ⛔ No Dinner on Sundays
                  </div>
                </div>
              </div>
            </div>

            {/* Parcel Delivery */}
            <div className="card-stagger stagger-d2 group relative overflow-hidden rounded-3xl border-2 border-emerald-200 bg-white shadow-lg hover:shadow-2xl hover:shadow-emerald-500/15 hover:border-emerald-400 transition-all duration-400 p-8 text-center">
              <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-emerald-50 group-hover:bg-emerald-100 transition-colors duration-400" />
              <div className="relative">
                <div className="text-5xl mb-4">🛵</div>
                <h3 className="font-black text-slate-900 text-xl mb-1" style={{ fontFamily: 'var(--font-playfair, serif)' }}>Parcel Delivery</h3>
                <div className="text-3xl font-black text-emerald-600 my-3">Dinner Only</div>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">Dinner parcels delivered to your hostel room. Available for hostel students only — minimum group of <strong>5 students</strong> required.</p>
                <div className="mt-4 space-y-2">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold">
                    🏠 Hostel Students Only
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                    👥 Min. 5 Students Required
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Special note */}
          <div className="mt-8 reveal-on-scroll flex items-start gap-3 p-5 rounded-2xl bg-amber-50 border border-amber-200">
            <span className="text-xl flex-shrink-0">⚠️</span>
            <p className="text-sm font-semibold text-amber-900"><strong>Holiday Notice:</strong> Join our <a href={MESS_DETAILS.whatsappGroupLink} target="_blank" rel="noopener noreferrer" className="underline text-amber-700 hover:text-amber-600">WhatsApp group</a> for advance notice on mess holidays, special thali days, and schedule changes.</p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          8B. PHOTO GALLERY SECTION
         ═══════════════════════════════════════════════════════════════════════ */}
      <section id="gallery" className="py-20 bg-[#FFFDF9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 reveal-on-scroll">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black uppercase tracking-widest mb-4">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" /> Our Food Gallery
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'var(--font-playfair, serif)' }}>
              Taste It With <span className="text-shimmer">Your Eyes</span>
            </h2>
            <p className="mt-4 text-slate-600 font-medium">Every dish crafted fresh — see what awaits you at Kolhapuri Mess.</p>
          </div>

          {/* Masonry-style gallery grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {/* Large tile - Veg Thali */}
            <div className="col-span-2 row-span-2 card-stagger stagger-d0 group relative overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-500">
              <div className="relative h-72 md:h-full min-h-64">
                <Image src="/images/veg_thali_real.jpg" alt="Veg Thali" fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                  <span className="inline-block px-3 py-1 rounded-lg bg-amber-500 text-white text-xs font-black uppercase tracking-wider mb-2">🥗 Veg Thali</span>
                  <p className="text-white font-bold text-sm">Fresh Chapati, Veg Bhaji, Dal & Rice</p>
                </div>
              </div>
            </div>

            {/* Chicken Thali */}
            <div className="card-stagger stagger-d1 group relative overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-500">
              <div className="relative h-52 md:h-64">
                <Image src="/images/chicken_thali_real.jpg" alt="Chicken Thali" fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className="inline-block px-3 py-1 rounded-lg bg-red-600 text-white text-xs font-black uppercase tracking-wider">🍗 Chicken</span>
                </div>
              </div>
            </div>

            {/* Mutton Thali */}
            <div className="card-stagger stagger-d2 group relative overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-500">
              <div className="relative h-52 md:h-64">
                <Image src="/images/mutton_thali_real.jpg" alt="Mutton Thali" fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className="inline-block px-3 py-1 rounded-lg bg-amber-700 text-white text-xs font-black uppercase tracking-wider">🐑 Mutton</span>
                </div>
              </div>
            </div>

            {/* Egg Thali */}
            <div className="card-stagger stagger-d3 group relative overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-500">
              <div className="relative h-52">
                <Image src="/images/egg_thali_hero.png" alt="Egg Thali" fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className="inline-block px-3 py-1 rounded-lg bg-yellow-500 text-white text-xs font-black uppercase tracking-wider">🥚 Egg</span>
                </div>
              </div>
            </div>

            {/* Wide tile - Kitchen / hygiene placeholder with gradient */}
            <div className="col-span-2 card-stagger stagger-d1 group relative overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-500" style={{ background: 'linear-gradient(135deg, #0F0A00, #2D1A00)' }}>
              <div className="flex flex-col items-center justify-center h-52 p-8 text-center">
                <div className="text-5xl mb-4 group-hover:scale-125 transition-transform duration-300">👨‍🍳</div>
                <h3 className="font-black text-white text-lg" style={{ fontFamily: 'var(--font-playfair, serif)' }}>100% Hygienic Kitchen</h3>
                <p className="text-amber-200/70 text-sm font-medium mt-2">Fresh locally sourced ingredients prepared daily with traditional Kolhapuri recipes.</p>
                <div className="flex items-center gap-3 mt-4">
                  {['✅ Fresh Daily', '🌿 No Preservatives', '🧽 Hygienic'].map(tag => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-amber-900/50 border border-amber-700/50 text-amber-300 text-[10px] font-bold">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center reveal-on-scroll">
            <p className="text-sm text-slate-500 font-medium">📸 Real food photos from Kolhapuri Mess kitchen — no stock images, no filters.</p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          8C. FAQ SECTION
         ═══════════════════════════════════════════════════════════════════════ */}
      <section id="faq" className="py-20 bg-gradient-to-b from-amber-50/40 to-[#FFFDF9]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 reveal-on-scroll">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black uppercase tracking-widest mb-4">
              <Search className="w-3.5 h-3.5 text-amber-700" /> FAQ
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'var(--font-playfair, serif)' }}>
              Got <span className="text-shimmer">Questions?</span>
            </h2>
            <p className="mt-4 text-slate-600 font-medium">Everything students ask before joining — answered here.</p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: '🕐 What are the meal timings?',
                a: 'Lunch is served from 11:30 AM to 3:00 PM, Monday to Sunday. Dinner is from 7:00 PM to 10:00 PM, Monday to Saturday — NO dinner on Sundays. Non-Veg thali is available only on Tuesday, Friday, and Sunday (lunch). On all other days, only Veg thali is served. Timings may vary based on food availability.'
              },
              {
                q: '🛵 Do you deliver to hostels?',
                a: 'Yes! We deliver hot dinner parcels to hostel rooms. This is available for hostel students only and requires a minimum group of 5 students. Only dinner is available for parcel delivery — not lunch. Contact us on WhatsApp at 7760948562 to set up your hostel delivery group.'
              },
              {
                q: '💰 How do I pay my monthly mess bill?',
                a: 'You can pay via UPI (Paytm QR code: paytmqr6la3hf@ptys) or cash at the mess counter. You can also view your itemized monthly bill online from our Student Portal — just enter your Student ID or mobile number.'
              },
              {
                q: '🏠 What if I go home for a few days (leave)?',
                a: 'No problem! Inform the mess owner via WhatsApp before your leave dates. Leave days will be deducted from your monthly bill. We have a transparent leave management system — your bill will only include days you actually ate.'
              },
              {
                q: '🥗 Is the kitchen 100% veg?',
                a: 'Non-Veg thali (Chicken / Mutton / Egg) is served only on Tuesday, Friday, and Sunday (lunch). On all other days — Monday, Wednesday, Thursday, and Saturday — only Veg thali is available. This schedule may change occasionally; join our WhatsApp group for daily menu updates.'
              },
              {
                q: '📋 How do I register for the mess?',
                a: 'You can fill out the online registration form on our website (scroll up to the Mess Plan section) or simply walk in to the mess and speak to the owner. You can also WhatsApp us at 7760948562 to enquire and register.'
              },
              {
                q: '🎉 Do you have special meals on festivals?',
                a: 'Yes! We serve special thalis on festivals like Ganesh Chaturthi, Diwali, and other occasions. Join our WhatsApp group to get advance notice of all special meal days and holiday schedules.'
              },
              {
                q: '💳 Is there a security deposit?',
                a: 'Yes, there is a one-time refundable security deposit of ₹1,000 when you join. This is fully refunded when you leave the mess, after adjusting any pending dues.'
              },
            ].map(({ q, a }, i) => (
              <div
                key={i}
                className="reveal-on-scroll rounded-2xl border-2 border-amber-100 bg-white hover:border-amber-300 transition-colors duration-300 overflow-hidden shadow-sm hover:shadow-md"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                  aria-expanded={openFaq === i}
                >
                  <span className="font-black text-slate-900 text-sm sm:text-base">{q}</span>
                  <span className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-black text-lg transition-all duration-300 ${
                    openFaq === i
                      ? 'bg-amber-500 border-amber-500 text-white rotate-45'
                      : 'border-amber-300 text-amber-600'
                  }`}>+</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5">
                    <div className="h-px bg-amber-100 mb-4" />
                    <p className="text-sm text-slate-600 font-medium leading-relaxed">{a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-10 text-center reveal-on-scroll">
            <p className="text-sm text-slate-500 font-medium mb-4">Still have a question?</p>
            <a
              href={MESS_DETAILS.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-black text-sm shadow-lg shadow-emerald-500/20 hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300"
            >
              <MessageCircle className="w-4 h-4" /> Ask on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          8D. BULK & PARTY ORDERS SECTION
         ═══════════════════════════════════════════════════════════════════════ */}
      <section id="bulk-orders" className="py-24 relative overflow-hidden">
        {/* Dark premium background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950 via-[#1a0f00] to-amber-900" />
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle at 30% 40%, rgba(255,191,0,0.4) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(255,160,0,0.3) 0%, transparent 50%)' }} />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-14 reveal-on-scroll">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-widest mb-5">
              <Package className="w-3.5 h-3.5" /> Catering Services
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight" style={{ fontFamily: 'var(--font-playfair, serif)' }}>
              Bulk Orders for <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">Events & Parties</span>
            </h2>
            <p className="mt-5 text-amber-200/70 font-medium text-base max-w-2xl mx-auto leading-relaxed">
              Hosting a group event, birthday party, office lunch, or family gathering? We cater authentic Kolhapuri meals in bulk — freshly prepared with the same homestyle taste.
            </p>
          </div>

          {/* 3 Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
            {/* Card 1: College & Hostel Events */}
            <div className="card-stagger stagger-d0 group p-7 rounded-3xl bg-white/[0.04] border border-amber-500/15 backdrop-blur-sm hover:bg-white/[0.08] hover:border-amber-500/30 transition-all duration-400">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <GraduationCap className="w-7 h-7 text-amber-400" />
              </div>
              <h3 className="text-xl font-black text-white mb-2" style={{ fontFamily: 'var(--font-playfair, serif)' }}>Group & Hostel Events</h3>
              <p className="text-amber-200/60 text-sm font-medium leading-relaxed">
                Mass catering for fests, freshers parties, farewell dinners, and hostel community gatherings. Veg & Non-Veg platters with traditional Kolhapuri flavours.
              </p>
            </div>

            {/* Card 2: Birthdays & Family Functions */}
            <div className="card-stagger stagger-d1 group p-7 rounded-3xl bg-white/[0.04] border border-amber-500/15 backdrop-blur-sm hover:bg-white/[0.08] hover:border-amber-500/30 transition-all duration-400">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500/20 to-rose-600/10 border border-rose-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <PartyPopper className="w-7 h-7 text-rose-400" />
              </div>
              <h3 className="text-xl font-black text-white mb-2" style={{ fontFamily: 'var(--font-playfair, serif)' }}>Birthdays & Family Functions</h3>
              <p className="text-amber-200/60 text-sm font-medium leading-relaxed">
                Custom Veg and Non-Veg thali platters for birthday celebrations, engagements, poojas, and family gatherings. We serve 20 to 500+ guests with ease.
              </p>
            </div>

            {/* Card 3: Office & Corporate Lunch */}
            <div className="card-stagger stagger-d2 group p-7 rounded-3xl bg-white/[0.04] border border-amber-500/15 backdrop-blur-sm hover:bg-white/[0.08] hover:border-amber-500/30 transition-all duration-400">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <Building2 className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-xl font-black text-white mb-2" style={{ fontFamily: 'var(--font-playfair, serif)' }}>Office & Corporate Lunch</h3>
              <p className="text-amber-200/60 text-sm font-medium leading-relaxed">
                Daily or weekly tiffin service for offices and working professionals. Affordable, hygienic, and delivered hot to your workplace in Belagavi.
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 reveal-on-scroll">
            <a
              href={`tel:${MESS_DETAILS.callPhones[0]}`}
              className="ripple-btn inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-white font-black text-sm shadow-xl shadow-amber-500/25 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/35 transition-all duration-300"
            >
              <Phone className="w-4.5 h-4.5" />
              📞 Call to Order Bulk
            </a>
            <a
              href={`https://wa.me/91${MESS_DETAILS.whatsappPhone}?text=${encodeURIComponent('Hello Kolhapuri Mess, I want to enquire about bulk food orders for an event/party. Please share details.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ripple-btn inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-black text-sm transition-all duration-300 hover:border-white/40"
            >
              <MessageCircle className="w-4.5 h-4.5" />
              💬 WhatsApp for Bulk Enquiry
            </a>
          </div>

          {/* Trust line */}
          <p className="text-center mt-8 text-amber-200/40 text-xs font-semibold">
            Minimum order: 20 plates • Advance booking required • Delivery available across Belagavi
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          8. LOCATION & CONTACT SECTION
         ═══════════════════════════════════════════════════════════════════════ */}
      <section id="location" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center max-w-2xl mx-auto mb-16 reveal-on-scroll">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black uppercase tracking-widest mb-4">
            <MapPin className="w-3.5 h-3.5 text-amber-700" /> Find Us & Contact
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'var(--font-playfair, serif)' }}>
            Visit <span className="text-shimmer">Kolhapuri Mess</span>
          </h2>
          <p className="mt-4 text-slate-600 font-medium">Near Nath Pai Circle, Shahapur, Belagavi. Lunch Mon–Sun · Dinner Mon–Sat · Non-Veg on Tue, Fri & Sun.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Address */}
          <div className="card-stagger stagger-d0 group p-8 rounded-3xl bg-white border-2 border-amber-200 hover:border-amber-400 shadow-lg hover:shadow-xl transition-all duration-400">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform mb-5">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-black text-slate-900 text-lg mb-2" style={{ fontFamily: 'var(--font-playfair, serif)' }}>Our Address</h3>
            <p className="text-sm text-slate-600 font-medium leading-relaxed mb-4">{MESS_DETAILS.address}</p>
            <a
              href={MESS_DETAILS.googleMapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-extrabold transition"
            >
              Open Google Maps <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Phone */}
          <div className="reveal-scale group p-8 rounded-3xl bg-white border-2 border-amber-200 hover:border-amber-400 shadow-lg hover:shadow-xl transition-all duration-400" style={{ transitionDelay: '100ms' }}>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform mb-5">
              <PhoneCall className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-black text-slate-900 text-lg mb-2" style={{ fontFamily: 'var(--font-playfair, serif)' }}>Phone Inquiries</h3>
            <div className="space-y-2 mb-4">
              {MESS_DETAILS.callPhones.map(phone => (
                <a key={phone} href={`tel:${phone}`} className="flex items-center gap-2.5 text-sm font-bold text-amber-900 hover:text-amber-700 transition group/link">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center group-hover/link:bg-amber-200 transition">
                    <Phone className="w-3.5 h-3.5 text-amber-700" />
                  </div>
                  {phone}
                </a>
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-500" /> Lunch 11:30 AM–3:00 PM · Dinner 7:00–10:00 PM
            </div>
          </div>

          {/* WhatsApp */}
          <div className="reveal-scale group p-8 rounded-3xl bg-white border-2 border-emerald-200 hover:border-emerald-400 shadow-lg hover:shadow-xl transition-all duration-400" style={{ transitionDelay: '200ms' }}>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform mb-5">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-black text-slate-900 text-lg mb-2" style={{ fontFamily: 'var(--font-playfair, serif)' }}>WhatsApp & Paytm</h3>
            <p className="text-sm font-bold text-slate-700 mb-1">
              WhatsApp: <a href={MESS_DETAILS.whatsappLink} target="_blank" className="text-emerald-700 hover:underline">{MESS_DETAILS.whatsappPhone}</a>
            </p>
            <p className="text-xs text-slate-500 font-medium mb-5">Paytm UPI: <span className="font-mono font-bold text-slate-700">{UPI_DETAILS.upiId}</span></p>
            <a
              href={MESS_DETAILS.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-md transition-all duration-200 hover:scale-105"
            >
              <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
            </a>
          </div>
        </div>

        {/* Google Maps Embed */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 reveal-on-scroll">
          <div className="rounded-3xl overflow-hidden shadow-2xl border-2 border-amber-200">
            <div className="bg-amber-50 border-b border-amber-200 px-6 py-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-black text-slate-900 text-sm">Kolhapuri Mess</p>
                <p className="text-xs text-slate-500 font-medium">Nath Pai Circle, Shahapur, Belagavi, Karnataka</p>
              </div>
              <a
                href={MESS_DETAILS.googleMapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-all hover:scale-105"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open in Maps
              </a>
            </div>
            <div className="relative w-full overflow-hidden bg-slate-100 min-h-[350px]">
              <iframe
                title="Kolhapuri Mess Location Map"
                src="https://maps.google.com/maps?q=Kolhapuri%20mess%20Nath%20Pai%20Circle%20Shahapur%20Belagavi&t=&z=17&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="380"
                className="w-full h-[380px] border-0 block"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              {/* Fallback Overlay Button for Mobile Phones */}
              <div className="p-3 bg-amber-950 text-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <p className="font-medium text-amber-200 text-center sm:text-left">
                  📍 Located right near <strong className="text-white">Nath Pai Circle, Shahapur, Belagavi</strong>
                </p>
                <a
                  href={MESS_DETAILS.googleMapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto text-center px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2"
                >
                  <MapPin className="w-4 h-4 text-white" /> Open Live GPS Directions in Google Maps App
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          9. DARK PREMIUM FOOTER
         ═══════════════════════════════════════════════════════════════════════ */}
      <footer className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0A0600 0%, #140C00 50%, #0A0600 100%)' }}>

        {/* Top gold border */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

        {/* Decorative rings */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full border border-amber-800/15 animate-spin-slow pointer-events-none" style={{ bottom: '-350px' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">

            {/* Brand col */}
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-amber-500/30">KM</div>
                <div>
                  <span className="font-black text-white text-xl block" style={{ fontFamily: 'var(--font-playfair, serif)' }}>Kolhapuri Mess</span>
                  <span className="text-[10px] text-amber-400 font-bold tracking-widest uppercase">Authentic Maharashtrian Cuisine</span>
                </div>
              </div>
              <p className="text-amber-200/50 text-sm font-medium leading-relaxed">
                Homestyle Maharashtrian meals for students &amp; food lovers in Shahapur, Belagavi. Pure ingredients, fresh chapatis, and transparent billing.
              </p>
              <a href={MESS_DETAILS.whatsappLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-600/30 text-emerald-400 font-bold text-xs transition">
                <MessageCircle className="w-4 h-4" /> WhatsApp Us Now
              </a>
            </div>

            {/* Timings col */}
            <div className="space-y-4">
              <h4 className="font-black text-white text-base" style={{ fontFamily: 'var(--font-playfair, serif)' }}>Hours &amp; Location</h4>
              {[
                { icon: Clock, text: 'Lunch: 11:30 AM – 3:00 PM' },
                { icon: Clock, text: 'Dinner: 7:00 PM – 10:00 PM (subject to availability)' },
                { icon: MapPin, text: 'Nath Pai Circle, Shahapur, Belagavi, KA' },
              ].map(({ icon: Icon, text }) => (
                <p key={text} className="flex items-start gap-2.5 text-amber-200/50 text-sm font-medium">
                  <Icon className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />{text}
                </p>
              ))}
            </div>

            {/* Quick links col */}
            <div className="space-y-4">
              <h4 className="font-black text-white text-base" style={{ fontFamily: 'var(--font-playfair, serif)' }}>Quick Access</h4>
              <div className="flex flex-col gap-2">
                <button onClick={() => setStudentModalOpen(true)} className="flex items-center gap-2 text-sm font-bold text-amber-300 hover:text-amber-200 transition text-left group">
                  <span className="w-6 h-6 rounded-lg bg-amber-900/40 flex items-center justify-center text-xs group-hover:bg-amber-800/60 transition">🎓</span>
                  Student Portal & Bill View
                </button>
                <a href="#thali-menu" className="flex items-center gap-2 text-sm font-bold text-amber-500/70 hover:text-amber-400 transition">
                  <span className="w-6 h-6 rounded-lg bg-amber-900/30 flex items-center justify-center text-xs">🍽️</span>
                  Our Thali Menu
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-amber-900/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-amber-700 font-medium">
            <span>© {new Date().getFullYear()} Kolhapuri Mess · Nath Pai Circle, Belagavi · All Rights Reserved.</span>
            <span className="flex items-center gap-1.5">
              Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for Belagavi
            </span>
          </div>
        </div>
      </footer>

      {/* ═══════════════════════════════════════════════════════════════════════
          STUDENT LOGIN MODAL
         ═══════════════════════════════════════════════════════════════════════ */}
      {studentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setStudentModalOpen(false); }}>
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" />
          <div className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl border-2 border-amber-300 overflow-hidden max-h-[90vh] overflow-y-auto animate-scale-in">
            {/* Top gradient bar */}
            <div className="h-1.5 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600" />

            <button onClick={() => setStudentModalOpen(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition z-10">
              <X className="w-4 h-4" />
            </button>

            <div className="p-7">
              {!studentData ? (
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 text-white font-black text-2xl mx-auto flex items-center justify-center shadow-lg animate-pulse-glow-gold">🎓</div>
                    <h2 className="text-2xl font-black text-slate-900" style={{ fontFamily: 'var(--font-playfair, serif)' }}>Student Portal</h2>
                    <p className="text-sm text-slate-500 font-medium">Enter your Student ID (e.g. KM-101) or Mobile Number</p>
                  </div>
                  <form onSubmit={handleStudentLogin} className="space-y-4">
                    <div>
                      <label className="text-xs font-extrabold text-slate-700 block mb-1.5">Student ID or Mobile Number</label>
                      <div className="relative">
                        <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="e.g. KM-101 or 9822101010"
                          value={studentQuery}
                          onChange={(e) => setStudentQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-3.5 bg-[#FFFDF9] border-2 border-amber-200 rounded-xl text-slate-900 text-sm font-bold placeholder-slate-400 focus:outline-none focus:border-amber-500 transition"
                          required autoFocus
                        />
                      </div>
                    </div>
                    <button type="submit" disabled={searchingStudent} className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-white font-black text-sm shadow-lg hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2">
                      {searchingStudent ? (
                        <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Checking Account...</>
                      ) : (
                        <><User className="w-4 h-4" /> Log In & View My Bill</>
                      )}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-amber-200">
                    <div>
                      <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200">{studentData.student_id}</span>
                      <h3 className="text-xl font-black text-slate-900 mt-2" style={{ fontFamily: 'var(--font-playfair, serif)' }}>{studentData.name}</h3>
                      <p className="text-xs text-slate-500 font-medium">{studentData.room_batch || 'Enrolled Student'} {studentData.is_parcel_delivery ? '· 🚚 Hostel Delivery' : ''}</p>
                    </div>
                    <button onClick={() => setStudentData(null)} className="text-xs font-extrabold text-amber-700 hover:underline">Change ↩</button>
                  </div>

                  {/* Modal Tab Switcher */}
                  <div className="flex bg-amber-50 p-1 rounded-xl border border-amber-200">
                    <button
                      onClick={() => setStudentModalTab('bill')}
                      className={`flex-1 py-2 px-3 rounded-lg font-extrabold text-xs transition flex items-center justify-center gap-1.5 ${
                        studentModalTab === 'bill'
                          ? 'bg-amber-500 text-white shadow-sm'
                          : 'text-slate-600 hover:text-amber-900'
                      }`}
                    >
                      <Receipt className="w-3.5 h-3.5" /> Monthly Bill
                    </button>
                    <button
                      onClick={() => setStudentModalTab('menu')}
                      className={`flex-1 py-2 px-3 rounded-lg font-extrabold text-xs transition flex items-center justify-center gap-1.5 ${
                        studentModalTab === 'menu'
                          ? 'bg-amber-500 text-white shadow-sm'
                          : 'text-slate-600 hover:text-amber-900'
                      }`}
                    >
                      <ChefHat className="w-3.5 h-3.5" /> Menu Card & Rates
                    </button>
                  </div>

                  {/* TAB 1: BILL */}
                  {studentModalTab === 'bill' && (
                    <>
                      {studentBill ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-3 gap-3 text-center">
                            {[
                              { label: 'Total Billed', value: `₹${studentBill.total_amount}`, color: 'slate' },
                              { label: 'Paid', value: `₹${studentBill.paid_amount || 0}`, color: 'emerald' },
                              { label: 'Balance Due', value: `₹${balanceOwed}`, color: 'amber', highlight: true },
                            ].map(({ label, value, color, highlight }) => (
                              <div key={label} className={`p-3 rounded-xl border ${highlight ? 'bg-amber-100 border-amber-300' : 'bg-slate-50 border-slate-200'}`}>
                                <span className="text-[10px] font-bold text-slate-500 block">{label}</span>
                                <p className={`text-lg font-black mt-0.5 text-${color}-700`}>{value}</p>
                              </div>
                            ))}
                          </div>

                          {balanceOwed > 0 ? (
                            <div className="p-4 bg-gradient-to-b from-amber-50 to-white rounded-2xl border-2 border-amber-300 text-center space-y-3">
                              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-900 bg-white px-3 py-1.5 rounded-full border border-amber-200 shadow-sm">
                                <QrCode className="w-4 h-4 text-amber-600" /> Paytm Business UPI QR Code
                              </div>
                              <div className="bg-white p-2 rounded-xl inline-block shadow-md border-2 border-amber-400">
                                <img src="/images/paytm_qr.png" alt="Official Paytm Payment QR" className="w-56 h-auto max-h-72 mx-auto rounded-lg object-contain" />
                              </div>
                              <div>
                                <p className="text-xs font-extrabold text-slate-900">Pay to: {UPI_DETAILS.payeeName}</p>
                                <p className="text-[11px] text-amber-800 font-mono font-bold mt-0.5">{UPI_DETAILS.upiId}</p>
                              </div>
                            </div>
                          ) : (
                            <div className="p-6 bg-emerald-50 border-2 border-emerald-200 rounded-2xl text-center space-y-2">
                              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                              <p className="text-base font-black text-emerald-800">Bill Fully Paid! 🎉</p>
                              <p className="text-xs text-emerald-600 font-medium">Thank you for the timely payment.</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="py-8 text-center space-y-2">
                          <UtensilsCrossed className="w-10 h-10 text-amber-300 mx-auto" />
                          <p className="text-sm font-bold text-slate-600">No bill generated for this month yet.</p>
                          <p className="text-xs text-slate-400">Check again after your first meal is recorded.</p>
                        </div>
                      )}
                    </>
                  )}

                  {/* TAB 2: MENU CARD & RATES */}
                  {studentModalTab === 'menu' && (
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs font-bold text-amber-900 text-center">
                        🍱 Mess Menu & Pricing Card (2026)
                      </div>
                      <div className="space-y-2">
                        {INITIAL_MENU_ITEMS.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                            <div className="font-bold text-slate-800 flex items-center gap-1.5">
                              <span>{item.name}</span>
                              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                                item.category === 'non_veg' ? 'bg-rose-100 text-rose-700' : item.category === 'egg' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {item.category.toUpperCase()}
                              </span>
                            </div>
                            <span className="font-black text-amber-700">₹{item.price}</span>
                          </div>
                        ))}
                      </div>
                      <div className="p-2.5 bg-slate-100 rounded-xl text-[11px] text-slate-600 space-y-1">
                        <p>• 🚚 Hostel Delivery: +₹10/day</p>
                        <p>• 🔒 Security Deposit: ₹1,000 (Refundable)</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          ADMIN LOGIN MODAL
         ═══════════════════════════════════════════════════════════════════════ */}
      {adminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setAdminModalOpen(false); }}>
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" />
          <div className="relative w-full max-w-md shadow-2xl animate-scale-in" style={{ filter: 'drop-shadow(0 25px 50px rgba(245,158,11,0.25))' }}>
            {/* Glow ring */}
            <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-br from-amber-400/30 via-yellow-500/20 to-amber-600/30 blur-xl" />
            <div className="relative bg-white rounded-3xl overflow-hidden border-2 border-amber-300">
              <div className="h-1.5 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600" />
              <button onClick={() => setAdminModalOpen(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition">
                <X className="w-4 h-4" />
              </button>
              <div className="p-8 space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 text-white font-black text-2xl mx-auto flex items-center justify-center shadow-lg shadow-amber-500/30">🔐</div>
                  <h2 className="text-2xl font-black text-slate-900" style={{ fontFamily: 'var(--font-playfair, serif)' }}>Admin ERP Login</h2>
                  <p className="text-xs text-slate-500 font-medium">Mess Staff & Management Access</p>
                </div>
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div>
                    <label className="text-xs font-extrabold text-slate-700 block mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <input type="email" placeholder="admin@kolhapurimess.com" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3.5 bg-[#FFFDF9] border-2 border-amber-200 rounded-xl text-slate-900 text-sm font-bold focus:outline-none focus:border-amber-500 transition" required />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-extrabold text-slate-700 block mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <input type="password" placeholder="••••••••" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3.5 bg-[#FFFDF9] border-2 border-amber-200 rounded-xl text-slate-900 text-sm font-bold focus:outline-none focus:border-amber-500 transition" required />
                    </div>
                  </div>
                  <button type="submit" disabled={adminLoading} className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-white font-black text-sm shadow-xl hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2">
                    {adminLoading ? (
                      <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Signing In...</>
                    ) : (
                      <><Lock className="w-4 h-4" /> Sign In to Admin ERP</>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
