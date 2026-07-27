'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Calendar, MapPin, Clock, Search, User, RefreshCw, Filter, CalendarOff, PlusCircle, Send, Trash2 } from 'lucide-react'
import type { Shift } from '@/lib/types'
import { useToast } from '@/components/ui/use-toast'
import { formatDate, formatTime } from '@/lib/utils'

export default function BrowseShifts() {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [requestingShift, setRequestingShift] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [shiftToDelete, setShiftToDelete] = useState<Shift | null>(null)
  const [deleting, setDeleting] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  async function loadShifts() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
      }

      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .eq('status', 'open')
        .order('date', { ascending: true })

      if (error) {
        console.error('Error loading shifts:', error)
        toast({
          title: 'Error loading shifts',
          description: error.message,
          variant: 'destructive',
        })
        setShifts([])
      } else {
        if (data && data.length > 0) {
          const uniqueUserIds = [...new Set(data.map(s => s.user_id))]
          const { data: profiles } = await supabase
            .from('profiles')
            .select('*')
            .in('id', uniqueUserIds)
          
          const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])
          const shiftsWithUsers = data.map(shift => ({
            ...shift,
            user: profileMap.get(shift.user_id)
          }))
          setShifts(shiftsWithUsers)
        } else {
          setShifts([])
        }
      }
    } catch (error) {
      console.error('Error loading shifts:', error)
      setShifts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadShifts()
  }, [])

  const handleRequestSwap = async (shift: Shift) => {
    if (!userId) {
      toast({
        title: 'Please sign in',
        description: 'You need to be signed in to request a shift swap.',
        variant: 'destructive',
      })
      return
    }

    if (shift.user_id === userId) {
      toast({
        title: 'Cannot request own shift',
        description: 'You cannot request a swap for your own shift.',
        variant: 'destructive',
      })
      return
    }

    setRequestingShift(shift.id)

    try {
      const { error } = await supabase
        .from('shift_swap_requests')
        .insert({
          shift_id: shift.id,
          requester_id: userId,
          target_user_id: shift.user_id,
          status: 'pending',
        })

      if (error) throw error

      toast({
        title: 'Swap requested! 🎉',
        description: `Your request has been sent to ${shift.user?.full_name || 'the shift owner'}.`,
      })

      setShifts(shifts.filter(s => s.id !== shift.id))
    } catch (error) {
      console.error('Error requesting swap:', error)
      toast({
        title: 'Error',
        description: 'Failed to send swap request. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setRequestingShift(null)
    }
  }

  const handleDeleteShift = async () => {
    if (!shiftToDelete) return
    
    setDeleting(true)
    try {
      const { error } = await supabase
        .from('shifts')
        .delete()
        .eq('id', shiftToDelete.id)
        .eq('user_id', userId!)

      if (error) {
        console.error('Delete error:', error)
        throw error
      }

      toast({
        title: 'Shift deleted',
        description: 'The shift has been permanently removed.',
        className: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
      })

      setShifts(shifts => shifts.filter(s => s.id !== shiftToDelete.id))
      setDeleteDialogOpen(false)
      setShiftToDelete(null)
    } catch (error) {
      console.error('Error deleting shift:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete shift. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setDeleting(false)
    }
  }

  const filteredShifts = shifts.filter(shift => {
    const matchesSearch = searchTerm === '' || 
      shift.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shift.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (shift.location?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)

    const matchesDepartment = departmentFilter === 'all' || shift.department === departmentFilter

    return matchesSearch && matchesDepartment
  })

  const departments = [...new Set(shifts.map(s => s.department))]

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-40" />
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
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Browse Shifts</h1>
        <p className="text-muted-foreground">Find and request shifts from your colleagues</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by position, department, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map(dept => (
              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      {filteredShifts.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">
              {filteredShifts.length} shift{filteredShifts.length !== 1 ? 's' : ''} available
            </p>
            <Button variant="ghost" size="sm" onClick={() => loadShifts()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          {filteredShifts.map((shift) => (
            <Card key={shift.id} className="bg-card border-border hover:border-emerald-500/30 transition-colors">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                        {shift.status}
                      </Badge>
                      <Badge variant="secondary">{shift.department}</Badge>
                    </div>
                    <h3 className="text-lg font-semibold">{shift.position}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(shift.date, 'EEE, MMM d')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(shift.start_time)} - {formatTime(shift.end_time)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{shift.location || 'No location'}</span>
                      </div>
                    </div>
                    {shift.user && (
                      <div className="flex items-center gap-2 text-sm">
                        <Avatar className="size-6">
                          <AvatarFallback className="text-xs bg-secondary">
                            {shift.user.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-muted-foreground">
                          Posted by <span className="font-medium text-foreground">{shift.user.full_name || 'Unknown'}</span>
                        </span>
                      </div>
                    )}
                    {shift.notes && (
                      <p className="text-sm text-muted-foreground bg-secondary/50 p-2 rounded">
                        {shift.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    {shift.user_id === userId ? (
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                          onClick={() => {
                            setShiftToDelete(shift)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        className="bg-emerald-600 hover:bg-emerald-700 w-full md:w-auto"
                        onClick={() => handleRequestSwap(shift)}
                        disabled={requestingShift === shift.id}
                      >
                        {requestingShift === shift.id ? (
                          <>
                            <Send className="h-4 w-4 mr-2 animate-pulse" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Request Swap
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-card border-border">
          <CardContent className="p-12 text-center">
            <CalendarOff className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">No shifts available</p>
            <p className="text-muted-foreground mb-4">
              {searchTerm || departmentFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'When colleagues post shifts for swap, they\'ll appear here'}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button variant="outline" onClick={() => loadShifts()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                <Link href="/dashboard/post">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Post a Shift
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
