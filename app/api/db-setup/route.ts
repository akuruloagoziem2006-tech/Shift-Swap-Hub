import { NextResponse } from 'next/server';
import { Client } from 'pg';

export async function POST() {
  const supabasePassword = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabasePassword) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 500 });
  }

  const client = new Client({
    host: 'qvizpavpwezozwupvxxt.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: supabasePassword,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    // Create profiles table
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

    // Create shifts table
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

    // Create shift_swap_requests table
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

    // Enable RLS
    await client.query('ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;');
    await client.query('ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;');
    await client.query('ALTER TABLE shift_swap_requests ENABLE ROW LEVEL SECURITY;');

    // Create RLS policies
    await client.query(`DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;`);
    await client.query(`CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);`);
    await client.query(`DROP POLICY IF EXISTS "Users can update own profile" ON profiles;`);
    await client.query(`CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);`);
    await client.query(`DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;`);
    await client.query(`CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);`);

    await client.query(`DROP POLICY IF EXISTS "Users can view shifts" ON shifts;`);
    await client.query(`CREATE POLICY "Users can view shifts" ON shifts FOR SELECT USING (true);`);
    await client.query(`DROP POLICY IF EXISTS "Users can create shifts" ON shifts;`);
    await client.query(`CREATE POLICY "Users can create shifts" ON shifts FOR INSERT WITH CHECK (auth.uid() = user_id);`);
    await client.query(`DROP POLICY IF EXISTS "Users can update own shifts" ON shifts;`);
    await client.query(`CREATE POLICY "Users can update own shifts" ON shifts FOR UPDATE USING (auth.uid() = user_id);`);
    await client.query(`DROP POLICY IF EXISTS "Managers can update any shifts" ON shifts;`);
    await client.query(`CREATE POLICY "Managers can update any shifts" ON shifts FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('manager', 'admin')));`);

    await client.query(`DROP POLICY IF EXISTS "Users can view swap requests" ON shift_swap_requests;`);
    await client.query(`CREATE POLICY "Users can view swap requests" ON shift_swap_requests FOR SELECT USING (true);`);
    await client.query(`DROP POLICY IF EXISTS "Users can create swap requests" ON shift_swap_requests;`);
    await client.query(`CREATE POLICY "Users can create swap requests" ON shift_swap_requests FOR INSERT WITH CHECK (auth.uid() = requester_id);`);
    await client.query(`DROP POLICY IF EXISTS "Users can update own requests" ON shift_swap_requests;`);
    await client.query(`CREATE POLICY "Users can update own requests" ON shift_swap_requests FOR UPDATE USING (auth.uid() = requester_id);`);
    await client.query(`DROP POLICY IF EXISTS "Managers can update any requests" ON shift_swap_requests;`);
    await client.query(`CREATE POLICY "Managers can update any requests" ON shift_swap_requests FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('manager', 'admin')));`);

    // Auto-create profile trigger
    await client.query(`
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      DROP FUNCTION IF EXISTS public.handle_new_user();
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS trigger AS $$
      BEGIN
        INSERT INTO public.profiles (id, email, full_name, avatar_url)
        VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', new.email), new.raw_user_meta_data->>'avatar_url');
        RETURN new;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
      CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    `);

    await client.end();

    return NextResponse.json({ success: true, message: 'Database setup complete!' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
