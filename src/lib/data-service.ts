import { createClient } from './supabase/client';
import { Student, MenuItem, OrderItem, Bill, Payment, Settlement, Leave, AttendanceRecord, TodaysMenu } from './types';
import { INITIAL_MENU_ITEMS, DEFAULT_SECURITY_DEPOSIT, PARCEL_CHARGE_PER_DAY } from './constants';

const LOCAL_STORAGE_KEY_STUDENTS = 'km_students_v5';
const LOCAL_STORAGE_KEY_MENU = 'km_menu_v1';
const LOCAL_STORAGE_KEY_ORDERS = 'km_orders_v1';
const LOCAL_STORAGE_KEY_BILLS = 'km_bills_v1';
const LOCAL_STORAGE_KEY_PAYMENTS = 'km_payments_v1';
const LOCAL_STORAGE_KEY_LEAVES = 'km_leaves_v1';
const LOCAL_STORAGE_KEY_SETTLEMENTS = 'km_settlements_v1';
const LOCAL_STORAGE_KEY_TODAYS_MENU = 'km_todays_menu_v3';

// Clean Sample Students for testing & demo with photos & college reference data
const SEED_STUDENTS: Student[] = [
  { 
    id: 'std-1', 
    student_id: 'KM-101', 
    name: 'Rahul Patil', 
    phone: '7676866399', 
    password: 'pass101', 
    college_name: 'Engineering College', 
    batch_year: 'CS 2026 Batch', 
    room_batch: 'Hostel Block A, Room 101', 
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    join_date: '2026-08-01', 
    status: 'active', 
    security_deposit: 1000, 
    deposit_paid: true, 
    is_parcel_delivery: true 
  },
  { 
    id: 'std-2', 
    student_id: 'KM-102', 
    name: 'Rohan Patil', 
    phone: '9876543210', 
    password: 'pass102', 
    college_name: 'Polytechnic College', 
    batch_year: 'Mech 3rd Year', 
    room_batch: 'Hostel Block B, Room 204', 
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    join_date: '2026-08-01', 
    status: 'active', 
    security_deposit: 1000, 
    deposit_paid: true, 
    is_parcel_delivery: false 
  },
];

const DEFAULT_TODAYS_MENU: TodaysMenu = {
  date: new Date().toISOString().split('T')[0],
  lunch_special: 'Full Kolhapuri Veg Thali',
  lunch_dishes: 'Paneer Masala, Matki Usal, Indrayani Rice, Chapati / Bhakri, Solkadhi',
  dinner_special: 'Signature Non-Veg & Veg Thali',
  dinner_dishes: 'Tambda & Pandhra Rassa, Sukka Chicken (or Veg Special Curry), Hot Chapati',
  notice: '✨ Freshly prepared with homestyle Kolhapuri spices daily!',
  is_mess_open: true,
  closed_reason: '',
  is_parcel_available: true,
  parcel_unavailable_reason: '',
  dinner_parcel_start: '18:00',
  dinner_parcel_end: '19:30',
  sunday_lunch_start: '12:00',
  sunday_lunch_end: '13:30',
  updated_at: new Date().toISOString()
};

function isBrowser() {
  return typeof window !== 'undefined';
}

// Memory / LocalStorage Helper
function getLocal<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  const stored = localStorage.getItem(key);
  if (!stored) {
    try {
      localStorage.setItem(key, JSON.stringify(fallback));
    } catch (err) {
      console.warn(`Initial getLocal setItem failed for key "${key}":`, err);
    }
    return fallback;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, value: T) {
  if (isBrowser()) {
    try {
      let cleanValue: any = value;
      // Strip bulky nested student objects from bills before storing to save 90% space
      if (key === LOCAL_STORAGE_KEY_BILLS && Array.isArray(value)) {
        cleanValue = value.map((b: any) => {
          if (b && typeof b === 'object' && 'students' in b) {
            const { students, ...rest } = b;
            return rest;
          }
          return b;
        });
      }
      localStorage.setItem(key, JSON.stringify(cleanValue));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('km_data_updated', { detail: { key } }));
    } catch (err) {
      console.warn(`LocalStorage quota exceeded for key "${key}", attempting lightweight trim:`, err);
      if (Array.isArray(value)) {
        try {
          const sliced = (value as any[]).slice(-50).map((b: any) => {
            if (b && typeof b === 'object' && 'students' in b) {
              const { students, ...rest } = b;
              return rest;
            }
            return b;
          });
          localStorage.setItem(key, JSON.stringify(sliced));
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new CustomEvent('km_data_updated', { detail: { key } }));
        } catch {
          console.warn(`Safe in-memory operation active for key "${key}".`);
        }
      }
    }
  }
}

