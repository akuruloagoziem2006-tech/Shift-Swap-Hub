'use client'

import { format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DateRange } from 'react-day-picker'

export interface FilterState {
  dateRange: DateRange | undefined
  roleTypes: string[]
  locations: string[]
  payRange: [number, number]
  shiftTypes: string[]
}

interface ShiftFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  roleTypes: string[]
  locations: string[]
}

const shiftTypeOptions = [
  { value: 'swap', label: 'Swap' },
  { value: 'cover', label: 'Cover' },
  { value: 'pickup', label: 'Pick Up' },
]

export function ShiftFilters({ 
  filters, 
  onFiltersChange, 
  roleTypes, 
  locations 
}: ShiftFiltersProps) {
  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const toggleArrayFilter = (key: 'roleTypes' | 'locations' | 'shiftTypes', value: string) => {
    const current = filters[key]
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value]
    updateFilter(key, updated)
  }

  return (
    <div className="space-y-6">
      {/* Date Range */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">Date Range</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal bg-card/50',
                !filters.dateRange && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 size-4" />
              {filters.dateRange?.from ? (
                filters.dateRange.to ? (
                  <>
                    {format(filters.dateRange.from, 'LLL dd')} - {format(filters.dateRange.to, 'LLL dd')}
                  </>
                ) : (
                  format(filters.dateRange.from, 'LLL dd, y')
                )
              ) : (
                <span>Select dates</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={filters.dateRange?.from}
              selected={filters.dateRange}
              onSelect={(range) => updateFilter('dateRange', range)}
              numberOfMonths={1}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Shift Type */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">Shift Type</Label>
        <div className="space-y-2">
          {shiftTypeOptions.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <Checkbox
                checked={filters.shiftTypes.includes(option.value)}
                onCheckedChange={() => toggleArrayFilter('shiftTypes', option.value)}
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Role Type */}
      {roleTypes.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">Role</Label>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {roleTypes.map((role) => (
              <label
                key={role}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <Checkbox
                  checked={filters.roleTypes.includes(role)}
                  onCheckedChange={() => toggleArrayFilter('roleTypes', role)}
                />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  {role}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Location */}
      {locations.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">Location</Label>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {locations.map((location) => (
              <label
                key={location}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <Checkbox
                  checked={filters.locations.includes(location)}
                  onCheckedChange={() => toggleArrayFilter('locations', location)}
                />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors truncate">
                  {location}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Pay Range */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-foreground">Pay Rate ($/hr)</Label>
          <span className="text-sm text-muted-foreground">
            ${filters.payRange[0]} - ${filters.payRange[1]}+
          </span>
        </div>
        <Slider
          value={filters.payRange}
          onValueChange={(value) => updateFilter('payRange', value as [number, number])}
          min={0}
          max={100}
          step={5}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>$0</span>
          <span>$100+</span>
        </div>
      </div>
    </div>
  )
}
