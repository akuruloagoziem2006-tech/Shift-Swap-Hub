'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Calendar, Clock, MapPin, PlusCircle, Trash2, ArrowRightLeft, CalendarOff, Send, Search } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import type { Shift, ShiftSwapRequest } from '@/lib/types'
import { formatDate, formatTime } from '@/lib/utils'

export default function MyShifts() {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [requests, setRequests] = useState<ShiftSwapRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [shiftToDelete, setShiftToDelete] = useState<Shift | null>(null)
  const [deleting, setDeleting] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()
  const router = useRouter()

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
          .select('*, shift:shifts(*, user:profiles(*))')
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
      const { error } = await supabase
        .from('shift_swap_requests')
        .update({ status: 'cancelled' })
        .eq('id', requestId)

      if (error) throw error

      toast({
        title: 'Request cancelled',
        description: 'Your swap request has been cancelled.',
      })

      setRequests(requests => requests.filter(r => r.id !== requestId))
    } catch (error) {
      console.error('Error cancelling request:', error)
      toast({
        title: 'Error',
        description: 'Failed to cancel request. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleMakeOpen = async (shiftId: string) => {
    try {
      const { error } = await supabase
        .from('shifts')
        .update({ status: 'open' })
        .eq('id', shiftId)

      if (error) throw error

      toast({
        title: 'Shift available for swap',
        description: 'Other employees can now request to take this shift.',
      })

      setShifts(shifts => shifts.map(s => 
        s.id === shiftId ? { ...s, status: 'open' as const } : s
      ))
    } catch (error) {
      console.error('Error updating shift:', error)
      toast({
        title: 'Error',
        description: 'Failed to make shift available. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteShift = async () => {
    if (!shiftToDelete) return
    
    setDeleting(true)
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Not authenticated')
      }

      // First verify the shift belongs to this user
      const { data: shiftToCheck, error: checkError } = await supabase
        .from('shifts')
        .select('user_id')
        .eq('id', shiftToDelete.id)
        .single()

      if (checkError || !shiftToCheck) {
        throw new Error('Shift not found')
      }

      if (shiftToCheck.user_id !== user.id) {
        throw new Error('You do not have permission to delete this shift')
      }

      // Delete the shift
      const { error: deleteError } = await supabase
        .from('shifts')
        .delete()
        .eq('id', shiftToDelete.id)
        .eq('user_id', user.id) // Double-check user_id matches

      if (deleteError) {
        console.error('Delete error:', deleteError)
        throw deleteError
      }

      toast({
        title: 'Shift deleted',
        description: 'The shift has been permanently removed.',
        className: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
      })

      setShifts(shifts => shifts.filter(s => s.id !== shiftToDelete.id))
      setDeleteDialogOpen(false)
      setShiftToDelete(null)
    } catch (error: any) {
      console.error('Error deleting shift:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete shift. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setDeleting(false)
    }
  }

  const getStatusBadge = (status: Shift['status']) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="secondary">Scheduled</Badge>
      case 'open':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Open for Swap</Badge>
      case 'filled':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Filled</Badge>
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
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Approved</Badge>
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
        <div>
          <h1 className="text-3xl font-bold mb-1">My Shifts</h1>
          <p className="text-muted-foreground">Manage your shifts and track swap requests</p>
        </div>
        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <Link href="/dashboard/post">
            <PlusCircle className="mr-2 h-4 w-4" />
            Post New Shift
          </Link>
        </Button>
      </div>

      {/* My Shifts */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          Your Shifts
          <Badge variant="secondary">{shifts.length}</Badge>
        </h2>
        {shifts.length > 0 ? (
          <div className="space-y-4">
            {shifts.map((shift) => (
              <Card key={shift.id} className="bg-card border-border hover:border-blue-500/30 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Calendar className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{shift.position}</CardTitle>
                        <p className="text-sm text-muted-foreground">{shift.department}</p>
                      </div>
                    </div>
                    {getStatusBadge(shift.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{formatDate(shift.date, 'EEE, MMM d')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{formatTime(shift.start_time)} - {formatTime(shift.end_time)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="truncate">{shift.location || 'No location'}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                    {shift.status === 'scheduled' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleMakeOpen(shift.id)}
                        className="text-blue-500 hover:text-blue-400"
                      >
                        <ArrowRightLeft className="mr-2 h-4 w-4" />
                        Make Available for Swap
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => {
                        setShiftToDelete(shift)
                        setDeleteDialogOpen(true)
                      }}
                      className="text-red-500 hover:text-red-400 hover:bg-red-500/10 ml-auto"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-card border-border ring-2 ring-blue-500/30">
            <CardContent className="p-12 text-center">
              <div className="inline-flex p-4 bg-blue-500/10 rounded-full mb-4">
                <CalendarOff className="w-12 h-12 text-blue-500" />
              </div>
              <p className="text-xl font-semibold mb-2">No shifts posted yet</p>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                You haven't posted any shifts for swap. Post your first shift and let colleagues know you're available to cover!
              </p>
              <Button asChild className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6 h-auto">
                <Link href="/dashboard/post">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Post Your First Shift
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Swap Requests */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          My Swap Requests
          <Badge variant="secondary">{requests.length}</Badge>
        </h2>
        {requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id} className="bg-card border-border">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-secondary rounded-lg">
                        <Send className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{request.shift?.position || 'Unknown Shift'}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Requested {formatDate(request.created_at, 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    {getRequestStatusBadge(request.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  {request.shift && (
                    <div className="flex flex-wrap items-center gap-4 mb-4 p-3 bg-secondary/50 rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{formatDate(request.shift.date, 'EEE, MMM d')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{formatTime(request.shift.start_time)} - {formatTime(request.shift.end_time)}</span>
                      </div>
                      {request.shift.user && (
                        <div className="flex items-center gap-2 text-sm ml-auto">
                          <Avatar className="size-6">
                            <AvatarFallback className="text-xs">
                              {request.shift.user.full_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-muted-foreground">
                            Requesting from {request.shift.user.full_name || 'Unknown'}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  {request.message && (
                    <p className="text-sm text-muted-foreground mb-4 italic">"{request.message}"</p>
                  )}
                  {request.status === 'pending' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleCancelRequest(request.id)}
                      className="text-red-500 hover:text-red-400"
                    >
                      Cancel Request
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-card border-border ring-2 ring-blue-500/30">
            <CardContent className="p-12 text-center">
              <div className="inline-flex p-4 bg-blue-500/10 rounded-full mb-4">
                <ArrowRightLeft className="w-12 h-12 text-blue-500" />
              </div>
              <p className="text-xl font-semibold mb-2">No swap requests yet</p>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                You haven't requested any shifts. Browse available shifts and request coverage from your colleagues!
              </p>
              <Button asChild className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6 h-auto">
                <Link href="/dashboard/browse">
                  <Search className="mr-2 h-5 w-5" />
                  Browse Available Shifts
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Shift</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this shift? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {shiftToDelete && (
            <div className="p-4 bg-secondary/50 rounded-lg my-4">
              <p className="font-medium">{shiftToDelete.position}</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(shiftToDelete.date, 'EEEE, MMM d')} • {formatTime(shiftToDelete.start_time)} - {formatTime(shiftToDelete.end_time)}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteShift}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete Shift'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
