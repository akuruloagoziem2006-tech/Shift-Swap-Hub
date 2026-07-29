'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Calendar, Clock, MapPin, User, Check, X, AlertCircle, Inbox, Users, Shield, CheckCircle2, XCircle } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import type { ShiftSwapRequest, Profile } from '@/lib/types'
import { formatDate, formatTime } from '@/lib/utils'

export default function ManagerApprovals() {
  const [requests, setRequests] = useState<ShiftSwapRequest[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
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

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        setUserRole(profile?.role || null)

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

        const { data: allProfiles } = await supabase
          .from('profiles')
          .select('*')
          .order('full_name', { ascending: true })

        setProfiles(allProfiles || [])
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
      const { error: requestError } = await supabase
        .from('shift_swap_requests')
        .update({ status: 'approved' })
        .eq('id', request.id)

      if (requestError) throw requestError

      const { error: shiftError } = await supabase
        .from('shifts')
        .update({ 
          user_id: request.requester_id,
          status: 'filled'
        })
        .eq('id', request.shift_id)

      if (shiftError) throw shiftError

      toast({
        title: 'Swap approved! ✅',
        description: `The shift has been assigned to ${request.requester?.full_name || 'the requester'}.`,
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

  const isManager = userRole === 'manager' || userRole === 'admin'

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Shield className="w-8 h-8 text-emerald-500" />
          Manager Dashboard
        </h1>
        <p className="text-muted-foreground">
          {isManager 
            ? 'Review and approve shift swap requests from your team.'
            : 'View shift swap requests. Contact a manager to approve swaps.'}
        </p>
      </div>

      {!isManager && (
        <Card className="bg-card border-border mb-8">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-amber-500 flex-shrink-0" />
              <div>
                <h3 className="font-medium mb-1">Manager Access Required</h3>
                <p className="text-sm text-muted-foreground">
                  You need manager or admin privileges to approve shift swaps. 
                  Current swap requests are shown below but cannot be approved from this account.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="pending" className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending" className="relative gap-2">
            Pending
            {pendingCount > 0 && (
              <Badge className="bg-amber-500">{pendingCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="profiles" className="gap-2">
            <Users className="w-4 h-4" />
            Profiles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          {requests.length > 0 ? (
            <div className="space-y-4">
              {requests.map((request) => (
                <Card key={request.id} className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge variant="secondary" className="mb-2 bg-amber-500/10 text-amber-500 border-amber-500/20">
                          Pending Review
                        </Badge>
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
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-secondary/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-emerald-500" />
                        <span className="text-sm">{request.shift?.date ? formatDate(request.shift.date, 'EEE, MMM d') : 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-emerald-500" />
                        <span className="text-sm">
                          {request.shift?.start_time ? formatTime(request.shift.start_time) : ''} - {request.shift?.end_time ? formatTime(request.shift.end_time) : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-emerald-500" />
                        <span className="text-sm">{request.shift?.location || 'No location'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                        <Avatar className="size-10">
                          <AvatarFallback className="text-sm">
                            {request.shift?.user?.full_name?.charAt(0) || request.target_user?.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs text-muted-foreground">Current Owner</p>
                          <p className="font-medium">
                            {request.shift?.user?.full_name || request.target_user?.full_name || 'Unknown'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-emerald-500/10 rounded-lg">
                        <Avatar className="size-10">
                          <AvatarFallback className="bg-emerald-500/20 text-emerald-500 text-sm">
                            {request.requester?.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs text-muted-foreground">Requester</p>
                          <p className="font-medium">
                            {request.requester?.full_name || 'Unknown'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {request.message && (
                      <div className="p-3 bg-secondary/30 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Message from requester:</p>
                        <p className="text-sm italic">"{request.message}"</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        Requested {formatDate(request.created_at, 'MMM d, yyyy h:mm a')}
                      </p>
                      {isManager ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(request)}
                            disabled={processingId === request.id}
                            className="gap-1 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(request)}
                            disabled={processingId === request.id}
                            className="gap-1 bg-emerald-600 hover:bg-emerald-700"
                          >
                            <CheckCircle2 className="w-4 h-4" />
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
            <Card className="bg-card border-border">
              <CardContent className="p-12 text-center">
                <div className="inline-flex p-4 bg-emerald-500/10 rounded-full mb-4">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                </div>
                <p className="text-xl font-semibold mb-2">All caught up! 🎉</p>
                <p className="text-muted-foreground max-w-md mx-auto">
                  No pending swap requests to review. Your team is all set!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="profiles" className="mt-4">
          {profiles.length > 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-muted-foreground">Name</TableHead>
                      <TableHead className="text-muted-foreground">Role</TableHead>
                      <TableHead className="text-muted-foreground">Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profiles.map((profile) => (
                      <TableRow key={profile.id} className="border-border">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <Avatar className="size-8">
                              <AvatarFallback className="text-xs">
                                {profile.full_name?.charAt(0) || profile.email?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            {profile.full_name || 'Unnamed User'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={profile.role === 'admin' ? 'default' : profile.role === 'manager' ? 'secondary' : 'outline'}>
                            {profile.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {profile.created_at ? formatDate(profile.created_at, 'MMM d, yyyy') : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="p-12 text-center">
                <div className="inline-flex p-4 bg-emerald-500/10 rounded-full mb-4">
                  <Users className="w-12 h-12 text-emerald-500" />
                </div>
                <p className="text-xl font-semibold mb-2">No team members yet</p>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Once your team members sign up, they'll appear here.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
