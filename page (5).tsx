'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Loader2, 
  MoreHorizontal,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { format } from 'date-fns'
import { toast } from 'sonner'
import type { Shift, SwapRequest } from '@/lib/types'

type ShiftWithRequests = Shift & {
  swap_requests: (SwapRequest & {
    profiles: { full_name: string | null; email: string | null } | null
  })[]
}

const fetchMyShifts = async () => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { posted: [], incoming: [], approved: [] }

  // Fetch posted shifts with swap requests
  const { data: postedShifts } = await supabase
    .from('shifts')
    .select(`
      *,
      swap_requests (
        *,
        profiles:requester_id (full_name, email)
      )
    `)
    .eq('user_id', user.id)
    .order('shift_date', { ascending: true })

  // Fetch shifts where user has made requests
  const { data: myRequests } = await supabase
    .from('swap_requests')
    .select(`
      *,
      shifts (*)
    `)
    .eq('requester_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch approved swaps for user
  const { data: approvedSwaps } = await supabase
    .from('swap_requests')
    .select(`
      *,
      shifts (*)
    `)
    .eq('requester_id', user.id)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  return {
    posted: (postedShifts || []) as ShiftWithRequests[],
    incoming: myRequests || [],
    approved: approvedSwaps || [],
  }
}

