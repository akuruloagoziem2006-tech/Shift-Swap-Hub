-- ============================================
-- SIMPLE SCHEMA FIX FOR SHIFT-SWAP-HUB
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. First, fix any invalid status values
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

-- 4. Add missing columns to shifts
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS date DATE;
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS position TEXT;
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

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

-- 7. RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_swap_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all reads on profiles" ON profiles;
CREATE POLICY "Allow all reads on profiles" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow own profile inserts" ON profiles;
CREATE POLICY "Allow own profile inserts" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Allow own profile updates" ON profiles;
CREATE POLICY "Allow own profile updates" ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Allow all reads on shifts" ON shifts;
CREATE POLICY "Allow all reads on shifts" ON shifts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow own shift inserts" ON shifts;
CREATE POLICY "Allow own shift inserts" ON shifts FOR INSERT WITH CHECK (auth.uid() = user_id);

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
SELECT 'profiles columns:' as info, string_agg(column_name, ', ') as cols
FROM information_schema.columns WHERE table_name = 'profiles' AND column_name NOT LIKE '%.%';

SELECT 'shifts columns:' as info, string_agg(column_name, ', ') as cols
FROM information_schema.columns WHERE table_name = 'shifts' AND column_name NOT LIKE '%m%';
-- Deployment trigger: Fri Jul 24 13:34:54 UTC 2026
