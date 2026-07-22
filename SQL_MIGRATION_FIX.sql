-- ============================================
-- SHIFT-SWAP-HUB DATABASE FIX MIGRATION
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- https://supabase.com/dashboard/project/qvizpavpwezozwupvxxt/sql/new
-- ============================================

-- ============================================
-- PART 1: Add missing columns to profiles table
-- ============================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ============================================
-- PART 2: Add missing columns to shifts table
-- ============================================
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS date DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS position TEXT NOT NULL DEFAULT 'General';
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS department TEXT NOT NULL DEFAULT 'General';
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ============================================
-- PART 3: Update trigger function to include department
-- ============================================
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

-- ============================================
-- PART 4: Grant necessary permissions
-- ============================================
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON profiles TO anon;
GRANT ALL ON shifts TO anon;
GRANT ALL ON shift_swap_requests TO anon;

-- ============================================
-- PART 5: Refresh PostgREST schema cache
-- This is crucial - it tells PostgREST to reload the schema
-- ============================================
NOTIFY pgrst, 'reload schema';

-- ============================================
-- PART 6: Verify columns exist (for debugging)
-- ============================================
DO $$
BEGIN
  -- Check profiles columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'department'
  ) THEN
    RAISE NOTICE 'WARNING: department column not found in profiles';
  ELSE
    RAISE NOTICE 'OK: department column exists in profiles';
  END IF;

  -- Check shifts columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'shifts' AND column_name = 'date'
  ) THEN
    RAISE NOTICE 'WARNING: date column not found in shifts';
  ELSE
    RAISE NOTICE 'OK: date column exists in shifts';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'shifts' AND column_name = 'position'
  ) THEN
    RAISE NOTICE 'WARNING: position column not found in shifts';
  ELSE
    RAISE NOTICE 'OK: position column exists in shifts';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'shifts' AND column_name = 'department'
  ) THEN
    RAISE NOTICE 'WARNING: department column not found in shifts';
  ELSE
    RAISE NOTICE 'OK: department column exists in shifts';
  END IF;
END $$;

-- ============================================
-- PART 7: Verify RLS policies exist
-- ============================================
DO $$
BEGIN
  -- Check shifts insert policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'shifts' AND policyname = 'Users can create shifts'
  ) THEN
    RAISE NOTICE 'WARNING: Shifts insert policy not found';
  ELSE
    RAISE NOTICE 'OK: Shifts insert policy exists';
  END IF;
END $$;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- If you see this message, the migration ran successfully.
-- If you see warnings above, check the SQL and run again.
