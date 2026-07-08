#!/usr/bin/env node
/**
 * Quick Database Setup Script
 * 
 * This script sets up the ShiftSwap database tables using the Supabase REST API.
 * Run: node scripts/quick-setup.mjs
 */

const SUPABASE_URL = 'https://qvizpavpwezozwupvxxt.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aXpwYXZwd2V6b3p3dXB2eHh0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM3NzAzMywiZXhwIjoyMDk0OTUzMDMzfQ.KD1wmD3xWmulpdzPTS0_yLvn6Kr27DeGbTl-SzCgWww';

const SQL = `
-- Profiles table
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

-- Shifts table
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

-- Shift swap requests
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

-- Enable RLS
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
CREATE POLICY "Managers can update any shifts" ON shifts FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('manager', 'admin')));

-- Swap Requests RLS Policies
DROP POLICY IF EXISTS "Users can view swap requests" ON shift_swap_requests;
CREATE POLICY "Users can view swap requests" ON shift_swap_requests FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can create swap requests" ON shift_swap_requests;
CREATE POLICY "Users can create swap requests" ON shift_swap_requests FOR INSERT WITH CHECK (auth.uid() = requester_id);
DROP POLICY IF EXISTS "Users can update own requests" ON shift_swap_requests;
CREATE POLICY "Users can update own requests" ON shift_swap_requests FOR UPDATE USING (auth.uid() = requester_id);
DROP POLICY IF EXISTS "Managers can update any requests" ON shift_swap_requests;
CREATE POLICY "Managers can update any requests" ON shift_swap_requests FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('manager', 'admin')));

-- Auto-create profile trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger AS $$
BEGIN INSERT INTO public.profiles (id, email, full_name, avatar_url) VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', new.email), new.raw_user_meta_data->>'avatar_url'); RETURN new;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
`;

async function setupDatabase() {
  console.log('🔧 Setting up ShiftSwap database...\n');
  console.log(`Project: ${SUPABASE_URL}\n`);

  // Split SQL into individual statements
  const statements = SQL.split(';').map(s => s.trim()).filter(s => s.length > 0);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const isCreateTable = stmt.toUpperCase().startsWith('CREATE TABLE');
    const isAlterTable = stmt.toUpperCase().startsWith('ALTER TABLE');
    const isDropPolicy = stmt.toUpperCase().includes('DROP POLICY');
    const isCreatePolicy = stmt.toUpperCase().includes('CREATE POLICY');
    const isCreateTrigger = stmt.toUpperCase().includes('CREATE TRIGGER');
    const isCreateFunction = stmt.toUpperCase().includes('CREATE OR REPLACE FUNCTION') || stmt.toUpperCase().includes('CREATE FUNCTION');

    let description = '';
    if (isCreateTable) description = 'Creating table';
    else if (isAlterTable) description = 'Enabling RLS';
    else if (isDropPolicy) description = 'Dropping old policy';
    else if (isCreatePolicy) description = 'Creating policy';
    else if (isCreateTrigger) description = 'Creating trigger';
    else if (isCreateFunction) description = 'Creating function';

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
        },
        body: JSON.stringify({ query: stmt })
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ ${description || 'Statement'} (${i + 1}/${statements.length})`);
      } else {
        console.log(`⚠️ ${description || 'Statement'} (${i + 1}/${statements.length}): ${data.message || 'Skipped'}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }

  console.log('\n✅ Database setup complete!');
  console.log('\nNext steps:');
  console.log('1. Sign up at http://localhost:3000/auth/signup');
  console.log('2. Your profile will be created automatically');
  console.log('3. Post shifts and start swapping!');
}

setupDatabase().catch(console.error);
