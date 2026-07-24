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

-- 3. Add missing columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 4. Fix shifts columns - ensure proper types
ALTER TABLE shifts DROP COLUMN IF EXISTS start_time;
ALTER TABLE shifts DROP COLUMN IF EXISTS end_time;
ALTER TABLE shifts DROP COLUMN IF EXISTS date;
ALTER TABLE shifts DROP COLUMN IF EXISTS position;
ALTER TABLE shifts DROP COLUMN IF EXISTS department;
ALTER TABLE shifts DROP COLUMN IF EXISTS location;
ALTER TABLE shifts DROP COLUMN IF EXISTS notes;
ALTER TABLE shifts DROP COLUMN IF EXISTS updated_at;

ALTER TABLE shifts ADD COLUMN start_time TIME NOT NULL DEFAULT '09:00:00';
ALTER TABLE shifts ADD COLUMN end_time TIME NOT NULL DEFAULT '17:00:00';
ALTER TABLE shifts ADD COLUMN date DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE shifts ADD COLUMN position TEXT NOT NULL DEFAULT 'Employee';
ALTER TABLE shifts ADD COLUMN department TEXT NOT NULL DEFAULT 'General';
ALTER TABLE shifts ADD COLUMN location TEXT;
ALTER TABLE shifts ADD COLUMN notes TEXT;
ALTER TABLE shifts ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();

-- 5. Ensure default values
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'employee';
ALTER TABLE shifts ALTER COLUMN status SET DEFAULT 'scheduled';

-- 6. Update trigger for new users
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

-- 7. RLS policies - FIXED FOR BROWSER AND CALENDAR
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_swap_requests ENABLE ROW LEVEL SECURITY;

-- Profiles - allow all reads (needed for user display in shifts)
DROP POLICY IF EXISTS "Allow all reads on profiles" ON profiles;
CREATE POLICY "Allow all reads on profiles" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow own profile inserts" ON profiles;
CREATE POLICY "Allow own profile inserts" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Allow own profile updates" ON profiles;
CREATE POLICY "Allow own profile updates" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Shifts - allow all reads (needed for browse and calendar)
DROP POLICY IF EXISTS "Allow all reads on shifts" ON shifts;
CREATE POLICY "Allow all reads on shifts" ON shifts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow all inserts on shifts" ON shifts;
CREATE POLICY "Allow all inserts on shifts" ON shifts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow own shift updates" ON shifts;
CREATE POLICY "Allow own shift updates" ON shifts FOR UPDATE USING (auth.uid() = user_id);

-- 8. Grant permissions
GRANT USAGE ON SCHEMA public TO anon, service_role;
GRANT ALL ON profiles TO anon, service_role;
GRANT ALL ON shifts TO anon, service_role;
GRANT ALL ON shift_swap_requests TO anon, service_role;

-- 9. Refresh PostgREST cache
NOTIFY pgrst, 'reload schema';

-- 10. Verify
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'shifts' 
ORDER BY ordinal_position;
-- Deployment trigger
