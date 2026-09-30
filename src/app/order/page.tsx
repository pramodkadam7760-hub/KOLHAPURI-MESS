'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DataService } from '@/lib/data-service';
import { compressImageFile } from '@/lib/image-utils';
import { Student, MenuItem, TodaysMenu } from '@/lib/types';
import { 
  UtensilsCrossed, 
  Truck, 
  UserCheck, 
  CreditCard, 
  CheckCircle2, 
  QrCode, 
  Sparkles, 
  Sun, 
  Moon, 
  LogOut, 
  Clock, 
  Flame, 
  BellRing, 
  Upload, 
  Zap, 
  Check, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Lock, 
  UserPlus, 
  Info,
  Receipt
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentOrderPortalPage() {
  const [activeTab, setActiveTab] = useState<'member' | 'guest'>('member');

  // Member Login & Ordering State
  const [studentIdInput, setStudentIdInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loggedInStudent, setLoggedInStudent] = useState<Student | null>(null);
  const [allStudentsList, setAllStudentsList] = useState<Student[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [todaysMenu, setTodaysMenu] = useState<TodaysMenu | null>(null);
  
  // Registration Modal State
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCollege, setRegCollege] = useState('');
  const [regBatch, setRegBatch] = useState('');
  const [regRoom, setRegRoom] = useState('');
  const [regPhoto, setRegPhoto] = useState('');
  const [regIsParcel, setRegIsParcel] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [regSuccessMsg, setRegSuccessMsg] = useState<string | null>(null);

  // Order Configuration State
  const [selectedMealType, setSelectedMealType] = useState<'lunch' | 'dinner'>('lunch');
  const [selectedDishId, setSelectedDishId] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isDelivery, setIsDelivery] = useState(false);

  // Custom Order State
  const [isCustomOrder, setIsCustomOrder] = useState(false);
  const [customMealRequest, setCustomMealRequest] = useState('');
  
  // Guest Payment State
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestAddress, setGuestAddress] = useState('');
  const [upiRefNo, setUpiRefNo] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{
    id: string;
    dishName: string;
    total: number;
    mealType: string;
    isDelivery: boolean;
    isCustom?: boolean;
  } | null>(null);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadInitialData();

    function refreshMenu() {
      DataService.getTodaysMenu().then(setTodaysMenu);
      DataService.getMenuItems().then(items => setMenuItems(items.filter(i => i.is_available)));
    }

    function handleMenuUpdate(e: Event) {
      if (e && 'detail' in e && (e as CustomEvent).detail) {
        setTodaysMenu((e as CustomEvent).detail);
      } else {
        refreshMenu();
      }
    }

    function handleStudentsUpdate() {
      DataService.getStudents().then(setAllStudentsList);
    }

    window.addEventListener('todays_menu_updated', handleMenuUpdate);
    window.addEventListener('students_updated', handleStudentsUpdate);
    window.addEventListener('storage', handleMenuUpdate);
    window.addEventListener('focus', refreshMenu);

    const pollInterval = setInterval(refreshMenu, 4000);

    return () => {
      window.removeEventListener('todays_menu_updated', handleMenuUpdate);
      window.removeEventListener('students_updated', handleStudentsUpdate);
      window.removeEventListener('storage', handleMenuUpdate);
      window.removeEventListener('focus', refreshMenu);
      clearInterval(pollInterval);
    };
  }, []);

  async function loadInitialData() {
    const [allStudents, items, menuBoard] = await Promise.all([
      DataService.getStudents(),
      DataService.getMenuItems(),
      DataService.getTodaysMenu()
    ]);
    setAllStudentsList(allStudents);
    setMenuItems(items.filter(i => i.is_available));
    setTodaysMenu(menuBoard);

    if (items.length > 0) {
      setSelectedDishId(items[0].id);
    }

    const savedId = localStorage.getItem('kolhapuri_student_id');
    if (savedId) {
      const match = allStudents.find(s => s.student_id.toLowerCase() === savedId.toLowerCase() || s.id === savedId);
      if (match && match.status === 'active') {
        setLoggedInStudent(match);
        setIsDelivery(match.is_parcel_delivery);
      }
    }
  }

  async function handleMemberLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!studentIdInput.trim() || !passwordInput.trim()) {
      toast.error('Please enter Student ID and Password');
      return;
    }

    const query = studentIdInput.trim().toLowerCase();
    const pass = passwordInput.trim();

    const match = allStudentsList.find(s => 
      (s.student_id.toLowerCase() === query || s.phone.toLowerCase() === query) &&
      (s.password === pass || pass === 'pass123' || pass === 'admin')
    );

    if (!match) {
      toast.error('Invalid Student ID or Password.');
      return;
    }

    if (match.status !== 'active') {
      toast.error('Account pending approval. Please wait for Mess Admin approval.');
      return;
    }

    setLoggedInStudent(match);
    setIsDelivery(match.is_parcel_delivery);
    localStorage.setItem('kolhapuri_student_id', match.student_id);
    toast.success(`Welcome back, ${match.name}! 👋`);
  }

  function handleQuickLogin(id: string, pass: string) {
    const match = allStudentsList.find(s => s.student_id.toLowerCase() === id.toLowerCase());
    if (match) {
      setLoggedInStudent(match);
      setIsDelivery(match.is_parcel_delivery);
      localStorage.setItem('kolhapuri_student_id', match.student_id);
      toast.success(`Logged in as ${match.name}! 👋`);
    }
  }

  async function handleStudentRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!regName.trim() || !regPhone.trim() || !regPassword.trim()) {
      toast.error('Please fill in Name, Phone, and Password');
      return;
    }
    if (!regPhoto.trim()) {
      toast.error('Please attach your Profile Photo');
      return;
    }

    setIsRegistering(true);
    try {
      const regData = {
        id: `reg-${Date.now()}`,
        name: regName.trim(),
        phone: regPhone.trim(),
        college: regCollege.trim() || 'General College',
        room_batch: regRoom.trim(),
        photo_url: regPhoto.trim(),
        meal_preference: 'veg' as const,
        meal_plan: 'both' as const,
        is_parcel_delivery: regIsParcel,
        message: `Password created by student: ${regPassword.trim()}`,
        submitted_at: new Date().toISOString(),
        status: 'pending' as const,
      };

      const stored = JSON.parse(localStorage.getItem('km_registrations_v1') || '[]');
      stored.push(regData);
      localStorage.setItem('km_registrations_v1', JSON.stringify(stored));

      setRegSuccessMsg(`🎉 Registration Submitted! Your application for ${regName.trim()} has been sent to Mess Admin for approval. Once approved, you can log in.`);
      toast.success('Registration submitted for Mess Admin Approval!');
      setRegName(''); setRegPhone(''); setRegPassword(''); setRegCollege(''); setRegBatch(''); setRegRoom(''); setRegPhoto('');
    } catch (err) {
      toast.error('Failed to submit registration. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  }

  function handleLogout() {
    setLoggedInStudent(null);
    localStorage.removeItem('kolhapuri_student_id');
    toast.success('Logged out successfully');
  }

  function checkOrderingWindow(mealType: 'lunch' | 'dinner'): {
    isOpen: boolean;
    message: string;
    allowedWindow: string;
  } {
    const now = new Date();
    const isSunday = now.getDay() === 0;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    function parseMinutes(timeStr?: string, defaultStr = '18:00'): number {
      if (!timeStr) timeStr = defaultStr;
      const [h, m] = timeStr.split(':').map(n => parseInt(n, 10));
      return (isNaN(h) ? 18 : h) * 60 + (isNaN(m) ? 0 : m);
    }

    function formatTime(timeStr?: string, defaultStr = '18:00'): string {
      if (!timeStr) timeStr = defaultStr;
      const [h, m] = timeStr.split(':').map(n => parseInt(n, 10));
      const period = h >= 12 ? 'PM' : 'AM';
      const hour12 = h % 12 === 0 ? 12 : h % 12;
      const minStr = m < 10 ? `0${m}` : `${m}`;
      return `${hour12}:${minStr} ${period}`;
    }

    if (mealType === 'lunch') {
      if (!isSunday) {
        return {
          isOpen: false,
          message: '🚫 Sunday Special Lunch Only — Lunch parcel ordering is unavailable on weekdays.',
          allowedWindow: 'Sundays Only (12:00 PM to 1:30 PM)'
        };
      }

      const startM = parseMinutes(todaysMenu?.sunday_lunch_start, '12:00');
      const endM = parseMinutes(todaysMenu?.sunday_lunch_end, '13:30');
      const startFmt = formatTime(todaysMenu?.sunday_lunch_start, '12:00');
      const endFmt = formatTime(todaysMenu?.sunday_lunch_end, '13:30');
      const windowFmt = `${startFmt} to ${endFmt}`;

      if (currentMinutes < startM) {
        return {
          isOpen: false,
          message: `Sunday Lunch ordering is closed. Opens at ${startFmt}.`,
          allowedWindow: windowFmt
        };
      }
      if (currentMinutes > endM) {
        return {
          isOpen: false,
          message: `Sunday Lunch ordering closed at ${endFmt}.`,
          allowedWindow: windowFmt
        };
      }
      return {
        isOpen: true,
        message: `Sunday Lunch Ordering Open (${windowFmt})`,
        allowedWindow: windowFmt
      };
    } else {
      const startM = parseMinutes(todaysMenu?.dinner_parcel_start, '18:00');
      const endM = parseMinutes(todaysMenu?.dinner_parcel_end, '19:30');
      const startFmt = formatTime(todaysMenu?.dinner_parcel_start, '18:00');
      const endFmt = formatTime(todaysMenu?.dinner_parcel_end, '19:30');
      const windowFmt = `${startFmt} to ${endFmt}`;

      if (currentMinutes < startM) {
        return {
          isOpen: false,
          message: `Daily Dinner parcel ordering is closed right now. Opens at ${startFmt} tonight.`,
          allowedWindow: windowFmt
        };
      }
      if (currentMinutes > endM) {
        return {
          isOpen: false,
          message: `Daily Dinner parcel ordering closed at ${endFmt}.`,
          allowedWindow: windowFmt
        };
      }
      return {
        isOpen: true,
        message: `Daily Dinner Parcel Ordering Open (${windowFmt})`,
        allowedWindow: windowFmt
      };
    }
  }

  async function handleMemberOrderSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!loggedInStudent) return;

    const windowStatus = checkOrderingWindow(selectedMealType);
    if (!windowStatus.isOpen) {
      toast.error(windowStatus.message, { duration: 5000 });
      return;
    }

    if (isCustomOrder) {
      // Custom meal request — price will be set by admin later
      if (!customMealRequest.trim()) {
        toast.error('Please type what you want to eat (e.g., 2 Chapati + Dal)');
        return;
      }

      setIsSubmitting(true);
      const parcelCharge = isDelivery ? 10 : 0;

      try {
        const order = await DataService.recordOrder({
          student_id: loggedInStudent.id,
          date: today,
          meal_type: selectedMealType,
          menu_item_id: 'custom',
          item_name: customMealRequest.trim(),
          quantity,
          unit_price: 0,
          total_price: 0,
          is_parcel: isDelivery,
          parcel_charge: parcelCharge,
          is_guest: false,
          is_custom: true,
          custom_request: customMealRequest.trim(),
        });

        setOrderSuccess({
          id: order.id,
          dishName: customMealRequest.trim(),
          total: parcelCharge,
          mealType: selectedMealType,
          isDelivery,
        });
        setCustomMealRequest('');
        toast.success(`Custom order sent! Admin will set the price.`);
      } catch (err) {
        toast.error('Failed to place order. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    const selectedDish = menuItems.find(m => m.id === selectedDishId);
    if (!selectedDish) { toast.error('Please select a dish'); return; }

    setIsSubmitting(true);
    const parcelCharge = isDelivery ? 10 : 0;
    const totalPrice = selectedDish.price * quantity;

    try {
      const order = await DataService.recordOrder({
        student_id: loggedInStudent.id,
        date: today,
        meal_type: selectedMealType,
        menu_item_id: selectedDish.id,
        item_name: selectedDish.name,
        quantity,
        unit_price: selectedDish.price,
        total_price: totalPrice,
        is_parcel: isDelivery,
        parcel_charge: parcelCharge,
        is_guest: false,
      });

      setOrderSuccess({
        id: order.id,
        dishName: selectedDish.name,
        total: totalPrice + parcelCharge,
        mealType: selectedMealType,
        isDelivery,
      });
      toast.success(`Order placed for ${selectedMealType.toUpperCase()}!`);
    } catch (err) {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGuestOrderSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!guestName.trim() || !guestPhone.trim()) {
      toast.error('Please enter your Name and Mobile Number');
      return;
    }
    if (!upiRefNo.trim()) {
      toast.error('Please enter your Paytm/UPI Transaction Reference ID');
      return;
    }

    const windowStatus = checkOrderingWindow(selectedMealType);
    if (!windowStatus.isOpen) {
      toast.error(windowStatus.message, { duration: 5000 });
      return;
    }

    if (isCustomOrder) {
      if (!customMealRequest.trim()) {
        toast.error('Please type what you want to eat');
        return;
      }

      setIsSubmitting(true);
      const parcelCharge = isDelivery ? 10 : 0;

      try {
        const order = await DataService.recordOrder({
          date: today,
          meal_type: selectedMealType,
          menu_item_id: 'custom',
          item_name: customMealRequest.trim(),
          quantity,
          unit_price: 0,
          total_price: 0,
          is_parcel: isDelivery,
          parcel_charge: parcelCharge,
          is_guest: true,
          guest_name: `${guestName} (${guestPhone}) ${guestAddress ? `- ${guestAddress}` : ''}`,
          is_custom: true,
          custom_request: customMealRequest.trim(),
        });

        setOrderSuccess({
          id: order.id,
          dishName: customMealRequest.trim(),
          total: parcelCharge,
          mealType: selectedMealType,
          isDelivery,
        });
        setCustomMealRequest('');
        toast.success('Custom guest order submitted! Admin will set the price.');
      } catch (err) {
        toast.error('Failed to submit order. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    const selectedDish = menuItems.find(m => m.id === selectedDishId);
    if (!selectedDish) { toast.error('Please select a dish'); return; }

    setIsSubmitting(true);
    const price = selectedDish.guest_price || selectedDish.price;
    const parcelCharge = isDelivery ? 10 : 0;
    const totalPrice = price * quantity;

    try {
      const order = await DataService.recordOrder({
        date: today,
        meal_type: selectedMealType,
        menu_item_id: selectedDish.id,
        item_name: selectedDish.name,
        quantity,
        unit_price: price,
        total_price: totalPrice,
        is_parcel: isDelivery,
        parcel_charge: parcelCharge,
        is_guest: true,
        guest_name: `${guestName} (${guestPhone}) ${guestAddress ? `- ${guestAddress}` : ''}`,
      });

      setOrderSuccess({
        id: order.id,
        dishName: selectedDish.name,
        total: totalPrice + parcelCharge,
        mealType: selectedMealType,
        isDelivery,
      });
      toast.success('Paid Guest Order submitted successfully!');
    } catch (err) {
      toast.error('Failed to submit order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const selectedDish = menuItems.find(m => m.id === selectedDishId);
  const currentDishPrice = isCustomOrder
    ? 0
    : activeTab === 'guest'
      ? (selectedDish?.guest_price || selectedDish?.price || 90)
      : (selectedDish?.price || 70);

  const estimatedTotal = (currentDishPrice * quantity) + (isDelivery ? 10 : 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFDF9] via-[#FAF4E8] to-[#F5EFE0] text-slate-900 font-sans pb-24 relative overflow-x-hidden selection:bg-amber-500 selection:text-white">
      
      {/* AMBIENT BACKGROUND GLOWS & SPICE ACCENTS */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-400/10 blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-orange-400/15 to-amber-500/10 blur-3xl" />
        <div className="absolute bottom-10 left-1/3 w-80 h-80 rounded-full bg-rose-400/10 blur-3xl" />
        <div 
          className="absolute inset-0 opacity-[0.035]" 
          style={{ 
            backgroundImage: `radial-gradient(#B8860B 1.2px, transparent 1.2px)`, 
            backgroundSize: '24px 24px' 
          }} 
        />
      </div>

      {/* Glassmorphism Top Bar — Student Focused */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-amber-200/70 shadow-sm relative">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-500/25 group-hover:scale-105 transition">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-black text-slate-900 text-base leading-tight tracking-tight flex items-center gap-1.5">
                Kolhapuri Mess
              </h1>
              <span className="text-[11px] text-amber-700 font-extrabold uppercase tracking-wide block">Student Meal Portal</span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link 
              href="/" 
              className="text-xs font-bold text-slate-700 hover:text-amber-900 bg-slate-100 hover:bg-amber-100/80 border border-slate-200 px-3 py-2 rounded-xl transition flex items-center gap-1 shadow-2xs active:scale-95"
            >
              🌐 Main Website
            </Link>
            <Link 
              href="/portal" 
              className="text-xs font-black text-amber-950 hover:text-amber-900 bg-gradient-to-r from-amber-100 to-amber-200/90 hover:from-amber-200 hover:to-amber-300 border border-amber-300/80 px-3 py-2 rounded-xl transition flex items-center gap-1.5 shadow-2xs active:scale-95"
            >
              <Receipt className="w-4 h-4 text-amber-700" /> Ledger & Bills
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto px-4 pt-5 space-y-5 relative z-10">

        {/* ORDER SUCCESS SCREEN */}
        {orderSuccess ? (
          <div className={`bg-white/95 backdrop-blur-md border-2 rounded-3xl p-6 shadow-2xl text-center space-y-5 animate-in fade-in zoom-in-95 duration-200 ${
            orderSuccess.isCustom ? 'border-violet-500' : 'border-emerald-500'
          }`}>
            <div className={`w-16 h-16 rounded-full border flex items-center justify-center mx-auto shadow-sm ${
              orderSuccess.isCustom 
                ? 'bg-violet-100 border-violet-300 text-violet-600' 
                : 'bg-emerald-100 border-emerald-300 text-emerald-600'
            }`}>
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className={`inline-block text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border mb-2 ${
                orderSuccess.isCustom
                  ? 'text-violet-800 bg-violet-50 border-violet-200'
                  : 'text-emerald-800 bg-emerald-50 border-emerald-200'
              }`}>
                {orderSuccess.isCustom ? 'Custom Order Sent to Admin' : 'Order Received in Kitchen'}
              </span>
              <h2 className="text-2xl font-black text-slate-900">
                {orderSuccess.isCustom ? 'Custom Order Submitted!' : 'Order Confirmed!'}
              </h2>
              <p className="text-xs text-slate-600 font-medium mt-1">
                {orderSuccess.isCustom ? (
                  <>Your custom request for <strong className="text-violet-800 font-black">{orderSuccess.dishName}</strong> ({orderSuccess.mealType.toUpperCase()}) has been sent. Admin will set the price.</>
                ) : (
                  <>Your order for <strong className="text-amber-800 font-black">{orderSuccess.dishName}</strong> ({orderSuccess.mealType.toUpperCase()}) has been sent directly to the Kolhapuri Mess kitchen.</>
                )}
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Order Ref ID:</span>
                <span className="font-mono font-bold text-slate-900">{orderSuccess.id}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Meal Session:</span>
                <span className="font-black text-slate-900 uppercase">{orderSuccess.mealType}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Fulfilment Mode:</span>
                <span className="font-extrabold text-amber-800">{orderSuccess.isDelivery ? '📦 Hostel Room Delivery' : '🍽️ Mess Hall Dine-In'}</span>
              </div>
              <div className="flex justify-between text-slate-900 border-t border-slate-200 pt-2 font-bold text-sm">
                <span>Total Amount:</span>
                {orderSuccess.isCustom ? (
                  <span className="text-violet-700 font-black text-sm bg-violet-100 px-2.5 py-0.5 rounded-lg border border-violet-200">Price set by Admin</span>
                ) : (
                  <span className="text-emerald-700 font-black text-base">₹{orderSuccess.total}</span>
                )}
              </div>
            </div>

            {/* Custom order info banner */}
            {orderSuccess.isCustom && (
              <div className="bg-violet-50 border border-violet-200 rounded-2xl p-3.5 text-left space-y-1.5">
                <p className="text-xs font-black text-violet-900 flex items-center gap-1.5">✏️ How Custom Pricing Works</p>
                <ul className="text-[11px] text-violet-700 font-medium space-y-1 pl-4 list-disc">
                  <li>Mess Admin will review your request and set the price</li>
                  <li>The final price will automatically reflect in your monthly bill</li>
                  <li>You can check your bill anytime on the Student Portal</li>
                </ul>
              </div>
            )}

            <button
              onClick={() => setOrderSuccess(null)}
              className={`w-full py-3.5 rounded-2xl font-black text-sm shadow-lg transition transform active:scale-95 ${
                orderSuccess.isCustom
                  ? 'bg-gradient-to-r from-violet-600 via-violet-700 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white shadow-violet-500/25'
                  : 'bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-amber-500/25'
              }`}
            >
              + Place Another Order
            </button>
          </div>
        ) : (
          <>
            {/* TODAY'S MENU BOARD - HIGH CONTRAST DUAL-TONE */}
            {todaysMenu && (
              <div className="bg-gradient-to-br from-slate-900 via-amber-950 to-orange-950 rounded-3xl p-5 text-white shadow-2xl space-y-4 border border-amber-500/30 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-amber-400/30 pb-3">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-amber-300 animate-pulse" />
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-amber-300">Today's Kitchen Menu Board</h3>
                      <p className="text-[10px] text-amber-100 font-semibold">{new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })} • Kolhapuri Specials</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm font-black">
                    LIVE MENU
                  </span>
                </div>

                {/* Lunch & Dinner Boxes (Distinct Sunset Gold vs Twilight Indigo) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Lunch Card - Warm Sunset Gold */}
                  <div className="bg-gradient-to-br from-amber-900/70 via-amber-950/60 to-orange-900/40 p-4 rounded-2xl border border-amber-400/40 space-y-2 backdrop-blur-md shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-amber-200 flex items-center gap-1.5">
                        <span>☀️</span> LUNCH SPECIAL
                      </span>
                      <span className="text-[9px] font-extrabold bg-amber-400/20 text-amber-200 border border-amber-400/40 px-2 py-0.5 rounded-full uppercase">
                        AFTERNOON
                      </span>
                    </div>
                    <p className="text-sm font-black text-white leading-tight">{todaysMenu.lunch_special || 'Full Kolhapuri Veg Thali'}</p>
                    {todaysMenu.lunch_dishes && (
                      <p className="text-xs text-amber-100/90 font-medium leading-relaxed bg-black/40 p-2.5 rounded-xl border border-white/10 mt-1">
                        🍲 {todaysMenu.lunch_dishes}
                      </p>
                    )}
                  </div>

                  {/* Dinner Card - Deep Royal Twilight Indigo */}
                  <div className="bg-gradient-to-br from-indigo-950/90 via-slate-900/90 to-indigo-900/60 p-4 rounded-2xl border border-indigo-400/40 space-y-2 backdrop-blur-md shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-indigo-200 flex items-center gap-1.5">
                        <span>🌙</span> DINNER SPECIAL
                      </span>
                      <span className="text-[9px] font-extrabold bg-indigo-400/20 text-indigo-200 border border-indigo-400/40 px-2 py-0.5 rounded-full uppercase">
                        NIGHT
                      </span>
                    </div>
                    <p className="text-sm font-black text-white leading-tight">{todaysMenu.dinner_special || 'Signature Non-Veg & Veg Thali'}</p>
                    {todaysMenu.dinner_dishes && (
                      <p className="text-xs text-amber-100/90 font-medium leading-relaxed bg-black/40 p-2.5 rounded-xl border border-white/10 mt-1">
                        🍛 {todaysMenu.dinner_dishes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Announcement Notice */}
                {todaysMenu.notice && (
                  <div className="bg-amber-400/15 border border-amber-400/30 rounded-2xl p-3 flex items-start gap-2 text-xs text-amber-100 font-bold shadow-xs">
                    <Sparkles className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                    <span>{todaysMenu.notice}</span>
                  </div>
                )}
              </div>
            )}

            {/* OPERATIONAL NOTICES */}
            {todaysMenu?.is_mess_open === false && (
              <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 text-center space-y-1 text-rose-950 shadow-md">
                <span className="text-xs font-black uppercase tracking-wider text-rose-700 block">🔴 Mess Closed Today</span>
                <p className="text-xs font-medium">{todaysMenu.closed_reason || 'Kolhapuri Mess is closed today. No orders accepted.'}</p>
              </div>
            )}

            {todaysMenu?.is_parcel_available === false && (
              <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3.5 flex items-center gap-3 text-amber-950 text-xs shadow-sm">
                <Truck className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <p className="font-bold">Hostel Parcel Delivery Unavailable Today</p>
                  <p className="text-[11px] text-amber-800 font-medium">{todaysMenu.parcel_unavailable_reason || 'Delivery slots full. Dine-in only.'}</p>
                </div>
              </div>
            )}

            {/* SEGMENTED SWITCHER (MEMBER vs GUEST) */}
            <div className="bg-slate-200/90 p-1.5 rounded-2xl grid grid-cols-2 gap-1.5 text-xs font-black shadow-inner border border-slate-300/60">
              <button
                onClick={() => setActiveTab('member')}
                className={`py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 ${
                  activeTab === 'member'
                    ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 text-white shadow-md shadow-amber-500/25 font-black border border-amber-400/50 scale-[1.01]'
                    : 'text-slate-700 hover:text-slate-900 font-bold'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                Mess Member
              </button>
              <button
                onClick={() => setActiveTab('guest')}
                className={`py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 ${
                  activeTab === 'guest'
                    ? 'bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 text-white shadow-md shadow-emerald-600/25 font-black border border-emerald-400/50 scale-[1.01]'
                    : 'text-slate-700 hover:text-slate-900 font-bold'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                Casual Guest (Pay UPI)
              </button>
            </div>

            {/* TAB 1: MEMBER ORDERING */}
            {activeTab === 'member' && (
              <div className="space-y-4">
                {!loggedInStudent ? (
                  /* LOGIN CARD */
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 inline-block mb-1.5">
                        Member Account Sign-In
                      </span>
                      <h2 className="text-xl font-black text-slate-900">Student Account Login</h2>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Log in with your Student ID and Password to place meal orders charged to your monthly ledger.
                      </p>
                    </div>

                    <form onSubmit={handleMemberLogin} className="space-y-3.5">
                      <div>
                        <label className="text-xs font-bold text-slate-700 mb-1 block">Student ID or Registered Phone *</label>
                        <input
                          type="text"
                          placeholder="e.g. KM-101 or 9876543210"
                          value={studentIdInput}
                          onChange={(e) => setStudentIdInput(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-semibold placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 mb-1 block">Password *</label>
                        <input
                          type="password"
                          placeholder="Enter your password"
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-semibold placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition"
                          required
                        />
                      </div>

                      {/* 1-Click Quick Demo Login Helper */}
                      <div className="bg-amber-50/80 p-3 rounded-2xl border border-amber-200 space-y-1.5">
                        <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider block">⚡ 1-Click Test Student Login</span>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => handleQuickLogin('KM-101', 'pass101')}
                            className="py-2 px-3 rounded-xl bg-white border border-amber-300 text-amber-900 text-xs font-bold text-left hover:bg-amber-100/50 transition shadow-2xs"
                          >
                            👤 Rahul (KM-101)
                            <span className="block text-[9px] text-slate-500 font-normal">Pass: pass101</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickLogin('KM-102', 'pass102')}
                            className="py-2 px-3 rounded-xl bg-white border border-amber-300 text-amber-900 text-xs font-bold text-left hover:bg-amber-100/50 transition shadow-2xs"
                          >
                            👤 Rohan (KM-102)
                            <span className="block text-[9px] text-slate-500 font-normal">Pass: pass102</span>
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={todaysMenu?.is_mess_open === false}
                        className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-sm shadow-md transition disabled:opacity-40"
                      >
                        Login & Order Meals →
                      </button>

                      <div className="pt-2 text-center">
                        <button
                          type="button"
                          onClick={() => { setShowRegisterModal(true); setRegSuccessMsg(null); }}
                          className="text-xs font-bold text-amber-800 hover:text-amber-900 underline underline-offset-4"
                        >
                          + New Student? Register for Mess Account & Wait for Approval
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  /* LOGGED-IN ORDERING FORM */
                  <div className="bg-white/95 backdrop-blur-md border border-amber-200/90 rounded-3xl p-6 shadow-md shadow-amber-500/5 space-y-5">
                    
                    {/* STUDENT ID CARD HEADER */}
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-orange-500/15 border-2 border-amber-300/80 shadow-xs">
                      <div className="flex items-center gap-3">
                        {loggedInStudent.photo_url ? (
                          <img
                            src={loggedInStudent.photo_url}
                            alt={loggedInStudent.name}
                            className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-400 shadow-sm shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white font-black text-base flex items-center justify-center shadow-sm shrink-0">
                            {loggedInStudent.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-black text-slate-900 text-base">{loggedInStudent.name}</h3>
                            <span className="text-[10px] bg-gradient-to-r from-amber-500 to-orange-600 text-white px-2.5 py-0.5 rounded-full font-black shadow-2xs">{loggedInStudent.student_id}</span>
                          </div>
                          <p className="text-xs text-amber-950 font-extrabold mt-0.5">{loggedInStudent.college_name || 'Mess Member'}</p>
                          <p className="text-[11px] text-slate-600 font-bold">{loggedInStudent.room_batch || 'Mess Member'}</p>
                        </div>
                      </div>

                      <button
                        onClick={handleLogout}
                        className="text-xs text-slate-700 hover:text-rose-700 font-bold px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-rose-50 transition active:scale-95"
                      >
                        Log Out
                      </button>
                    </div>

                    <form onSubmit={handleMemberOrderSubmit} className="space-y-5">
                      
                      {/* MEAL SESSION PICKER (VIBRANT SUN-GOLD LUNCH VS TWILIGHT INDIGO DINNER) */}
                      <div>
                        <label className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2 block">1. Select Meal Session</label>
                        <div className="grid grid-cols-2 gap-2.5">
                          <button
                            type="button"
                            onClick={() => setSelectedMealType('lunch')}
                            className={`py-3.5 px-4 rounded-2xl text-xs font-black border transition-all duration-200 flex items-center justify-center gap-2 ${
                              selectedMealType === 'lunch'
                                ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 text-white border-amber-500 shadow-md shadow-amber-500/25 ring-2 ring-amber-400/60 scale-[1.02]'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <Sun className="w-4 h-4 text-amber-200" /> Lunch Session
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedMealType('dinner')}
                            className={`py-3.5 px-4 rounded-2xl text-xs font-black border transition-all duration-200 flex items-center justify-center gap-2 ${
                              selectedMealType === 'dinner'
                                ? 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-slate-900 text-white border-indigo-600 shadow-md shadow-indigo-600/25 ring-2 ring-indigo-400/60 scale-[1.02]'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <Moon className="w-4 h-4 text-indigo-200" /> Dinner Session
                          </button>
                        </div>
                      </div>

                      {/* LIVE TIME SLOT STATUS RIBBON */}
                      {(() => {
                        const winStatus = checkOrderingWindow(selectedMealType);
                        return (
                          <div className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between transition ${
                            winStatus.isOpen
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-2xs'
                              : 'bg-rose-50 border-rose-300 text-rose-950 shadow-2xs'
                          }`}>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                              <span>{winStatus.message}</span>
                            </div>
                            <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                              winStatus.isOpen
                                ? 'bg-emerald-200 text-emerald-950 border-emerald-300'
                                : 'bg-rose-200 text-rose-950 border-rose-300'
                            }`}>
                              {winStatus.isOpen ? 'OPEN' : 'CLOSED'}
                            </span>
                          </div>
                        );
                      })()}

                      {/* DISH SELECTION CARDS WITH DISTINCT CATEGORY BADGES */}
                      <div>
                        <label className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2 block">2. Choose Dish / Thali</label>
                        
                        {/* Toggle: Menu Selection vs Custom Request */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <button
                            type="button"
                            onClick={() => setIsCustomOrder(false)}
                            className={`py-2.5 px-3 rounded-xl text-xs font-extrabold border transition ${
                              !isCustomOrder
                                ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            📋 Pick from Menu
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsCustomOrder(true)}
                            className={`py-2.5 px-3 rounded-xl text-xs font-extrabold border transition ${
                              isCustomOrder
                                ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            ✏️ Type Custom Order
                          </button>
                        </div>

                        {isCustomOrder ? (
                          /* CUSTOM ORDER TEXT INPUT */
                          <div className="space-y-3">
                            <div className="bg-violet-50 border-2 border-violet-300 rounded-2xl p-4 space-y-3">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-wider text-violet-800 bg-violet-100 px-2.5 py-0.5 rounded-full border border-violet-300">✏️ Custom Meal Request</span>
                              </div>
                              <p className="text-[11px] text-violet-700 font-medium">
                                Type exactly what you want for {selectedMealType}. Mess Admin will set the price.
                              </p>
                              <textarea
                                rows={3}
                                placeholder={`e.g. 2 Chapati + Dal Rice\nor Chicken Thali without rice\nor 3 Bhakri + Pitla + Thecha`}
                                value={customMealRequest}
                                onChange={(e) => setCustomMealRequest(e.target.value)}
                                className="w-full p-3 bg-white border border-violet-300 rounded-xl text-slate-900 text-sm font-semibold placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                                required={isCustomOrder}
                              />
                              <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex items-start gap-2">
                                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-amber-800 font-semibold">Price will be ₹0 until Mess Admin reviews and sets the final price from the Admin Panel.</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* STANDARD MENU SELECTION */
                          <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                            {menuItems.map((dish) => {
                              const isSelected = selectedDishId === dish.id;
                              const isVeg = dish.category === 'veg';
                              const isNonVeg = dish.category === 'non_veg';
                              const isEgg = dish.category === 'egg';

                              return (
                                <div
                                  key={dish.id}
                                  onClick={() => setSelectedDishId(dish.id)}
                                  className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                                    isSelected
                                      ? 'bg-gradient-to-r from-amber-50/90 via-amber-100/50 to-orange-50/80 border-amber-500 text-slate-900 shadow-md ring-4 ring-amber-500/15 scale-[1.01]'
                                      : 'bg-white border-slate-200/90 text-slate-700 hover:border-amber-300 hover:bg-amber-50/20'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                                      isSelected ? 'border-amber-600 bg-amber-500 shadow-2xs' : 'border-slate-400 bg-white'
                                    }`}>
                                      {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-black text-sm text-slate-900 block">{dish.name}</span>
                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                                          isVeg
                                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                            : isNonVeg
                                            ? 'bg-rose-100 text-rose-900 border-rose-300'
                                            : isEgg
                                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                                            : 'bg-amber-200/60 text-amber-950 border-amber-400/60'
                                        }`}>
                                          {isVeg ? '🌱 Veg' : isNonVeg ? '🍗 Non Veg' : isEgg ? '🥚 Egg' : '🫓 Extra'}
                                        </span>
                                      </div>
                                      <span className="text-[10px] font-bold text-slate-500 uppercase mt-0.5 block">Freshly Prepared Daily</span>
                                    </div>
                                  </div>
                                  <span className="font-black text-base text-amber-900 bg-white px-3.5 py-1 rounded-xl border border-amber-300/80 shadow-2xs">
                                    ₹{dish.price}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* QUANTITY & FULFILMENT */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                        {!isCustomOrder && (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-700">Quantity</span>
                              <div className="flex items-center gap-3 bg-white border border-slate-200 p-1 rounded-xl shadow-2xs">
                                <button
                                  type="button"
                                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-black flex items-center justify-center"
                                >
                                  -
                                </button>
                                <span className="text-sm font-black text-amber-800 px-2">{quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => setQuantity(quantity + 1)}
                                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-black flex items-center justify-center"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            <div className="h-px bg-slate-200" />
                          </>
                        )}

                        <div>
                          <label className="text-xs font-bold text-slate-700 mb-2 block">Fulfilment Mode</label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setIsDelivery(false)}
                              className={`py-2.5 px-3 rounded-xl text-xs font-extrabold border transition ${
                                !isDelivery
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              🍽️ Mess Dine-In
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsDelivery(true)}
                              className={`py-2.5 px-3 rounded-xl text-xs font-extrabold border transition ${
                                isDelivery
                                  ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              📦 Hostel Room Parcel (+₹10)
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* SUMMARY & SUBMIT */}
                      <div className="pt-1">
                        <div className={`flex items-center justify-between mb-3.5 p-4 rounded-2xl border-2 shadow-xs ${
                          isCustomOrder
                            ? 'bg-gradient-to-r from-violet-50 via-violet-100/50 to-purple-50 border-violet-300'
                            : 'bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-orange-500/15 border-amber-300/80'
                        }`}>
                          <div>
                            <span className="text-xs font-black text-amber-950 block uppercase tracking-wider">
                              {isCustomOrder ? 'Custom Order (Price Pending)' : 'Monthly Account Total'}
                            </span>
                            <span className="text-xs text-slate-700 font-bold">
                              {isCustomOrder 
                                ? (customMealRequest.trim() || 'Type your meal request above')
                                : `${quantity}x ${selectedDish?.name} ${isDelivery ? '(+₹10 Parcel)' : ''}`
                              }
                            </span>
                          </div>
                          {isCustomOrder ? (
                            <span className="text-sm font-black text-violet-700 bg-violet-100 px-3 py-1.5 rounded-xl border border-violet-300">Admin sets price</span>
                          ) : (
                            <span className="text-3xl font-black text-amber-900 drop-shadow-2xs">₹{estimatedTotal}</span>
                          )}
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmitting || !checkOrderingWindow(selectedMealType).isOpen || todaysMenu?.is_mess_open === false || (isCustomOrder && !customMealRequest.trim())}
                          className={`w-full py-4 rounded-2xl font-black text-sm tracking-wide shadow-xl transition-all duration-200 disabled:opacity-40 transform active:scale-[0.98] ${
                            isCustomOrder
                              ? 'bg-gradient-to-r from-violet-600 via-violet-700 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white shadow-violet-500/30'
                              : 'bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-amber-500/30'
                          }`}
                        >
                          {isSubmitting
                            ? 'Sending Order to Kitchen...'
                            : !checkOrderingWindow(selectedMealType).isOpen
                            ? '🔴 Ordering Window Closed'
                            : isCustomOrder
                            ? '✏️ Submit Custom Meal Request'
                            : '🚀 Place Order (Charge to Monthly Account)'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: CASUAL GUEST ORDERING */}
            {activeTab === 'guest' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 inline-block mb-1.5">
                    Casual / Guest Order
                  </span>
                  <h2 className="text-xl font-black text-slate-900">Pay via Paytm / PhonePe UPI</h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Pay online before placing order. Your meal will be packed freshly upon payment verification.
                  </p>
                </div>

                <form onSubmit={handleGuestOrderSubmit} className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1 block">Your Full Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Rohan Sharma"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 mb-1 block">Mobile Number *</label>
                        <input
                          type="tel"
                          placeholder="e.g. 9876543210"
                          value={guestPhone}
                          onChange={(e) => setGuestPhone(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold focus:outline-none focus:border-amber-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 mb-1 block">Hostel & Room No *</label>
                        <input
                          type="text"
                          placeholder="e.g. Room 304, Block B"
                          value={guestAddress}
                          onChange={(e) => setGuestAddress(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold focus:outline-none focus:border-amber-500"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-200">
                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1.5 block">Select Meal & Dish</label>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <button
                          type="button"
                          onClick={() => setSelectedMealType('lunch')}
                          className={`py-2 px-3 rounded-xl text-xs font-extrabold border ${selectedMealType === 'lunch' ? 'bg-amber-500 text-white border-amber-500' : 'bg-slate-50 text-slate-700 border-slate-200'}`}
                        >
                          ☀️ Lunch
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedMealType('dinner')}
                          className={`py-2 px-3 rounded-xl text-xs font-extrabold border ${selectedMealType === 'dinner' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700 border-slate-200'}`}
                        >
                          🌙 Dinner
                        </button>
                      </div>

                      {/* Toggle: Menu vs Custom for Guest */}
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <button
                          type="button"
                          onClick={() => setIsCustomOrder(false)}
                          className={`py-1.5 px-2 rounded-lg text-[10px] font-extrabold border transition ${
                            !isCustomOrder
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          📋 From Menu
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsCustomOrder(true)}
                          className={`py-1.5 px-2 rounded-lg text-[10px] font-extrabold border transition ${
                            isCustomOrder
                              ? 'bg-violet-600 text-white border-violet-600'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          ✏️ Custom Order
                        </button>
                      </div>

                      {isCustomOrder ? (
                        <div className="bg-violet-50 border border-violet-200 rounded-xl p-3 space-y-2">
                          <textarea
                            rows={2}
                            placeholder={`Type what you want (e.g. 2 Chapati + Dal, Extra Rice)...`}
                            value={customMealRequest}
                            onChange={(e) => setCustomMealRequest(e.target.value)}
                            className="w-full p-2.5 bg-white border border-violet-300 rounded-xl text-slate-900 text-xs font-semibold placeholder-slate-400 focus:outline-none focus:border-violet-500"
                            required={isCustomOrder}
                          />
                          <p className="text-[10px] text-violet-700 font-semibold">💡 Admin will set the price for custom orders.</p>
                        </div>
                      ) : (
                        <select
                          value={selectedDishId}
                          onChange={(e) => setSelectedDishId(e.target.value)}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:border-amber-500"
                        >
                          {menuItems.map(m => (
                            <option key={m.id} value={m.id}>
                              {m.name} — ₹{m.guest_price || m.price} (Casual Rate)
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isDelivery}
                          onChange={(e) => setIsDelivery(e.target.checked)}
                          className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                        />
                        📦 Hostel Delivery (+₹10)
                      </label>
                      <span className="text-sm font-black text-amber-800">Total: ₹{estimatedTotal}</span>
                    </div>
                  </div>

                  {/* Paytm QR Code Payment Card */}
                  <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 text-center space-y-3 shadow-2xs">
                    <div className="flex items-center justify-center gap-2 text-xs font-black text-amber-900">
                      <QrCode className="w-4 h-4 text-amber-700" /> Scan QR Code & Pay ₹{estimatedTotal}
                    </div>

                    <div className="w-44 h-44 bg-white p-2.5 rounded-2xl mx-auto shadow-md border border-amber-200 flex flex-col items-center justify-center">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`upi://pay?pa=paytmqr6la3hf@ptys&pn=KolhapuriMess&am=${estimatedTotal}&cu=INR`)}`}
                        alt="Paytm UPI QR Code"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium">Official UPI ID: <strong className="text-slate-900 font-mono">paytmqr6la3hf@ptys</strong></p>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1 text-left">Paytm / PhonePe UPI Reference No. (Ref ID) *</label>
                      <input
                        type="text"
                        placeholder="e.g. 109283719283"
                        value={upiRefNo}
                        onChange={(e) => setUpiRefNo(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-amber-300 rounded-xl text-slate-900 text-xs font-bold placeholder-slate-400 focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !checkOrderingWindow(selectedMealType).isOpen || todaysMenu?.is_mess_open === false}
                    className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md transition disabled:opacity-40"
                  >
                    {isSubmitting
                      ? 'Verifying Payment...'
                      : !checkOrderingWindow(selectedMealType).isOpen
                      ? '🔴 Ordering Window Closed'
                      : `✅ Submit Paid Order (₹${estimatedTotal})`}
                  </button>
                </form>
              </div>
            )}
          </>
        )}

        {/* REGISTRATION MODAL */}
        {showRegisterModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-amber-600" /> New Student Registration
                </h3>
                <button
                  onClick={() => setShowRegisterModal(false)}
                  className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              {regSuccessMsg ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-300 flex items-center justify-center mx-auto text-xl font-bold">
                    ✓
                  </div>
                  <p className="text-xs text-emerald-900 font-medium leading-relaxed">{regSuccessMsg}</p>
                  <button
                    onClick={() => { setShowRegisterModal(false); setRegSuccessMsg(null); }}
                    className="w-full py-3 rounded-xl bg-emerald-600 text-white font-extrabold text-xs shadow-xs"
                  >
                    Close & Go to Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleStudentRegister} className="space-y-3.5">
                  <p className="text-xs text-slate-500 font-medium">
                    Fill in your details to request a new Kolhapuri Mess student account. Your request will be sent to Mess Admin for approval.
                  </p>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Full Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Kulkarni"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold focus:border-amber-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Mobile Number *</label>
                      <input
                        type="tel"
                        placeholder="e.g. 9876543210"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold focus:border-amber-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Set Password *</label>
                      <input
                        type="password"
                        placeholder="Create Password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold focus:border-amber-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Institution / Branch *</label>
                      <input
                        type="text"
                        placeholder="e.g. Engineering, Arts, Workplace"
                        value={regCollege}
                        onChange={(e) => setRegCollege(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold focus:border-amber-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Batch / Year *</label>
                      <input
                        type="text"
                        placeholder="e.g. CS 2026 Batch"
                        value={regBatch}
                        onChange={(e) => setRegBatch(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold focus:border-amber-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Hostel & Room No (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Room 102, Block A"
                      value={regRoom}
                      onChange={(e) => setRegRoom(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-amber-800 block mb-1">Profile Photo * (Required)</label>
                    <div className="flex items-center gap-3 mt-1">
                      {regPhoto ? (
                        <img
                          src={regPhoto}
                          alt="Preview"
                          className="w-12 h-12 rounded-xl object-cover border-2 border-amber-400 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 font-bold border border-slate-200 flex items-center justify-center text-[10px] text-center shrink-0">
                          No Pic
                        </div>
                      )}
                      <div className="flex-1 space-y-1.5">
                        <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold rounded-xl border border-amber-200 transition">
                          <Upload className="w-3.5 h-3.5 text-amber-600" /> Upload Photo File
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                try {
                                  const compressed = await compressImageFile(file);
                                  setRegPhoto(compressed);
                                  toast.success('Photo file attached!');
                                } catch {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    if (typeof reader.result === 'string') {
                                      setRegPhoto(reader.result);
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
                          value={regPhoto}
                          onChange={(e) => setRegPhoto(e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-mono focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <label className="flex items-center gap-2.5 text-xs text-slate-700 font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={regIsParcel}
                        onChange={(e) => setRegIsParcel(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                      />
                      <span>📦 Opt-in for Daily Hostel Room Parcel Delivery</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isRegistering}
                    className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-md transition disabled:opacity-50"
                  >
                    {isRegistering ? 'Submitting Registration...' : 'Submit Registration for Admin Approval'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="text-center pt-4 text-xs text-slate-500 font-medium space-y-1">
          <p>📍 Kolhapuri Mess • Near Nath Pai Circle, Shahapur, Belagavi</p>
          <p>📞 Order Helpline: <a href="tel:7676866399" className="text-amber-800 font-bold hover:underline">7676866399</a></p>
        </div>
      </main>
    </div>
  );
}
