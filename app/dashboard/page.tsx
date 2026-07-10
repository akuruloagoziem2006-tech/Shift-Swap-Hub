'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar, Users, Clock, TrendingUp, ArrowRight, PlusCircle, Sparkles, X } from 'lucide-react'
import type { Profile, Shift, ShiftSwapRequest } from '@/lib/types'
import { formatDate, formatTime } from '@/lib/utils'

export default function Dashboard() {
  const [user, setUser] = useState<Profile | null>(null)
  const [openShifts, setOpenShifts] = useState<Shift[]>([])
  const [myShifts, setMyShifts] = useState<Shift[]>([])
  const [pendingRequests, setPendingRequests] = useState<ShiftSwapRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [showWelcome, setShowWelcome] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      try {
        // Get current user
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) {
          setLoading(false)
          return
        }

        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single()
        setUser(profile)

        // Check if first-time user (no full_name set)
        if (profile && !profile.full_name) {
          setShowWelcome(true)
        }

        // Get open shifts (available for swap)
        const { data: shifts } = await supabase
          .from('shifts')
          .select('*, user:profiles(*)')
          .eq('status', 'open')
          .order('date', { ascending: true })
          .limit(5)
        setOpenShifts(shifts || [])

        // Get user's own shifts
        const { data: myShiftData } = await supabase
          .from('shifts')
          .select('*')
          .eq('user_id', authUser.id)
          .order('date', { ascending: true })
          .limit(5)
        setMyShifts(myShiftData || [])

        // Get pending swap requests for this user
        const { data: requests } = await supabase
          .from('shift_swap_requests')
          .select('*, shift:shifts(*), requester:profiles(*)')
          .eq('target_user_id', authUser.id)
          .eq('status', 'pending')
        setPendingRequests(requests || [])

      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleApproveRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('shift_swap_requests')
        .update({ status: 'approved' })
        .eq('id', requestId)

      if (!error) {
        setPendingRequests(requests => requests.filter(r => r.id !== requestId))
      }
    } catch (error) {
      console.error('Error approving request:', error)
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('shift_swap_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId)

      if (!error) {
        setPendingRequests(requests => requests.filter(r => r.id !== requestId))
      }
    } catch (error) {
      console.error('Error rejecting request:', error)
    }
  }

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-zinc-950 border-zinc-800">
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold">
          Welcome back, {user?.full_name?.split(' ')[0] || 'User'}
        </h1>
        <p className="text-zinc-400">Here's what's happening with your shifts today</p>
      </div>

      {/* Welcome Banner for First-Time Users */}
      {showWelcome && (
        <div className="mb-8 bg-gradient-to-r from-teal-500/10 to-teal-600/10 border border-teal-500/20 rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-teal-500/20 rounded-lg">
                <Sparkles className="h-6 w-6 text-teal-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-1">
                  👋 Welcome to ShiftSwap!
                </h2>
                <p className="text-zinc-300 mb-4">
                  Get started by setting up your profile. This helps colleagues recognize you when swapping shifts.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button asChild className="bg-teal-600 hover:bg-teal-700">
                    <Link href="/dashboard/profile">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Complete Profile
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                    <Link href="/dashboard/post">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Post Your First Shift
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowWelcome(false)}
              className="text-zinc-500 hover:text-zinc-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Open Shifts</CardTitle>
            <Users className="h-5 w-5 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{openShifts.length}</div>
            <p className="text-xs text-zinc-500">Available for swap</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">My Shifts</CardTitle>
            <Calendar className="h-5 w-5 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{myShifts.length}</div>
            <p className="text-xs text-zinc-500">Upcoming shifts</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingRequests.length}</div>
            <p className="text-xs text-zinc-500">Awaiting your response</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-5 w-5 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">-</div>
            <p className="text-xs text-zinc-500">Need more data</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Swap Requests */}
      {pendingRequests.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Pending Swap Requests</h2>
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <Card key={request.id} className="bg-zinc-950 border-zinc-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {request.requester?.full_name || 'Someone'} wants your shift
                      </p>
                      <p className="text-sm text-zinc-400">
                        {request.shift?.date && formatDate(request.shift.date)} • {request.shift?.position}
                      </p>
                      {request.message && (
                        <p className="text-sm text-zinc-500 mt-1">"{request.message}"</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="bg-teal-600 hover:bg-teal-700"
                        onClick={() => handleApproveRequest(request.id)}
                      >
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleRejectRequest(request.id)}
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Open Shifts */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Open Shifts</h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/browse">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        {openShifts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {openShifts.map((shift) => (
              <Card key={shift.id} className="bg-zinc-950 border-zinc-800">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="bg-teal-500/10 text-teal-500 border-teal-500/20">
                      {shift.status}
                    </Badge>
                    <span className="text-sm text-zinc-500">{shift.department}</span>
                  </div>
                  <CardTitle className="text-lg">{shift.position}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-zinc-400 mb-2">
                    {formatDate(shift.date, 'EEEE, MMM d, yyyy')}
                  </p>
                  <p className="text-sm text-zinc-400">
                    {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                  </p>
                  {shift.location && (
                    <p className="text-sm text-zinc-500 mt-1">{shift.location}</p>
                  )}
                  <div className="mt-4">
                    <Button size="sm" className="w-full bg-teal-600 hover:bg-teal-700">
                      Request Swap
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-zinc-950 border-zinc-800">
            <CardContent className="p-8 text-center">
              <p className="text-zinc-400">No open shifts available at the moment.</p>
              <Button asChild className="mt-4 bg-teal-600 hover:bg-teal-700">
                <Link href="/dashboard/post">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Post a Shift
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button asChild className="bg-teal-600 hover:bg-teal-700 h-auto py-4">
          <Link href="/dashboard/post">
            <PlusCircle className="mr-2 h-5 w-5" />
            Post a Shift
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto py-4">
          <Link href="/dashboard/browse">
            <Users className="mr-2 h-5 w-5" />
            Browse Shifts
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto py-4">
          <Link href="/dashboard/my-shifts">
            <Calendar className="mr-2 h-5 w-5" />
            My Shifts
          </Link>
        </Button>
      </div>
    </div>
  )
}
