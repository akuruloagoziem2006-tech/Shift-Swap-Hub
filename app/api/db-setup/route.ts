import { NextResponse } from 'next/server';

const SETUP_SQL = `
-- ============================================
-- SHIFT-SWAP-HUB DATABASE SETUP
-- Run this in Supabase SQL Editor
-- ============================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'employee' CHECK (role IN ('employee', 'manager', 'admin')),
  department TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create shifts table
CREATE TABLE IF NOT EXISTS shifts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  position TEXT NOT NULL,
  department TEXT NOT NULL,
  location TEXT,
  notes TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'open', 'filled', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create shift_swap_requests table
CREATE TABLE IF NOT EXISTS shift_swap_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shift_id UUID REFERENCES shifts(id) ON DELETE CASCADE NOT NULL,
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  target_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_swap_requests ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Shifts RLS Policies
DROP POLICY IF EXISTS "Users can view shifts" ON shifts;
CREATE POLICY "Users can view shifts" ON shifts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create shifts" ON shifts;
CREATE POLICY "Users can create shifts" ON shifts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own shifts" ON shifts;
CREATE POLICY "Users can update own shifts" ON shifts FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Managers can update any shifts" ON shifts;
CREATE POLICY "Managers can update any shifts" ON shifts FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('manager', 'admin'))
);

-- Swap Requests RLS Policies
DROP POLICY IF EXISTS "Users can view swap requests" ON shift_swap_requests;
CREATE POLICY "Users can view swap requests" ON shift_swap_requests FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create swap requests" ON shift_swap_requests;
CREATE POLICY "Users can create swap requests" ON shift_swap_requests FOR INSERT WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "Users can update own requests" ON shift_swap_requests;
CREATE POLICY "Users can update own requests" ON shift_swap_requests FOR UPDATE USING (auth.uid() = requester_id);

DROP POLICY IF EXISTS "Managers can update any requests" ON shift_swap_requests;
CREATE POLICY "Managers can update any requests" ON shift_swap_requests FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('manager', 'admin'))
);

-- Auto-create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, department)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'department'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON profiles TO anon;
GRANT ALL ON shifts TO anon;
GRANT ALL ON shift_swap_requests TO anon;

-- Refresh PostgREST schema cache (CRITICAL for schema changes to take effect)
NOTIFY pgrst, 'reload schema';
`;

export async function POST() {
  return NextResponse.json({
    success: true,
    message: 'Database setup instructions',
    sql: SETUP_SQL,
    instructions: [
      '1. Go to https://supabase.com/dashboard',
      '2. Select your project: qvizpavpwezozwupvxxt',
      '3. Click "SQL Editor" in the left sidebar',
      '4. Click "New Query"',
      '5. Paste the SQL above and click "Run"',
      '6. Tables and RLS policies will be created automatically',
      '7. The NOTIFY pgrst command at the end refreshes the schema cache'
    ]
  });
}

export async function GET() {
  return NextResponse.json({
    message: 'POST to this endpoint to get database setup SQL',
    endpoint: '/api/db-setup',
    method: 'POST'
  });
}
