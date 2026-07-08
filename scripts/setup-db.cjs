/**
 * Database Setup Script
 * 
 * Run this script to create all required tables in Supabase:
 * node scripts/setup-db.js
 * 
 * Or run the SQL manually in Supabase SQL Editor.
 */

const { Client } = require('pg');

const SUPABASE_HOST = 'qvizpavpwezozwupvxxt.supabase.co';
const SUPABASE_PORT = 5432;
const SUPABASE_DB = 'postgres';
const SUPABASE_USER = 'postgres';
const SUPABASE_PASSWORD = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aXpwYXZwd2V6b3p3dXB2eHh0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM3NzAzMywiZXhwIjoyMDk0OTUzMDMzfQ.KD1wmD3xWmulpdzPTS0_yLvn6Kr27DeGbTl-SzCgWww';

async function setupDatabase() {
  console.log('🔧 Setting up ShiftSwap database...\n');

  const client = new Client({
    host: SUPABASE_HOST,
    port: SUPABASE_PORT,
    database: SUPABASE_DB,
    user: SUPABASE_USER,
    password: SUPABASE_PASSWORD,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to Supabase PostgreSQL\n');

    // Create profiles table
    console.log('📋 Creating profiles table...');
    await client.query(`
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
    `);
    console.log('✅ profiles table created\n');

    // Create shifts table
    console.log('📋 Creating shifts table...');
    await client.query(`
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
    `);
    console.log('✅ shifts table created\n');

    // Create shift_swap_requests table
    console.log('📋 Creating shift_swap_requests table...');
    await client.query(`
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
    `);
    console.log('✅ shift_swap_requests table created\n');

    // Enable RLS
    console.log('🔒 Enabling Row Level Security...');
    await client.query('ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;');
    await client.query('ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;');
    await client.query('ALTER TABLE shift_swap_requests ENABLE ROW LEVEL SECURITY;');
    console.log('✅ RLS enabled\n');

    // Create RLS policies
    console.log('📋 Creating RLS policies...');
    
    // Profiles policies
    await client.query(`DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;`);
    await client.query(`CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);`);
    
    await client.query(`DROP POLICY IF EXISTS "Users can update own profile" ON profiles;`);
    await client.query(`CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);`);
    
    await client.query(`DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;`);
    await client.query(`CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);`);
    console.log('✅ Profiles policies created\n');

    // Shifts policies
    await client.query(`DROP POLICY IF EXISTS "Users can view shifts" ON shifts;`);
    await client.query(`CREATE POLICY "Users can view shifts" ON shifts FOR SELECT USING (true);`);
    
    await client.query(`DROP POLICY IF EXISTS "Users can create shifts" ON shifts;`);
    await client.query(`CREATE POLICY "Users can create shifts" ON shifts FOR INSERT WITH CHECK (auth.uid() = user_id);`);
    
    await client.query(`DROP POLICY IF EXISTS "Users can update own shifts" ON shifts;`);
    await client.query(`CREATE POLICY "Users can update own shifts" ON shifts FOR UPDATE USING (auth.uid() = user_id);`);
    
    await client.query(`DROP POLICY IF EXISTS "Managers can update any shifts" ON shifts;`);
    await client.query(`CREATE POLICY "Managers can update any shifts" ON shifts FOR UPDATE USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('manager', 'admin'))
    );`);
    console.log('✅ Shifts policies created\n');

    // Swap requests policies
    await client.query(`DROP POLICY IF EXISTS "Users can view swap requests" ON shift_swap_requests;`);
    await client.query(`CREATE POLICY "Users can view swap requests" ON shift_swap_requests FOR SELECT USING (true);`);
    
    await client.query(`DROP POLICY IF EXISTS "Users can create swap requests" ON shift_swap_requests;`);
    await client.query(`CREATE POLICY "Users can create swap requests" ON shift_swap_requests FOR INSERT WITH CHECK (auth.uid() = requester_id);`);
    
    await client.query(`DROP POLICY IF EXISTS "Users can update own requests" ON shift_swap_requests;`);
    await client.query(`CREATE POLICY "Users can update own requests" ON shift_swap_requests FOR UPDATE USING (auth.uid() = requester_id);`);
    
    await client.query(`DROP POLICY IF EXISTS "Managers can update any requests" ON shift_swap_requests;`);
    await client.query(`CREATE POLICY "Managers can update any requests" ON shift_swap_requests FOR UPDATE USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('manager', 'admin'))
    );`);
    console.log('✅ Swap requests policies created\n');

    // Create trigger for auto-creating profiles
    console.log('📋 Creating profile auto-create trigger...');
    await client.query(`
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      DROP FUNCTION IF EXISTS public.handle_new_user();
      
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS trigger AS $$
      BEGIN
        INSERT INTO public.profiles (id, email, full_name, avatar_url)
        VALUES (
          new.id,
          new.email,
          COALESCE(new.raw_user_meta_data->>'full_name', new.email),
          new.raw_user_meta_data->>'avatar_url'
        );
        RETURN new;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
      
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    `);
    console.log('✅ Auto-create profile trigger created\n');

    console.log('🎉 Database setup complete!\n');
    console.log('Tables created:');
    console.log('  - profiles');
    console.log('  - shifts');
    console.log('  - shift_swap_requests');
    console.log('\nYou can now use the app at http://localhost:3000');

  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupDatabase();
