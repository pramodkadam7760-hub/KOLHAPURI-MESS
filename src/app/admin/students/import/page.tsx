'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataService } from '@/lib/data-service';
import { Upload, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Papa from 'papaparse';
import toast from 'react-hot-toast';

export default function CSVImportPage() {
  const router = useRouter();
  const [csvText, setCsvText] = useState('');
  const [preview, setPreview] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: Papa.ParseResult<unknown>) => { setPreview(results.data); },
      error: (err: Error) => { toast.error('Failed to parse CSV file: ' + err.message); }
    });
  }

  function handleTextParse() {
    if (!csvText.trim()) return;
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results: Papa.ParseResult<unknown>) => { setPreview(results.data); }
    });
  }

  async function handleImport() {
    if (preview.length === 0) return;
    setLoading(true);
    let importedCount = 0;
    for (const rawRow of preview) {
      const row = rawRow as Record<string, string>;
      const name = row.name || row.Name || row['Student Name'];
      const phone = row.phone || row.Phone || row['Mobile'] || '0000000000';
      const student_id = row.student_id || row['Student ID'] || `KM-${Math.floor(100 + Math.random() * 900)}`;
      const room = row.room_batch || row.Room || row.Batch || '';
      const parcel = (row.parcel || row.Parcel || '').toString().toLowerCase() === 'yes';
      if (name) {
        await DataService.saveStudent({ student_id, name, phone, room_batch: room, is_parcel_delivery: parcel, security_deposit: 1000, deposit_paid: true, status: 'active' });
        importedCount++;
      }
    }
    setLoading(false);
    toast.success(`Successfully imported ${importedCount} students!`);
    router.push('/admin/students');
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 rounded-2xl p-6 shadow-lg shadow-amber-500/20 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl bg-white/20 border border-white/30 text-white hover:bg-white/30 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Bulk Import Students (CSV / Excel)</h1>
          <p className="text-amber-100 text-xs mt-0.5">Import student roster directly from CSV export of your old Excel sheet.</p>
        </div>
      </div>

      <div className="bg-white border border-amber-100 rounded-2xl p-6 space-y-5 shadow-sm">
        <div>
          <label className="text-xs font-semibold text-slate-600">Option 1: Upload .csv file</label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="w-full mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-slate-700 text-sm file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-amber-500 file:text-white file:font-bold"
          />
        </div>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-amber-100"></div>
          <span className="flex-shrink mx-4 text-xs font-bold text-slate-400 uppercase">OR</span>
          <div className="flex-grow border-t border-amber-100"></div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600">Option 2: Paste CSV Text</label>
          <textarea
            rows={4}
            placeholder={`name,phone,room_batch,student_id\nRohan Patil,9822101010,Room 102,KM-101\nSuraj Shinde,9765402020,Room 105,KM-102`}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            className="w-full mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-slate-900 text-xs font-mono placeholder-slate-400 focus:outline-none focus:border-amber-400"
          />
          <button
            onClick={handleTextParse}
            className="mt-2 px-4 py-2 rounded-xl bg-amber-100 text-amber-800 text-xs font-semibold hover:bg-amber-200 transition border border-amber-200"
          >
            Parse Text
          </button>
        </div>

        {/* Preview Table */}
        {preview.length > 0 && (
          <div className="pt-4 border-t border-amber-100 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Parsed Preview ({preview.length} rows found)
              </h3>
              <button
                onClick={handleImport}
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm flex items-center gap-2 transition"
              >
                <Upload className="w-4 h-4" />
                {loading ? 'Importing...' : 'Confirm & Save All'}
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto rounded-xl border border-amber-100">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-amber-50 text-amber-800 sticky top-0">
                  <tr>
                    <th className="p-2.5">Name</th>
                    <th className="p-2.5">Phone</th>
                    <th className="p-2.5">Room</th>
                    <th className="p-2.5">ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-50">
                  {preview.map((rawRow, idx) => {
                    const row = rawRow as Record<string, string>;
                    return (
                      <tr key={idx} className="hover:bg-amber-50/50">
                        <td className="p-2.5 font-semibold text-slate-900">{row.name || row.Name}</td>
                        <td className="p-2.5">{row.phone || row.Phone}</td>
                        <td className="p-2.5">{row.room_batch || row.Room}</td>
                        <td className="p-2.5 font-mono text-amber-700">{row.student_id || row['Student ID']}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
