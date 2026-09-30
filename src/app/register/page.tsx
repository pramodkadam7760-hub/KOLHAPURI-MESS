'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, CheckCircle2, User, Phone, Home, Utensils, 
  Truck, ChefHat, Send, AlertCircle, Sparkles, Upload, Camera
} from 'lucide-react';
import { MESS_DETAILS } from '@/lib/constants';
import { compressImageFile } from '@/lib/image-utils';
import { DataService } from '@/lib/data-service';

interface RegistrationForm {
  name: string;
  phone: string;
  college: string;
  room_batch: string;
  photo_url: string;
  meal_preference: 'veg' | 'non_veg' | 'egg' | '';
  meal_plan: 'both' | 'lunch' | 'dinner' | '';
  is_parcel_delivery: boolean;
  message: string;
}

const LOCAL_KEY = 'km_registrations_v1';

function saveRegistration(data: RegistrationForm) {
  if (typeof window === 'undefined') return;
  const existing = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
  const newItem = {
    ...data,
    id: `reg-${Date.now()}`,
    submitted_at: new Date().toISOString(),
    status: 'pending',
  };
  existing.push(newItem);

  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(existing));
  } catch (err) {
    console.warn('LocalStorage quota exceeded, performing fallback saving strategy:', err);
    try {
      // Retain only last 10 registrations if localStorage is near limit
      const trimmed = existing.slice(-10);
      localStorage.setItem(LOCAL_KEY, JSON.stringify(trimmed));
    } catch {
      try {
        localStorage.setItem(LOCAL_KEY, JSON.stringify([newItem]));
      } catch (finalErr) {
        console.error('Final fallback failed to set localStorage:', finalErr);
      }
    }
  }
}

