import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { Shift } from '@/lib/types'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const department = searchParams.get('department')
  const date = searchParams.get('date')

  const supabase = await createClient()

  let query = supabase
    .from('shifts')
    .select(`
      *,
      user:profiles(*)
    `)
    .order('date', { ascending: true })

  if (status) {
    query = query.eq('status', status)
  }

  if (department) {
    query = query.eq('department', department)
  }

  if (date) {
    query = query.eq('date', date)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  const { data, error } = await supabase
    .from('shifts')
    .insert({
      ...body,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
