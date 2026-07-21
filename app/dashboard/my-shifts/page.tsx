'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar, Clock, MapPin, PlusCircle } from 'lucide-react'
import type { Shift, ShiftSwapRequest } from '@/lib/types'
import { formatDate, formatTime } from '@/lib/utils'

export default function MyShifts() {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [requests, setRequests] = useState<ShiftSwapRequest[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setLoading(false)
          return
        }

        // Get user's shifts
        const { data: myShifts } = await supabase
          .from('shifts')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: true })

        setShifts(myShifts || [])

        // Get swap requests where user is the requester
        const { data: myRequests } = await supabase
          .from('shift_swap_requests')
          .select('*, shift:shifts(*)')
          .eq('requester_id', user.id)
          .order('created_at', { ascending: false })

        setRequests(myRequests || [])
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleCancelRequest = async (requestId: string) => {
    try {
      await supabase
        .from('shift_swap_requests')
        .update({ status: 'cancelled' })
        .eq('id', requestId)

      setRequests(requests => requests.filter(r => r.id !== requestId))
    } catch (error) {
      console.error('Error cancelling request:', error)
    }
  }

  const handleMakeOpen = async (shiftId: string) => {
    try {
      await supabase
        .from('shifts')
        .update({ status: 'open' })
        .eq('id', shiftId)

      setShifts(shifts => shifts.map(s => 
        s.id === shiftId ? { ...s, status: 'open' as const } : s
      ))
    } catch (error) {
      console.error('Error updating shift:', error)
    }
  }

  const getStatusBadge = (status: Shift['status']) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="secondary">Scheduled</Badge>
      case 'open':
        return <Badge className="bg-teal-500/10 text-teal-500 border-teal-500/20">Open for Swap</Badge>
      case 'filled':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Filled</Badge>
      case 'completed':
        return <Badge variant="outline">Completed</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getRequestStatusBadge = (status: ShiftSwapRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
      case 'approved':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      case 'cancelled':
        return <Badge variant="outline">Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Shifts</h1>
        <Button asChild className="bg-teal-600 hover:bg-teal-700">
          <Link href="/dashboard/post">
            <PlusCircle className="mr-2 h-4 w-4" />
            Post New Shift
          </Link>
        </Button>
      </div>

      {/* My Shifts */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Your Shifts</h2>
        {shifts.length > 0 ? (
          <div className="space-y-4">
            {shifts.map((shift) => (
              <Card key={shift.id} className="bg-zinc-950 border-zinc-800">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{shift.position}</CardTitle>
                      <p className="text-sm text-muted-foreground">{shift.department}</p>
                    </div>
                    {getStatusBadge(shift.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-teal-500" />
                      <span>{formatDate(shift.date, 'EEEE, MMM d')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-teal-500" />
                      <span>{formatTime(shift.start_time)} - {formatTime(shift.end_time)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-teal-500" />
                      <span>{shift.location || 'No location'}</span>
                    </div>
                  </div>
                  {shift.status === 'scheduled' && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleMakeOpen(shift.id)}
                      >
                        Make Available for Swap
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-zinc-950 border-zinc-800">
            <CardContent className="p-8 text-center">
              <p className="text-zinc-400 mb-4">You don't have any shifts yet.</p>
              <Button asChild className="bg-teal-600 hover:bg-teal-700">
                <Link href="/dashboard/post">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Post Your First Shift
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Swap Requests */}
      <div>
        <h2 className="text-xl font-semibold mb-4">My Swap Requests</h2>
        {requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id} className="bg-zinc-950 border-zinc-800">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{request.shift?.position || 'Unknown Shift'}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Requested on {formatDate(request.created_at)}
                      </p>
                    </div>
                    {getRequestStatusBadge(request.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  {request.shift && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-teal-500" />
                        <span>{formatDate(request.shift.date, 'EEEE, MMM d')}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-teal-500" />
                        <span>{formatTime(request.shift.start_time)} - {formatTime(request.shift.end_time)}</span>
                      </div>
                    </div>
                  )}
                  {request.message && (
                    <p className="text-sm text-muted-foreground mb-4">"{request.message}"</p>
                  )}
                  {request.status === 'pending' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleCancelRequest(request.id)}
                    >
                      Cancel Request
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-zinc-950 border-zinc-800">
            <CardContent className="p-8 text-center">
              <p className="text-zinc-400">You haven't requested any shift swaps yet.</p>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/dashboard/browse">
                  Browse Available Shifts
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
