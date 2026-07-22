-- ============================================
-- SHIFT-SWAP-HUB DATABASE MIGRATION
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- https://supabase.com/dashboard/project/qvizpavpwezozwupvxxt/sql/new
-- ============================================

-- Add missing columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add missing columns to shifts table
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS date DATE;
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS position TEXT;
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Update trigger function to include department
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

-- After running this, refresh the PostgREST cache by going to:
-- Database -> Replication -> Publication (disable and re-enable)
-- Or run: NOTIFY pgrst, 'reload schema';
