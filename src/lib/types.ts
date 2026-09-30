export interface Profile {
  id: string;
  full_name: string;
  role: 'admin' | 'staff';
  phone?: string;
  created_at?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'veg' | 'non_veg' | 'egg' | 'extra';
  price: number;
  guest_price?: number;
  description?: string;
  is_available: boolean;
  sort_order: number;
}

export interface MealPlan {
  id: string;
  name: string;
  includes_lunch: boolean;
  includes_dinner: boolean;
  is_active: boolean;
}

export interface Student {
  id: string;
  student_id: string;
  name: string;
  phone: string;
  password?: string;
  college_name?: string;
  batch_year?: string;
  room_batch?: string;
  photo_url?: string;
  meal_plan_id?: string;
  join_date: string;
  status: 'pending_approval' | 'active' | 'on_leave' | 'left';
  security_deposit: number;
  deposit_paid: boolean;
  is_parcel_delivery: boolean;
  left_date?: string;
  approval_date?: string;
  created_at?: string;
  meal_plans?: MealPlan;
}

export interface OrderItem {
  id: string;
  student_id?: string;
  date: string;
  meal_type: 'lunch' | 'dinner';
  menu_item_id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  is_parcel: boolean;
  parcel_charge: number;
  is_guest: boolean;
  guest_name?: string;
  recorded_by?: string;
  created_at?: string;
  status?: 'pending' | 'kitchen' | 'dispatched' | 'completed';
  is_custom?: boolean;
  custom_request?: string;
  students?: Student;
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  date: string;
  meal_type: 'lunch' | 'dinner';
  status: 'present' | 'absent' | 'leave';
  marked_by?: string;
}

export interface Leave {
  id: string;
  student_id: string;
  start_date: string;
  end_date: string;
  reason?: string;
  created_by?: string;
}

export interface Bill {
  id: string;
  student_id: string;
  billing_month: number;
  billing_year: number;
  total_meals: number;
  items_total: number;
  delivery_charges: number;
  guest_charges: number;
  adjustments: number;
  adjustment_notes?: string;
  total_amount: number;
  paid_amount: number;
  status: 'draft' | 'finalized' | 'paid' | 'partially_paid';
  generated_at: string;
  finalized_at?: string;
  students?: Student;
}

export interface Payment {
  id: string;
  student_id: string;
  bill_id?: string;
  amount: number;
  mode: 'cash' | 'upi' | 'bank_transfer';
  payment_date: string;
  notes?: string;
  recorded_by?: string;
  students?: Student;
}

export interface Settlement {
  id: string;
  student_id: string;
  total_dues: number;
  deposit_applied: number;
  refund_amount: number;
  balance_owed: number;
  settled_by?: string;
  closed_at: string;
  notes?: string;
  students?: Student;
}

export interface TodaysMenu {
  date: string;
  lunch_special: string;
  lunch_dishes: string;
  dinner_special: string;
  dinner_dishes: string;
  notice?: string;
  is_mess_open?: boolean;
  closed_reason?: string;
  is_parcel_available?: boolean;
  parcel_unavailable_reason?: string;
  dinner_parcel_start?: string;
  dinner_parcel_end?: string;
  sunday_lunch_start?: string;
  sunday_lunch_end?: string;
  updated_at: string;
}
