'use client';

import { useState, useEffect } from 'react';
import { DataService } from '@/lib/data-service';
import { MenuItem, TodaysMenu } from '@/lib/types';
import { ChefHat, Edit2, Sparkles, Sun, Moon, Save, Megaphone, Power, Truck, AlertTriangle, CheckCircle2, ShieldAlert, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MenuManagementPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Today's Menu Board State
  const [todaysMenu, setTodaysMenu] = useState<TodaysMenu>({
    date: new Date().toISOString().split('T')[0],
    lunch_special: '',
    lunch_dishes: '',
    dinner_special: '',
    dinner_dishes: '',
    notice: '',
    is_mess_open: true,
    closed_reason: '',
    is_parcel_available: true,
    parcel_unavailable_reason: '',
    updated_at: ''
  });
  const [isSavingTodaysMenu, setIsSavingTodaysMenu] = useState(false);

  useEffect(() => { 
    loadMenu(); 
  }, []);

  async function loadMenu() {
    const [items, tMenu] = await Promise.all([
      DataService.getMenuItems(),
      DataService.getTodaysMenu()
    ]);
    setMenuItems(items);
    setTodaysMenu(tMenu);
  }

  async function handleSaveTodaysMenu(e: React.FormEvent) {
    e.preventDefault();
    setIsSavingTodaysMenu(true);
    await DataService.saveTodaysMenu(todaysMenu);
    toast.success('🎉 Today\'s Menu published! Reflects live on Student Portal & Website.');
    setIsSavingTodaysMenu(false);
  }

  async function handleToggleAvailability(item: MenuItem) {
    const updated = { ...item, is_available: !item.is_available };
    await DataService.updateMenuItem(updated);
    toast.success(`Updated availability for ${item.name}`);
    loadMenu();
  }

  async function handleSaveItem(e: React.FormEvent) {
    e.preventDefault();
    if (!editingItem) return;
    await DataService.updateMenuItem(editingItem);
    toast.success(`Updated ${editingItem.name}`);
    setEditingItem(null);
    loadMenu();
  }

  const categories = [
    { key: 'veg', label: '🌱 Veg Dishes' },
    { key: 'non_veg', label: '🍗 Non Veg Dishes' },
    { key: 'egg', label: '🥚 Egg Specials' },
    { key: 'extra', label: '🫓 Extra Side Items' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 rounded-3xl p-6 shadow-xl shadow-amber-500/15 text-white">
        <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
          <ChefHat className="w-7 h-7" /> Menu & Today's Meal Board Management
        </h1>
        <p className="text-amber-100 text-xs md:text-sm mt-1">
          Publish today's fresh menu for students and manage dish prices.
        </p>
      </div>

      {/* TODAY'S MENU BOARD PUBLISHER CARD */}
      <div className="bg-white border border-amber-200/80 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-amber-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider mb-1 border border-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Live Daily Menu
            </div>
            <h2 className="text-lg font-black text-slate-900">Set Today's Fresh Kitchen Menu</h2>
            <p className="text-xs text-slate-500">Changes update instantly on Student Portal & Main Website.</p>
          </div>
        </div>

        <form onSubmit={handleSaveTodaysMenu} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Lunch Menu Box */}
            <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-amber-900">
                <Sun className="w-4 h-4 text-amber-600" /> ☀️ TODAY'S LUNCH MENU
              </div>
              <div>
                <label className="text-xs font-extrabold text-slate-700">Lunch Special Title</label>
                <input
                  type="text"
                  placeholder="e.g. Full Kolhapuri Veg Thali"
                  value={todaysMenu.lunch_special}
                  onChange={(e) => setTodaysMenu({ ...todaysMenu, lunch_special: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-extrabold text-slate-700">Included Dishes / Description</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Paneer Butter Masala, Matki Usal, Indrayani Rice, Chapati/Bhakri, Solkadhi"
                  value={todaysMenu.lunch_dishes}
                  onChange={(e) => setTodaysMenu({ ...todaysMenu, lunch_dishes: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-white border border-amber-300 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>

            {/* Dinner Menu Box */}
            <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-indigo-900">
                <Moon className="w-4 h-4 text-indigo-600" /> 🌙 TODAY'S DINNER MENU
              </div>
              <div>
                <label className="text-xs font-extrabold text-slate-700">Dinner Special Title</label>
                <input
                  type="text"
                  placeholder="e.g. Signature Non-Veg & Veg Thali"
                  value={todaysMenu.dinner_special}
                  onChange={(e) => setTodaysMenu({ ...todaysMenu, dinner_special: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-white border border-indigo-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-extrabold text-slate-700">Included Dishes / Description</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Tambda & Pandhra Rassa, Sukka Chicken (or Special Veg Curry), Hot Chapati"
                  value={todaysMenu.dinner_dishes}
                  onChange={(e) => setTodaysMenu({ ...todaysMenu, dinner_dishes: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-white border border-indigo-300 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* OPERATIONAL STATUS TOGGLES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white">
            {/* Mess Open / Closed Status Toggle */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-amber-400">
                  <Power className="w-4 h-4" /> Mess Operational Status
                </span>
                <button
                  type="button"
                  onClick={() => setTodaysMenu({ ...todaysMenu, is_mess_open: !(todaysMenu.is_mess_open ?? true) })}
                  className={`px-3 py-1 rounded-xl text-xs font-black transition border ${
                    (todaysMenu.is_mess_open ?? true)
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  }`}
                >
                  {(todaysMenu.is_mess_open ?? true) ? '🟢 MESS OPEN' : '🔴 MESS CLOSED TODAY'}
                </button>
              </div>
              {!(todaysMenu.is_mess_open ?? true) && (
                <input
                  type="text"
                  placeholder="Reason for closure (e.g. Festival Holiday / Kitchen Maintenance)"
                  value={todaysMenu.closed_reason || ''}
                  onChange={(e) => setTodaysMenu({ ...todaysMenu, closed_reason: e.target.value })}
                  className="w-full p-2 bg-slate-800 border border-rose-500/30 rounded-xl text-xs text-rose-200 focus:outline-none placeholder-slate-500"
                />
              )}
            </div>

            {/* Parcel Delivery Status Toggle */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-amber-400">
                  <Truck className="w-4 h-4" /> Hostel Delivery Status
                </span>
                <button
                  type="button"
                  onClick={() => setTodaysMenu({ ...todaysMenu, is_parcel_available: !(todaysMenu.is_parcel_available ?? true) })}
                  className={`px-3 py-1 rounded-xl text-xs font-black transition border ${
                    (todaysMenu.is_parcel_available ?? true)
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}
                >
                  {(todaysMenu.is_parcel_available ?? true) ? '🟢 PARCELS AVAILABLE' : '🟠 PARCELS FULL / UNAVAILABLE'}
                </button>
              </div>
              {!(todaysMenu.is_parcel_available ?? true) && (
                <input
                  type="text"
                  placeholder="Reason (e.g. Delivery Slots Full Tonight / Heavy Rain)"
                  value={todaysMenu.parcel_unavailable_reason || ''}
                  onChange={(e) => setTodaysMenu({ ...todaysMenu, parcel_unavailable_reason: e.target.value })}
                  className="w-full p-2 bg-slate-800 border border-amber-500/30 rounded-xl text-xs text-amber-200 focus:outline-none placeholder-slate-500"
                />
              )}
            </div>
          </div>

          {/* PARCEL ORDERING TIME WINDOW CONFIGURATOR */}
          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-white space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-amber-300">
                <Clock className="w-4 h-4 text-amber-400" /> Configurable Order Time Windows
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full font-bold border border-amber-500/40">
                Enforced on Portal
              </span>
            </div>
            <p className="text-xs text-amber-100/80 font-medium">
              Define exact ordering time slots. Outside these hours, students cannot submit orders on the Student Portal.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Dinner Parcel Window */}
              <div className="bg-slate-900/90 p-3.5 rounded-xl border border-amber-500/20 space-y-2">
                <div className="flex items-center justify-between text-xs font-extrabold text-amber-300">
                  <span className="flex items-center gap-1.5"><Moon className="w-4 h-4 text-indigo-400" /> Daily Dinner Parcel Slot</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-1">Start Time (6:00 PM)</label>
                    <input
                      type="time"
                      value={todaysMenu.dinner_parcel_start || '18:00'}
                      onChange={(e) => setTodaysMenu({ ...todaysMenu, dinner_parcel_start: e.target.value })}
                      className="w-full p-2 bg-slate-950 border border-amber-500/40 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-1">End Time (7:30 PM)</label>
                    <input
                      type="time"
                      value={todaysMenu.dinner_parcel_end || '19:30'}
                      onChange={(e) => setTodaysMenu({ ...todaysMenu, dinner_parcel_end: e.target.value })}
                      className="w-full p-2 bg-slate-950 border border-amber-500/40 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">Default: 6:00 PM to 7:30 PM (18:00 to 19:30)</p>
              </div>

              {/* Sunday Lunch Parcel Window */}
              <div className="bg-slate-900/90 p-3.5 rounded-xl border border-amber-500/20 space-y-2">
                <div className="flex items-center justify-between text-xs font-extrabold text-amber-300">
                  <span className="flex items-center gap-1.5"><Sun className="w-4 h-4 text-amber-400" /> Sunday Lunch Parcel Slot</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-1">Start Time (12:00 PM)</label>
                    <input
                      type="time"
                      value={todaysMenu.sunday_lunch_start || '12:00'}
                      onChange={(e) => setTodaysMenu({ ...todaysMenu, sunday_lunch_start: e.target.value })}
                      className="w-full p-2 bg-slate-950 border border-amber-500/40 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-1">End Time (1:30 PM)</label>
                    <input
                      type="time"
                      value={todaysMenu.sunday_lunch_end || '13:30'}
                      onChange={(e) => setTodaysMenu({ ...todaysMenu, sunday_lunch_end: e.target.value })}
                      className="w-full p-2 bg-slate-950 border border-amber-500/40 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">Default: 12:00 PM to 1:30 PM (12:00 to 13:30)</p>
              </div>
            </div>
          </div>

          {/* Kitchen Announcement Notice */}
          <div>
            <label className="text-xs font-black text-slate-800 flex items-center gap-1.5 mb-1">
              <Megaphone className="w-4 h-4 text-amber-600" /> Daily Special Announcement / Notice (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. ✨ Festival Special: Puran Poli served today!"
              value={todaysMenu.notice || ''}
              onChange={(e) => setTodaysMenu({ ...todaysMenu, notice: e.target.value })}
              className="w-full p-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSavingTodaysMenu}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-white font-black text-xs shadow-md shadow-amber-500/20 hover:scale-105 transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSavingTodaysMenu ? 'Publishing...' : '💾 Publish Today\'s Menu & Operational Status'}
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-6">
        {categories.map(cat => {
          const items = menuItems.filter(i => i.category === cat.key);
          if (items.length === 0) return null;

          return (
            <div key={cat.key} className="bg-white border border-amber-100 rounded-2xl p-5 space-y-4 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 border-b border-amber-100 pb-3">{cat.label}</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {items.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3.5 bg-amber-50/50 border border-amber-100 rounded-xl hover:border-amber-200 transition">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                      <div className="flex items-center gap-3 text-xs mt-1">
                        <span className="text-emerald-600 font-semibold">Student: ₹{item.price}</span>
                        {item.guest_price && (
                          <span className="text-amber-600 font-semibold">Guest: ₹{item.guest_price}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleAvailability(item)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          item.is_available
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-100 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {item.is_available ? 'Available' : 'Unavailable'}
                      </button>

                      <button
                        onClick={() => setEditingItem(item)}
                        className="p-1.5 rounded-lg bg-amber-100 border border-amber-200 text-amber-700 hover:bg-amber-200 transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-amber-100 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900 flex items-center justify-between border-b border-amber-100 pb-3">
              <span>Edit Menu Price</span>
              <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-700 text-xl leading-none">✕</button>
            </h2>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600">Dish Name</label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Student Price (₹)</label>
                  <input
                    type="number"
                    value={editingItem.price}
                    onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })}
                    className="w-full mt-1 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Guest Price (₹)</label>
                  <input
                    type="number"
                    value={editingItem.guest_price || editingItem.price}
                    onChange={(e) => setEditingItem({ ...editingItem, guest_price: parseFloat(e.target.value) || 0 })}
                    className="w-full mt-1 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-amber-100">
                <button type="button" onClick={() => setEditingItem(null)} className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200 transition">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl transition">Save Price</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
