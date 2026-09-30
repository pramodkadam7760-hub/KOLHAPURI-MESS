'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DataService } from '@/lib/data-service';
import { compressImageFile } from '@/lib/image-utils';
import { Student } from '@/lib/types';
import { 
  Users, 
  Plus, 
  Search, 
  Upload, 
  Truck, 
  Edit3, 
  CheckCircle2, 
  AlertCircle,
  Phone,
  UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentsListPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending_approval' | 'active' | 'on_leave' | 'left'>('all');
  const [parcelFilter, setParcelFilter] = useState<'all' | 'parcel' | 'dinein'>('all');
  const [loading, setLoading] = useState(true);
  
  // Edit Student Modal state
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [pendingOnlineCount, setPendingOnlineCount] = useState(0);

  useEffect(() => {
    loadStudents();
    checkPendingOnlineRegistrations();

    window.addEventListener('storage', loadStudents);
    window.addEventListener('students_updated', loadStudents);
    return () => {
      window.removeEventListener('storage', loadStudents);
      window.removeEventListener('students_updated', loadStudents);
    };
  }, []);

  function checkPendingOnlineRegistrations() {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('km_registrations_v1');
    if (stored) {
      try {
        const list = JSON.parse(stored);
        const count = list.filter((r: any) => r.status === 'pending').length;
        setPendingOnlineCount(count);
      } catch (e) {}
    }
  }

  async function loadStudents() {
    setLoading(true);
    const data = await DataService.getStudents();
    setStudents(data);
    setLoading(false);
  }

  const pendingStudents = students.filter(s => s.status === 'pending_approval');

  const filteredStudents = students.filter(s => {
    const q = search.toLowerCase();
    const matchesSearch = s.name.toLowerCase().includes(q) || 
                          s.student_id.toLowerCase().includes(q) ||
                          s.phone.includes(search) ||
                          (s.college_name && s.college_name.toLowerCase().includes(q)) ||
                          (s.batch_year && s.batch_year.toLowerCase().includes(q)) ||
                          (s.room_batch && s.room_batch.toLowerCase().includes(q));
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchesParcel = parcelFilter === 'all' 
      ? true 
      : parcelFilter === 'parcel' 
        ? s.is_parcel_delivery 
        : !s.is_parcel_delivery;
    return matchesSearch && matchesStatus && matchesParcel;
  });

  async function handleApproveStudent(student: Student) {
    await DataService.approveStudent(student.id);
    toast.success(`🎉 Approved ${student.name} (${student.student_id})! Account is now active.`);
    loadStudents();
  }

  async function handleToggleParcel(student: Student) {
    const updated = { ...student, is_parcel_delivery: !student.is_parcel_delivery };
    await DataService.saveStudent(updated);
    toast.success(`Updated parcel delivery setting for ${student.name}`);
    loadStudents();
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingStudent) return;
    await DataService.saveStudent(editingStudent);
    toast.success('Student updated successfully!');
    setEditingStudent(null);
    loadStudents();
  }

  return (
    <div className="space-y-6">
      {/* Pending Online Registrations Alert Banner */}
      {pendingOnlineCount > 0 && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 rounded-3xl p-5 text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-amber-400/40 animate-in fade-in">
          <div>
            <span className="inline-block text-[10px] font-black uppercase tracking-widest bg-amber-950/40 text-amber-200 px-3 py-1 rounded-full mb-1 border border-white/20">
              Approval Required
            </span>
            <h2 className="text-lg font-black tracking-tight">
              📩 {pendingOnlineCount} New Online Registration Request{pendingOnlineCount > 1 ? 's' : ''} Awaiting Admin Approval
            </h2>
            <p className="text-xs text-amber-100 mt-0.5">
              Review student sign-up details & uploaded photos under Online Registrations and click Approve to add them to this Student Roster.
            </p>
          </div>
          <Link
            href="/admin/registrations"
            className="px-4 py-2 bg-white text-amber-900 font-extrabold text-xs rounded-xl shadow hover:bg-amber-50 transition shrink-0 inline-flex items-center gap-1"
          >
            Review Online Requests ({pendingOnlineCount}) →
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-amber-600" />
            Enrolled Students ({students.length})
          </h1>
          <p className="text-xs text-slate-500 font-medium">Manage student directory, college reference data, photos, and delivery preferences.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/students/import"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-100/70 hover:bg-amber-200/80 text-amber-900 font-extrabold text-xs transition border border-amber-300"
          >
            <Upload className="w-4 h-4 text-amber-700" />
            CSV Import
          </Link>
          <Link
            href="/admin/students/add"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            Add Student
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3 bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-amber-700/60" />
          <input 
            type="text"
            placeholder="Search by name, ID (e.g. KM-101), college, batch, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-extrabold text-slate-700">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-amber-50/40 border border-amber-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending_approval">⏳ Pending Approval ({pendingStudents.length})</option>
              <option value="active">Active Only</option>
              <option value="on_leave">On Leave</option>
              <option value="left">Left / Settled</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-extrabold text-slate-700">Delivery:</label>
            <select
              value={parcelFilter}
              onChange={(e) => setParcelFilter(e.target.value as any)}
              className="bg-amber-50/40 border border-amber-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Delivery Types</option>
              <option value="parcel">📦 Hostel Delivery Only</option>
              <option value="dinein">🍽️ Mess Dine-In Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white border border-amber-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-amber-50/70 text-xs text-slate-800 font-extrabold uppercase tracking-wider border-b border-amber-200/80">
              <tr>
                <th className="px-6 py-4">Student Photo & Name</th>
                <th className="px-6 py-4">Institution & Branch Reference</th>
                <th className="px-6 py-4">Room & Phone</th>
                <th className="px-6 py-4">Hostel Delivery</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">
                    No students found matching search filters.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-amber-50/40 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {s.photo_url ? (
                          <img 
                            src={s.photo_url} 
                            alt={s.name} 
                            className="w-10 h-10 rounded-2xl object-cover border-2 border-amber-300 shadow-sm shrink-0" 
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 font-black flex items-center justify-center text-xs border border-amber-300 shrink-0">
                            {s.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                            {s.name}
                            <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded-md border border-amber-300 font-bold">{s.student_id}</span>
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium">Pass: <span className="font-mono text-slate-700 font-bold">{s.password || 'pass123'}</span></p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{s.college_name || 'General Institution'}</p>
                      <p className="text-[11px] text-amber-700 font-extrabold mt-0.5">{s.batch_year || '2026 Batch'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{s.room_batch || 'N/A'}</p>
                      <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-amber-600" /> {s.phone}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleToggleParcel(s)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold transition ${
                          s.is_parcel_delivery 
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        <Truck className="w-3.5 h-3.5" />
                        {s.is_parcel_delivery ? 'Yes (+₹10/day)' : 'Dine-in only'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase ${
                        s.status === 'active' 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : s.status === 'pending_approval'
                          ? 'bg-amber-100 text-amber-900 border border-amber-400 font-extrabold animate-pulse'
                          : s.status === 'on_leave'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}>
                        {s.status === 'pending_approval' ? '⏳ Pending Approval' : s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {s.status === 'pending_approval' && (
                          <button 
                            onClick={() => handleApproveStudent(s)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs shadow transition flex items-center gap-1"
                            title="Approve Student Account"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </button>
                        )}
                        <button 
                          onClick={() => setEditingStudent(s)}
                          className="p-2 rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 transition"
                          title="Edit Student Profile & Photo"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-amber-300 rounded-3xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
            <h2 className="text-lg font-black text-slate-900 flex items-center justify-between border-b border-amber-100 pb-3">
              <span>Edit Student Profile — {editingStudent.student_id}</span>
              <button onClick={() => setEditingStudent(null)} className="text-slate-400 hover:text-slate-700 text-sm font-bold">✕</button>
            </h2>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700">Full Name</label>
                <input 
                  type="text" 
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-slate-900 text-sm font-semibold focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Institution / Branch</label>
                  <input 
                    type="text" 
                    placeholder="Enter institution or branch"
                    value={editingStudent.college_name || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, college_name: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-slate-900 text-xs font-bold focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Batch / Branch Year</label>
                  <input 
                    type="text" 
                    placeholder="e.g. CS 2026 Batch"
                    value={editingStudent.batch_year || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, batch_year: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-slate-900 text-xs font-bold focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Student Profile Photo</label>
                <div className="flex items-center gap-3 mt-1.5">
                  {editingStudent.photo_url ? (
                    <img 
                      src={editingStudent.photo_url} 
                      alt={editingStudent.name} 
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400 shadow-sm shrink-0" 
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-900 font-black flex items-center justify-center text-xs border border-amber-300 shrink-0">
                      No Photo
                    </div>
                  )}
                  <div className="flex-1 space-y-1.5">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-extrabold rounded-xl border border-amber-300 transition shadow-xs">
                      <Upload className="w-4 h-4 text-amber-700" /> Choose Local Photo File
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const compressed = await compressImageFile(file);
                              setEditingStudent({ ...editingStudent, photo_url: compressed });
                              toast.success('Photo file uploaded & optimized!');
                            } catch {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                if (typeof reader.result === 'string') {
                                  setEditingStudent({ ...editingStudent, photo_url: reader.result });
                                  toast.success('Photo file uploaded!');
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }
                        }}
                      />
                    </label>
                    <input 
                      type="url" 
                      placeholder="Or paste photo URL (https://...)"
                      value={editingStudent.photo_url || ''}
                      onChange={(e) => setEditingStudent({ ...editingStudent, photo_url: e.target.value })}
                      className="w-full p-2 bg-amber-50/40 border border-amber-200 rounded-xl text-slate-900 text-xs font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Student ID</label>
                  <input 
                    type="text" 
                    value={editingStudent.student_id}
                    onChange={(e) => setEditingStudent({ ...editingStudent, student_id: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-slate-900 text-xs font-bold focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Password</label>
                  <input 
                    type="text" 
                    value={editingStudent.password || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, password: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-slate-900 text-xs font-mono font-bold focus:border-amber-500 focus:outline-none"
                    placeholder="Set Login Password"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Phone Number</label>
                  <input 
                    type="text" 
                    value={editingStudent.phone}
                    onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-slate-900 text-sm font-semibold focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Room / Batch</label>
                  <input 
                    type="text" 
                    value={editingStudent.room_batch || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, room_batch: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-slate-900 text-sm font-semibold focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Status</label>
                  <select 
                    value={editingStudent.status}
                    onChange={(e) => setEditingStudent({ ...editingStudent, status: e.target.value as any })}
                    className="w-full mt-1 p-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-slate-900 text-sm font-semibold focus:border-amber-500 focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="on_leave">On Leave</option>
                    <option value="left">Left (Settled)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Security Deposit (₹)</label>
                  <input 
                    type="number" 
                    value={editingStudent.security_deposit}
                    onChange={(e) => setEditingStudent({ ...editingStudent, security_deposit: parseFloat(e.target.value) || 0 })}
                    className="w-full mt-1 p-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-slate-900 text-sm font-semibold focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-amber-50/50 border border-amber-200 rounded-xl">
                <input 
                  type="checkbox"
                  id="parcelCheck"
                  checked={editingStudent.is_parcel_delivery}
                  onChange={(e) => setEditingStudent({ ...editingStudent, is_parcel_delivery: e.target.checked })}
                  className="w-4 h-4 accent-amber-600 rounded"
                />
                <label htmlFor="parcelCheck" className="text-xs text-slate-800 font-bold">
                  Hostel Parcel Delivery (charge ₹10 extra per day)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-amber-100">
                <button 
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-black hover:from-amber-600 hover:to-amber-700 shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
