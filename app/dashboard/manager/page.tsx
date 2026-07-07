'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Clock, MapPin, User, Check, X, AlertCircle, Inbox } from 'lucide-react'
import type { ShiftSwapRequest, Profile } from '@/lib/types'
import { formatDate, formatTime } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

export default function ManagerApprovals() {
  const [requests, setRequests] = useState<ShiftSwapRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setLoading(false)
          return
        }

        // Get user profile to check role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        setUserRole(profile?.role || null)

        // Get all pending requests (for managers/admins)
        const { data: allRequests } = await supabase
          .from('shift_swap_requests')
          .select(`
            *,
            shift:shifts(*, user:profiles(*)),
            requester:profiles!shift_swap_requests_requester_id_fkey(*),
            target_user:profiles!shift_swap_requests_target_user_id_fkey(*)
          `)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })

        setRequests(allRequests || [])
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleApprove = async (request: ShiftSwapRequest) => {
    setProcessingId(request.id)
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
        title: 'Request approved!',
        description: 'The shift has been assigned to the new employee.',
      })

      setRequests(requests => requests.filter(r => r.id !== request.id))
    } catch (error) {
      console.error('Error approving request:', error)
      toast({
        title: 'Error',
        description: 'Failed to approve request. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (request: ShiftSwapRequest) => {
    setProcessingId(request.id)
    try {
      const { error } = await supabase
        .from('shift_swap_requests')
        .update({ status: 'rejected' })
        .eq('id', request.id)

      if (error) throw error

      toast({
        title: 'Request rejected',
        description: 'The swap request has been declined.',
      })

      setRequests(requests => requests.filter(r => r.id !== request.id))
    } catch (error) {
      console.error('Error rejecting request:', error)
      toast({
        title: 'Error',
        description: 'Failed to reject request. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setProcessingId(null)
    }
  }

  const pendingCount = requests.length

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <Skeleton className="h-10 w-64 mb-8" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    )
  }

  // Check if user has manager/admin role
  const isManager = userRole === 'manager' || userRole === 'admin'

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Manager Approvals</h1>
        <p className="text-zinc-400">
          {isManager 
            ? 'Review and approve shift swap requests from your team.'
            : 'View shift swap requests. Contact a manager to approve swaps.'}
        </p>
      </div>

      {!isManager && (
        <Card className="bg-zinc-950 border-zinc-800 mb-8">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-amber-500 flex-shrink-0" />
              <div>
                <h3 className="font-medium mb-1">Manager Access Required</h3>
                <p className="text-sm text-zinc-400">
                  You need manager or admin privileges to approve shift swaps. 
                  Current swap requests are shown below but cannot be approved from this account.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="pending" className="mb-6">
        <TabsList>
          <TabsTrigger value="pending" className="relative">
            Pending
            {pendingCount > 0 && (
              <Badge className="ml-2 bg-teal-500">{pendingCount}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          {requests.length > 0 ? (
            <div className="space-y-4">
              {requests.map((request) => (
                <Card key={request.id} className="bg-zinc-950 border-zinc-800">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge variant="secondary" className="mb-2">Pending</Badge>
                        <CardTitle className="text-lg">
                          {request.shift?.position || 'Unknown Position'}
                        </CardTitle>
                        <CardDescription>
                          {request.shift?.department || 'No department'}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Shift Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-secondary/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-teal-500" />
                        <span>{request.shift?.date ? formatDate(request.shift.date, 'EEEE, MMM d') : 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-teal-500" />
                        <span>
                          {request.shift?.start_time ? formatTime(request.shift.start_time) : ''} - {request.shift?.end_time ? formatTime(request.shift.end_time) : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-teal-500" />
                        <span>{request.shift?.location || 'No location'}</span>
                      </div>
                    </div>

                    {/* People involved */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
                        <User className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Current Owner</p>
                          <p className="font-medium">
                            {request.shift?.user?.full_name || request.target_user?.full_name || 'Unknown'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-teal-500/10 rounded-lg">
                        <User className="w-5 h-5 text-teal-500" />
                        <div>
                          <p className="text-xs text-muted-foreground">Requester</p>
                          <p className="font-medium">
                            {request.requester?.full_name || 'Unknown'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Message */}
                    {request.message && (
                      <div className="p-3 bg-secondary/30 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Message from requester:</p>
                        <p className="text-sm italic">"{request.message}"</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2">
                      <p className="text-xs text-muted-foreground">
                        Requested on {formatDate(request.created_at, 'MMM d, yyyy h:mm a')}
                      </p>
                      {isManager ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(request)}
                            disabled={processingId === request.id}
                            className="text-red-500 hover:text-red-400"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(request)}
                            disabled={processingId === request.id}
                            className="bg-teal-600 hover:bg-teal-700"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            {processingId === request.id ? 'Approving...' : 'Approve'}
                          </Button>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          Awaiting Manager Approval
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-zinc-950 border-zinc-800">
              <CardContent className="p-12 text-center">
                <Inbox className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-zinc-400 mb-2">No pending swap requests</p>
                <p className="text-sm text-muted-foreground">
                  All shift swap requests have been processed.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
