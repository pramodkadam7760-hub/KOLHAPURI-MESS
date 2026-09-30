'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { DataService } from '@/lib/data-service';
import { Student, Bill, OrderItem } from '@/lib/types';
import { UPI_DETAILS, INITIAL_MENU_ITEMS } from '@/lib/constants';
import { 
  ArrowLeft, 
  Receipt, 
  QrCode, 
  CheckCircle2, 
  Calendar, 
  Utensils, 
  Truck, 
  ShieldCheck,
  ChefHat,
  Info,
  Sun,
  Moon,
  TrendingUp
} from 'lucide-react';

export default function StudentPortalBillDetail({ params }: { params: Promise<{ studentId: string }> }) {
  const resolvedParams = use(params);
  const studentId = resolvedParams.studentId;

  const [student, setStudent] = useState<Student | null>(null);
  const [currentBill, setCurrentBill] = useState<Bill | null>(null);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bill' | 'attendance' | 'menu'>('bill');

  useEffect(() => {
    async function loadStudentData() {
      setLoading(true);
      const month = new Date().getMonth() + 1;
      const year = new Date().getFullYear();

      const std = await DataService.getStudentByIdOrPhone(studentId);
      if (std) {
        setStudent(std);
        const bills = await DataService.getBills(month, year, std.id);
        if (bills.length > 0) setCurrentBill(bills[0]);

        // Load all order items for this student this month
        const allOrders: OrderItem[] = [];
        const daysInMonth = new Date(year, month, 0).getDate();
        for (let d = 1; d <= daysInMonth; d++) {
          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const dayOrders = await DataService.getOrderItemsByDate(dateStr);
          const studentOrders = dayOrders.filter(o => o.student_id === std.id);
          allOrders.push(...studentOrders);
        }
        setOrders(allOrders);
      }
      setLoading(false);
    }
    loadStudentData();
  }, [studentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-950 via-amber-900 to-orange-950 text-white flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-amber-200/80">Loading your portal...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-950 via-amber-900 to-orange-950 text-white flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <p className="text-sm text-amber-200">Student record not found.</p>
          <Link href="/portal" className="px-4 py-2.5 bg-amber-500 text-stone-950 font-bold text-xs rounded-xl">
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  const totalAmount = currentBill ? currentBill.total_amount : 0;
  const paidAmount = currentBill ? currentBill.paid_amount || 0 : 0;
  const balanceOwed = totalAmount - paidAmount;

  const upiUri = `upi://pay?pa=${UPI_DETAILS.upiId}&pn=${encodeURIComponent(UPI_DETAILS.payeeName)}&am=${balanceOwed > 0 ? balanceOwed : 0}&cu=INR`;

  // Build attendance calendar data for current month
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay(); // 0=Sun
  const today = now.getDate();

  // Map: date string -> { lunch: bool, dinner: bool }
  const mealMap: Record<string, { lunch: boolean; dinner: boolean }> = {};
  orders.forEach(o => {
    if (!mealMap[o.date]) mealMap[o.date] = { lunch: false, dinner: false };
    if (o.meal_type === 'lunch') mealMap[o.date].lunch = true;
    if (o.meal_type === 'dinner') mealMap[o.date].dinner = true;
  });

  const lunchCount = Object.values(mealMap).filter(m => m.lunch).length;
  const dinnerCount = Object.values(mealMap).filter(m => m.dinner).length;
  const totalMealDays = Object.keys(mealMap).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950 via-amber-900 to-orange-950 text-amber-50 p-4 sm:p-8 font-sans antialiased">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Top Navigation */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Link 
              href="/portal"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-200/90 hover:text-white px-3 py-2 rounded-xl bg-stone-900/90 border border-amber-500/30 shadow-md"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </Link>
            <Link 
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-200/90 hover:text-white px-3 py-2 rounded-xl bg-stone-900/90 border border-amber-500/30 shadow-md"
            >
              🌐 Main Website
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link 
              href="/order"
              className="inline-flex items-center gap-1.5 text-xs font-black text-amber-950 bg-amber-400 hover:bg-amber-300 px-3 py-2 rounded-xl shadow-md"
            >
              🍱 Order Meal
            </Link>
          </div>
        </div>

        {/* Student Profile Card */}
        <div className="bg-stone-900/90 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl"></div>
          
          <div className="flex items-start justify-between relative z-10">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-stone-950 bg-amber-400 px-2.5 py-0.5 rounded-lg">
                  {student.student_id}
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-white" style={{ fontFamily: 'var(--font-playfair, serif)' }}>{student.name}</h1>
              </div>
              <p className="text-xs text-amber-200/70 mt-1 font-medium">
                Room/Hostel: <span className="text-amber-100 font-bold">{student.room_batch || 'N/A'}</span> • Phone: <span className="text-amber-100 font-bold">{student.phone}</span>
              </p>
            </div>

            {student.is_parcel_delivery && (
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 flex items-center gap-1 flex-shrink-0">
                <Truck className="w-3.5 h-3.5" /> Hostel Delivery (+₹10)
              </span>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-amber-500/20">
            <div className="text-center">
              <p className="text-lg font-black text-white">{totalMealDays}</p>
              <p className="text-[10px] text-amber-200/60 font-medium">Days Eaten</p>
            </div>
            <div className="text-center border-x border-amber-500/20">
              <p className="text-lg font-black text-amber-400">₹{Math.max(0, balanceOwed).toLocaleString('en-IN')}</p>
              <p className="text-[10px] text-amber-200/60 font-medium">Balance Due</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-black text-emerald-400">{lunchCount + dinnerCount}</p>
              <p className="text-[10px] text-amber-200/60 font-medium">Total Meals</p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-stone-900/90 p-1.5 rounded-2xl border border-amber-500/30 gap-1">
          {[
            { id: 'bill', icon: Receipt, label: 'Monthly Bill' },
            { id: 'attendance', icon: Calendar, label: 'Meal History' },
            { id: 'menu', icon: ChefHat, label: 'Menu & Rates' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 py-2.5 px-3 rounded-xl font-extrabold text-[11px] transition flex items-center justify-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-md'
                  : 'text-amber-200/80 hover:text-white'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ========== TAB 1: BILL STATEMENT ========== */}
        {activeTab === 'bill' && (
          <div className="bg-stone-900/90 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-amber-500/20">
              <div>
                <h2 className="font-extrabold text-white text-lg">Monthly Bill Statement</h2>
                <p className="text-xs text-amber-200/70">Current Billing Cycle: {now.toLocaleString('en-IN', { month: 'long', year: 'numeric' })}</p>
              </div>
              <span className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold tracking-wide uppercase ${
                balanceOwed <= 0 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                  : paidAmount > 0 
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
              }`}>
                {balanceOwed <= 0 ? '✓ FULLY PAID' : paidAmount > 0 ? 'PARTIALLY PAID' : 'UNPAID'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-stone-950/80 rounded-2xl border border-amber-500/20">
                <span className="text-[11px] text-amber-200/70 font-medium">Total Billed</span>
                <p className="text-lg font-bold text-white mt-0.5">₹{totalAmount.toLocaleString('en-IN')}</p>
              </div>
              <div className="p-3 bg-stone-950/80 rounded-2xl border border-amber-500/20">
                <span className="text-[11px] text-amber-200/70 font-medium">Paid So Far</span>
                <p className="text-lg font-bold text-emerald-400 mt-0.5">₹{paidAmount.toLocaleString('en-IN')}</p>
              </div>
              <div className="p-3 bg-stone-950/80 rounded-2xl border border-amber-500/40 bg-amber-500/10">
                <span className="text-[11px] text-amber-300 font-extrabold">Balance Owed</span>
                <p className="text-xl font-black text-amber-400 mt-0.5">₹{Math.max(0, balanceOwed).toLocaleString('en-IN')}</p>
              </div>
            </div>

            {/* Official Paytm Business QR */}
            <div className="p-6 rounded-2xl bg-stone-950/90 border border-amber-500/40 space-y-4 text-center shadow-inner">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-amber-500/10 px-3.5 py-1.5 rounded-full border border-amber-500/30">
                <QrCode className="w-4 h-4" /> Official Paytm Business UPI QR Code
              </div>

              <div className="bg-white p-2 rounded-2xl inline-block shadow-2xl border-4 border-amber-500 max-w-xs mx-auto overflow-hidden">
                <img 
                  src="/images/paytm_qr.png"
                  alt="Official Paytm Business QR Code — Suvarna Kadam"
                  className="w-full h-auto max-h-80 mx-auto rounded-xl object-contain"
                />
              </div>

              <div className="space-y-1">
                <p className="text-sm font-bold text-white">Payee: {UPI_DETAILS.payeeName}</p>
                <p className="text-xs text-amber-400 font-mono font-bold">UPI ID: {UPI_DETAILS.upiId}</p>
                {balanceOwed > 0 && (
                  <p className="text-xs text-amber-200/90 mt-1">
                    Amount Due: <span className="font-extrabold text-white text-base">₹{balanceOwed.toLocaleString('en-IN')}</span>
                  </p>
                )}
              </div>

              <div className="pt-2 text-[11px] text-amber-200/70 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Paytm Business Verified • Kolhapuri Mess Official QR</span>
              </div>
            </div>

            {balanceOwed <= 0 && (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="text-base font-bold text-emerald-300">Thank You! Your Bill is Paid in Full.</h3>
                <p className="text-xs text-amber-200/70">No outstanding balance for this monthly cycle.</p>
              </div>
            )}
          </div>
        )}

        {/* ========== TAB 2: MEAL ATTENDANCE CALENDAR ========== */}
        {activeTab === 'attendance' && (
          <div className="bg-stone-900/90 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
              <div>
                <h2 className="font-extrabold text-white text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-400" /> Meal Attendance
                </h2>
                <p className="text-xs text-amber-200/70">{now.toLocaleString('en-IN', { month: 'long', year: 'numeric' })} — Your meal history</p>
              </div>
            </div>

            {/* Attendance Summary Stats */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-stone-950/80 rounded-2xl border border-amber-500/20">
                <Sun className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <p className="text-lg font-black text-white">{lunchCount}</p>
                <p className="text-[10px] text-amber-200/60">Lunches</p>
              </div>
              <div className="p-3 bg-stone-950/80 rounded-2xl border border-amber-500/20">
                <Moon className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
                <p className="text-lg font-black text-white">{dinnerCount}</p>
                <p className="text-[10px] text-amber-200/60">Dinners</p>
              </div>
              <div className="p-3 bg-stone-950/80 rounded-2xl border border-amber-500/20">
                <TrendingUp className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <p className="text-lg font-black text-white">{lunchCount + dinnerCount}</p>
                <p className="text-[10px] text-amber-200/60">Total Meals</p>
              </div>
            </div>

            {/* Calendar Grid */}
            <div>
              {/* Day headers */}
              <div className="grid grid-cols-7 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="text-center text-[10px] font-bold text-amber-200/50 py-1">{d}</div>
                ))}
              </div>

              {/* Calendar cells */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for first day offset */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}

                {/* Day cells */}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const meal = mealMap[dateStr];
                  const isToday = day === today;
                  const isFuture = day > today;
                  const hasLunch = meal?.lunch;
                  const hasDinner = meal?.dinner;
                  const hasBoth = hasLunch && hasDinner;
                  const hasAny = hasLunch || hasDinner;

                  return (
                    <div
                      key={day}
                      className={`relative aspect-square flex flex-col items-center justify-center rounded-xl text-xs transition ${
                        isToday 
                          ? 'ring-2 ring-amber-500' 
                          : ''
                      } ${
                        isFuture
                          ? 'opacity-30'
                          : hasBoth
                          ? 'bg-emerald-500/30 border border-emerald-500/50'
                          : hasAny
                          ? 'bg-amber-500/20 border border-amber-500/40'
                          : 'bg-stone-950/40 border border-stone-700/30'
                      }`}
                    >
                      <span className={`font-bold text-xs ${
                        isToday ? 'text-amber-400' : isFuture ? 'text-stone-500' : hasAny ? 'text-white' : 'text-stone-500'
                      }`}>{day}</span>
                      
                      {/* Meal dots */}
                      {!isFuture && (
                        <div className="flex gap-0.5 mt-0.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${hasLunch ? 'bg-amber-400' : 'bg-stone-600'}`} title="Lunch" />
                          <span className={`w-1.5 h-1.5 rounded-full ${hasDinner ? 'bg-indigo-400' : 'bg-stone-600'}`} title="Dinner" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 text-[11px] text-amber-200/70 pt-2 border-t border-amber-500/20">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500/50 inline-block" />
                Both meals
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500/40 inline-block" />
                One meal
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                Lunch
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block" />
                Dinner
              </div>
            </div>

            {totalMealDays === 0 && (
              <div className="text-center py-8 space-y-2">
                <Utensils className="w-10 h-10 text-amber-500/40 mx-auto" />
                <p className="text-sm text-amber-200/50 font-medium">No meals recorded yet this month.</p>
                <p className="text-xs text-amber-200/30">Check back after your first meal is recorded by the admin.</p>
              </div>
            )}
          </div>
        )}

        {/* ========== TAB 3: MENU CARD & RATES ========== */}
        {activeTab === 'menu' && (
          <div className="bg-stone-900/90 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
              <div>
                <h2 className="font-extrabold text-white text-lg flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-amber-400" /> Official Mess Menu & Rates
                </h2>
                <p className="text-xs text-amber-200/70">Daily itemized meal pricing & guest rates</p>
              </div>
              <span className="text-[11px] font-bold text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                Mess Rates 2026
              </span>
            </div>

            <div className="space-y-3">
              {INITIAL_MENU_ITEMS.map((item, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-3.5 bg-stone-950/80 rounded-2xl border border-amber-500/20 hover:border-amber-500/40 transition"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{item.name}</span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        item.category === 'non_veg' 
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                          : item.category === 'egg'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : item.category === 'extra'
                          ? 'bg-stone-500/20 text-stone-300 border border-stone-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {item.category.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black text-amber-400">₹{item.price}</span>
                    {item.guest_price && item.guest_price !== item.price && (
                      <span className="text-[10px] text-amber-200/60 block">Guest: ₹{item.guest_price}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Info */}
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2 text-xs text-amber-200/90">
              <div className="font-bold text-amber-300 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-amber-400" /> Additional Service Rates & Terms:
              </div>
              <ul className="space-y-1 pl-5 list-disc text-[11px] text-amber-200/80">
                <li><span className="font-bold text-white">Hostel Parcel Delivery:</span> +₹10 per day for direct room delivery</li>
                <li><span className="font-bold text-white">Security Deposit:</span> ₹1,000 one-time deposit (fully refundable upon leaving)</li>
                <li><span className="font-bold text-white">Extra Chapati:</span> ₹12 per piece</li>
              </ul>
            </div>
          </div>
        )}

        {/* Mess Rules & Billing Info */}
        <div className="bg-stone-900/90 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-6 space-y-4">
          <h3 className="font-bold text-white text-base">Mess Rules & Billing Info</h3>
          <ul className="text-xs text-amber-200/80 space-y-2 list-disc list-inside">
            <li>Billing cycle runs from 1st to last day of each calendar month.</li>
            <li>Security deposit of ₹1,000 is held safely and applied upon final settlement when leaving.</li>
            <li>For any discrepancy in recorded meals, please contact Mess Admin at {UPI_DETAILS.phone}.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