// ---------------- API METHODS ---------------- //

export const DataService = {
  // --- TODAY'S MENU BOARD ---
  async getTodaysMenu(): Promise<TodaysMenu> {
    try {
      if (typeof window !== 'undefined') {
        const res = await fetch('/api/todays-menu', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setLocal(LOCAL_STORAGE_KEY_TODAYS_MENU, data);
          return data;
        }
      }
    } catch (e) {
      console.warn('API fetch /api/todays-menu failed, using local storage fallback', e);
    }
    return getLocal<TodaysMenu>(LOCAL_STORAGE_KEY_TODAYS_MENU, DEFAULT_TODAYS_MENU);
  },

  async saveTodaysMenu(menu: Partial<TodaysMenu>): Promise<TodaysMenu> {
    const current = await this.getTodaysMenu();
    const updated: TodaysMenu = {
      ...current,
      ...menu,
      date: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString()
    };
    setLocal(LOCAL_STORAGE_KEY_TODAYS_MENU, updated);

    try {
      if (typeof window !== 'undefined') {
        await fetch('/api/todays-menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated)
        });
      }
    } catch (e) {
      console.warn('Failed to POST to /api/todays-menu', e);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('todays_menu_updated', { detail: updated }));
    }

    return updated;
  },

  // --- MENU ITEMS ---
  async getMenuItems(): Promise<MenuItem[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from('menu_items').select('*').order('sort_order', { ascending: true });
      if (!error && data && data.length > 0) return data as MenuItem[];
    } catch (e) {
      console.warn('Supabase fetch failed, trying API route', e);
    }

    try {
      if (typeof window !== 'undefined') {
        const res = await fetch('/api/menu-items', { cache: 'no-store' });
        if (res.ok) {
          const items = await res.json();
          setLocal(LOCAL_STORAGE_KEY_MENU, items);
          return items;
        }
      }
    } catch (e) {
      console.warn('API fetch /api/menu-items failed, using local storage fallback', e);
    }

    const local = getLocal<MenuItem[]>(LOCAL_STORAGE_KEY_MENU, INITIAL_MENU_ITEMS.map((item, index) => ({ ...item, id: `menu-${index + 1}` })));
    return local;
  },

  async updateMenuItem(item: MenuItem): Promise<boolean> {
    try {
      const supabase = createClient();
      const { error } = await supabase.from('menu_items').upsert(item);
      if (!error) return true;
    } catch (e) {
      console.warn('Supabase update failed', e);
    }

    const items = await this.getMenuItems();
    const idx = items.findIndex(i => i.id === item.id);
    if (idx >= 0) items[idx] = item;
    else items.push(item);
    setLocal(LOCAL_STORAGE_KEY_MENU, items);

    try {
      if (typeof window !== 'undefined') {
        await fetch('/api/menu-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        });
      }
    } catch (e) {
      console.warn('Failed to POST to /api/menu-items', e);
    }

    return true;
  },

  // --- STUDENTS ---
  async getStudents(): Promise<Student[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from('students').select('*').order('name', { ascending: true });
      if (!error && data && data.length > 0) return data as Student[];
    } catch (e) {
      console.warn('Supabase fetch failed, falling back to local students', e);
    }
    return getLocal<Student[]>(LOCAL_STORAGE_KEY_STUDENTS, SEED_STUDENTS);
  },

  async getStudentByIdOrPhone(query: string): Promise<Student | null> {
    const students = await this.getStudents();
    const q = query.trim().toLowerCase();
    return students.find(s => 
      s.student_id.toLowerCase() === q || 
      s.phone.replace(/\D/g, '').includes(q.replace(/\D/g, '')) ||
      s.id === query
    ) || null;
  },

  async saveStudent(student: Partial<Student>): Promise<Student> {
    const newStudent: Student = {
      id: student.id || `std-${Date.now()}`,
      student_id: student.student_id || `KM-${Math.floor(100 + Math.random() * 900)}`,
      name: student.name || '',
      phone: student.phone || '',
      password: student.password || 'pass123',
      college_name: student.college_name || '',
      batch_year: student.batch_year || '',
      room_batch: student.room_batch || '',
      photo_url: student.photo_url || '',
      join_date: student.join_date || new Date().toISOString().split('T')[0],
      status: student.status || 'active',
      security_deposit: student.security_deposit || DEFAULT_SECURITY_DEPOSIT,
      deposit_paid: student.deposit_paid ?? true,
      is_parcel_delivery: student.is_parcel_delivery ?? false,
      approval_date: student.approval_date,
    };

    try {
      const supabase = createClient();
      const { data, error } = await supabase.from('students').upsert(newStudent).select().single();
      if (!error && data) return data as Student;
    } catch (e) {
      console.warn('Supabase save student failed', e);
    }

    const students = await this.getStudents();
    const idx = students.findIndex(s => s.id === newStudent.id);
    if (idx >= 0) students[idx] = newStudent;
    else students.push(newStudent);
    setLocal(LOCAL_STORAGE_KEY_STUDENTS, students);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('students_updated', { detail: students }));
    }

    return newStudent;
  },

  async registerStudent(data: { name: string; phone: string; password: string; college_name?: string; batch_year?: string; room_batch?: string; photo_url?: string; is_parcel_delivery?: boolean }): Promise<Student> {
    const students = await this.getStudents();
    const nextNum = 101 + students.length;
    const newStudent: Student = {
      id: `std-${Date.now()}`,
      student_id: `KM-${nextNum}`,
      name: data.name,
      phone: data.phone,
      password: data.password,
      college_name: data.college_name || '',
      batch_year: data.batch_year || '',
      room_batch: data.room_batch || '',
      photo_url: data.photo_url || '',
      join_date: new Date().toISOString().split('T')[0],
      status: 'pending_approval',
      security_deposit: DEFAULT_SECURITY_DEPOSIT,
      deposit_paid: false,
      is_parcel_delivery: data.is_parcel_delivery ?? false,
    };
    return this.saveStudent(newStudent);
  },

  async approveStudent(studentId: string): Promise<Student> {
    const students = await this.getStudents();
    const student = students.find(s => s.id === studentId || s.student_id === studentId);
    if (!student) throw new Error('Student not found');
    student.status = 'active';
    student.approval_date = new Date().toISOString().split('T')[0];
    student.deposit_paid = true;
    return this.saveStudent(student);
  },

  // --- DAILY ORDERS & ATTENDANCE ---
  async getOrderItemsByDate(date: string, mealType?: 'lunch' | 'dinner'): Promise<OrderItem[]> {
    let dbOrders: OrderItem[] = [];
    try {
      const supabase = createClient();
      let query = supabase.from('order_items').select('*').eq('date', date);
      if (mealType) query = query.eq('meal_type', mealType);
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        dbOrders = data as OrderItem[];
      }
    } catch (e) {
      console.warn('Supabase fetch order items failed', e);
    }

    const localOrders = getLocal<OrderItem[]>(LOCAL_STORAGE_KEY_ORDERS, [])
      .filter(o => o.date === date && (!mealType || o.meal_type === mealType));

    const orderMap = new Map<string, OrderItem>();
    localOrders.forEach(o => orderMap.set(o.id, o));
    dbOrders.forEach(o => orderMap.set(o.id, o));

    return Array.from(orderMap.values()).sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return timeB - timeA;
    });
  },

  async getAllOrders(): Promise<OrderItem[]> {
    let dbOrders: OrderItem[] = [];
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from('order_items').select('*');
      if (!error && data && data.length > 0) {
        dbOrders = data as OrderItem[];
      }
    } catch (e) {
      console.warn('Supabase fetch all orders failed', e);
    }

    const localOrders = getLocal<OrderItem[]>(LOCAL_STORAGE_KEY_ORDERS, []);
    const orderMap = new Map<string, OrderItem>();
    localOrders.forEach(o => orderMap.set(o.id, o));
    dbOrders.forEach(o => orderMap.set(o.id, o));

    return Array.from(orderMap.values()).sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return timeB - timeA;
    });
  },

  async recordOrder(order: Omit<OrderItem, 'id'>): Promise<OrderItem> {
    const newOrder: OrderItem = {
      ...order,
      created_at: order.created_at || new Date().toISOString(),
      status: order.status || 'pending',
      id: `ord-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
    };

    // Always record into local storage so all ERP pages reflect immediately
    const orders = getLocal<OrderItem[]>(LOCAL_STORAGE_KEY_ORDERS, []);
    orders.unshift(newOrder);
    setLocal(LOCAL_STORAGE_KEY_ORDERS, orders);

    // Notify open ERP tabs in real-time
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('new_order_recorded', { detail: newOrder }));
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase.from('order_items').insert(newOrder).select().single();
      if (!error && data) return data as OrderItem;
    } catch (e) {
      console.warn('Supabase record order failed', e);
    }

    return newOrder;
  },

  async deleteOrder(orderId: string): Promise<boolean> {
    try {
      const supabase = createClient();
      const { error } = await supabase.from('order_items').delete().eq('id', orderId);
      if (!error) return true;
    } catch (e) {
      console.warn('Supabase delete order failed', e);
    }

    const orders = getLocal<OrderItem[]>(LOCAL_STORAGE_KEY_ORDERS, []);
    const filtered = orders.filter(o => o.id !== orderId);
    setLocal(LOCAL_STORAGE_KEY_ORDERS, filtered);
    return true;
  },

  async updateOrder(orderId: string, updates: Partial<OrderItem>): Promise<OrderItem | null> {
    // Update in localStorage
    const orders = getLocal<OrderItem[]>(LOCAL_STORAGE_KEY_ORDERS, []);
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx >= 0) {
      orders[idx] = { ...orders[idx], ...updates };
      setLocal(LOCAL_STORAGE_KEY_ORDERS, orders);
    }

    // Try updating in Supabase
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from('order_items').update(updates).eq('id', orderId).select().single();
      if (!error && data) {
        // Notify all open tabs
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new CustomEvent('new_order_recorded', { detail: data }));
        }
        return data as OrderItem;
      }
    } catch (e) {
      console.warn('Supabase update order failed', e);
    }

    // Return the locally updated version
    const updatedOrder = idx >= 0 ? orders[idx] : null;
    if (updatedOrder && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('new_order_recorded', { detail: updatedOrder }));
    }
    return updatedOrder;
  },

  // --- BILLS ---
  async getBills(month?: number, year?: number, studentId?: string): Promise<Bill[]> {
    const students = await this.getStudents();
    const studentMap = new Map(students.map(s => [s.id, s]));

    let rawBills: Bill[] = [];
    try {
      const supabase = createClient();
      let q = supabase.from('bills').select('*');
      if (month) q = q.eq('billing_month', month);
      if (year) q = q.eq('billing_year', year);
      if (studentId) q = q.eq('student_id', studentId);
      const { data, error } = await q;
      if (!error && data && data.length > 0) {
        rawBills = data as Bill[];
      }
    } catch (e) {
      console.warn('Supabase fetch bills failed', e);
    }

    if (rawBills.length === 0) {
      const bills = getLocal<Bill[]>(LOCAL_STORAGE_KEY_BILLS, []);
      rawBills = bills.filter(b => 
        (!month || b.billing_month === month) &&
        (!year || b.billing_year === year) &&
        (!studentId || b.student_id === studentId)
      );
    }

    return rawBills.map(b => ({
      ...b,
      students: b.students || studentMap.get(b.student_id) || undefined
    }));
  },

  async generateMonthlyBills(month: number, year: number): Promise<Bill[]> {
    const students = await this.getStudents();
    const orders = await this.getAllOrders();
    const existingBills = await this.getBills(month, year);

    const updatedBills: Bill[] = [];

    for (const student of students) {
      if (student.status === 'left') continue;

      // Filter orders for this student in this month and year
      const studentOrders = orders.filter(o => {
        if (!o.date) return false;
        const d = new Date(o.date);
        return o.student_id === student.id && (d.getMonth() + 1) === month && d.getFullYear() === year;
      });

      // Calculate totals
      const itemsTotal = studentOrders.reduce((sum, item) => sum + item.total_price, 0);
      const totalMeals = new Set(studentOrders.map(o => `${o.date}-${o.meal_type}`)).size;
      
      // Calculate delivery charges (if parcel delivery is true)
      // ₹10 per day the student took meals
      const uniqueDays = new Set(studentOrders.map(o => o.date)).size;
      const deliveryCharges = student.is_parcel_delivery ? (uniqueDays * PARCEL_CHARGE_PER_DAY) : 0;

      const totalAmount = itemsTotal + deliveryCharges;

      const existing = existingBills.find(b => b.student_id === student.id);
      
      const bill: Bill = {
        id: existing?.id || `bill-${student.id}-${year}-${month}`,
        student_id: student.id,
        billing_month: month,
        billing_year: year,
        total_meals: totalMeals,
        items_total: itemsTotal,
        delivery_charges: deliveryCharges,
        guest_charges: 0,
        adjustments: existing?.adjustments || 0,
        adjustment_notes: existing?.adjustment_notes || '',
        total_amount: totalAmount + (existing?.adjustments || 0),
        paid_amount: existing?.paid_amount || 0,
        status: (existing?.paid_amount || 0) >= totalAmount ? 'paid' : (existing?.paid_amount || 0) > 0 ? 'partially_paid' : 'draft',
        generated_at: new Date().toISOString(),
        students: student
      };

      updatedBills.push(bill);
    }

    // Persist local bills
    const currentBills = getLocal<Bill[]>(LOCAL_STORAGE_KEY_BILLS, []);
    const otherBills = currentBills.filter(b => !(b.billing_month === month && b.billing_year === year));
    setLocal(LOCAL_STORAGE_KEY_BILLS, [...otherBills, ...updatedBills]);

    return updatedBills;
  },

  async updateBill(bill: Bill): Promise<Bill> {
    const bills = getLocal<Bill[]>(LOCAL_STORAGE_KEY_BILLS, []);
    const idx = bills.findIndex(b => b.id === bill.id);
    if (idx >= 0) bills[idx] = bill;
    else bills.push(bill);
    setLocal(LOCAL_STORAGE_KEY_BILLS, bills);
    return bill;
  },

  // --- PAYMENTS ---
  async getPayments(studentId?: string): Promise<Payment[]> {
    const payments = getLocal<Payment[]>(LOCAL_STORAGE_KEY_PAYMENTS, []);
    if (studentId) return payments.filter(p => p.student_id === studentId);
    return payments;
  },

  async recordPayment(payment: Omit<Payment, 'id'>): Promise<Payment> {
    const newPayment: Payment = {
      ...payment,
      id: `pay-${Date.now()}`
    };

    const payments = getLocal<Payment[]>(LOCAL_STORAGE_KEY_PAYMENTS, []);
    payments.push(newPayment);
    setLocal(LOCAL_STORAGE_KEY_PAYMENTS, payments);

    // Update corresponding bill if bill_id present
    if (payment.bill_id) {
      const bills = getLocal<Bill[]>(LOCAL_STORAGE_KEY_BILLS, []);
      const bill = bills.find(b => b.id === payment.bill_id);
      if (bill) {
        bill.paid_amount = (bill.paid_amount || 0) + payment.amount;
        bill.status = bill.paid_amount >= bill.total_amount ? 'paid' : 'partially_paid';
        setLocal(LOCAL_STORAGE_KEY_BILLS, bills);
      }
    }

    return newPayment;
  },

  // --- SETTLEMENT (FOR LEAVING STUDENTS) ---
  async processSettlement(studentId: string, notes?: string): Promise<Settlement> {
    const students = await this.getStudents();
    const student = students.find(s => s.id === studentId);
    if (!student) throw new Error('Student not found');

    const bills = await this.getBills(undefined, undefined, studentId);
    const totalDues = bills.reduce((sum, b) => sum + (b.total_amount - b.paid_amount), 0);

    const depositApplied = Math.min(student.security_deposit || 1000, totalDues);
    const balanceOwed = totalDues > depositApplied ? (totalDues - depositApplied) : 0;
    const refundAmount = depositApplied > totalDues ? (depositApplied - totalDues) : 0;

    const settlement: Settlement = {
      id: `stl-${Date.now()}`,
      student_id: studentId,
      total_dues: totalDues,
      deposit_applied: depositApplied,
      refund_amount: refundAmount,
      balance_owed: balanceOwed,
      closed_at: new Date().toISOString(),
      notes: notes || 'Student final settlement completed.',
      students: student
    };

    // Update student status to 'left'
    student.status = 'left';
    student.left_date = new Date().toISOString().split('T')[0];
    await this.saveStudent(student);

    // Save settlement
    const settlements = getLocal<Settlement[]>(LOCAL_STORAGE_KEY_SETTLEMENTS, []);
    settlements.push(settlement);
    setLocal(LOCAL_STORAGE_KEY_SETTLEMENTS, settlements);

    return settlement;
  }
};