export default function MyShiftsPage() {
  const { data, isLoading, mutate } = useSWR('my-shifts', fetchMyShifts)
  const supabase = createClient()
  const [deleteShiftId, setDeleteShiftId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const handleDeleteShift = async () => {
    if (!deleteShiftId) return
    
    setActionLoading(deleteShiftId)
    const { error } = await supabase
      .from('shifts')
      .delete()
      .eq('id', deleteShiftId)

    if (error) {
      toast.error('Failed to delete shift')
    } else {
      toast.success('Shift deleted successfully')
      mutate()
    }
    setDeleteShiftId(null)
    setActionLoading(null)
  }

  const handleRequestAction = async (requestId: string, action: 'approved' | 'rejected') => {
    setActionLoading(requestId)
    const { error } = await supabase
      .from('swap_requests')
      .update({ status: action })
      .eq('id', requestId)

    if (error) {
      toast.error(`Failed to ${action === 'approved' ? 'approve' : 'reject'} request`)
    } else {
      toast.success(`Request ${action === 'approved' ? 'approved' : 'rejected'}`)
      mutate()
    }
    setActionLoading(null)
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      open: 'bg-green-500/10 text-green-400 border-green-500/20',
      pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      closed: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
      approved: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
      rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
    }
    return (
      <Badge variant="outline" className={styles[status] || styles.pending}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Shifts</h1>
        <p className="text-muted-foreground mt-1">
          Manage your posted shifts and swap requests.
        </p>
      </div>

      <Tabs defaultValue="posted" className="space-y-6">
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="posted" className="data-[state=active]:bg-teal-500/10 data-[state=active]:text-teal-500">
            Posted Shifts
            {data?.posted && data.posted.length > 0 && (
              <span className="ml-2 size-5 rounded-full bg-teal-500/20 text-xs flex items-center justify-center">
                {data.posted.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="incoming" className="data-[state=active]:bg-teal-500/10 data-[state=active]:text-teal-500">
            Incoming Requests
            {data?.posted && data.posted.reduce((acc, s) => acc + (s.swap_requests?.filter(r => r.status === 'pending').length || 0), 0) > 0 && (
              <span className="ml-2 size-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center">
                {data.posted.reduce((acc, s) => acc + (s.swap_requests?.filter(r => r.status === 'pending').length || 0), 0)}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved" className="data-[state=active]:bg-teal-500/10 data-[state=active]:text-teal-500">
            My Approved
          </TabsTrigger>
        </TabsList>

        {/* Posted Shifts Tab */}
        <TabsContent value="posted" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="size-8 animate-spin text-teal-500" />
            </div>
          ) : data?.posted && data.posted.length > 0 ? (
            <div className="grid gap-4">
              {data.posted.map((shift) => (
                <Card key={shift.id} className="bg-card/50 border-border/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{shift.title}</CardTitle>
                        <div className="flex items-center gap-2 flex-wrap">
                          {statusBadge(shift.status)}
                          <Badge variant="outline" className="bg-secondary/50">
                            {shift.role_type}
                          </Badge>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="mr-2 size-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => setDeleteShiftId(shift.id)}
                          >
                            <Trash2 className="mr-2 size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="size-4 text-teal-500/70" />
                        {format(new Date(shift.shift_date), 'MMM d, yyyy')}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="size-4 text-teal-500/70" />
                        {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="size-4 text-teal-500/70" />
                        {shift.location}
                      </div>
                    </div>
                    {shift.swap_requests && shift.swap_requests.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-border/50">
                        <p className="text-sm font-medium text-foreground mb-2">
                          {shift.swap_requests.length} Request{shift.swap_requests.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-card/50 border-border/50">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="size-12 text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold text-foreground mb-2">No posted shifts</h3>
                <p className="text-muted-foreground text-sm text-center max-w-sm">
                  {"You haven't posted any shifts yet. Post a shift to get started!"}
                </p>
                <Button className="mt-4 bg-teal-600 hover:bg-teal-700" asChild>
                  <a href="/dashboard/post">Post a Shift</a>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Incoming Requests Tab */}
        <TabsContent value="incoming" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="size-8 animate-spin text-teal-500" />
            </div>
          ) : data?.posted && data.posted.some(s => s.swap_requests?.length > 0) ? (
            <div className="grid gap-4">
              {data.posted.flatMap(shift => 
                (shift.swap_requests || []).map(request => (
                  <Card key={request.id} className="bg-card/50 border-border/50">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{shift.title}</CardTitle>
                          <CardDescription>
                            Request from {request.profiles?.full_name || request.profiles?.email || 'Unknown'}
                          </CardDescription>
                        </div>
                        {statusBadge(request.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="size-4 text-teal-500/70" />
                          {format(new Date(shift.shift_date), 'MMM d, yyyy')}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="size-4 text-teal-500/70" />
                          {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                        </div>
                      </div>
                      {request.message && (
                        <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg mb-4">
                          {request.message}
                        </p>
                      )}
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-teal-600 hover:bg-teal-700"
                            onClick={() => handleRequestAction(request.id, 'approved')}
                            disabled={actionLoading === request.id}
                          >
                            {actionLoading === request.id ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <CheckCircle className="size-4 mr-1" />
                            )}
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRequestAction(request.id, 'rejected')}
                            disabled={actionLoading === request.id}
                          >
                            <XCircle className="size-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          ) : (
            <Card className="bg-card/50 border-border/50">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="size-12 text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold text-foreground mb-2">No incoming requests</h3>
                <p className="text-muted-foreground text-sm text-center max-w-sm">
                  {"When someone requests one of your shifts, it will appear here."}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Approved Swaps Tab */}
        <TabsContent value="approved" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="size-8 animate-spin text-teal-500" />
            </div>
          ) : data?.approved && data.approved.length > 0 ? (
            <div className="grid gap-4">
              {data.approved.map((request: SwapRequest & { shifts: Shift }) => (
                <Card key={request.id} className="bg-card/50 border-border/50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{request.shifts.title}</CardTitle>
                      {statusBadge('approved')}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="size-4 text-teal-500/70" />
                        {format(new Date(request.shifts.shift_date), 'MMM d, yyyy')}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="size-4 text-teal-500/70" />
                        {formatTime(request.shifts.start_time)} - {formatTime(request.shifts.end_time)}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="size-4 text-teal-500/70" />
                        {request.shifts.location}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-card/50 border-border/50">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="size-12 text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold text-foreground mb-2">No approved swaps</h3>
                <p className="text-muted-foreground text-sm text-center max-w-sm">
                  Shifts you&apos;ve been approved to pick up will appear here.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteShiftId} onOpenChange={() => setDeleteShiftId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this shift?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the shift
              and all associated swap requests.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteShift}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
