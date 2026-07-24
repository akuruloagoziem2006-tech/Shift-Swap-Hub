-- ============================================
-- FORCE SCHEMA REFRESH FOR SHIFT-SWAP-HUB
-- Run this in Supabase SQL Editor
-- ============================================

-- 0. FIX ANY INVALID STATUS VALUES FIRST (before adding constraint)
-- This prevents constraint violation errors from existing rows
UPDATE shifts SET status = 'open' WHERE status = 'available';
UPDATE shifts SET status = 'scheduled' WHERE status IS NULL;
UPDATE shifts SET status = 'scheduled' WHERE status NOT IN ('scheduled', 'open', 'filled', 'completed', 'cancelled');

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

-- 3. Fix shifts status constraint to allow 'open' status
ALTER TABLE shifts DROP CONSTRAINT IF EXISTS shifts_status_check;
ALTER TABLE shifts ADD CONSTRAINT shifts_status_check 
CHECK (status IN ('scheduled', 'open', 'filled', 'completed', 'cancelled'));

-- 4. Update trigger for new users to include department
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

-- 5. Ensure RLS policies exist
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

-- 8. Verify columns exist
SELECT 'profiles columns:' as info, string_agg(column_name, ', ') as columns
FROM information_schema.columns WHERE table_name = 'profiles';

SELECT 'shifts columns:' as info, string_agg(column_name, ', ') as columns
FROM information_schema.columns WHERE table_name = 'shifts';
