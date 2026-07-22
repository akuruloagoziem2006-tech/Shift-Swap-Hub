#!/usr/bin/env python3
"""Schema refresh script using Python"""
import psycopg2
import sys

SQL = """
-- 1. Add missing columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Add missing columns to shifts  
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS date DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS position TEXT NOT NULL DEFAULT 'General';
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS department TEXT NOT NULL DEFAULT 'General';
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Fix shifts status constraint
ALTER TABLE shifts DROP CONSTRAINT IF EXISTS shifts_status_check;
ALTER TABLE shifts ADD CONSTRAINT shifts_status_check 
CHECK (status IN ('scheduled', 'open', 'filled', 'completed', 'cancelled'));

-- 4. Update trigger for new users
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

-- 5. Ensure RLS policies
DROP POLICY IF EXISTS "Users can view shifts" ON shifts;
CREATE POLICY "Users can view shifts" ON shifts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create shifts" ON shifts;
CREATE POLICY "Users can create shifts" ON shifts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own shifts" ON shifts;
CREATE POLICY "Users can update own shifts" ON shifts FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 6. Grant permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON profiles TO anon;
GRANT ALL ON shifts TO anon;
GRANT ALL ON shift_swap_requests TO anon;

-- 7. CRITICAL: Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
"""

def main():
    print("Connecting to Supabase...")
    
    try:
        conn = psycopg2.connect(
            host="qvizpavpwezozwupvxxt.supabase.co",
            port=5432,
            dbname="postgres",
            user="postgres",
            password="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aXpwYXZwd2V6b3p3dXB2eHh0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM3NzAzMywiZXhwIjoyMDk0OTUzMDMzfQ.KD1wmD3xWmulpdzPTS0_yLvn6Kr27DeGbTl-SzCgWww",
            sslmode="require",
            connect_timeout=30
        )
        print("Connected!")
        
        cur = conn.cursor()
        
        # Execute the SQL
        print("\nRunning schema changes...")
        cur.execute(SQL)
        conn.commit()
        print("Schema changes applied!")
        
        # Verify profiles columns
        cur.execute("""
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'profiles' AND column_name IN ('email', 'department', 'updated_at')
        """)
        profiles_cols = [row[0] for row in cur.fetchall()]
        print(f"\nprofiles columns: {', '.join(profiles_cols)}")
        
        # Verify shifts columns
        cur.execute("""
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'shifts' AND column_name IN ('date', 'position', 'department', 'location', 'notes')
        """)
        shifts_cols = [row[0] for row in cur.fetchall()]
        print(f"shifts columns: {', '.join(shifts_cols)}")
        
        print("\nSchema refresh complete!")
        
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
