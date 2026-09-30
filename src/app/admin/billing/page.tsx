'use client';

import { useState, useEffect } from 'react';
import { DataService } from '@/lib/data-service';
import { Bill } from '@/lib/types';
import { Receipt, Calendar, RefreshCw, Edit2, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MonthlyBillingPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [adjAmount, setAdjAmount] = useState(0);
  const [adjNotes, setAdjNotes] = useState('');
  const [billSearch, setBillSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => { 
    loadBills(); 
    window.addEventListener('storage', loadBills);
    window.addEventListener('km_data_updated', loadBills);
    window.addEventListener('new_order_recorded', loadBills);
    return () => {
      window.removeEventListener('storage', loadBills);
      window.removeEventListener('km_data_updated', loadBills);
      window.removeEventListener('new_order_recorded', loadBills);
    };
  }, [selectedMonth, selectedYear]);

  async function loadBills() {
    setLoading(true);
    const data = await DataService.getBills(selectedMonth, selectedYear);
    setBills(data);
    setLoading(false);
  }

  async function handleGenerateBills() {
    setLoading(true);
    const generated = await DataService.generateMonthlyBills(selectedMonth, selectedYear);
    setBills(generated);
    setLoading(false);
    toast.success(`Generated/updated bills for ${generated.length} students!`);
  }

  async function handleSaveAdjustment(e: React.FormEvent) {
    e.preventDefault();
    if (!editingBill) return;
    const updated: Bill = {
      ...editingBill,
      adjustments: adjAmount,
      adjustment_notes: adjNotes,
      total_amount: (editingBill.items_total + editingBill.delivery_charges) + adjAmount
    };
    await DataService.updateBill(updated);
    toast.success('Bill adjustment saved');
    setEditingBill(null);
    loadBills();
  }

  const months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
    { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
    { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' },
  ];

  const totalBilledAmount = bills.reduce((sum, b) => sum + b.total_amount, 0);

  // Filtered bills
  const filteredBills = bills.filter(b => {
    const matchesSearch = billSearch === '' || 
      (b.students?.name || '').toLowerCase().includes(billSearch.toLowerCase()) ||
      (b.students?.student_id || '').toLowerCase().includes(billSearch.toLowerCase()) ||
      (b.students?.room_batch || '').toLowerCase().includes(billSearch.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const filteredBilledAmount = filteredBills.reduce((sum, b) => sum + b.total_amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 rounded-2xl p-6 shadow-lg shadow-amber-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Receipt className="w-7 h-7" /> Monthly Bill Generation
            </h1>
            <p className="text-amber-100 text-sm mt-1">Automate bill tallies based on actual meal orders & hostel delivery charges.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm rounded-xl px-3 py-2 font-medium focus:outline-none"
            >
              {months.map(m => <option key={m.value} value={m.value} className="text-slate-900 bg-white">{m.label}</option>)}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm rounded-xl px-3 py-2 font-medium focus:outline-none"
            >
              <option value={2026} className="text-slate-900 bg-white">2026</option>
              <option value={2027} className="text-slate-900 bg-white">2027</option>
            </select>
            <button
              onClick={handleGenerateBills}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-amber-700 font-bold text-sm shadow-md hover:bg-amber-50 transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Calculating...' : 'Generate/Update Bills'}
            </button>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-white border border-amber-100 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Total Billed Cycle Amount</span>
          <p className="text-3xl font-black text-amber-600 mt-1">₹{totalBilledAmount.toLocaleString('en-IN')}</p>
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Showing {filteredBills.length} of {bills.length} student bills for {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white border border-amber-100 rounded-2xl p-4 shadow-sm">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-amber-700/60" />
          <input 
            type="text"
            placeholder="Search by student name, ID, or room..."
            value={billSearch}
            onChange={(e) => setBillSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-amber-50/40 border border-amber-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 font-semibold"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-amber-700" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-amber-50/40 border border-amber-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="finalized">Finalized</option>
            <option value="paid">Paid</option>
            <option value="partially_paid">Partially Paid</option>
          </select>
        </div>
        {(billSearch || statusFilter !== 'all') && (
          <button
            onClick={() => { setBillSearch(''); setStatusFilter('all'); }}
            className="px-3 py-2 rounded-xl bg-amber-100 text-amber-800 text-xs font-extrabold border border-amber-200 hover:bg-amber-200 transition"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Bills Table */}
      <div className="bg-white border border-amber-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-amber-50 text-xs text-amber-800 uppercase tracking-wider border-b border-amber-100">
              <tr>
                <th className="px-6 py-4">Student ID / Name</th>
                <th className="px-6 py-4">Meals</th>
                <th className="px-6 py-4">Dishes Total</th>
                <th className="px-6 py-4">Hostel Delivery</th>
                <th className="px-6 py-4">Adjustments</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-50">
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    {bills.length === 0 ? 'No bills generated yet. Click "Generate/Update Bills" above.' : 'No bills match your current filters.'}
                  </td>
                </tr>
              ) : (
                filteredBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-amber-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{bill.students?.name || 'Student'}</div>
                      <div className="text-xs text-slate-400">{bill.students?.student_id} • {bill.students?.room_batch}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">{bill.total_meals} meals</td>
                    <td className="px-6 py-4 font-semibold text-slate-700">₹{bill.items_total.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-amber-600 font-medium">+₹{bill.delivery_charges.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4">
                      {bill.adjustments !== 0 ? (
                        <span className={bill.adjustments > 0 ? 'text-rose-500 font-semibold' : 'text-emerald-600 font-semibold'}>
                          {bill.adjustments > 0 ? `+₹${bill.adjustments}` : `-₹${Math.abs(bill.adjustments)}`}
                        </span>
                      ) : '₹0'}
                    </td>
                    <td className="px-6 py-4 font-black text-amber-600 text-base">₹{bill.total_amount.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                        bill.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : bill.status === 'partially_paid'
                          ? 'bg-amber-100 text-amber-700 border border-amber-200'
                          : 'bg-rose-100 text-rose-700 border border-rose-200'
                      }`}>
                        {bill.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => { setEditingBill(bill); setAdjAmount(bill.adjustments || 0); setAdjNotes(bill.adjustment_notes || ''); }}
                        className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 transition"
                        title="Edit Adjustments"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Adjustment Modal */}
      {editingBill && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-amber-100 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900 flex items-center justify-between border-b border-amber-100 pb-3">
              <span>Adjust Bill — {editingBill.students?.name}</span>
              <button onClick={() => setEditingBill(null)} className="text-slate-400 hover:text-slate-700 text-xl leading-none">✕</button>
            </h2>
            <form onSubmit={handleSaveAdjustment} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600">Adjustment Amount (₹ + or −)</label>
                <input
                  type="number"
                  placeholder="e.g. -100 for discount, +50 for penalty"
                  value={adjAmount}
                  onChange={(e) => setAdjAmount(parseFloat(e.target.value) || 0)}
                  className="w-full mt-1 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-slate-900 text-sm font-semibold focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Reason / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Approved leave discount"
                  value={adjNotes}
                  onChange={(e) => setAdjNotes(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-amber-100">
                <button type="button" onClick={() => setEditingBill(null)} className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200 transition">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl transition">Save Adjustment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
