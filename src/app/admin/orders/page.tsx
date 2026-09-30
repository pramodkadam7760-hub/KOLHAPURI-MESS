'use client';

import { useState, useEffect } from 'react';
import { DataService } from '@/lib/data-service';
import { OrderItem, Student } from '@/lib/types';
import { 
  Clock, 
  UtensilsCrossed, 
  Search, 
  Truck, 
  Trash2, 
  Calendar, 
  RefreshCw,
  ChefHat,
  Edit3,
  Save,
  X,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminOrderQueuePage() {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState(today);
  const [mealFilter, setMealFilter] = useState<'all' | 'lunch' | 'dinner'>('all');
  const [deliveryFilter, setDeliveryFilter] = useState<'all' | 'parcel' | 'dinein'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'member' | 'guest' | 'custom'>('all');
  const [search, setSearch] = useState('');

  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Price editing state
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<string>('');
  const [editItemName, setEditItemName] = useState<string>('');
  const [isSavingPrice, setIsSavingPrice] = useState(false);

  useEffect(() => {
    loadData();

    window.addEventListener('storage', loadData);
    window.addEventListener('new_order_recorded', loadData);
    return () => {
      window.removeEventListener('storage', loadData);
      window.removeEventListener('new_order_recorded', loadData);
    };
  }, [selectedDate]);

  async function loadData() {
    setLoading(true);
    const [stdList, ordList] = await Promise.all([
      DataService.getStudents(),
      DataService.getOrderItemsByDate(selectedDate)
    ]);
    setStudents(stdList);
    setOrders(ordList);
    setLoading(false);
  }

  async function handleDelete(orderId: string) {
    if (!confirm('Are you sure you want to delete this order?')) return;
    await DataService.deleteOrder(orderId);
    toast.success('Order deleted');
    loadData();
  }

  function startEditPrice(order: OrderItem) {
    setEditingOrderId(order.id);
    setEditPrice(order.total_price > 0 ? order.total_price.toString() : '');
    setEditItemName(order.item_name);
  }

  async function handleSavePrice() {
    if (!editingOrderId) return;
    const priceNum = parseFloat(editPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error('Please enter a valid price');
      return;
    }

    setIsSavingPrice(true);
    try {
      const order = orders.find(o => o.id === editingOrderId);
      const qty = order?.quantity || 1;
      const unitPrice = priceNum / qty;

      await DataService.updateOrder(editingOrderId, {
        unit_price: unitPrice,
        total_price: priceNum,
        item_name: editItemName.trim() || order?.item_name || 'Custom Order',
      });
      toast.success(`Price set to ₹${priceNum} successfully!`);
      setEditingOrderId(null);
      setEditPrice('');
      setEditItemName('');
      loadData();
    } catch (err) {
      toast.error('Failed to update price');
    } finally {
      setIsSavingPrice(false);
    }
  }

  // Filter orders
  const filteredOrders = orders.filter((ord) => {
    const matchesMeal = mealFilter === 'all' || ord.meal_type === mealFilter;
    const matchesDelivery = deliveryFilter === 'all' 
      ? true 
      : deliveryFilter === 'parcel' 
        ? (ord.is_parcel || ord.parcel_charge > 0)
        : (!ord.is_parcel && ord.parcel_charge === 0);

    const matchesPayment = paymentFilter === 'all'
      ? true
      : paymentFilter === 'custom'
        ? ord.is_custom === true
        : paymentFilter === 'guest'
          ? (ord.is_guest && !ord.is_custom)
          : (!ord.is_guest && !ord.is_custom);

    const student = students.find(s => s.id === ord.student_id);
    const studentName = ord.is_guest ? (ord.guest_name || '') : (student?.name || '');
    const studentId = student?.student_id || '';
    const room = student?.room_batch || '';
    const query = search.toLowerCase();

    const matchesSearch = !search || (
      studentName.toLowerCase().includes(query) ||
      studentId.toLowerCase().includes(query) ||
      room.toLowerCase().includes(query) ||
      ord.item_name.toLowerCase().includes(query) ||
      (ord.custom_request || '').toLowerCase().includes(query)
    );

    return matchesMeal && matchesDelivery && matchesPayment && matchesSearch;
  });

  // Calculate live stats
  const totalOrders = filteredOrders.length;
  const parcelOrdersCount = filteredOrders.filter(o => o.is_parcel || o.parcel_charge > 0).length;
  const dineInCount = totalOrders - parcelOrdersCount;
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total_price + (o.parcel_charge || 0), 0);
  const customOrdersCount = filteredOrders.filter(o => o.is_custom).length;
  const needsPricingCount = filteredOrders.filter(o => o.is_custom && o.total_price === 0).length;

  function formatOrderTime(createdAt?: string, orderId?: string) {
    if (createdAt) {
      try {
        const d = new Date(createdAt);
        const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
        
        // Calculate relative time (e.g. 5 mins ago)
        const diffMs = Date.now() - d.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        let agoStr = '';
        if (diffMins < 1) agoStr = 'Just now';
        else if (diffMins < 60) agoStr = `${diffMins}m ago`;
        else agoStr = `${Math.floor(diffMins / 60)}h ago`;

        return { timeStr, agoStr };
      } catch (e) {}
    }

    // Fallback if timestamp missing: parse timestamp from order ID
    if (orderId && orderId.startsWith('ord-')) {
      const parts = orderId.split('-');
      const timestamp = parseInt(parts[1], 10);
      if (!isNaN(timestamp)) {
        const d = new Date(timestamp);
        const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
        return { timeStr, agoStr: 'Recorded' };
      }
    }

    return { timeStr: 'Session Entry', agoStr: '' };
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 rounded-3xl p-6 shadow-xl shadow-amber-500/15 border border-amber-400/40 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-100 text-xs font-black uppercase tracking-wider mb-1">
            <Clock className="w-4 h-4 text-amber-200" /> Real-time Kitchen & Dispatch Queue
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Live Order Queue</h1>
          <p className="text-amber-100 text-xs md:text-sm mt-1 font-medium">
            Monitor incoming orders, hostel parcel dispatches, and set prices for custom meal requests.
          </p>
        </div>

        {/* Date Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex p-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl">
            <button 
              onClick={() => setSelectedDate(yesterday)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition ${selectedDate === yesterday ? 'bg-white text-amber-900 shadow-md' : 'text-amber-100 hover:text-white'}`}
            >
              Yesterday
            </button>
            <button 
              onClick={() => setSelectedDate(today)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition ${selectedDate === today ? 'bg-white text-amber-900 shadow-md' : 'text-amber-100 hover:text-white'}`}
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/30 text-white">
            <Calendar className="w-4 h-4 text-amber-200" />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-white text-xs font-bold focus:outline-none"
            />
          </div>

          <button
            onClick={loadData}
            className="p-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl border border-white/30 text-white transition"
            title="Refresh Live Queue"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-amber-200/80 rounded-2xl p-4 shadow-xs">
          <div className="text-xs font-bold text-slate-500">Total Session Orders</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalOrders}</div>
        </div>

        <div className="bg-white border border-amber-200/80 rounded-2xl p-4 shadow-xs">
          <div className="text-xs font-bold text-amber-800">📦 Hostel Parcels</div>
          <div className="text-2xl font-black text-amber-700 mt-1">{parcelOrdersCount}</div>
        </div>

        <div className="bg-white border border-amber-200/80 rounded-2xl p-4 shadow-xs">
          <div className="text-xs font-bold text-slate-500">🍽️ Mess Dine-In</div>
          <div className="text-2xl font-black text-slate-800 mt-1">{dineInCount}</div>
        </div>

        <div className="bg-white border border-amber-200/80 rounded-2xl p-4 shadow-xs">
          <div className="text-xs font-bold text-emerald-700">Total Order Revenue</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">₹{totalRevenue.toLocaleString('en-IN')}</div>
        </div>

        {/* Custom Orders KPI */}
        <div className={`border rounded-2xl p-4 shadow-xs ${needsPricingCount > 0 ? 'bg-violet-50 border-violet-300' : 'bg-white border-amber-200/80'}`}>
          <div className="text-xs font-bold text-violet-800 flex items-center gap-1.5">
            ✏️ Custom Orders
            {needsPricingCount > 0 && (
              <span className="text-[9px] font-black bg-rose-500 text-white px-1.5 py-0.5 rounded-full animate-pulse">{needsPricingCount} NEED PRICE</span>
            )}
          </div>
          <div className="text-2xl font-black text-violet-700 mt-1">{customOrdersCount}</div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-amber-700/60" />
          <input 
            type="text"
            placeholder="Search by student name, ID, room, or dish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={mealFilter}
            onChange={(e) => setMealFilter(e.target.value as 'all' | 'lunch' | 'dinner')}
            className="bg-amber-50/40 border border-amber-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Sessions</option>
            <option value="lunch">☀️ Lunch Only</option>
            <option value="dinner">🌙 Dinner Only</option>
          </select>

          <select
            value={deliveryFilter}
            onChange={(e) => setDeliveryFilter(e.target.value as 'all' | 'parcel' | 'dinein')}
            className="bg-amber-50/40 border border-amber-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Service Types</option>
            <option value="parcel">📦 Hostel Delivery Only</option>
            <option value="dinein">🍽️ Mess Dine-In Only</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as 'all' | 'member' | 'guest' | 'custom')}
            className="bg-amber-50/40 border border-amber-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Order Types</option>
            <option value="member">🟢 Member Billed</option>
            <option value="guest">💳 Guest Paid (UPI)</option>
            <option value="custom">✏️ Custom Orders Only</option>
          </select>
        </div>
      </div>

      {/* Needs Pricing Alert Banner */}
      {needsPricingCount > 0 && (
        <div className="bg-violet-50 border-2 border-violet-300 rounded-2xl p-4 flex items-center gap-3 shadow-sm animate-in fade-in duration-300">
          <div className="w-10 h-10 rounded-xl bg-violet-100 border border-violet-300 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-violet-700" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-black text-violet-900">{needsPricingCount} custom order{needsPricingCount > 1 ? 's' : ''} waiting for price</p>
            <p className="text-xs text-violet-700 font-medium">Students typed custom meal requests. Click the ✏️ edit button to set the price.</p>
          </div>
          <button
            onClick={() => setPaymentFilter('custom')}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-black rounded-xl transition shrink-0"
          >
            Show Custom Orders
          </button>
        </div>
      )}

      {/* Orders Queue Table / List */}
      <div className="bg-white border border-amber-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-amber-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-amber-600" />
            Active Kitchen Queue ({filteredOrders.length} orders)
          </h2>
          <span className="text-xs text-slate-500 font-semibold">Sorted by Order Time</span>
        </div>

        <div className="divide-y divide-amber-100/60">
          {filteredOrders.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <UtensilsCrossed className="w-10 h-10 mx-auto mb-2 text-amber-400 opacity-60" />
              <p className="text-sm font-semibold text-slate-600">No orders found matching your filters.</p>
            </div>
          ) : (
            filteredOrders.map((ord) => {
              const student = students.find(s => s.id === ord.student_id);
              const displayName = ord.is_guest 
                ? (ord.guest_name ? `👤 Guest: ${ord.guest_name}` : '👤 Walk-in Guest')
                : student 
                  ? student.name 
                  : (ord.student_id || 'Student');

              const subInfo = ord.is_guest
                ? 'Guest Casual Order'
                : student
                  ? `${student.student_id} • ${student.room_batch || 'No Room'}`
                  : 'No Student ID';

              const { timeStr, agoStr } = formatOrderTime(ord.created_at, ord.id);
              const isCustom = ord.is_custom === true;
              const needsPrice = isCustom && ord.total_price === 0;

              return (
                <div key={ord.id} className={`p-4 hover:bg-amber-50/40 transition ${needsPrice ? 'bg-violet-50/40 border-l-4 border-l-violet-500' : ''}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Left Column: Customer & Dish details */}
                    <div className="flex items-start gap-3.5">
                      {/* Meal Pill */}
                      <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center font-black text-xs flex-shrink-0 ${ord.meal_type === 'lunch' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-indigo-100 text-indigo-800 border border-indigo-300'}`}>
                        <span>{ord.meal_type === 'lunch' ? 'L' : 'D'}</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-extrabold text-slate-900 text-sm">{displayName}</h3>
                          
                          {/* Custom Order Badge */}
                          {isCustom && (
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                              needsPrice
                                ? 'text-white bg-violet-600 border-violet-600 animate-pulse'
                                : 'text-violet-800 bg-violet-100 border-violet-300'
                            }`}>
                              ✏️ {needsPrice ? 'NEEDS PRICE' : 'Custom Order'}
                            </span>
                          )}

                          {/* Member vs Guest Badge */}
                          {!isCustom && (ord.is_guest ? (
                            <span className="text-[10px] font-black text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full border border-purple-300">
                              💳 Guest Paid
                            </span>
                          ) : (
                            <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                              🟢 Member Billed
                            </span>
                          ))}

                          {/* Delivery Badge */}
                          {ord.parcel_charge > 0 || ord.is_parcel ? (
                            <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                              <Truck className="w-3 h-3" /> Hostel Delivery (+₹{ord.parcel_charge || 10})
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                              🍽️ Mess Dine-In
                            </span>
                          )}
                        </div>

                        <p className="text-xs font-bold text-slate-800">
                          {ord.item_name} <span className="text-amber-700 font-black">x{ord.quantity}</span>
                          <span className="text-slate-400 font-normal ml-2">({subInfo})</span>
                        </p>

                        {/* Show custom request text if different from item_name */}
                        {isCustom && ord.custom_request && ord.custom_request !== ord.item_name && (
                          <p className="text-[11px] text-violet-700 font-medium bg-violet-50 border border-violet-200 rounded-lg px-2 py-1 mt-1 inline-block">
                            📝 Request: {ord.custom_request}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right Column: TIME OF ORDER & Price & Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-amber-100">
                      {/* Time of Order Badge */}
                      <div className="text-left sm:text-right">
                        <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>{timeStr}</span>
                        </div>
                        {agoStr && (
                          <div className="text-[10px] font-bold text-amber-700 mt-0.5">
                            {agoStr}
                          </div>
                        )}
                      </div>

                      {/* Total Price */}
                      <div className="text-right">
                        {needsPrice ? (
                          <span className="text-xs font-black text-violet-700 bg-violet-100 px-2.5 py-1 rounded-lg border border-violet-300">₹ Pending</span>
                        ) : (
                          <span className="text-base font-black text-emerald-700">₹{ord.total_price + (ord.parcel_charge || 0)}</span>
                        )}
                      </div>

                      {/* Edit Price Action */}
                      <button
                        onClick={() => startEditPrice(ord)}
                        className={`p-2 rounded-xl transition ${
                          needsPrice
                            ? 'text-white bg-violet-600 hover:bg-violet-700 shadow-sm'
                            : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                        }`}
                        title={needsPrice ? 'Set Price' : 'Edit Price'}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Delete Action */}
                      <button
                        onClick={() => handleDelete(ord.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                        title="Delete order"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* PRICE EDIT MODAL */}
      {editingOrderId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-amber-100 rounded-3xl p-6 w-full max-w-md space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-amber-100 pb-3">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-violet-600" /> Set Order Price
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {(() => {
                    const ord = orders.find(o => o.id === editingOrderId);
                    const student = ord?.student_id ? students.find(s => s.id === ord.student_id) : null;
                    return ord?.is_guest 
                      ? `Guest: ${ord.guest_name || 'Walk-in'}`
                      : student 
                        ? `${student.name} (${student.student_id})`
                        : 'Unknown Student';
                  })()}
                </p>
              </div>
              <button 
                onClick={() => { setEditingOrderId(null); setEditPrice(''); setEditItemName(''); }}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Custom Request Preview */}
            {(() => {
              const ord = orders.find(o => o.id === editingOrderId);
              return ord?.is_custom && ord.custom_request ? (
                <div className="bg-violet-50 border-2 border-violet-200 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-violet-800 bg-violet-100 px-2.5 py-0.5 rounded-full border border-violet-300">
                    ✏️ Student's Custom Request
                  </span>
                  <p className="text-sm font-bold text-violet-950 leading-relaxed mt-1.5">
                    "{ord.custom_request}"
                  </p>
                  <p className="text-[11px] text-violet-700 font-medium">
                    For {ord.meal_type.toUpperCase()} • Qty: {ord.quantity}
                  </p>
                </div>
              ) : null;
            })()}

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Dish / Item Name</label>
                <input
                  type="text"
                  value={editItemName}
                  onChange={(e) => setEditItemName(e.target.value)}
                  placeholder="e.g. 2 Chapati + Dal Rice"
                  className="w-full p-3 bg-amber-50/50 border border-amber-200 rounded-xl text-slate-900 text-sm font-semibold placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Total Price (₹) *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-lg font-black text-amber-700">₹</span>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    placeholder="0"
                    min="0"
                    step="1"
                    className="w-full pl-10 pr-4 py-3 bg-amber-50/50 border-2 border-amber-300 rounded-xl text-slate-900 text-2xl font-black placeholder-slate-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                    autoFocus
                  />
                </div>
                <p className="text-[10px] text-slate-500 font-medium mt-1">Enter the final amount to charge for this order</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-amber-100">
              <button 
                type="button" 
                onClick={() => { setEditingOrderId(null); setEditPrice(''); setEditItemName(''); }}
                className="px-5 py-2.5 bg-slate-100 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleSavePrice}
                disabled={isSavingPrice || !editPrice}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-sm font-black rounded-xl shadow-md shadow-amber-500/20 transition disabled:opacity-40 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSavingPrice ? 'Saving...' : 'Save Price'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
