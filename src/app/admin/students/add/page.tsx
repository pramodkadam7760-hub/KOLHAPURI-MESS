'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataService } from '@/lib/data-service';
import { compressImageFile } from '@/lib/image-utils';
import { Users, ArrowLeft, Save, Truck, Shield, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddStudentPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    student_id: `KM-${Math.floor(100 + Math.random() * 900)}`,
    name: '',
    phone: '',
    password: 'pass123',
    college_name: '',
    batch_year: 'CS 2026 Batch',
    room_batch: '',
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    join_date: new Date().toISOString().split('T')[0],
    security_deposit: 1000,
    deposit_paid: true,
    is_parcel_delivery: false,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast.error('Name and Phone are required');
      return;
    }
    await DataService.saveStudent(formData);
    toast.success(`Enrolled student ${formData.name} successfully!`);
    router.push('/admin/students');
  }

  const inputCls = "w-full mt-1.5 p-3 bg-amber-50 border border-amber-200 rounded-xl text-slate-900 text-sm font-semibold focus:outline-none focus:border-amber-400 transition";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 rounded-2xl p-6 shadow-lg shadow-amber-500/20 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl bg-white/20 border border-white/30 text-white hover:bg-white/30 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Enroll New Student</h1>
          <p className="text-amber-100 text-xs">Add student profile with college, batch, photo, password, and security deposit details.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-amber-100 rounded-2xl p-6 space-y-5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-600">Student ID (Unique)</label>
            <input
              type="text"
              value={formData.student_id}
              onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
              className={inputCls}
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Full Name *</label>
            <input
              type="text"
              placeholder="e.g. Rohan Patil"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={inputCls}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-600">Institution / Branch</label>
            <input
              type="text"
              placeholder="e.g. Engineering, Arts, General"
              value={formData.college_name}
              onChange={(e) => setFormData({ ...formData, college_name: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Batch / Branch Year</label>
            <input
              type="text"
              placeholder="e.g. CS 2026 Batch"
              value={formData.batch_year}
              onChange={(e) => setFormData({ ...formData, batch_year: e.target.value })}
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600">Student Profile Photo</label>
          <div className="flex items-center gap-3 mt-1.5">
            {formData.photo_url ? (
              <img
                src={formData.photo_url}
                alt="Preview"
                className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400 shadow-sm shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-900 font-black flex items-center justify-center text-xs border border-amber-300 shrink-0">
                No Photo
              </div>
            )}
            <div className="flex-1 space-y-1.5">
              <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-extrabold rounded-xl border border-amber-300 transition shadow-xs">
                <Upload className="w-4 h-4 text-amber-700" /> Choose Photo File from Device
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const compressed = await compressImageFile(file);
                        setFormData({ ...formData, photo_url: compressed });
                        toast.success('Photo file attached & optimized!');
                      } catch {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          if (typeof reader.result === 'string') {
                            setFormData({ ...formData, photo_url: reader.result });
                            toast.success('Photo file attached!');
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
                value={formData.photo_url}
                onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-600">Phone Number *</label>
            <input
              type="tel"
              placeholder="10 digit mobile number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className={inputCls}
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Login Password *</label>
            <input
              type="text"
              placeholder="e.g. pass123"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={inputCls}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-600">Room / Hostel</label>
            <input
              type="text"
              placeholder="e.g. Room 102, Block A"
              value={formData.room_batch}
              onChange={(e) => setFormData({ ...formData, room_batch: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Security Deposit (₹)</label>
            <input
              type="number"
              value={formData.security_deposit}
              onChange={(e) => setFormData({ ...formData, security_deposit: parseFloat(e.target.value) || 0 })}
              className={inputCls}
              required
            />
          </div>
        </div>

        {/* Checkboxes */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="parcelDelivery"
              checked={formData.is_parcel_delivery}
              onChange={(e) => setFormData({ ...formData, is_parcel_delivery: e.target.checked })}
              className="w-4 h-4 accent-amber-500 rounded"
            />
            <label htmlFor="parcelDelivery" className="text-xs text-slate-700 font-semibold flex items-center gap-1.5 cursor-pointer">
              <Truck className="w-4 h-4 text-amber-600" />
              Hostel Parcel Delivery Student (+₹10 extra per meal day)
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="depositPaid"
              checked={formData.deposit_paid}
              onChange={(e) => setFormData({ ...formData, deposit_paid: e.target.checked })}
              className="w-4 h-4 accent-emerald-500 rounded"
            />
            <label htmlFor="depositPaid" className="text-xs text-slate-700 font-semibold flex items-center gap-1.5 cursor-pointer">
              <Shield className="w-4 h-4 text-emerald-600" />
              Security deposit of ₹1,000 paid at enrollment
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-amber-100">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm flex items-center gap-2 transition"
          >
            <Save className="w-4 h-4" /> Save & Enroll
          </button>
        </div>
      </form>
    </div>
  );
}
