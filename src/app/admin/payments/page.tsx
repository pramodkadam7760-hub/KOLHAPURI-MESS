'use client';

import { useState, useEffect } from 'react';
import { DataService } from '@/lib/data-service';
import { Bill, Payment, Student } from '@/lib/types';
import { CreditCard, CheckCircle2, Search, Filter, History } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PaymentsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const [duesSearch, setDuesSearch] = useState('');
  const [modeFilter, setModeFilter] = useState<'all' | 'upi' | 'cash' | 'bank_transfer'>('all');

  const [recordingBill, setRecordingBill] = useState<Bill | null>(null);
  const [payAmount, setPayAmount] = useState(0);
  const [payMode, setPayMode] = useState<'cash' | 'upi' | 'bank_transfer'>('upi');
  const [payNotes, setPayNotes] = useState('');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const [billList, payList, stdList] = await Promise.all([
      DataService.getBills(),
      DataService.getPayments(),
      DataService.getStudents()
    ]);
    setBills(billList);
    setPayments(payList);
    setStudents(stdList);
    setLoading(false);
  }

  async function handleRecordPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!recordingBill || payAmount <= 0) { toast.error('Please enter a valid amount'); return; }
    await DataService.recordPayment({
      student_id: recordingBill.student_id,
      bill_id: recordingBill.id,
      amount: payAmount,
      mode: payMode,
      payment_date: new Date().toISOString().split('T')[0],
      notes: payNotes,
    });
    toast.success(`Recorded ₹${payAmount} payment!`);
    setRecordingBill(null);
    loadData();
  }

  const unpaidBills = bills.filter(b => b.total_amount > (b.paid_amount || 0));
  const totalOutstanding = unpaidBills.reduce((sum, b) => sum + (b.total_amount - (b.paid_amount || 0)), 0);

  const filteredUnpaidBills = unpaidBills.filter(b => {
    const student = students.find(s => s.id === b.student_id) || b.students;
    if (!student) return true;
    return student.name.toLowerCase().includes(duesSearch.toLowerCase()) ||
           student.student_id.toLowerCase().includes(duesSearch.toLowerCase()) ||
           student.phone.includes(duesSearch);
  });

  const filteredPayments = payments.filter(p => {
    const matchesMode = modeFilter === 'all' || p.mode === modeFilter;
    const student = students.find(s => s.id === p.student_id);
    const matchesSearch = !duesSearch || (student && (
      student.name.toLowerCase().includes(duesSearch.toLowerCase()) ||
      student.student_id.toLowerCase().includes(duesSearch.toLowerCase())
    ));
    return matchesMode && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 rounded-2xl p-6 shadow-lg shadow-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <CreditCard className="w-7 h-7" /> Payment Recording & Dues
          </h1>
          <p className="text-amber-100 text-sm mt-1">Track student payments, UPI transfers, and manage outstanding balances.</p>
        </div>
        <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl px-5 py-3 flex items-center gap-3">
          <span className="text-xs text-amber-100 font-semibold">Live Dues Total:</span>
          <span className="text-2xl font-black text-white">₹{totalOutstanding.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Toolbar: Search + Mode Filter */}
      <div className="flex flex-col md:flex-row gap-3 bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-amber-700/60" />
          <input 
            type="text"
            placeholder="Filter by student name, Student ID, or phone..."
            value={duesSearch}
            onChange={(e) => setDuesSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-amber-700" />
          <label className="text-xs font-extrabold text-slate-700">Payment Method:</label>
          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value as any)}
            className="bg-amber-50/40 border border-amber-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Methods</option>
            <option value="upi">📱 UPI Only</option>
            <option value="cash">💵 Cash Only</option>
            <option value="bank_transfer">🏦 Bank Transfer</option>
          </select>
        </div>
      </div>

      {/* Dues List */}
      <div className="bg-white border border-amber-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-amber-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-base">Students with Outstanding Dues ({filteredUnpaidBills.length})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-amber-50 text-xs text-amber-800 uppercase tracking-wider border-b border-amber-100">
              <tr>
                <th className="px-6 py-4">Student ID / Name</th>
                <th className="px-6 py-4">Cycle</th>
                <th className="px-6 py-4">Total Billed</th>
                <th className="px-6 py-4">Paid So Far</th>
                <th className="px-6 py-4">Balance Owed</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-50">
              {filteredUnpaidBills.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-50" />
                    No matching unpaid bills found.
                  </td>
                </tr>
              ) : (
                filteredUnpaidBills.map((bill) => {
                  const student = students.find(s => s.id === bill.student_id) || bill.students;
                  const balance = bill.total_amount - (bill.paid_amount || 0);
                  return (
                    <tr key={bill.id} className="hover:bg-amber-50/50 transition">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{student?.name || 'Student'}</div>
                        <div className="text-xs text-slate-400">{student?.student_id} • {student?.phone}</div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-700">Month {bill.billing_month}/{bill.billing_year}</td>
                      <td className="px-6 py-4 font-semibold text-slate-700">₹{bill.total_amount.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4 text-emerald-600 font-semibold">₹{(bill.paid_amount || 0).toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4 font-black text-rose-500 text-base">₹{balance.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => { setRecordingBill(bill); setPayAmount(balance); }}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition"
                        >
                          + Record Payment
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment History Table */}
      <div className="bg-white border border-amber-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-amber-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <History className="w-5 h-5 text-amber-600" />
            Recent Payment Transactions ({filteredPayments.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-amber-50 text-xs text-amber-800 uppercase tracking-wider border-b border-amber-100">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-50">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No transactions recorded yet.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const student = students.find(s => s.id === p.student_id);
                  return (
                    <tr key={p.id} className="hover:bg-amber-50/50 transition">
                      <td className="px-6 py-4 text-xs font-medium text-slate-500">{p.payment_date}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{student?.name || 'Student'}</div>
                        <div className="text-xs text-slate-400">{student?.student_id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                          p.mode === 'upi' ? 'bg-purple-100 text-purple-700' :
                          p.mode === 'cash' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {p.mode === 'upi' ? '📱 UPI' : p.mode === 'cash' ? '💵 Cash' : '🏦 Bank Transfer'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-black text-emerald-600">₹{p.amount.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4 text-xs text-slate-500">{p.notes || '-'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {recordingBill && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-amber-100 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900 flex items-center justify-between border-b border-amber-100 pb-3">
              <span>Record Payment — {recordingBill.students?.name}</span>
              <button onClick={() => setRecordingBill(null)} className="text-slate-400 hover:text-slate-700 text-xl leading-none">✕</button>
            </h2>
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600">Payment Amount (₹)</label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)}
                  className="w-full mt-1 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-slate-900 text-base font-bold focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Payment Method</label>
                <select
                  value={payMode}
                  onChange={(e) => setPayMode(e.target.value as 'cash' | 'upi' | 'bank_transfer')}
                  className="w-full mt-1 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-slate-900 text-sm font-semibold focus:outline-none focus:border-amber-400"
                >
                  <option value="upi">UPI (Paytm / PhonePe / GPay)</option>
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Notes / Transaction Reference</label>
                <input
                  type="text"
                  placeholder="e.g. Paytm ref 109283719"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-amber-100">
                <button type="button" onClick={() => setRecordingBill(null)} className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200 transition">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl transition">Confirm Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
