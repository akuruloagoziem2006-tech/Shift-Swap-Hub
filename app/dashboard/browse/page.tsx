'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Calendar, MapPin, Clock, Search, User, RefreshCw, Filter } from 'lucide-react'
import type { Shift } from '@/lib/types'
import { useToast } from '@/components/ui/use-toast'

// Format time for display (handles HH:MM:SS and HH:MM)
function formatTimeDisplay(time: string | null): string {
  if (!time) return 'N/A'
  const parts = time.split(':')
  const hours = parseInt(parts[0], 10)
  const minutes = parts[1] || '00'
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const hour12 = hours % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}

// Format date for display
function formatDateDisplay(date: string): string {
  if (!date) return 'N/A'
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export default function BrowseShifts() {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [requestingShift, setRequestingShift] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = createClient()
  const { toast } = useToast()

  async function loadShifts() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
      }

      // Query all shifts with open status - without join first
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
        console.log('Loaded shifts:', data?.length || 0)
        
        // Now fetch profiles separately for each shift owner
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
        title: 'Request sent!',
        description: 'Your swap request has been sent to the shift owner.',
      })

      // Remove the shift from the list or update its status
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
        <div className="flex gap-4 mb-6">
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
      <h1 className="text-3xl font-bold mb-8">Browse Shifts</h1>

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
        <div className="grid gap-6">
          {filteredShifts.map((shift) => (
            <Card key={shift.id} className="bg-zinc-950 border-zinc-800">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="outline" className="bg-teal-500/10 text-teal-500 border-teal-500/20 mb-2">
                      {shift.status}
                    </Badge>
                    <CardTitle className="text-xl">{shift.position}</CardTitle>
                  </div>
                  <Badge variant="secondary">{shift.department}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-teal-500" />
                    <span>{formatDateDisplay(shift.date)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-teal-500" />
                    <span>{formatTimeDisplay(shift.start_time)} - {formatTimeDisplay(shift.end_time)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-teal-500" />
                    <span>{shift.location || 'No location'}</span>
                  </div>
                </div>

                {shift.user && (
                  <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Posted by: {shift.user.full_name || 'Unknown'}</p>
                      {shift.notes && (
                        <p className="text-sm text-muted-foreground">{shift.notes}</p>
                      )}
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full bg-teal-600 hover:bg-teal-700"
                  onClick={() => handleRequestSwap(shift)}
                  disabled={requestingShift === shift.id || shift.user_id === userId}
                >
                  {requestingShift === shift.id ? 'Sending Request...' : 
                   shift.user_id === userId ? 'Your Shift' : 'Request Swap'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-zinc-950 border-zinc-800">
          <CardContent className="p-12 text-center">
            <p className="text-zinc-400 mb-2">No open shifts available.</p>
            <p className="text-zinc-500 text-sm mb-4">Post a shift to make it available for swap.</p>
            <Button variant="outline" onClick={() => loadShifts()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
