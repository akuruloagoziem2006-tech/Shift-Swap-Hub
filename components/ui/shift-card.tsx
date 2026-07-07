'use client'

import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  DollarSign, 
  Sparkles,
  ArrowRight,
  Briefcase
} from 'lucide-react'
import type { Shift } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ShiftCardProps {
  shift: Shift
  onRequestSwap?: (shift: Shift) => void
}

export function ShiftCard({ shift, onRequestSwap }: ShiftCardProps) {
  const shiftTypeLabels: Record<string, { label: string; color: string }> = {
    swap: { label: 'Swap', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    cover: { label: 'Cover', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    pickup: { label: 'Pick Up', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  }

  const typeInfo = shiftTypeLabels[shift.shift_type] || shiftTypeLabels.swap
  const isAIMatch = shift.ai_match_score && shift.ai_match_score >= 80

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  return (
    <Card className={cn(
      'bg-card/50 border-border/50 hover:border-teal-500/30 transition-all duration-200 group',
      isAIMatch && 'ring-1 ring-teal-500/20'
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-teal-500 transition-colors">
              {shift.title}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={typeInfo.color}>
                {typeInfo.label}
              </Badge>
              {isAIMatch && (
                <Badge className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-0 gap-1">
                  <Sparkles className="size-3" />
                  AI Match {shift.ai_match_score}%
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-4">
        {shift.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {shift.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="size-4 text-teal-500/70" />
            <span>{format(new Date(shift.shift_date), 'MMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="size-4 text-teal-500/70" />
            <span>{formatTime(shift.start_time)} - {formatTime(shift.end_time)}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="size-4 text-teal-500/70" />
            <span className="truncate">{shift.location}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Briefcase className="size-4 text-teal-500/70" />
            <span className="truncate">{shift.role_type}</span>
          </div>
        </div>

        {shift.pay_rate && (
          <div className="flex items-center gap-2 pt-2 border-t border-border/50">
            <DollarSign className="size-4 text-green-500" />
            <span className="font-semibold text-foreground">${shift.pay_rate}/hr</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <Button 
          className="w-full bg-teal-600 hover:bg-teal-700 group/btn"
          onClick={() => onRequestSwap?.(shift)}
        >
          Request Shift
          <ArrowRight className="size-4 ml-2 group-hover/btn:translate-x-0.5 transition-transform" />
        </Button>
      </CardFooter>
    </Card>
  )
}
