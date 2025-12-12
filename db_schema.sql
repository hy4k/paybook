-- Expenses Table
CREATE TABLE IF NOT EXISTS public.fets_expenses_data (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    location text,
    date date,
    color text,
    category text,
    name text,
    amount numeric,
    month text
);

-- Ensure category column exists (fixes potential missing column issue)
ALTER TABLE public.fets_expenses_data ADD COLUMN IF NOT EXISTS category text;

-- Staff Table
CREATE TABLE IF NOT EXISTS public.staff (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    name text NOT NULL,
    designation text,
    basic_salary numeric DEFAULT 0,
    phone text,
    email text,
    join_date date,
    status text DEFAULT 'active'
);

-- Attendance Table
CREATE TABLE IF NOT EXISTS public.attendance (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    staff_id uuid REFERENCES public.staff(id) ON DELETE CASCADE,
    date date NOT NULL,
    status text DEFAULT 'present',
    check_in time,
    check_out time,
    notes text
);

-- Payroll Table
CREATE TABLE IF NOT EXISTS public.payroll (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    staff_id uuid REFERENCES public.staff(id) ON DELETE CASCADE,
    month text NOT NULL,
    year int,
    total_days int,
    worked_days numeric,
    calculated_salary numeric,
    deductions numeric DEFAULT 0,
    bonus numeric DEFAULT 0,
    net_salary numeric,
    payment_status text DEFAULT 'pending',
    payment_date date
);

-- Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    name text NOT NULL,
    description text,
    price numeric DEFAULT 0,
    stock_quantity int DEFAULT 0,
    category text,
    sku text
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    title text NOT NULL,
    description text,
    status text DEFAULT 'todo',
    priority text DEFAULT 'medium',
    assigned_to uuid REFERENCES public.staff(id),
    due_date timestamp with time zone
);

-- Missions Table
CREATE TABLE IF NOT EXISTS public.missions (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    title text NOT NULL,
    description text,
    agent_id uuid REFERENCES public.staff(id),
    location text,
    status text DEFAULT 'pending',
    start_time timestamp with time zone,
    end_time timestamp with time zone,
    outcome text
);

-- Notes Table
CREATE TABLE IF NOT EXISTS public.notes (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    title text,
    content text NOT NULL,
    user_id uuid REFERENCES auth.users(id),
    is_pinned boolean DEFAULT false,
    color text
);

-- Shifts Table
CREATE TABLE IF NOT EXISTS public.shifts (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    name text NOT NULL,
    start_time time NOT NULL,
    end_time time NOT NULL,
    description text
);

-- Existing Tables (References)
-- public.expenses
-- public.categories
-- public.fets_cash_transactions
-- public.settleup_cycles
-- public.settleup_contributions
