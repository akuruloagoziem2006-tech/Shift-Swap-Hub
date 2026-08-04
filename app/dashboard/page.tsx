'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Calendar, Users, Clock, TrendingUp, ArrowRight, PlusCircle, Sparkles, X, User, CalendarOff, Inbox, Share2, CheckCircle, Mail, Search } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import type { Profile, Shift, ShiftSwapRequest } from '@/lib/types'
import { formatDate, formatTime } from '@/lib/utils'
import { OnboardingGuide } from '@/components/dashboard/onboarding-guide'

export default function Dashboard() {
  const [user, setUser] = useState<Profile | null>(null)
  const [openShifts, setOpenShifts] = useState<Shift[]>([])
  const [myShifts, setMyShifts] = useState<Shift[]>([])
  const [pendingRequests, setPendingRequests] = useState<ShiftSwapRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [showWelcome, setShowWelcome] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const supabase = createClient()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      try {
        // Get current user
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) {
          setLoading(false)
          return
        }

        setCurrentUserId(authUser.id)

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

        // Get open shifts (available for swap) with user info
        const { data: shifts } = await supabase
          .from('shifts')
          .select('*')
          .eq('status', 'open')
          .order('date', { ascending: true })
          .limit(5)

        // Fetch profiles separately
        if (shifts && shifts.length > 0) {
          const uniqueUserIds = [...new Set(shifts.map(s => s.user_id))]
          const { data: profiles } = await supabase
            .from('profiles')
            .select('*')
            .in('id', uniqueUserIds)
          const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])
          const shiftsWithUsers = shifts.map(shift => ({
            ...shift,
            user: profileMap.get(shift.user_id)
          }))
          setOpenShifts(shiftsWithUsers)
        } else {
          setOpenShifts([])
        }

        // Get user's own shifts
        const { data: myShiftData } = await supabase
          .from('shifts')
          .select('*')
          .eq('user_id', authUser.id)
          .order('date', { ascending: true })
          .limit(5)
        setMyShifts(myShiftData || [])

        // Get pending swap requests where user is the target (shift owner)
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

  const handleApproveRequest = async (request: ShiftSwapRequest) => {
    try {
      // Update request status
      const { error: requestError } = await supabase
        .from('shift_swap_requests')
        .update({ status: 'approved' })
        .eq('id', request.id)

      if (requestError) throw requestError

      // Update shift to be filled
      const { error: shiftError } = await supabase
        .from('shifts')
        .update({ 
          user_id: request.requester_id,
          status: 'filled'
        })
        .eq('id', request.shift_id)

      if (shiftError) throw shiftError

      toast({
        title: 'Swap approved!',
        description: `The shift has been assigned to ${request.requester?.full_name || 'the requester'}.`,
      })

      setPendingRequests(requests => requests.filter(r => r.id !== request.id))
      // Refresh the page to show updated data
      router.refresh()
    } catch (error) {
      console.error('Error approving request:', error)
      toast({
        title: 'Error',
        description: 'Failed to approve request. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('shift_swap_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId)

      if (error) throw error

      toast({
        title: 'Request declined',
        description: 'The swap request has been declined.',
      })

      setPendingRequests(requests => requests.filter(r => r.id !== requestId))
    } catch (error) {
      console.error('Error rejecting request:', error)
      toast({
        title: 'Error',
        description: 'Failed to decline request. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const getStatusBadge = (status: Shift['status']) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Open</Badge>
      case 'filled':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Filled</Badge>
      case 'scheduled':
        return <Badge variant="secondary">Scheduled</Badge>
      case 'completed':
        return <Badge variant="outline">Completed</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-card border-border">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Welcome back, {user?.full_name?.split(' ')[0] || 'User'} 👋
        </h1>
        <p className="text-muted-foreground">Here's what's happening with your shifts</p>
      </div>

      {/* How It Works */}
      <div className="mb-8 bg-gradient-to-br blue-500/5 blue-500/10 to-transparent border border-blue-500/20 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-500" />
          How ShiftSwap Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg h-fit">
              <Share2 className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-medium mb-1">1. Post Your Shift</h3>
              <p className="text-sm text-muted-foreground">Can't make it? Post your shift as available for swap.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg h-fit">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-medium mb-1">2. Request a Swap</h3>
              <p className="text-sm text-muted-foreground">Browse available shifts and request coverage from colleagues.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg h-fit">
              <CheckCircle className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-medium mb-1">3. Get Approved</h3>
              <p className="text-sm text-muted-foreground">Managers approve swaps to keep your team covered.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Banner for First-Time Users */}
      {showWelcome && (
        <div className="mb-8 bg-gradient-to-r blue-500/10 blue-500/10 border border-blue-500/20 rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Sparkles className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-1">
                  Welcome to ShiftSwap!
                </h2>
                <p className="text-muted-foreground mb-4">
                  Get started by setting up your profile and posting your first shift.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button asChild className="bg-blue-600 hover:bg-blue-700">
                    <Link href="/dashboard/profile">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Complete Profile
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
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
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Onboarding Guide for New Users */}
      {currentUserId && <OnboardingGuide userId={currentUserId} />}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Open Shifts</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">{openShifts.length}</div>
            <p className="text-xs text-muted-foreground">Available for swap</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">My Shifts</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">{myShifts.length}</div>
            <p className="text-xs text-muted-foreground">Upcoming shifts</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">{pendingRequests.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">My Requests</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Track your swaps</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Swap Requests */}
      {pendingRequests.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-semibold">Pending Requests</h2>
            <Badge variant="secondary" className="bg-amber-500/10 text-amber-500">{pendingRequests.length}</Badge>
          </div>
          <div className="space-y-3">
            {pendingRequests.map((request) => (
              <Card key={request.id} className="bg-card border-border overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="size-10">
                        <AvatarFallback className="bg-blue-500/10 text-blue-500 text-sm">
                          {request.requester?.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {request.requester?.full_name || 'Someone'} wants your shift
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {request.shift?.position} • {request.shift?.date && formatDate(request.shift.date, 'MMM d')}
                        </p>
                        {request.message && (
                          <p className="text-sm text-muted-foreground mt-1 italic">"{request.message}"</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-13 md:ml-0">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleRejectRequest(request.id)}
                        className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                      >
                        Decline
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleApproveRequest(request)}
                      >
                        Approve
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
          <h2 className="text-xl font-semibold">Open Shifts</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/browse">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        {openShifts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {openShifts.map((shift) => (
              <Card key={shift.id} className="bg-card border-border hover:border-blue-500/30 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    {getStatusBadge(shift.status)}
                    <span className="text-xs text-muted-foreground">{shift.department}</span>
                  </div>
                  <CardTitle className="text-lg">{shift.position}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(shift.date, 'EEE, MMM d')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(shift.start_time)} - {formatTime(shift.end_time)}</span>
                  </div>
                  {shift.user && (
                    <div className="flex items-center gap-2 text-sm">
                      <Avatar className="size-6">
                        <AvatarFallback className="bg-secondary text-xs">
                          {shift.user.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-muted-foreground">Posted by {shift.user.full_name || 'Unknown'}</span>
                    </div>
                  )}
                  {shift.user_id === currentUserId ? (
                    <Button size="sm" className="w-full" disabled variant="outline">
                      Your Shift
                    </Button>
                  ) : (
                    <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700" asChild>
                      <Link href="/dashboard/browse">
                        Request Swap
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-card border-border">
            <CardContent className="p-12 text-center">
              <div className="inline-flex p-4 bg-blue-500/10 rounded-full mb-4">
                <CalendarOff className="w-12 h-12 text-blue-500" />
              </div>
              <p className="text-xl font-semibold mb-2">No open shifts available</p>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                When colleagues post shifts for swap, they'll appear here. Be the first to post!
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                  <Link href="/dashboard/post">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Post a Shift
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/dashboard/browse">
                    Browse All
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions - Mobile Friendly */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          <Button asChild className="bg-blue-600 hover:bg-blue-700 h-auto py-4 md:py-5 flex flex-col gap-2 shadow-lg shadow-blue-500/20">
            <Link href="/dashboard/post">
              <PlusCircle className="h-6 w-6 md:h-5 md:w-5" />
              <span className="text-sm md:text-base font-semibold">Post Shift</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto py-4 md:py-5 flex flex-col gap-2 bg-card border-2 hover:border-blue-500/50">
            <Link href="/dashboard/browse">
              <Search className="h-6 w-6 md:h-5 md:w-5 text-blue-500" />
              <span className="text-sm md:text-base font-semibold">Browse</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto py-4 md:py-5 flex flex-col gap-2 bg-card border-2 hover:border-blue-500/50">
            <Link href="/dashboard/my-shifts">
              <Calendar className="h-6 w-6 md:h-5 md:w-5 text-blue-500" />
              <span className="text-sm md:text-base font-semibold">My Shifts</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
