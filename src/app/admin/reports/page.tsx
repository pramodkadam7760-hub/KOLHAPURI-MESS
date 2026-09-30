'use client';

import { useState, useEffect } from 'react';
import { DataService } from '@/lib/data-service';
import { Student, Bill, Payment } from '@/lib/types';
import { BarChart3, Download, FileSpreadsheet, IndianRupee, Users } from 'lucide-react';
import Papa from 'papaparse';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    async function loadData() {
      const [stdList, billList, payList] = await Promise.all([
        DataService.getStudents(),
        DataService.getBills(),
        DataService.getPayments()
      ]);
      setStudents(stdList);
      setBills(billList);
      setPayments(payList);
    }
    loadData();
  }, []);

  function exportStudentsCSV() {
    const data = students.map(s => ({
      'Student ID': s.student_id,
      'Name': s.name,
      'Phone': s.phone,
      'Room/Batch': s.room_batch || '',
      'Status': s.status,
      'Hostel Parcel Delivery': s.is_parcel_delivery ? 'Yes' : 'No',
      'Security Deposit': s.security_deposit || 1000,
      'Join Date': s.join_date,
    }));
    const csv = Papa.unparse(data);
    downloadFile(csv, `kolhapuri_mess_students_${new Date().toISOString().split('T')[0]}.csv`);
  }

  function exportDuesCSV() {
    const unpaidBills = bills.filter(b => b.total_amount > (b.paid_amount || 0));
    const data = unpaidBills.map(b => {
      const std = students.find(s => s.id === b.student_id);
      return {
        'Student ID': std?.student_id || '',
        'Student Name': std?.name || '',
        'Phone': std?.phone || '',
        'Billing Month': `${b.billing_month}/${b.billing_year}`,
        'Total Billed (₹)': b.total_amount,
        'Paid Amount (₹)': b.paid_amount || 0,
        'Outstanding Balance (₹)': b.total_amount - (b.paid_amount || 0),
        'Status': b.status,
      };
    });
    const csv = Papa.unparse(data);
    downloadFile(csv, `kolhapuri_mess_dues_${new Date().toISOString().split('T')[0]}.csv`);
  }

  function exportPaymentsCSV() {
    const data = payments.map(p => {
      const std = students.find(s => s.id === p.student_id);
      return {
        'Payment ID': p.id,
        'Student ID': std?.student_id || '',
        'Student Name': std?.name || '',
        'Amount Paid (₹)': p.amount,
        'Payment Mode': p.mode,
        'Payment Date': p.payment_date,
        'Notes': p.notes || '',
      };
    });
    const csv = Papa.unparse(data);
    downloadFile(csv, `kolhapuri_mess_payments_${new Date().toISOString().split('T')[0]}.csv`);
  }

  function downloadFile(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    toast.success(`Downloaded ${filename}`);
  }

  const totalBilled = bills.reduce((sum, b) => sum + b.total_amount, 0);
  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalDues = bills.reduce((sum, b) => sum + (b.total_amount - (b.paid_amount || 0)), 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 rounded-2xl p-6 shadow-lg shadow-amber-500/20">
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <BarChart3 className="w-7 h-7" /> Reports & CSV Data Exports
        </h1>
        <p className="text-amber-100 text-sm mt-1">Download clean spreadsheets of student roster, outstanding dues, and revenue logs.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-amber-100 rounded-2xl p-5 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Billed Revenue</span>
          <p className="text-2xl font-black text-amber-600 mt-1">₹{totalBilled.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white border border-amber-100 rounded-2xl p-5 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Cash/UPI Collected</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">₹{totalCollected.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white border border-amber-100 rounded-2xl p-5 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Current Dues</span>
          <p className="text-2xl font-black text-rose-500 mt-1">₹{totalDues.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-amber-100 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition">
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Student Roster CSV</h3>
            <p className="text-xs text-slate-500 mt-1">Full list of enrolled students, phone numbers, room numbers, and deposit records.</p>
          </div>
          <button
            onClick={exportStudentsCSV}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow"
          >
            <Download className="w-4 h-4" /> Export Roster (.csv)
          </button>
        </div>

        <div className="bg-white border border-rose-100 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition">
          <div>
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-500 flex items-center justify-center mb-3">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Outstanding Dues CSV</h3>
            <p className="text-xs text-slate-500 mt-1">Itemized list of students with unpaid or partially paid monthly balances.</p>
          </div>
          <button
            onClick={exportDuesCSV}
            className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow"
          >
            <Download className="w-4 h-4" /> Export Dues List (.csv)
          </button>
        </div>

        <div className="bg-white border border-emerald-100 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
              <IndianRupee className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Payment History CSV</h3>
            <p className="text-xs text-slate-500 mt-1">Complete audit log of cash, UPI, and bank payments recorded.</p>
          </div>
          <button
            onClick={exportPaymentsCSV}
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow"
          >
            <Download className="w-4 h-4" /> Export Payments (.csv)
          </button>
        </div>
      </div>
    </div>
  );
}
