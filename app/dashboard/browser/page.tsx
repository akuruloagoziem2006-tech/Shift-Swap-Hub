'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar, MapPin, Clock, Search, Filter, User } from 'lucide-react'
import type { Shift, Profile } from '@/lib/types'
import { formatDate, formatTime } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

export default function BrowseShifts() {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [requestingShift, setRequestingShift] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUserId(user.id)
        }

        const { data, error } = await supabase
          .from('shifts')
          .select('*, user:profiles(*)')
          .eq('status', 'open')
          .order('date', { ascending: true })

        if (!error && data) {
          setShifts(data)
        }
      } catch (error) {
        console.error('Error loading shifts:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
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
            <p className="text-zinc-400 mb-2">No shifts found matching your criteria.</p>
            <Button variant="outline" onClick={() => { setSearchTerm(''); setDepartmentFilter('all'); }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
