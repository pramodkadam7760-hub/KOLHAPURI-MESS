-- Schema Migration for Kolhapuri Mess ERP

-- Create Enums
CREATE TYPE user_role AS ENUM ('admin', 'staff');
CREATE TYPE menu_category AS ENUM ('veg', 'non_veg', 'egg', 'extra');
CREATE TYPE student_status AS ENUM ('active', 'on_leave', 'left');
CREATE TYPE meal_type AS ENUM ('lunch', 'dinner');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'leave');
CREATE TYPE bill_status AS ENUM ('draft', 'finalized', 'paid', 'partially_paid');
CREATE TYPE payment_mode AS ENUM ('cash', 'upi', 'bank_transfer');

-- Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'staff',
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meal Plans Table
CREATE TABLE IF NOT EXISTS meal_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    includes_lunch BOOLEAN DEFAULT TRUE,
    includes_dinner BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menu Items Table
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category menu_category NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    guest_price DECIMAL(10,2) DEFAULT NULL, -- Null defaults to price, veg thali defaults to 90
    description TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Students Table
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    room_batch TEXT,
    meal_plan_id UUID REFERENCES meal_plans(id),
    join_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status student_status DEFAULT 'active',
    security_deposit DECIMAL(10,2) DEFAULT 1000.00,
    deposit_paid BOOLEAN DEFAULT TRUE,
    is_parcel_delivery BOOLEAN DEFAULT FALSE, -- Charges ₹10 parcel fee per day
    left_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    meal_type meal_type NOT NULL,
    status attendance_status NOT NULL DEFAULT 'present',
    marked_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, date, meal_type)
);

-- Order Items Table (Records specific dishes ordered by students or guests)
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    meal_type meal_type NOT NULL,
    menu_item_id UUID REFERENCES menu_items(id),
    item_name TEXT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    is_parcel BOOLEAN DEFAULT FALSE,
    parcel_charge DECIMAL(10,2) DEFAULT 0.00,
    is_guest BOOLEAN DEFAULT FALSE,
    guest_name TEXT,
    recorded_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leaves Table
CREATE TABLE IF NOT EXISTS leaves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bills Table
CREATE TABLE IF NOT EXISTS bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    billing_month INT NOT NULL, -- 1 to 12
    billing_year INT NOT NULL,
    total_meals INT DEFAULT 0,
    items_total DECIMAL(10,2) DEFAULT 0.00,
    delivery_charges DECIMAL(10,2) DEFAULT 0.00,
    guest_charges DECIMAL(10,2) DEFAULT 0.00,
    adjustments DECIMAL(10,2) DEFAULT 0.00,
    adjustment_notes TEXT,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    paid_amount DECIMAL(10,2) DEFAULT 0.00,
    status bill_status DEFAULT 'draft',
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    finalized_at TIMESTAMPTZ,
    UNIQUE(student_id, billing_month, billing_year)
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    bill_id UUID REFERENCES bills(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    mode payment_mode NOT NULL DEFAULT 'cash',
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    recorded_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settlements Table (For leaving students)
CREATE TABLE IF NOT EXISTS settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    total_dues DECIMAL(10,2) NOT NULL,
    deposit_applied DECIMAL(10,2) NOT NULL DEFAULT 1000.00,
    refund_amount DECIMAL(10,2) DEFAULT 0.00,
    balance_owed DECIMAL(10,2) DEFAULT 0.00,
    settled_by UUID REFERENCES profiles(id),
    closed_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

-- Audit Log Table
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    old_value JSONB,
    new_value JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Initial Menu Items from Kolhapuri Mess Menu Card
INSERT INTO menu_items (name, category, price, guest_price, sort_order) VALUES
('Full Thali', 'veg', 70.00, 90.00, 1),
('Full Thali (Bhakri)', 'veg', 80.00, 90.00, 2),
('2 Chapati + Bhaji', 'veg', 50.00, 50.00, 3),
('3 Chapati + Bhaji', 'veg', 65.00, 65.00, 4),
('1 Chapati + Bhaji', 'veg', 35.00, 35.00, 5),
('1 Chapati + Bhaji + Rice', 'veg', 60.00, 60.00, 6),
('Rice Aamti / Half Rice Aamti', 'veg', 40.00, 40.00, 7),
('Rice Aamti + Bhaji / Half Rice + Bhaji', 'veg', 50.00, 50.00, 8),
('Paneer Full Thali', 'veg', 80.00, 80.00, 9),
('Shev Bhaji Thali', 'veg', 80.00, 80.00, 10),
('Extra Chapati', 'extra', 12.00, 12.00, 11),
('Chicken Full Thali', 'non_veg', 150.00, 150.00, 12),
('Chicken Thali (1 Chapati)', 'non_veg', 140.00, 140.00, 13),
('Rice + Chicken', 'non_veg', 140.00, 140.00, 14),
('Full Bhurji Thali', 'egg', 80.00, 80.00, 15),
('Bhurji Thali (1 Chapati)', 'egg', 70.00, 70.00, 16),
('Full Egg Curry', 'egg', 80.00, 80.00, 17),
('Egg Curry (1 Egg)', 'egg', 70.00, 70.00, 18),
('Egg Bhurji + 2 Chapati', 'egg', 60.00, 60.00, 19),
('Egg Bhurji + 1 Chapati', 'egg', 45.00, 45.00, 20)
ON CONFLICT DO NOTHING;

-- Seed Initial Meal Plans
INSERT INTO meal_plans (name, includes_lunch, includes_dinner) VALUES
('Lunch + Dinner (Both)', TRUE, TRUE),
('Lunch Only', TRUE, FALSE),
('Dinner Only', FALSE, TRUE)
ON CONFLICT DO NOTHING;
