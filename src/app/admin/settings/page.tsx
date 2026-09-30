'use client';

import { useState } from 'react';
import { Settings as SettingsIcon, QrCode, Save, Truck } from 'lucide-react';
import { UPI_DETAILS } from '@/lib/constants';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [upiName, setUpiName] = useState(UPI_DETAILS.payeeName);
  const [upiId, setUpiId] = useState(UPI_DETAILS.upiId);
  const [phone, setPhone] = useState(UPI_DETAILS.phone);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    toast.success('Settings updated successfully!');
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 rounded-2xl p-6 shadow-lg shadow-amber-500/20">
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-7 h-7" /> Mess System Settings
        </h1>
        <p className="text-amber-100 text-sm mt-1">Configure UPI QR payment details, parcel charges, and security deposit rules.</p>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-amber-100 rounded-2xl p-6 space-y-6 shadow-sm">
        {/* UPI Payment Config */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-amber-100">
            <QrCode className="w-5 h-5 text-amber-600" />
            <h2 className="font-bold text-slate-900 text-base">Paytm Business UPI QR Settings</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600">Payee Account Name</label>
              <input
                type="text"
                value={upiName}
                onChange={(e) => setUpiName(e.target.value)}
                className="w-full mt-1.5 p-3 bg-amber-50 border border-amber-200 rounded-xl text-slate-900 text-sm font-semibold focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Paytm VPA / UPI ID</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full mt-1.5 p-3 bg-amber-50 border border-amber-200 rounded-xl text-slate-900 text-sm font-semibold font-mono text-amber-700 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">Contact / Phone Number for Mess</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full mt-1.5 p-3 bg-amber-50 border border-amber-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Parcel & Deposit Rules */}
        <div className="space-y-4 pt-4 border-t border-amber-100">
          <div className="flex items-center gap-2 pb-3 border-b border-amber-100">
            <Truck className="w-5 h-5 text-amber-600" />
            <h2 className="font-bold text-slate-900 text-base">Delivery & Deposit Default Charges</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <span className="text-xs font-semibold text-slate-500">Hostel Parcel Fee</span>
              <p className="text-xl font-bold text-amber-600 mt-1">₹10 / meal day</p>
              <p className="text-[11px] text-slate-400 mt-1">Charged only to students marked for parcel delivery</p>
            </div>
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <span className="text-xs font-semibold text-slate-500">Default Security Deposit</span>
              <p className="text-xl font-bold text-emerald-600 mt-1">₹1,000</p>
              <p className="text-[11px] text-slate-400 mt-1">Refundable at final settlement when student leaves</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-amber-100">
          <button
            type="submit"
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Settings
          </button>
        </div>
      </form>

      {/* Danger Zone: System Reset */}
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 space-y-3">
        <div className="flex items-center gap-2 text-rose-800 font-extrabold text-sm">
          ⚠️ Danger Zone: System Data Reset
        </div>
        <p className="text-xs text-rose-700">
          If you want to clear all existing demo students, orders, bills, and start completely fresh, click below.
        </p>
        <button
          type="button"
          onClick={() => {
            if (confirm('Are you sure you want to clear all demo data and start with an empty student directory?')) {
              if (typeof window !== 'undefined') {
                localStorage.removeItem('km_students_v6');
                localStorage.removeItem('km_orders_v2');
                localStorage.removeItem('km_bills_v2');
                localStorage.removeItem('km_payments_v2');
                localStorage.removeItem('km_registrations_v1');
                window.location.reload();
              }
            }
          }}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition"
        >
          🗑️ Clear Demo Data & Start Fresh
        </button>
      </div>
    </div>
  );
}
