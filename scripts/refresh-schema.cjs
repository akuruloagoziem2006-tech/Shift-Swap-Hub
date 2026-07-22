/**
 * Schema Refresh Script
 * 
 * This script:
 * 1. Ensures all columns exist in profiles and shifts tables
 * 2. Refreshes the PostgREST schema cache
 * 3. Grants necessary permissions
 * 
 * Run: node scripts/refresh-schema.cjs
 */

const { Client } = require('pg');

const SUPABASE_HOST = 'qvizpavpwezozwupvxxt.supabase.co';
const SUPABASE_PORT = 5432;
const SUPABASE_DB = 'postgres';
const SUPABASE_USER = 'postgres';
const SUPABASE_PASSWORD = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aXpwYXZwd2V6b3p3dXB2eHh0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM3NzAzMywiZXhwIjoyMDk0OTUzMDMzfQ.KD1wmD3xWmulpdzPTS0_yLvn6Kr27DeGbTl-SzCgWww';

async function refreshSchema() {
  console.log('🔄 Refreshing ShiftSwap schema...\n');

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

    // 1. Add missing columns to profiles table
    console.log('📋 Ensuring profiles columns exist...');
    
    const profilesColumns = [
      { name: 'email', type: 'TEXT' },
      { name: 'avatar_url', type: 'TEXT' },
      { name: 'department', type: 'TEXT' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', default: 'NOW()' }
    ];

    for (const col of profilesColumns) {
      const checkQuery = `
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = '${col.name}'
      `;
      const result = await client.query(checkQuery);
      
      if (result.rows.length === 0) {
        const alterQuery = col.default 
          ? `ALTER TABLE profiles ADD COLUMN ${col.name} ${col.type} DEFAULT ${col.default};`
          : `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ${col.name} ${col.type};`;
        await client.query(alterQuery);
        console.log(`  ✅ Added column: ${col.name}`);
      } else {
        console.log(`  ✓ Column exists: ${col.name}`);
      }
    }

    // 2. Add missing columns to shifts table
    console.log('\n📋 Ensuring shifts columns exist...');
    
    const shiftsColumns = [
      { name: 'date', type: 'DATE NOT NULL', default: 'CURRENT_DATE' },
      { name: 'position', type: 'TEXT NOT NULL', default: "'General'" },
      { name: 'department', type: 'TEXT NOT NULL', default: "'General'" },
      { name: 'location', type: 'TEXT' },
      { name: 'notes', type: 'TEXT' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', default: 'NOW()' }
    ];

    for (const col of shiftsColumns) {
      const checkQuery = `
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'shifts' AND column_name = '${col.name}'
      `;
      const result = await client.query(checkQuery);
      
      if (result.rows.length === 0) {
        let alterQuery;
        if (col.name === 'date' || col.name === 'position' || col.name === 'department') {
          alterQuery = `ALTER TABLE shifts ADD COLUMN IF NOT EXISTS ${col.name} ${col.type} DEFAULT ${col.default};`;
        } else {
          alterQuery = `ALTER TABLE shifts ADD COLUMN IF NOT EXISTS ${col.name} ${col.type};`;
        }
        await client.query(alterQuery);
        console.log(`  ✅ Added column: ${col.name}`);
      } else {
        console.log(`  ✓ Column exists: ${col.name}`);
      }
    }

    // 3. Ensure status constraint allows 'open' value
    console.log('\n📋 Checking shifts status constraint...');
    await client.query(`
      ALTER TABLE shifts DROP CONSTRAINT IF EXISTS shifts_status_check;
      ALTER TABLE shifts ADD CONSTRAINT shifts_status_check 
      CHECK (status IN ('scheduled', 'open', 'filled', 'completed', 'cancelled'));
    `);
    console.log('  ✅ Status constraint updated\n');

    // 4. Update trigger function to include department
    console.log('📋 Updating profile auto-create trigger...');
    await client.query(`
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
    `);
    console.log('  ✅ Trigger updated with department field\n');

    // 5. Ensure RLS policies exist
    console.log('📋 Ensuring RLS policies exist...');
    
    const policies = [
      {
        table: 'shifts',
        name: 'Users can create shifts',
        type: 'INSERT',
        using: null,
        check: 'auth.uid() = user_id'
      },
      {
        table: 'shifts',
        name: 'Users can view shifts',
        type: 'SELECT',
        using: 'true',
        check: null
      },
      {
        table: 'profiles',
        name: 'Users can view all profiles',
        type: 'SELECT',
        using: 'true',
        check: null
      },
      {
        table: 'profiles',
        name: 'Users can update own profile',
        type: 'UPDATE',
        using: 'auth.uid() = id',
        check: null
      },
      {
        table: 'profiles',
        name: 'Users can insert own profile',
        type: 'INSERT',
        using: null,
        check: 'auth.uid() = id'
      }
    ];

    for (const policy of policies) {
      await client.query(`DROP POLICY IF EXISTS "${policy.name}" ON ${policy.table};`);
      let createQuery;
      if (policy.type === 'INSERT') {
        createQuery = `CREATE POLICY "${policy.name}" ON ${policy.table} FOR ${policy.type} WITH CHECK (${policy.check});`;
      } else {
        createQuery = `CREATE POLICY "${policy.name}" ON ${policy.table} FOR ${policy.type} USING (${policy.using});`;
      }
      await client.query(createQuery);
      console.log(`  ✅ Policy: ${policy.name}`);
    }

    // 6. Grant permissions
    console.log('\n📋 Granting permissions...');
    await client.query('GRANT USAGE ON SCHEMA public TO anon;');
    await client.query('GRANT ALL ON profiles TO anon;');
    await client.query('GRANT ALL ON shifts TO anon;');
    await client.query('GRANT ALL ON shift_swap_requests TO anon;');
    console.log('  ✅ Permissions granted\n');

    // 7. Refresh PostgREST schema cache (CRITICAL!)
    console.log('🔄 Refreshing PostgREST schema cache...');
    await client.query("NOTIFY pgrst, 'reload schema';");
    console.log('  ✅ PostgREST schema cache refreshed\n');

    // 8. Verify columns
    console.log('📋 Verifying schema...');
    
    const verifyProfiles = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'profiles' AND column_name IN ('email', 'department', 'updated_at')
    `);
    console.log(`  profiles columns: ${verifyProfiles.rows.map(r => r.column_name).join(', ')}`);
    
    const verifyShifts = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'shifts' AND column_name IN ('date', 'position', 'department', 'location', 'notes')
    `);
    console.log(`  shifts columns: ${verifyShifts.rows.map(r => r.column_name).join(', ')}\n`);

    console.log('🎉 Schema refresh complete!\n');
    console.log('The Post a Shift form and Profile page should now work correctly.');

  } catch (error) {
    console.error('❌ Error refreshing schema:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await client.end();
  }
}

refreshSchema();
