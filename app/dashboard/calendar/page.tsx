'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react'
import type { Shift, ShiftSwapRequest } from '@/lib/types'
import { formatDate, formatTime } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

type ViewMode = 'my-shifts' | 'all-shifts' | 'available'

interface DayShifts {
  date: string
  shifts: Shift[]
}

export default function CalendarPage() {
  const [loading, setLoading] = useState(true)
  const [shifts, setShifts] = useState<Shift[]>([])
  const [myShiftIds, setMyShiftIds] = useState<Set<string>>(new Set())
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('all-shifts')
  const [swapMessage, setSwapMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    loadShifts()
  }, [])

  async function loadShifts() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get all shifts
      const { data: allShifts } = await supabase
        .from('shifts')
        .select(`
          *,
          user:profiles(*)
        `)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true })

      if (allShifts) {
        setShifts(allShifts)
        // Track user's own shifts
        const myIds = new Set(allShifts.filter(s => s.user_id === user.id).map(s => s.id))
        setMyShiftIds(myIds)
      }
    } catch (error) {
      console.error('Error loading shifts:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredShifts = useMemo(() => {
    switch (viewMode) {
      case 'my-shifts':
        return shifts.filter(s => myShiftIds.has(s.id))
      case 'available':
        return shifts.filter(s => s.status === 'open' || s.status === 'scheduled')
      default:
        return shifts
    }
  }, [shifts, viewMode, myShiftIds])

  // Group shifts by date
  const shiftsByDate = useMemo(() => {
    const grouped: Record<string, Shift[]> = {}
    filteredShifts.forEach(shift => {
      const dateKey = shift.date
      if (!grouped[dateKey]) grouped[dateKey] = []
      grouped[dateKey].push(shift)
    })
    return grouped
  }, [filteredShifts])

  // Get shifts for selected date
  const selectedDateShifts = useMemo(() => {
    if (!selectedDate) return []
    const dateKey = formatDate(selectedDate.toISOString(), 'yyyy-MM-dd')
    return shiftsByDate[dateKey] || []
  }, [selectedDate, shiftsByDate])

  // Check if a date has shifts
  const hasShifts = (date: Date) => {
    const dateKey = formatDate(date.toISOString(), 'yyyy-MM-dd')
    return (shiftsByDate[dateKey]?.length || 0) > 0
  }

  // Check if a date has open shifts
  const hasOpenShifts = (date: Date) => {
    const dateKey = formatDate(date.toISOString(), 'yyyy-MM-dd')
    const dateShifts = shiftsByDate[dateKey] || []
    return dateShifts.some(s => s.status === 'open' || s.status === 'scheduled')
  }

  // Get badge color based on status
  const getStatusColor = (status: string, isOwn: boolean) => {
    if (isOwn) return 'bg-blue-500/20 text-blue-400 border-blue-500'
    switch (status) {
      case 'open':
        return 'bg-teal-500/20 text-teal-400 border-teal-500'
      case 'scheduled':
        return 'bg-amber-500/20 text-amber-400 border-amber-500'
      case 'filled':
        return 'bg-green-500/20 text-green-400 border-green-500'
      case 'completed':
        return 'bg-gray-500/20 text-gray-400 border-gray-500'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500'
    }
  }

  async function handleRequestSwap() {
    if (!selectedShift) return
    
    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.from('shift_swap_requests').insert({
        shift_id: selectedShift.id,
        requester_id: user.id,
        target_user_id: selectedShift.user_id,
        message: swapMessage || null,
        status: 'pending'
      })

      if (error) throw error

      toast({
        title: 'Swap request sent!',
        description: 'Your request has been submitted for manager approval.',
      })

      setSelectedShift(null)
      setSwapMessage('')
    } catch (error) {
      console.error('Error requesting swap:', error)
      toast({
        title: 'Error',
        description: 'Failed to send swap request. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentMonth(new Date())
    setSelectedDate(new Date())
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <Skeleton className="h-10 w-64 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Shift Calendar</h1>
        <p className="text-zinc-400">
          View and manage shifts. Click on a date to see shifts and request swaps.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card className="bg-zinc-950 border-zinc-800">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Calendar</CardTitle>
                  <CardDescription>Navigate months and click dates to view shifts</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={goToToday}>
                    Today
                  </Button>
                  <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={goToNextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)} className="w-auto">
                  <TabsList className="h-8">
                    <TabsTrigger value="my-shifts" className="text-xs px-2 py-1">My Shifts</TabsTrigger>
                    <TabsTrigger value="all-shifts" className="text-xs px-2 py-1">All</TabsTrigger>
                    <TabsTrigger value="available" className="text-xs px-2 py-1">Available</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                className="w-full"
                modifiers={{
                  hasShifts: (date) => hasShifts(date),
                  hasOpenShifts: (date) => hasOpenShifts(date),
                }}
                modifiersClassNames={{
                  hasShifts: 'bg-teal-500/10',
                  hasOpenShifts: 'bg-teal-500/20 border border-teal-500/50',
                }}
                components={{
                  DayButton: ({ day, modifiers, ...props }) => {
                    const dateKey = formatDate(day.date.toISOString(), 'yyyy-MM-dd')
                    const dayShifts = shiftsByDate[dateKey] || []
                    const shiftCount = dayShifts.length
                    const openCount = dayShifts.filter(s => s.status === 'open' || s.status === 'scheduled').length
                    
                    return (
                      <div className="relative w-full h-full">
                        <button
                          className={cn(
                            'w-full h-full p-0 text-sm flex flex-col items-center justify-center rounded-md transition-colors',
                            modifiers.today && 'bg-accent',
                            modifiers.selected && 'bg-primary text-primary-foreground',
                            !modifiers.selected && !modifiers.disabled && 'hover:bg-accent'
                          )}
                          {...props}
                        >
                          <span>{day.number}</span>
                          {shiftCount > 0 && (
                            <div className="flex gap-0.5 mt-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                              {openCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                            </div>
                          )}
                        </button>
                      </div>
                    )
                  }
                }}
              />

              <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-teal-500" />
                  Has shifts
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Has open shifts
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Selected Date Shifts */}
        <div>
          <Card className="bg-zinc-950 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                {selectedDate 
                  ? formatDate(selectedDate.toISOString(), 'EEEE, MMMM d')
                  : 'Select a date'}
              </CardTitle>
              <CardDescription>
                {selectedDateShifts.length > 0 
                  ? `${selectedDateShifts.length} shift${selectedDateShifts.length > 1 ? 's' : ''}`
                  : 'No shifts on this date'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedDateShifts.length > 0 ? (
                selectedDateShifts.map((shift) => {
                  const isOwn = myShiftIds.has(shift.id)
                  return (
                    <div
                      key={shift.id}
                      className={cn(
                        'p-3 rounded-lg border transition-colors cursor-pointer',
                        isOwn 
                          ? 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20'
                          : 'bg-secondary/30 border-border hover:bg-secondary/50'
                      )}
                      onClick={() => setSelectedShift(shift)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">{shift.position}</p>
                          <p className="text-sm text-muted-foreground">{shift.department}</p>
                        </div>
                        <Badge className={cn('text-xs', getStatusColor(shift.status, isOwn))}>
                          {isOwn ? 'My Shift' : shift.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{formatTime(shift.start_time)} - {formatTime(shift.end_time)}</span>
                        </div>
                        {shift.location && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            <span>{shift.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="w-3 h-3" />
                          <span>{shift.user?.full_name || 'Unknown'}</span>
                        </div>
                      </div>

                      {!isOwn && (shift.status === 'open' || shift.status === 'scheduled') && (
                        <Button 
                          size="sm" 
                          className="w-full mt-3 bg-teal-600 hover:bg-teal-700"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedShift(shift)
                          }}
                        >
                          <ArrowRightLeft className="w-3 h-3 mr-1" />
                          Request Swap
                        </Button>
                      )}
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No shifts scheduled</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Legend Card */}
          <Card className="bg-zinc-950 border-zinc-800 mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-teal-500" />
                <span>Open shift (available for swap)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span>Scheduled shift</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                <span>Your shift</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500" />
                <span>Filled (swap completed)</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Swap Request Dialog */}
      <Dialog open={!!selectedShift && !myShiftIds.has(selectedShift?.id || '')} onOpenChange={() => setSelectedShift(null)}>
        <DialogContent className="bg-zinc-950 border-zinc-800">
          <DialogHeader>
            <DialogTitle>Request Shift Swap</DialogTitle>
            <DialogDescription>
              Send a request to swap this shift. A manager will need to approve the swap.
            </DialogDescription>
          </DialogHeader>
          
          {selectedShift && (
            <div className="space-y-4">
              <div className="p-4 bg-secondary/30 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{selectedShift.position}</span>
                  <Badge className={getStatusColor(selectedShift.status, false)}>
                    {selectedShift.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    {formatDate(selectedShift.date, 'MMM d, yyyy')}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {formatTime(selectedShift.start_time)} - {formatTime(selectedShift.end_time)}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {selectedShift.location || 'N/A'}
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {selectedShift.user?.full_name || 'Unknown'}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message (optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Add a note to your swap request..."
                  value={swapMessage}
                  onChange={(e) => setSwapMessage(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedShift(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleRequestSwap}
              disabled={submitting}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {submitting ? 'Sending...' : 'Send Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
