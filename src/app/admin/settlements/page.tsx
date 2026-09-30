'use client';

import { useState, useEffect } from 'react';
import { DataService } from '@/lib/data-service';
import { Student } from '@/lib/types';
import { UserMinus, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettlementsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [settlingStudent, setSettlingStudent] = useState<Student | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadStudents(); }, []);

  async function loadStudents() {
    const data = await DataService.getStudents();
    setStudents(data);
  }

  async function handleConfirmSettlement() {
    if (!settlingStudent) return;
    setLoading(true);
    try {
      await DataService.processSettlement(settlingStudent.id, notes);
      toast.success(`Settlement completed for ${settlingStudent.name}!`);
      setSettlingStudent(null);
      setSelectedStudentId('');
      setNotes('');
      loadStudents();
    } catch (e: unknown) {
      toast.error((e as Error).message || 'Settlement failed');
    } finally {
      setLoading(false);
    }
  }

  const activeStudents = students.filter(s => s.status !== 'left');
  const settledStudents = students.filter(s => s.status === 'left');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 rounded-2xl p-6 shadow-lg shadow-amber-500/20">
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <UserMinus className="w-7 h-7" /> Student Final Settlement & Deposit Refund
        </h1>
        <p className="text-amber-100 text-sm mt-1">When a student leaves, apply their ₹1,000 security deposit against outstanding dues.</p>
      </div>

      {/* Select Student for Settlement */}
      <div className="bg-white border border-amber-100 rounded-2xl p-6 space-y-4 shadow-sm">
        <h2 className="text-base font-bold text-slate-900">Select Student Leaving</h2>

        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedStudentId}
            onChange={(e) => {
              setSelectedStudentId(e.target.value);
              const found = students.find(s => s.id === e.target.value);
              setSettlingStudent(found || null);
            }}
            className="flex-1 p-3 bg-amber-50 border border-amber-200 rounded-xl text-slate-900 text-sm font-semibold focus:outline-none focus:border-amber-400"
          >
            <option value="">-- Choose Student --</option>
            {activeStudents.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.student_id}) — Deposit Held: ₹{s.security_deposit || 1000}
              </option>
            ))}
          </select>
        </div>

        {/* Settlement Summary */}
        {settlingStudent && (
          <div className="mt-4 p-5 bg-amber-50 border border-amber-200 rounded-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-amber-200">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">{settlingStudent.name}</h3>
                <p className="text-xs text-slate-500">ID: {settlingStudent.student_id} • Room: {settlingStudent.room_batch}</p>
              </div>
              <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold border border-amber-300">
                Deposit Held: ₹1,000
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-white rounded-xl border border-emerald-100">
                <span className="text-xs text-slate-500">Security Deposit</span>
                <p className="text-lg font-bold text-emerald-600">₹1,000</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-amber-100">
                <span className="text-xs text-slate-500">Deposit Application</span>
                <p className="text-lg font-bold text-amber-600">−₹1,000</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-rose-100">
                <span className="text-xs text-slate-500">Account Status</span>
                <p className="text-lg font-bold text-rose-500">Closing Account</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600">Settlement Remarks / Notes</label>
              <input
                type="text"
                placeholder="e.g. Deposit refunded in cash after dues deduction"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full mt-1 p-2.5 bg-white border border-amber-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={handleConfirmSettlement}
                disabled={loading}
                className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm rounded-xl transition flex items-center gap-2 shadow-lg"
              >
                <CheckCircle2 className="w-4 h-4" />
                {loading ? 'Processing...' : 'Confirm Final Settlement'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* History of Closed Accounts */}
      <div className="bg-white border border-amber-100 rounded-2xl p-6 space-y-4 shadow-sm">
        <h2 className="text-base font-bold text-slate-900">Closed Student Accounts ({settledStudents.length})</h2>

        <div className="space-y-3">
          {settledStudents.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No closed student accounts yet.</p>
          ) : (
            settledStudents.map(s => (
              <div key={s.id} className="flex items-center justify-between p-3.5 bg-amber-50/50 border border-amber-100 rounded-xl">
                <div>
                  <p className="font-bold text-slate-900 text-sm">{s.name}</p>
                  <p className="text-xs text-slate-400">ID: {s.student_id} • Left on: {s.left_date || 'N/A'}</p>
                </div>
                <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-semibold border border-slate-200">
                  Account Closed
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
