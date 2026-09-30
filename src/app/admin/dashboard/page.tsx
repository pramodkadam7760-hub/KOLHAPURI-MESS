'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DataService } from '@/lib/data-service';
import { Student, OrderItem, Bill } from '@/lib/types';
import { 
  Users, 
  UtensilsCrossed, 
  IndianRupee, 
  ShieldCheck, 
  Plus, 
  ArrowUpRight, 
  Receipt, 
  Truck,
  Sparkles
} from 'lucide-react';

export default function DashboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [todayOrders, setTodayOrders] = useState<OrderItem[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const today = new Date().toISOString().split('T')[0];
      const month = new Date().getMonth() + 1;
      const year = new Date().getFullYear();

      const [stdList, ordList, billList] = await Promise.all([
        DataService.getStudents(),
        DataService.getOrderItemsByDate(today),
        DataService.getBills(month, year)
      ]);

      setStudents(stdList);
      setTodayOrders(ordList);
      setBills(billList);
      setLoading(false);
    }

    loadData();

    window.addEventListener('storage', loadData);
    window.addEventListener('km_data_updated', loadData);
    window.addEventListener('new_order_recorded', loadData);

    return () => {
      window.removeEventListener('storage', loadData);
      window.removeEventListener('km_data_updated', loadData);
      window.removeEventListener('new_order_recorded', loadData);
    };
  }, []);

  const activeStudents = students.filter(s => s.status === 'active');
  const parcelStudents = activeStudents.filter(s => s.is_parcel_delivery);
  const totalDeposit = activeStudents.reduce((sum, s) => sum + (s.security_deposit || 1000), 0);
  
  const pendingDues = bills.reduce((sum, b) => sum + (b.total_amount - b.paid_amount), 0);
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total_price, 0);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 p-6 text-white shadow-xl shadow-amber-500/20 border border-amber-400/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-100 text-xs font-extrabold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" /> Kolhapuri Mess ERP Admin
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Namaskar, Mess Admin 👋</h1>
            <p className="text-amber-100 text-sm mt-1 font-medium">Here is your live mess overview for today.</p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link 
              href="/admin/attendance" 
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-amber-900 font-extrabold text-sm shadow-md hover:bg-amber-50 transition"
            >
              <UtensilsCrossed className="w-4 h-4 text-amber-600" />
              Record Meals
            </Link>
            <Link 
              href="/admin/students/add" 
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-950/30 hover:bg-amber-950/50 border border-white/30 text-white font-bold text-sm transition"
            >
              <Plus className="w-4 h-4" />
              Add Student
            </Link>
          </div>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="admin-stat-card bg-white border border-amber-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Active Students</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="admin-number-pop text-2xl font-black text-slate-900">{activeStudents.length}</span>
            <div className="flex items-center gap-1.5 text-xs text-amber-800 font-semibold mt-1">
              <Truck className="w-3.5 h-3.5 text-amber-600" />
              <span>{parcelStudents.length} Hostel Delivery (₹10/day)</span>
            </div>
          </div>
        </div>

        <div className="admin-stat-card bg-white border border-amber-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Today's Meal Orders</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="admin-number-pop text-2xl font-black text-slate-900">{todayOrders.length} dishes</span>
            <div className="text-xs text-amber-700 mt-1 font-bold">
              Today's tally: ₹{todayRevenue.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        <div className="admin-stat-card bg-white border border-amber-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Outstanding Dues</span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="admin-number-pop text-2xl font-black text-rose-600">₹{pendingDues.toLocaleString('en-IN')}</span>
            <div className="text-xs text-slate-500 mt-1 font-medium">
              From current monthly bills
            </div>
          </div>
        </div>

        <div className="admin-stat-card bg-white border border-amber-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Security Deposits Held</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="admin-number-pop text-2xl font-black text-emerald-700">₹{totalDeposit.toLocaleString('en-IN')}</span>
            <div className="text-xs text-slate-500 mt-1 font-medium">
              ₹1,000 per student (Refundable)
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Meal Entry Tally */}
        <div className="lg:col-span-2 bg-white border border-amber-200/80 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-amber-100">
            <div>
              <h2 className="font-extrabold text-slate-900 text-base">Today's Meal Orders Log</h2>
              <p className="text-xs text-slate-500">Live summary of dishes recorded today</p>
            </div>
            <Link 
              href="/admin/attendance"
              className="text-xs font-extrabold text-amber-700 hover:text-amber-900 flex items-center gap-1"
            >
              Open Entry Grid <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {todayOrders.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <UtensilsCrossed className="w-10 h-10 mx-auto mb-2 text-amber-400 opacity-60" />
              <p className="text-sm font-semibold text-slate-600">No orders recorded for today yet.</p>
              <Link 
                href="/admin/attendance"
                className="inline-block mt-3 px-4 py-2 text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 rounded-xl hover:bg-amber-100 transition"
              >
                + Record Today's Meals
              </Link>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {todayOrders.slice(0, 8).map((ord, rowIdx) => {
                const student = students.find(s => s.id === ord.student_id);
                const studentName = ord.is_guest 
                  ? (ord.guest_name ? `Guest: ${ord.guest_name}` : 'Walk-in Guest')
                  : student 
                    ? student.name 
                    : (ord.student_id || 'Walk-in Guest');

                const subInfo = ord.is_guest
                  ? 'Guest Order'
                  : student
                    ? `${student.student_id} • ${student.room_batch || 'No Room'}`
                    : 'No ID';

                return (
                  <div key={ord.id} className="admin-row-enter flex items-center justify-between p-3.5 rounded-xl bg-amber-50/40 border border-amber-100" style={{ animationDelay: `${rowIdx * 80}ms` }}>
                    <div className="flex items-center gap-3">
                      <div className={`admin-pill-sheen w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${ord.meal_type === 'lunch' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'}`}>
                        {ord.meal_type === 'lunch' ? 'L' : 'D'}
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-slate-900">{studentName}</p>
                        <p className="text-xs text-slate-500 font-medium">
                          {ord.item_name} x {ord.quantity} <span className="text-slate-400">({subInfo})</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-emerald-700">₹{ord.total_price + (ord.parcel_charge || 0)}</span>
                      {ord.parcel_charge > 0 && (
                        <span className="block text-[10px] text-amber-700 font-bold">+₹{ord.parcel_charge} Delivery</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Dues Overview */}
        <div className="bg-white border border-amber-200/80 rounded-2xl p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-amber-100">
              <h2 className="font-extrabold text-slate-900 text-base">Top Outstanding Dues</h2>
              <Link href="/admin/payments" className="text-xs font-bold text-amber-700 hover:text-amber-900">
                View All
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {bills.filter(b => b.total_amount > b.paid_amount).slice(0, 4).map((bill, rowIdx) => (
                <div key={bill.id} className="admin-row-enter flex items-center justify-between p-3 rounded-xl bg-amber-50/40 border border-amber-100" style={{ animationDelay: `${rowIdx * 100}ms` }}>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{bill.students?.name || 'Student'}</p>
                    <p className="text-xs text-slate-500">{bill.students?.student_id} • {bill.students?.room_batch}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-rose-600">₹{(bill.total_amount - bill.paid_amount).toLocaleString('en-IN')}</p>
                    <span className="admin-pill-sheen inline-block text-[10px] px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-bold">
                      Unpaid
                    </span>
                  </div>
                </div>
              ))}

              {bills.filter(b => b.total_amount > b.paid_amount).length === 0 && (
                <div className="py-8 text-center text-slate-500 text-xs">
                  <ShieldCheck className="w-8 h-8 mx-auto mb-1 text-emerald-600 opacity-60" />
                  All generated bills are currently clear!
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-amber-100 text-center">
            <Link 
              href="/admin/billing"
              className={`inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-extrabold text-sm shadow-md transition ${pendingDues > 0 ? 'admin-pulse-attention' : ''}`}
            >
              <Receipt className="w-4 h-4" />
              Generate Monthly Bills
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
