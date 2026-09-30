'use client';

import { useState, useEffect } from 'react';
import { DataService } from '@/lib/data-service';
import { Student } from '@/lib/types';
import { 
  UserCheck, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Phone, 
  Home, 
  GraduationCap, 
  Utensils, 
  Truck,
  Calendar,
  Clock,
  MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';

interface RegistrationRequest {
  id: string;
  name: string;
  phone: string;
  college: string;
  room_batch: string;
  photo_url?: string;
  meal_preference: 'veg' | 'non_veg' | 'egg' | '';
  meal_plan: 'both' | 'lunch' | 'dinner' | '';
  is_parcel_delivery: boolean;
  message: string;
  submitted_at: string;
  status: 'pending' | 'approved' | 'rejected';
}

const LOCAL_KEY = 'km_registrations_v1';

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<RegistrationRequest[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    loadRegistrations();
  }, []);

  function loadRegistrations() {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(LOCAL_KEY);
    if (stored) {
      try {
        setRegistrations(JSON.parse(stored));
      } catch (e) {
        setRegistrations([]);
      }
    }
  }

  function saveRegistrations(updated: RegistrationRequest[]) {
    setRegistrations(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
    }
  }

  async function handleApprove(reg: RegistrationRequest) {
    const existingStudents = await DataService.getStudents();
    
    // Check if student with same phone already exists in roster
    const existingMatch = existingStudents.find(s => s.phone.replace(/\D/g, '') === reg.phone.replace(/\D/g, ''));
    if (existingMatch) {
      const updatedMatch = {
        ...existingMatch,
        status: 'active' as const,
        photo_url: reg.photo_url || existingMatch.photo_url,
        college_name: reg.college || existingMatch.college_name,
        room_batch: reg.room_batch || existingMatch.room_batch,
      };
      await DataService.saveStudent(updatedMatch);
      const updated = registrations.map(r => r.id === reg.id ? { ...r, status: 'approved' as const } : r);
      saveRegistrations(updated);
      toast.success(`Approved existing record for ${reg.name} (${existingMatch.student_id})!`);
      return;
    }

    // Generate next Student ID
    const maxNum = existingStudents.reduce((max, s) => {
      const match = s.student_id.match(/KM-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 100);

    const nextStudentId = `KM-${maxNum + 1}`;

    const newStudent: Student = {
      id: `std-${Date.now()}`,
      student_id: nextStudentId,
      name: reg.name,
      phone: reg.phone,
      password: 'pass123',
      college_name: reg.college || 'General College',
      batch_year: '2026 Batch',
      room_batch: reg.room_batch || '',
      photo_url: reg.photo_url || '',
      join_date: new Date().toISOString().split('T')[0],
      status: 'active',
      security_deposit: 1000,
      deposit_paid: true,
      is_parcel_delivery: reg.is_parcel_delivery,
    };

    await DataService.saveStudent(newStudent);

    // Update status to approved
    const updated = registrations.map(r => r.id === reg.id ? { ...r, status: 'approved' as const } : r);
    saveRegistrations(updated);

    toast.success(`Approved! ${reg.name} registered with ID ${nextStudentId} 🎉`);
  }

  function handleReject(id: string) {
    const updated = registrations.map(r => r.id === id ? { ...r, status: 'rejected' as const } : r);
    saveRegistrations(updated);
    toast.error('Registration marked as rejected.');
  }

  function handleDelete(id: string) {
    const updated = registrations.filter(r => r.id !== id);
    saveRegistrations(updated);
    toast.success('Registration entry deleted.');
  }

  const filtered = registrations.filter(r => {
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    const q = search.toLowerCase();
    const matchesSearch = 
      r.name.toLowerCase().includes(q) ||
      r.phone.includes(q) ||
      r.college.toLowerCase().includes(q) ||
      r.room_batch.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const pendingCount = registrations.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 rounded-2xl p-6 text-white shadow-lg shadow-amber-500/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
              Student Registration Portal
            </span>
            {pendingCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-black px-2.5 py-0.5 rounded-full animate-pulse">
                {pendingCount} New Request{pendingCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black tracking-tight">Online Student Registrations</h1>
          <p className="text-amber-100 text-xs mt-1">
            Review online application submissions from students, verify details, and approve them to automatically assign Student IDs.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 bg-amber-50/70 p-1 rounded-xl border border-amber-200/60 w-full sm:w-auto">
          {(['pending', 'approved', 'rejected', 'all'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold capitalize transition-all ${
                filterStatus === st
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-amber-900 hover:bg-amber-100/50'
              }`}
            >
              {st} {st === 'pending' && pendingCount > 0 ? `(${pendingCount})` : ''}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-amber-700/60" />
          <input 
            type="text"
            placeholder="Search by student name, phone, college..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-amber-50/40 border border-amber-200 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          />
        </div>
      </div>

      {/* Registrations List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-amber-200/80 p-12 text-center space-y-3">
          <div className="w-14 h-14 bg-amber-100/60 rounded-full flex items-center justify-center mx-auto text-amber-700">
            <UserCheck className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Registrations Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {filterStatus === 'pending' 
              ? 'There are currently no pending online registration requests from students.' 
              : 'No student registrations match your search criteria.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((reg) => (
            <div 
              key={reg.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs transition-all hover:shadow-md ${
                reg.status === 'pending'
                  ? 'border-amber-300 bg-gradient-to-br from-amber-50/40 via-white to-orange-50/20'
                  : reg.status === 'approved'
                  ? 'border-emerald-200/80 bg-emerald-50/10'
                  : 'border-slate-200 opacity-75'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-amber-100">
                <div className="flex items-center gap-3">
                  {reg.photo_url ? (
                    <img 
                      src={reg.photo_url} 
                      alt={reg.name} 
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-400 shadow-sm shrink-0" 
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 font-black flex items-center justify-center text-sm border border-amber-300 shrink-0">
                      {reg.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">{reg.name}</h3>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600 mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-amber-600" />
                      <span>{reg.phone}</span>
                    </div>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  reg.status === 'pending'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : reg.status === 'approved'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  {reg.status}
                </span>
              </div>

              {/* Details Grid */}
              <div className="py-3 grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <GraduationCap className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span className="truncate" title={reg.college}>
                    <strong className="text-slate-900 font-semibold">Institution:</strong> {reg.college || 'N/A'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  <Home className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span className="truncate">
                    <strong className="text-slate-900 font-semibold">Room:</strong> {reg.room_batch || 'N/A'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  <Utensils className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>
                    <strong className="text-slate-900 font-semibold">Preference:</strong> {reg.meal_preference ? reg.meal_preference.toUpperCase() : 'N/A'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  <Truck className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>
                    <strong className="text-slate-900 font-semibold">Parcel:</strong> {reg.is_parcel_delivery ? 'Yes (+₹10)' : 'No'}
                  </span>
                </div>
              </div>

              {/* Message if present */}
              {reg.message && (
                <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/60 text-xs text-slate-700 flex items-start gap-2 mb-3">
                  <MessageSquare className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="italic">"{reg.message}"</p>
                </div>
              )}

              {/* Footer info & action buttons */}
              <div className="pt-3 border-t border-amber-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{new Date(reg.submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <div className="flex items-center gap-2">
                  {reg.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(reg)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve
                      </button>

                      <button
                        onClick={() => handleReject(reg.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => handleDelete(reg.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
