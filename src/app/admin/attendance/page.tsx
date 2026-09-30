'use client';

import { useState, useEffect } from 'react';
import { DataService } from '@/lib/data-service';
import { Student, MenuItem, OrderItem } from '@/lib/types';
import { 
  UtensilsCrossed, 
  Calendar, 
  Search, 
  Plus, 
  Trash2, 
  Truck, 
  UserCheck, 
  UserPlus,
  Check,
  ChevronRight,
  Sun,
  Moon,
  AlertTriangle,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DailyAttendanceOrderPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [todayOrders, setTodayOrders] = useState<OrderItem[]>([]);
  
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState(today);
  const [mealType, setMealType] = useState<'lunch' | 'dinner'>('lunch');
  const [search, setSearch] = useState('');
  const [roomFilter, setRoomFilter] = useState<string>('all');
  const [parcelOnly, setParcelOnly] = useState(false);
  
  // Quick order selection modal for a student
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);
  const [selectedDishId, setSelectedDishId] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isGuestOrder, setIsGuestOrder] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [isParcel, setIsParcel] = useState(false);
  const [parcelCharge, setParcelCharge] = useState<number>(10);

  const isToday = selectedDate === today;
  const isPast = selectedDate < today;
  const isFuture = selectedDate > today;

  // Get unique rooms/batches for filter dropdown
  const uniqueRooms = Array.from(new Set(students.map(s => s.room_batch).filter(Boolean))) as string[];

  useEffect(() => {
    loadData();

    window.addEventListener('storage', loadData);
    window.addEventListener('new_order_recorded', loadData);
    return () => {
      window.removeEventListener('storage', loadData);
      window.removeEventListener('new_order_recorded', loadData);
    };
  }, [selectedDate, mealType]);

  async function loadData() {
    const [stdList, menuList, orders] = await Promise.all([
      DataService.getStudents(),
      DataService.getMenuItems(),
      DataService.getOrderItemsByDate(selectedDate, mealType)
    ]);
    setStudents(stdList.filter(s => s.status === 'active'));
    setMenuItems(menuList.filter(m => m.is_available));
    setTodayOrders(orders);
  }

  // Pre-select default dish (Full Thali)
  const defaultVegThali = menuItems.find(i => i.name === 'Full Thali') || menuItems[0];

  function openOrderModal(student: Student | null, isGuest: boolean = false) {
    setActiveStudent(student);
    setIsGuestOrder(isGuest);
    setSelectedDishId(defaultVegThali?.id || '');
    setQuantity(1);
    const hasParcelDefault = student ? student.is_parcel_delivery : false;
    setIsParcel(hasParcelDefault);
    setParcelCharge(hasParcelDefault ? 10 : 10);
  }

  async function handleQuickAddThali(student: Student) {
    if (!defaultVegThali) return;

    const studentIsParcel = student.is_parcel_delivery;
    const charge = studentIsParcel ? 10 : 0;

    await DataService.recordOrder({
      student_id: student.id,
      date: selectedDate,
      meal_type: mealType,
      menu_item_id: defaultVegThali.id,
      item_name: defaultVegThali.name,
      quantity: 1,
      unit_price: defaultVegThali.price,
      total_price: defaultVegThali.price,
      is_parcel: studentIsParcel,
      parcel_charge: charge,
      is_guest: false,
    });

    toast.success(`Logged ${defaultVegThali.name} for ${student.name}`);
    loadData();
  }

  async function handleSaveCustomOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDishId) return;

    const dish = menuItems.find(i => i.id === selectedDishId);
    if (!dish) return;

    const price = isGuestOrder 
      ? (dish.guest_price || dish.price)
      : dish.price;

    const finalParcelCharge = isParcel ? (parcelCharge || 0) : 0;

    await DataService.recordOrder({
      student_id: activeStudent ? activeStudent.id : undefined,
      date: selectedDate,
      meal_type: mealType,
      menu_item_id: dish.id,
      item_name: dish.name,
      quantity,
      unit_price: price,
      total_price: price * quantity,
      is_parcel: isParcel,
      parcel_charge: finalParcelCharge,
      is_guest: isGuestOrder,
      guest_name: isGuestOrder ? (guestName || 'Guest') : undefined,
    });

    toast.success(`Logged ${dish.name} order${finalParcelCharge > 0 ? ` (+₹${finalParcelCharge} Delivery)` : ''}`);
    setActiveStudent(null);
    setIsGuestOrder(false);
    setGuestName('');
    setQuantity(1);
    setIsParcel(false);
    loadData();
  }

  async function handleDeleteOrder(orderId: string) {
    await DataService.deleteOrder(orderId);
    toast.success('Order deleted');
    loadData();
  }

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
      s.student_id.toLowerCase().includes(search.toLowerCase()) ||
      (s.room_batch && s.room_batch.toLowerCase().includes(search.toLowerCase()));
    const matchesRoom = roomFilter === 'all' || s.room_batch === roomFilter;
    const matchesParcel = !parcelOnly || s.is_parcel_delivery;
    return matchesSearch && matchesRoom && matchesParcel;
  });

  const sessionTotalRevenue = todayOrders.reduce((sum, o) => sum + o.total_price + (o.parcel_charge || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 border border-amber-300 rounded-2xl p-5 shadow-lg shadow-amber-500/10 flex flex-col md:flex-row md:items-center justify-between gap-4 text-white">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <UtensilsCrossed className="w-7 h-7 text-amber-200" />
            Daily Meal Order Entry
          </h1>
          <p className="text-xs text-amber-100 mt-1">Record dishes ordered by students & guests for Lunch and Dinner.</p>
        </div>

        {/* Date & Meal Type Pickers */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Date Buttons */}
          <div className="flex p-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl">
            <button 
              onClick={() => setSelectedDate(yesterday)}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition ${selectedDate === yesterday ? 'bg-white text-amber-900 shadow-md' : 'text-amber-100 hover:text-white'}`}
            >
              Yesterday
            </button>
            <button 
              onClick={() => setSelectedDate(today)}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition ${isToday ? 'bg-white text-amber-900 shadow-md' : 'text-amber-100 hover:text-white'}`}
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-2 rounded-xl border border-white/30 text-white">
            <Calendar className="w-4 h-4 text-amber-200" />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-white text-xs font-bold focus:outline-none"
            />
          </div>

          <div className="flex p-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl">
            <button 
              onClick={() => setMealType('lunch')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition ${
                mealType === 'lunch'
                  ? 'bg-white text-amber-900 shadow-md'
                  : 'text-amber-100 hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              Lunch
            </button>
            <button 
              onClick={() => setMealType('dinner')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition ${
                mealType === 'dinner'
                  ? 'bg-amber-950 text-white shadow-md'
                  : 'text-amber-100 hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              Dinner
            </button>
          </div>

          <button 
            onClick={() => openOrderModal(null, true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-amber-900 hover:bg-amber-50 text-xs font-extrabold transition shadow-md"
          >
            <UserPlus className="w-4 h-4 text-amber-700" />
            + Guest Meal (₹90)
          </button>
        </div>
      </div>

      {/* Past/Future Date Warning Banner */}
      {!isToday && (
        <div className={`flex items-center gap-3 p-3.5 rounded-2xl border text-sm font-bold ${isPast ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-blue-50 border-blue-300 text-blue-900'}`}>
          <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${isPast ? 'text-amber-600' : 'text-blue-600'}`} />
          <span>
            {isPast
              ? `⚠️ You are recording orders for a past date: ${new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`
              : `📅 You are recording orders for a future date: ${new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`
            }
          </span>
          <button onClick={() => setSelectedDate(today)} className="ml-auto px-3 py-1 rounded-lg bg-white border border-amber-200 text-xs font-extrabold text-amber-800 hover:bg-amber-50 transition flex-shrink-0">
            Go to Today
          </button>
        </div>
      )}

      {/* Main Order Recording Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Student List Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-amber-200/80 shadow-xs">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-amber-700/60" />
              <input 
                type="text"
                placeholder="Quick search student name or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-1.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 font-semibold"
              />
            </div>

            {/* Room/Batch Filter */}
            <select
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
              className="px-3 py-1.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Rooms / Batches</option>
              {uniqueRooms.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            {/* Parcel Toggle */}
            <button
              onClick={() => setParcelOnly(!parcelOnly)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition flex items-center justify-center gap-1.5 ${
                parcelOnly
                  ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                  : 'bg-amber-50/40 text-slate-700 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              Parcel Only
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredStudents.map((student) => {
              const studentOrders = todayOrders.filter(o => o.student_id === student.id);
              const hasOrdered = studentOrders.length > 0;

              return (
                <div 
                  key={student.id} 
                  className={`p-4 rounded-2xl border-2 transition flex flex-col justify-between ${
                    hasOrdered 
                      ? 'bg-amber-50/60 border-amber-400 shadow-sm' 
                      : 'bg-white border-amber-200/80 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-200">
                          {student.student_id}
                        </span>
                        <h3 className="font-extrabold text-slate-900 text-sm">{student.name}</h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 font-medium">{student.room_batch || 'No room'}</p>
                    </div>

                    {student.is_parcel_delivery && (
                      <span className="p-1.5 bg-amber-100 text-amber-800 rounded-lg border border-amber-200" title="Hostel Delivery (+₹10)">
                        <Truck className="w-4 h-4" />
                      </span>
                    )}
                  </div>

                  {/* Summary of recorded items if any */}
                  {hasOrdered && (
                    <div className="mt-3 p-2.5 bg-white rounded-xl border border-amber-300 text-xs space-y-1 shadow-2xs">
                      {studentOrders.map(o => (
                        <div key={o.id} className="flex justify-between items-center text-slate-800 font-semibold">
                          <span>✓ {o.item_name} (x{o.quantity})</span>
                          <span className="font-black text-amber-700">₹{o.total_price + (o.parcel_charge || 0)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-4 flex items-center gap-2">
                    <button 
                      onClick={() => handleQuickAddThali(student)}
                      className="flex-1 py-2 px-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-black shadow-xs transition flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Full Thali (₹70)
                    </button>
                    <button 
                      onClick={() => openOrderModal(student, false)}
                      className="py-2 px-3 bg-amber-100/70 hover:bg-amber-200/80 text-amber-900 border border-amber-300 rounded-xl text-xs font-extrabold transition"
                    >
                      More Dish
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Live Session Summary */}
        <div className="bg-white border border-amber-200/80 rounded-2xl p-5 flex flex-col justify-between h-full shadow-xs">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-amber-100">
              <div>
                <h2 className="font-black text-slate-900 text-base capitalize">{mealType} Session Orders</h2>
                <p className="text-xs text-amber-800 font-semibold">{selectedDate}</p>
              </div>
              <span className="text-xs font-black text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
                {todayOrders.length} orders
              </span>
            </div>

            <div className="mt-4 space-y-2 max-h-[450px] overflow-y-auto pr-1">
              {todayOrders.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <UtensilsCrossed className="w-8 h-8 mx-auto mb-2 opacity-30 text-amber-600" />
                  No meal orders recorded for this {mealType} yet.
                </div>
              ) : (
                todayOrders.map((ord) => {
                  const student = students.find(s => s.id === ord.student_id);
                  const displayName = ord.is_guest 
                    ? (ord.guest_name ? `👤 Guest (${ord.guest_name})` : '👤 Walk-in Guest')
                    : student 
                      ? `${student.name} (${student.student_id})`
                      : (ord.student_id || 'Student');

                  return (
                    <div key={ord.id} className="flex items-center justify-between p-3 rounded-xl bg-amber-50/50 border border-amber-200/60">
                      <div>
                        <p className="text-xs font-extrabold text-slate-900">
                          {displayName}
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 flex-wrap mt-0.5">
                          <span>{ord.item_name} x {ord.quantity}</span>
                          {ord.is_guest ? (
                            <span className="text-[9px] font-black text-purple-800 bg-purple-100 px-1.5 py-0.5 rounded border border-purple-300">
                              💳 Guest Paid
                            </span>
                          ) : (
                            <span className="text-[9px] font-black text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300">
                              🟢 Member Billed
                            </span>
                          )}
                          {ord.parcel_charge > 0 && (
                            <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                              +₹{ord.parcel_charge} Delivery
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-amber-700">
                          ₹{ord.total_price + (ord.parcel_charge || 0)}
                        </span>
                        <button 
                          onClick={() => handleDeleteOrder(ord.id)}
                          className="text-slate-400 hover:text-rose-600 transition p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-amber-100 flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-600">Session Total:</span>
            <span className="text-xl font-black text-amber-700">₹{sessionTotalRevenue.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Modal for Custom Dish Selection / Guest Order */}
      {(activeStudent || isGuestOrder) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-amber-300 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h2 className="text-lg font-black text-slate-900 flex items-center justify-between border-b border-amber-100 pb-3">
              <span>{isGuestOrder ? 'Record Guest Meal (₹90 Veg)' : `Add Meal for ${activeStudent?.name}`}</span>
              <button 
                onClick={() => {
                  setActiveStudent(null);
                  setIsGuestOrder(false);
                }} 
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </h2>

            <form onSubmit={handleSaveCustomOrder} className="space-y-4">
              {isGuestOrder && (
                <div>
                  <label className="text-xs font-bold text-slate-700">Guest Name / Remark</label>
                  <input 
                    type="text"
                    placeholder="e.g. Friend of Rohan"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-slate-900 text-sm font-semibold focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700">Select Dish</label>
                <select
                  value={selectedDishId}
                  onChange={(e) => setSelectedDishId(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-slate-900 text-sm font-extrabold focus:outline-none focus:border-amber-500"
                  required
                >
                  {menuItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} — ₹{isGuestOrder ? (item.guest_price || item.price) : item.price}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Quantity</label>
                <div className="flex items-center gap-3 mt-1">
                  <button 
                    type="button" 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 font-extrabold hover:bg-amber-200 border border-amber-300"
                  >
                    -
                  </button>
                  <span className="text-base font-black text-slate-900">{quantity}</span>
                  <button 
                    type="button" 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 font-extrabold hover:bg-amber-200 border border-amber-300"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Delivery Charge Option */}
              <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-800 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isParcel}
                      onChange={(e) => {
                        setIsParcel(e.target.checked);
                        if (e.target.checked && parcelCharge === 0) setParcelCharge(10);
                      }}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                    />
                    🚚 Add Hostel Delivery Charge
                  </label>
                </div>
                {isParcel && (
                  <div className="flex items-center justify-between pt-1 border-t border-amber-200/60">
                    <span className="text-xs font-bold text-slate-700">Delivery Amount (₹):</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-amber-800">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={parcelCharge}
                        onChange={(e) => setParcelCharge(parseFloat(e.target.value) || 0)}
                        className="w-20 p-1.5 bg-white border border-amber-300 rounded-xl text-slate-900 text-xs font-extrabold focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-amber-100">
                <button 
                  type="button" 
                  onClick={() => {
                    setActiveStudent(null);
                    setIsGuestOrder(false);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-black rounded-xl shadow-md"
                >
                  Record Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
