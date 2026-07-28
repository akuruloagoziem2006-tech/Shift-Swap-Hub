import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

async function setupDemoAccount() {
  // Create Supabase client with service role key for admin operations
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
  
  try {
    // Sign in with demo credentials first to get the user ID
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'demo@shiftswap.app',
      password: 'demo1234',
    });

    if (authError) {
      return { 
        error: 'Demo user not found. Please create the demo user in Supabase Auth first.', 
        status: 404 
      };
    }

    const userId = authData.user.id;

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    // Create profile if it doesn't exist
    if (!existingProfile) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: 'demo@shiftswap.app',
          full_name: 'Demo User',
          role: 'employee',
          department: 'Demo Department',
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        return { 
          error: 'Failed to create profile', 
          details: profileError,
          status: 500
        };
      }
    }

    // Check existing shifts
    const { data: existingShifts } = await supabase
      .from('shifts')
      .select('id')
      .eq('user_id', userId);

    // Only add shifts if none exist
    if (!existingShifts || existingShifts.length === 0) {
      const { error: shiftsError } = await supabase
        .from('shifts')
        .insert([
          {
            user_id: userId,
            date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            start_time: '09:00',
            end_time: '17:00',
            position: 'Cashier',
            department: 'Retail',
            location: 'Downtown Store',
            status: 'open',
          },
          {
            user_id: userId,
            date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            start_time: '14:00',
            end_time: '22:00',
            position: 'Cashier',
            department: 'Retail',
            location: 'Mall Location',
            status: 'scheduled',
          },
          {
            user_id: userId,
            date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            start_time: '09:00',
            end_time: '17:00',
            position: 'Stocker',
            department: 'Inventory',
            location: 'Warehouse',
            status: 'open',
          },
        ]);

      if (shiftsError) {
        console.error('Shifts creation error:', shiftsError);
        return { 
          error: 'Failed to create shifts', 
          details: shiftsError,
          status: 500
        };
      }
    }

    return {
      success: true,
      message: 'Demo account setup complete',
      userId,
    };

  } catch (error: any) {
    console.error('Setup error:', error);
    return { 
      error: 'Setup failed', 
      details: error.message,
      status: 500
    };
  }
}

// Support both GET and POST
export async function GET() {
  const result = await setupDemoAccount();
  const status = result.status || 200;
  return NextResponse.json(result, { status });
}

export async function POST() {
  const result = await setupDemoAccount();
  const status = result.status || 200;
  return NextResponse.json(result, { status });
}
