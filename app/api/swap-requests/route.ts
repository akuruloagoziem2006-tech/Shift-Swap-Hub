import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const userId = searchParams.get('userId')

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let query = supabase
    .from('shift_swap_requests')
    .select(`
      *,
      shift:shifts(*),
      requester:profiles!shift_swap_requests_requester_id_fkey(*),
      target_user:profiles!shift_swap_requests_target_user_id_fkey(*)
    `)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  // Get requests where user is requester OR target
  if (userId) {
    query = query.or(`requester_id.eq.${userId},target_user_id.eq.${userId}`)
  } else {
    query = query.eq('requester_id', user.id)
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

  // Check if shift exists and is available
  const { data: shift, error: shiftError } = await supabase
    .from('shifts')
    .select('*')
    .eq('id', body.shift_id)
    .single()

  if (shiftError || !shift) {
    return NextResponse.json({ error: 'Shift not found' }, { status: 404 })
  }

  if (shift.status !== 'open') {
    return NextResponse.json({ error: 'Shift is not available for swap' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('shift_swap_requests')
    .insert({
      shift_id: body.shift_id,
      requester_id: user.id,
      target_user_id: body.target_user_id || null,
      message: body.message || null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { id, status, target_user_id } = body

  // Verify the request exists and user has permission
  const { data: existingRequest, error: fetchError } = await supabase
    .from('shift_swap_requests')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !existingRequest) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 })
  }

  // Check permissions: requester can cancel, shift owner or target can approve/reject
  const isRequester = existingRequest.requester_id === user.id
  const isTarget = existingRequest.target_user_id === user.id

  if (!isRequester && !isTarget) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
  }

  if (status === 'cancelled' && !isRequester) {
    return NextResponse.json({ error: 'Only requester can cancel' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('shift_swap_requests')
    .update({ status, target_user_id: target_user_id || existingRequest.target_user_id })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // If approved, update the shift status
  if (status === 'approved') {
    await supabase
      .from('shifts')
      .update({ 
        user_id: existingRequest.requester_id,
        status: 'filled'
      })
      .eq('id', existingRequest.shift_id)
  }

  return NextResponse.json(data)
}