export default function RegisterPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<RegistrationForm>({
    name: '',
    phone: '',
    college: '',
    room_batch: '',
    photo_url: '',
    meal_preference: '',
    meal_plan: '',
    is_parcel_delivery: false,
    message: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegistrationForm, string>>>({});

  function update(field: keyof RegistrationForm, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  }

  function validateStep1() {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.phone.trim() || form.phone.replace(/\D/g, '').length < 10) e.phone = 'Valid 10-digit phone number required';
    if (!form.college.trim()) e.college = 'College / institution is required';
    if (!form.photo_url.trim()) e.photo_url = 'Student profile photo is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateStep2() {
    const e: typeof errors = {};
    if (!form.meal_preference) e.meal_preference = 'Please select a meal preference';
    if (!form.meal_plan) e.meal_plan = 'Please select a meal plan';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 600));
    saveRegistration(form);
    setSubmitted(true);
    setSubmitting(false);
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-950 via-amber-900 to-orange-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-stone-900/90 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500/50">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white mb-2">Registration Submitted! 🎉</h1>
            <p className="text-amber-200/80 text-sm leading-relaxed">
              Thank you <strong className="text-white">{form.name}</strong>! Your registration request has been sent to the mess owner. 
              You will receive a confirmation call on <strong className="text-white">{form.phone}</strong> within 24 hours.
            </p>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-left space-y-2">
            <p className="text-xs font-bold text-amber-300 uppercase tracking-wide">What Happens Next?</p>
            <ul className="text-xs text-amber-200/80 space-y-1.5">
              <li>✅ Admin reviews your request</li>
              <li>📞 You get a confirmation call from Mess Owner</li>
              <li>🔑 Your Student ID (KM-XXX) is created</li>
              <li>💳 Pay ₹1,000 security deposit to join</li>
              <li>🍱 Start enjoying meals from day 1!</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Link
              href="/"
              className="flex-1 px-4 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm rounded-xl transition text-center"
            >
              Back to Home
            </Link>
            <a
              href={MESS_DETAILS.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-xl transition text-center"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950 via-amber-900 to-orange-950 p-4 sm:p-8 font-sans antialiased">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-amber-200/90 hover:text-white px-3.5 py-2 rounded-xl bg-stone-900/90 border border-amber-500/30"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <span className="text-xs text-amber-300 font-extrabold uppercase tracking-wider bg-amber-500/20 px-3.5 py-1.5 rounded-full border border-amber-500/30">
            Join the Mess
          </span>
        </div>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-stone-900/90 border border-amber-500/30 px-4 py-2 rounded-2xl">
            <ChefHat className="w-5 h-5 text-amber-400" />
            <span className="text-amber-300 font-black text-sm tracking-wide">KOLHAPURI MESS</span>
          </div>
          <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'var(--font-playfair, serif)' }}>
            Student Registration Form
          </h1>
          <p className="text-amber-200/70 text-xs">
            Fill this form to join our mess. We'll contact you within 24 hours.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div className={`flex-1 h-1.5 rounded-full transition-all ${step >= s ? 'bg-amber-500' : 'bg-stone-700'}`} />
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                step > s ? 'bg-emerald-500 text-white' : step === s ? 'bg-amber-500 text-stone-950' : 'bg-stone-700 text-stone-400'
              }`}>
                {step > s ? '✓' : s}
              </div>
            </div>
          ))}
          <div className="flex-1 h-1.5 rounded-full bg-stone-700" />
        </div>
        <div className="flex justify-between text-[10px] text-amber-200/60 font-bold uppercase tracking-wide px-1 -mt-2">
          <span>Personal Info</span>
          <span>Meal Plan</span>
          <span>Confirm</span>
        </div>

        {/* Step 1: Personal Info */}
        {step === 1 && (
          <div className="bg-stone-900/90 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-6 space-y-5 shadow-2xl">
            <h2 className="font-extrabold text-white text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-amber-400" /> Personal Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1.5">Full Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => update('name', e.target.value)}
                  placeholder="e.g. Rohan Patil"
                  className="w-full bg-stone-950/80 border border-amber-500/30 focus:border-amber-500 rounded-xl px-4 py-3 text-white placeholder-stone-500 text-sm outline-none transition"
                />
                {errors.name && <p className="text-rose-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1.5">Mobile Number *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 text-sm font-bold">+91</span>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => update('phone', e.target.value)}
                    placeholder="9876543210"
                    className="w-full bg-stone-950/80 border border-amber-500/30 focus:border-amber-500 rounded-xl px-4 py-3 pl-12 text-white placeholder-stone-500 text-sm outline-none transition"
                    maxLength={10}
                  />
                </div>
                {errors.phone && <p className="text-rose-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1.5">Institution / Branch *</label>
                <input
                  type="text"
                  value={form.college}
                  onChange={e => update('college', e.target.value)}
                  placeholder="Enter your institution or branch (e.g. Engineering, Arts, Business)"
                  className="w-full bg-stone-950/80 border border-amber-500/30 focus:border-amber-500 rounded-xl px-4 py-3 text-white placeholder-stone-500 text-sm outline-none transition"
                />
                {errors.college && <p className="text-rose-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.college}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1.5">Student Profile Photo *</label>
                <div className="flex items-center gap-3 bg-stone-950/80 p-3 rounded-2xl border border-amber-500/30">
                  {form.photo_url ? (
                    <img
                      src={form.photo_url}
                      alt="Student Preview"
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-md shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-stone-900 border-2 border-dashed border-amber-500/40 text-amber-400 flex flex-col items-center justify-center text-[10px] font-bold text-center shrink-0 p-1">
                      <Camera className="w-5 h-5 mb-0.5" />
                      Add Photo
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold rounded-xl border border-amber-500/40 transition shadow-sm">
                      <Upload className="w-4 h-4 text-amber-400" /> Choose Photo File from Device
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const compressed = await compressImageFile(file);
                              update('photo_url', compressed);
                            } catch {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                if (typeof reader.result === 'string') {
                                  update('photo_url', reader.result);
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
                      value={form.photo_url}
                      onChange={e => update('photo_url', e.target.value)}
                      placeholder="Or paste photo image URL (https://...)"
                      className="w-full bg-stone-900 border border-stone-800 focus:border-amber-500 rounded-xl px-3 py-1.5 text-white placeholder-stone-500 text-xs outline-none transition font-mono"
                    />
                  </div>
                </div>
                {errors.photo_url && <p className="text-rose-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.photo_url}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1.5">Room / Hostel (Optional)</label>
                <div className="relative">
                  <Home className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500/60" />
                  <input
                    type="text"
                    value={form.room_batch}
                    onChange={e => update('room_batch', e.target.value)}
                    placeholder="e.g. Room 204, Shivaji Hostel"
                    className="w-full bg-stone-950/80 border border-amber-500/30 focus:border-amber-500 rounded-xl px-4 py-3 pl-10 text-white placeholder-stone-500 text-sm outline-none transition"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => validateStep1() && setStep(2)}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-sm rounded-2xl transition shadow-lg"
            >
              Next: Choose Meal Plan →
            </button>
          </div>
        )}

        {/* Step 2: Meal Plan */}
        {step === 2 && (
          <div className="bg-stone-900/90 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-6 space-y-5 shadow-2xl">
            <h2 className="font-extrabold text-white text-lg flex items-center gap-2">
              <Utensils className="w-5 h-5 text-amber-400" /> Meal Preferences
            </h2>

            {/* Meal Preference */}
            <div>
              <label className="block text-xs font-bold text-amber-300 mb-3">Food Preference *</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'veg', label: '🥗 Veg', desc: 'Pure Vegetarian', color: 'emerald' },
                  { value: 'egg', label: '🥚 Egg', desc: 'Vegetarian + Egg', color: 'amber' },
                  { value: 'non_veg', label: '🍗 Non-Veg', desc: 'Chicken & Mutton', color: 'rose' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => update('meal_preference', opt.value)}
                    className={`p-4 rounded-2xl border-2 text-center transition ${
                      form.meal_preference === opt.value
                        ? 'border-amber-500 bg-amber-500/20'
                        : 'border-stone-700 bg-stone-950/60 hover:border-amber-500/50'
                    }`}
                  >
                    <div className="text-2xl mb-1">{opt.label.split(' ')[0]}</div>
                    <div className="text-xs font-bold text-white">{opt.label.split(' ').slice(1).join(' ')}</div>
                    <div className="text-[10px] text-amber-200/60 mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
              {errors.meal_preference && <p className="text-rose-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.meal_preference}</p>}
            </div>

            {/* Meal Plan */}
            <div>
              <label className="block text-xs font-bold text-amber-300 mb-3">Meal Plan *</label>
              <div className="space-y-2.5">
                {[
                  { value: 'both', label: '🍱 Lunch + Dinner (Both Meals)', desc: 'Full day coverage — most popular' },
                  { value: 'lunch', label: '☀️ Lunch Only', desc: 'Afternoon meal only' },
                  { value: 'dinner', label: '🌙 Dinner Only', desc: 'Evening meal only' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => update('meal_plan', opt.value)}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition flex items-center justify-between ${
                      form.meal_plan === opt.value
                        ? 'border-amber-500 bg-amber-500/20'
                        : 'border-stone-700 bg-stone-950/60 hover:border-amber-500/50'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-bold text-white">{opt.label}</p>
                      <p className="text-xs text-amber-200/60">{opt.desc}</p>
                    </div>
                    {form.meal_plan === opt.value && (
                      <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
              {errors.meal_plan && <p className="text-rose-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.meal_plan}</p>}
            </div>

            {/* Parcel Delivery */}
            <div
              className={`p-4 rounded-2xl border-2 cursor-pointer transition ${
                form.is_parcel_delivery ? 'border-amber-500 bg-amber-500/20' : 'border-stone-700 bg-stone-950/60'
              }`}
              onClick={() => update('is_parcel_delivery', !form.is_parcel_delivery)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-white">Hostel Room Delivery (+₹10/day)</p>
                    <p className="text-xs text-amber-200/60">Get meals delivered directly to your room</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                  form.is_parcel_delivery ? 'bg-amber-500 border-amber-500' : 'border-stone-500'
                }`}>
                  {form.is_parcel_delivery && <span className="text-stone-950 text-xs font-black">✓</span>}
                </div>
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-bold text-amber-300 mb-1.5">Additional Note (Optional)</label>
              <textarea
                value={form.message}
                onChange={e => update('message', e.target.value)}
                placeholder="Any specific dietary requirements or questions..."
                rows={3}
                className="w-full bg-stone-950/80 border border-amber-500/30 focus:border-amber-500 rounded-xl px-4 py-3 text-white placeholder-stone-500 text-sm outline-none transition resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3.5 bg-stone-800 hover:bg-stone-700 text-amber-200 font-bold text-sm rounded-2xl transition"
              >
                ← Back
              </button>
              <button
                onClick={() => validateStep2() && setStep(3)}
                className="flex-2 flex-grow py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-sm rounded-2xl transition shadow-lg"
              >
                Next: Review & Submit →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Submit */}
        {step === 3 && (
          <div className="bg-stone-900/90 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h2 className="font-extrabold text-white text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" /> Review & Submit
              </h2>
              {form.photo_url && (
                <img
                  src={form.photo_url}
                  alt={form.name}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-400 shadow-md shrink-0"
                />
              )}
            </div>

            <div className="space-y-3">
              {[
                { label: 'Full Name', value: form.name },
                { label: 'Phone', value: `+91 ${form.phone}` },
                { label: 'Institution / Branch', value: form.college },
                { label: 'Room / Hostel', value: form.room_batch || 'Not specified' },
                { label: 'Food Preference', value: form.meal_preference === 'veg' ? '🥗 Vegetarian' : form.meal_preference === 'egg' ? '🥚 Egg' : '🍗 Non-Vegetarian' },
                { label: 'Meal Plan', value: form.meal_plan === 'both' ? '🍱 Lunch + Dinner' : form.meal_plan === 'lunch' ? '☀️ Lunch Only' : '🌙 Dinner Only' },
                { label: 'Room Delivery', value: form.is_parcel_delivery ? '✅ Yes (+₹10/day)' : '❌ No (Self pickup)' },
              ].map(item => (
                <div key={item.label} className="flex items-start justify-between p-3.5 bg-stone-950/80 rounded-xl border border-amber-500/20">
                  <span className="text-xs text-amber-200/60 font-medium">{item.label}</span>
                  <span className="text-xs font-bold text-white text-right max-w-[60%]">{item.value}</span>
                </div>
              ))}
            </div>

            {form.message && (
              <div className="p-3.5 bg-stone-950/80 rounded-xl border border-amber-500/20">
                <p className="text-xs text-amber-200/60 mb-1">Note</p>
                <p className="text-xs text-white">{form.message}</p>
              </div>
            )}

            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-200/80 space-y-1">
              <p className="font-bold text-amber-300">📋 What happens after you submit?</p>
              <p>Mess Owner will call you on <strong className="text-white">{form.phone}</strong> to confirm your registration and joining date. Security deposit of ₹1,000 is payable upon joining.</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3.5 bg-stone-800 hover:bg-stone-700 text-amber-200 font-bold text-sm rounded-2xl transition"
              >
                ← Edit
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-2 flex-grow py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-60 text-stone-950 font-black text-sm rounded-2xl transition shadow-lg flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Registration
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Contact Info */}
        <div className="text-center text-xs text-amber-200/50">
          Questions? Call us at{' '}
          <a href={`tel:${MESS_DETAILS.callPhones[0]}`} className="text-amber-400 font-bold hover:text-amber-300">
            {MESS_DETAILS.callPhones[0]}
          </a>
          {' '}or{' '}
          <a href={MESS_DETAILS.whatsappLink} target="_blank" rel="noopener noreferrer" className="text-emerald-400 font-bold hover:text-emerald-300">
            WhatsApp us
          </a>
        </div>
      </div>
    </div>
  );
}
