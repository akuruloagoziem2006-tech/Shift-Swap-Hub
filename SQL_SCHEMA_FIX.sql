-- ============================================
-- SCHEMA FIX FOR SHIFT-SWAP-HUB
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Fix any invalid status values
UPDATE shifts SET status = 'open' WHERE status = 'available' OR status IS NULL;
UPDATE shifts SET status = 'scheduled' WHERE status NOT IN ('scheduled', 'open', 'filled', 'completed', 'cancelled');

-- 2. Drop the old constraint and create a new one
ALTER TABLE shifts DROP CONSTRAINT IF EXISTS shifts_status_check;
ALTER TABLE shifts ADD CONSTRAINT shifts_status_check 
CHECK (status IN ('scheduled', 'open', 'filled', 'completed', 'cancelled'));

-- 3. Add missing columns to profiles (safe - only adds if missing)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 4. Fix shifts columns - ALTER only if needed (safer approach)
-- Check if start_time column exists and fix type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'shifts' AND column_name = 'start_time'
  ) THEN
    ALTER TABLE shifts ADD COLUMN start_time TIME DEFAULT '09:00:00';
  END IF;
END $$;

-- Check if end_time column exists and fix type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'shifts' AND column_name = 'end_time'
  ) THEN
    ALTER TABLE shifts ADD COLUMN end_time TIME DEFAULT '17:00:00';
  END IF;
END $$;

-- Check if date column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'shifts' AND column_name = 'date'
  ) THEN
    ALTER TABLE shifts ADD COLUMN date DATE DEFAULT CURRENT_DATE;
  END IF;
END $$;

-- Check if position column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'shifts' AND column_name = 'position'
  ) THEN
    ALTER TABLE shifts ADD COLUMN position TEXT DEFAULT 'Employee';
  END IF;
END $$;

-- Check if shifts department column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'shifts' AND column_name = 'department'
  ) THEN
    ALTER TABLE shifts ADD COLUMN department TEXT DEFAULT 'General';
  END IF;
END $$;

-- Add optional columns
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 5. Add FOREIGN KEY between shifts.user_id and profiles.id
ALTER TABLE shifts DROP CONSTRAINT IF EXISTS shifts_user_id_fkey;
ALTER TABLE shifts ADD CONSTRAINT shifts_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- 6. Ensure default values
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'employee';
ALTER TABLE shifts ALTER COLUMN status SET DEFAULT 'open';

-- 7. Update trigger for new users
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

-- 8. RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_swap_requests ENABLE ROW LEVEL SECURITY;

-- Profiles - allow all reads
DROP POLICY IF EXISTS "Allow all reads on profiles" ON profiles;
CREATE POLICY "Allow all reads on profiles" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow own profile inserts" ON profiles;
CREATE POLICY "Allow own profile inserts" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Allow own profile updates" ON profiles;
CREATE POLICY "Allow own profile updates" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Shifts - allow all reads
DROP POLICY IF EXISTS "Allow all reads on shifts" ON shifts;
CREATE POLICY "Allow all reads on shifts" ON shifts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow own shift inserts" ON shifts;
CREATE POLICY "Allow own shift inserts" ON shifts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow own shift updates" ON shifts;
CREATE POLICY "Allow own shift updates" ON shifts FOR UPDATE USING (auth.uid() = user_id);

-- 9. Grant permissions
GRANT USAGE ON SCHEMA public TO anon, service_role;
GRANT ALL ON profiles TO anon, service_role;
GRANT ALL ON shifts TO anon, service_role;
GRANT ALL ON shift_swap_requests TO anon, service_role;

-- 10. Refresh PostgREST cache - IMPORTANT for relationship discovery
NOTIFY pgrst, 'reload schema';

-- 11. Verify columns and constraints
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'shifts' 
ORDER BY ordinal_position;

SELECT conname, conrelid::regclass AS table_name, confrelid::regclass AS foreign_table
FROM pg_constraint 
WHERE contype = 'f' AND conrelid = 'shifts'::regclass;
-- Trigger deployment
