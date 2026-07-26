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
import { Separator } from '@/components/ui/separator'
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  CalendarCheck,
  CalendarX,
  CheckCircle2,
  Users
} from 'lucide-react'
import type { Shift } from '@/lib/types'
import { formatDate, formatTime } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

type ViewMode = 'my-shifts' | 'all-shifts' | 'available'

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

      const { data: allShifts } = await supabase
        .from('shifts')
        .select('*')
        .order('date', { ascending: true })
        .order('start_time', { ascending: true })

      if (allShifts) {
        const uniqueUserIds = [...new Set(allShifts.map(s => s.user_id))]
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .in('id', uniqueUserIds)
        
        const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])
        const shiftsWithUsers = allShifts.map(shift => ({
          ...shift,
          user: profileMap.get(shift.user_id)
        }))
        
        setShifts(shiftsWithUsers)
        const myIds = new Set(shiftsWithUsers.filter(s => s.user_id === user.id).map(s => s.id))
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

  const shiftsByDate = useMemo(() => {
    const grouped: Record<string, Shift[]> = {}
    filteredShifts.forEach(shift => {
      const dateKey = shift.date
      if (!grouped[dateKey]) grouped[dateKey] = []
      grouped[dateKey].push(shift)
    })
    return grouped
  }, [filteredShifts])

  const selectedDateShifts = useMemo(() => {
    if (!selectedDate) return []
    const dateKey = formatDate(selectedDate.toISOString(), 'yyyy-MM-dd')
    return shiftsByDate[dateKey] || []
  }, [selectedDate, shiftsByDate])

  const hasShifts = (date: Date) => {
    const dateKey = formatDate(date.toISOString(), 'yyyy-MM-dd')
    return (shiftsByDate[dateKey]?.length || 0) > 0
  }

  const hasOpenShifts = (date: Date) => {
    const dateKey = formatDate(date.toISOString(), 'yyyy-MM-dd')
    const dateShifts = shiftsByDate[dateKey] || []
    return dateShifts.some(s => s.status === 'open' || s.status === 'scheduled')
  }

  const getStatusConfig = (status: string, isOwn: boolean) => {
    if (isOwn) return { 
      bg: 'bg-gradient-to-br from-blue-600/20 to-blue-800/20', 
      border: 'border-blue-500/40',
      text: 'text-blue-400',
      icon: <CalendarCheck className="w-3 h-3" />
    }
    switch (status) {
      case 'open':
        return { 
          bg: 'bg-gradient-to-br from-emerald-500/20 to-emerald-700/20', 
          border: 'border-emerald-500/40',
          text: 'text-emerald-400',
          icon: <ArrowRightLeft className="w-3 h-3" />
        }
      case 'scheduled':
        return { 
          bg: 'bg-gradient-to-br from-amber-500/20 to-amber-700/20', 
          border: 'border-amber-500/40',
          text: 'text-amber-400',
          icon: <Clock className="w-3 h-3" />
        }
      case 'filled':
        return { 
          bg: 'bg-gradient-to-br from-green-500/20 to-green-700/20', 
          border: 'border-green-500/40',
          text: 'text-green-400',
          icon: <CheckCircle2 className="w-3 h-3" />
        }
      case 'completed':
        return { 
          bg: 'bg-gradient-to-br from-zinc-500/20 to-zinc-600/20', 
          border: 'border-zinc-500/40',
          text: 'text-zinc-400',
          icon: <CalendarCheck className="w-3 h-3" />
        }
      default:
        return { 
          bg: 'bg-gradient-to-br from-zinc-500/20 to-zinc-600/20', 
          border: 'border-zinc-500/40',
          text: 'text-zinc-400',
          icon: <CalendarX className="w-3 h-3" />
        }
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
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-72" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-[420px] w-full rounded-xl" />
          </div>
          <Skeleton className="h-[420px] w-full rounded-xl" />
        </div>
      </div>
    )
  }

  const totalShifts = filteredShifts.length
  const openShifts = filteredShifts.filter(s => s.status === 'open' || s.status === 'scheduled').length
  const myShiftsCount = filteredShifts.filter(s => myShiftIds.has(s.id)).length

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Shift Calendar</h1>
        <p className="text-muted-foreground">
          View and manage your work schedule. Click on a date to see shift details.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalShifts}</p>
                <p className="text-xs text-muted-foreground">Total Shifts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <ArrowRightLeft className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{openShifts}</p>
                <p className="text-xs text-muted-foreground">Available for Swap</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{myShiftsCount}</p>
                <p className="text-xs text-muted-foreground">Your Shifts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Section */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-card border-border/50 shadow-sm">
            <CardHeader className="pb-4 border-b border-border/50">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-primary" />
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </CardTitle>
                  <CardDescription>Select a date to view shift details</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={goToToday} className="gap-2">
                    <CalendarCheck className="w-4 h-4" />
                    Today
                  </Button>
                  <div className="flex">
                    <Button variant="outline" size="icon" className="rounded-r-none" onClick={goToPreviousMonth}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-l-none border-l-0" onClick={goToNextMonth}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)} className="mb-6">
                <TabsList className="grid w-full grid-cols-3 h-10">
                  <TabsTrigger value="my-shifts" className="gap-2 text-xs sm:text-sm">
                    <Users className="w-4 h-4" />
                    <span className="hidden sm:inline">My Shifts</span>
                  </TabsTrigger>
                  <TabsTrigger value="all-shifts" className="gap-2 text-xs sm:text-sm">
                    <Briefcase className="w-4 h-4" />
                    <span className="hidden sm:inline">All Shifts</span>
                  </TabsTrigger>
                  <TabsTrigger value="available" className="gap-2 text-xs sm:text-sm">
                    <ArrowRightLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Available</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
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
                  hasShifts: 'bg-emerald-500/10 hover:bg-emerald-500/20',
                  hasOpenShifts: 'bg-emerald-500/20 border-2 border-emerald-500/50 font-semibold',
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
                            'w-full h-full p-0 text-sm flex flex-col items-center justify-center rounded-lg transition-all duration-200',
                            modifiers.today && 'bg-primary/10 text-primary font-semibold',
                            modifiers.selected && 'bg-primary text-primary-foreground font-semibold shadow-md',
                            !modifiers.selected && !modifiers.disabled && 'hover:bg-accent/50'
                          )}
                          {...props}
                        >
                          <span>{day.date.getDate()}</span>
                          {shiftCount > 0 && (
                            <div className="flex gap-0.5 mt-1">
                              <span className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                openCount > 0 ? "bg-emerald-500" : "bg-amber-500"
                              )} />
                              {openCount > 0 && openCount < shiftCount && (
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500/70" />
                              )}
                            </div>
                          )}
                        </button>
                      </div>
                    )
                  }
                }}
              />

              <Separator className="my-6" />

              <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span>Has shifts</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-emerald-500/50" />
                  <span>Open for swap</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <span>Scheduled only</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Selected Date Shifts Panel */}
        <div className="space-y-4">
          <Card className="bg-card border-border/50 shadow-sm">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                {selectedDate 
                  ? formatDate(selectedDate.toISOString(), 'EEEE, MMMM d')
                  : 'Select a date'}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                {selectedDateShifts.length > 0 ? (
                  <>
                    <span className="inline-flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      {selectedDateShifts.length} shift{selectedDateShifts.length > 1 ? 's' : ''}
                    </span>
                    <span className="text-primary/60">•</span>
                    <span className="inline-flex items-center gap-1">
                      <ArrowRightLeft className="w-3 h-3" />
                      {selectedDateShifts.filter(s => s.status === 'open' || s.status === 'scheduled').length} available
                    </span>
                  </>
                ) : (
                  'No shifts on this date'
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {selectedDateShifts.length > 0 ? (
                selectedDateShifts.map((shift) => {
                  const isOwn = myShiftIds.has(shift.id)
                  const statusConfig = getStatusConfig(shift.status, isOwn)
                  return (
                    <div
                      key={shift.id}
                      className={cn(
                        'p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-md',
                        statusConfig.bg,
                        statusConfig.border,
                        isOwn ? 'ring-2 ring-blue-500/30' : ''
                      )}
                      onClick={() => setSelectedShift(shift)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-sm">{shift.position}</p>
                          <p className="text-xs text-muted-foreground">{shift.department}</p>
                        </div>
                        <Badge variant="outline" className={cn('gap-1 text-xs', statusConfig.bg, statusConfig.border, statusConfig.text)}>
                          {statusConfig.icon}
                          {isOwn ? 'Mine' : shift.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4 text-foreground/50" />
                          <span className="font-medium">{formatTime(shift.start_time)} - {formatTime(shift.end_time)}</span>
                        </div>
                        {shift.location && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="w-4 h-4 text-foreground/50" />
                            <span>{shift.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="w-4 h-4 text-foreground/50" />
                          <span>{shift.user?.full_name || 'Unknown'}</span>
                        </div>
                      </div>

                      {!isOwn && (shift.status === 'open' || shift.status === 'scheduled') && (
                        <Button 
                          size="sm" 
                          className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 gap-2"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedShift(shift)
                          }}
                        >
                          <ArrowRightLeft className="w-4 h-4" />
                          Request Swap
                        </Button>
                      )}
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-12 space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
                    <CalendarX className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm text-muted-foreground">No shifts scheduled</p>
                  <p className="text-xs text-muted-foreground">Select another date to view shifts</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Swap Request Dialog */}
      <Dialog open={!!selectedShift && !myShiftIds.has(selectedShift?.id || '')} onOpenChange={() => setSelectedShift(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-primary" />
              Request Shift Swap
            </DialogTitle>
            <DialogDescription>
              Send a request to swap this shift. A manager will need to approve the swap.
            </DialogDescription>
          </DialogHeader>
          
          {selectedShift && (
            <div className="space-y-4">
              <div className={cn(
                'p-4 rounded-xl border space-y-3',
                getStatusConfig(selectedShift.status, false).bg,
                getStatusConfig(selectedShift.status, false).border
              )}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{selectedShift.position}</span>
                  <Badge variant="outline" className={cn(
                    getStatusConfig(selectedShift.status, false).bg,
                    getStatusConfig(selectedShift.status, false).border,
                    getStatusConfig(selectedShift.status, false).text
                  )}>
                    {selectedShift.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarIcon className="w-4 h-4" />
                    {formatDate(selectedShift.date, 'MMM d, yyyy')}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {formatTime(selectedShift.start_time)} - {formatTime(selectedShift.end_time)}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {selectedShift.location || 'N/A'}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="w-4 h-4" />
                    {selectedShift.user?.full_name || 'Unknown'}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-sm font-medium">Message (optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Add a note to your swap request..."
                  value={swapMessage}
                  onChange={(e) => setSwapMessage(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelectedShift(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleRequestSwap}
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700 gap-2"
            >
              {submitting ? 'Sending...' : (
                <>
                  <ArrowRightLeft className="w-4 h-4" />
                  Send Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
