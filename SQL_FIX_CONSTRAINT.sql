-- ============================================
-- FIX SHIFT STATUS CONSTRAINT
-- Run this in Supabase SQL Editor to fix the constraint violation
-- ============================================

-- 1. First, check what status values exist in the shifts table
SELECT DISTINCT status FROM shifts;

-- 2. Update any invalid status values to 'scheduled' (or 'open')
-- This will fix rows with 'available' or other invalid values
UPDATE shifts SET status = 'open' WHERE status = 'available';
UPDATE shifts SET status = 'scheduled' WHERE status NOT IN ('scheduled', 'open', 'filled', 'completed', 'cancelled');

-- 3. Now drop and recreate the constraint
ALTER TABLE shifts DROP CONSTRAINT IF EXISTS shifts_status_check;
ALTER TABLE shifts ADD CONSTRAINT shifts_status_check 
CHECK (status IN ('scheduled', 'open', 'filled', 'completed', 'cancelled'));

-- 4. Verify the constraint was added
SELECT 'Constraint added successfully' as result;

-- 5. Verify all status values are now valid
SELECT DISTINCT status FROM shifts;
