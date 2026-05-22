'use client'

import { useState, useMemo } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import { ShiftCard } from '@/components/shifts/shift-card'
import { ShiftFilters, type FilterState } from '@/components/shifts/shift-filters'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, SlidersHorizontal, Loader2 } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import type { Shift } from '@/lib/types'

const fetcher = async () => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('shifts')
    .select('*')
    .eq('status', 'open')
    .order('shift_date', { ascending: true })
  
  if (error) throw error
  return data as Shift[]
}

export default function BrowseShiftsPage() {
  const { data: shifts, isLoading, error } = useSWR('browse-shifts', fetcher)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterState>({
    dateRange: undefined,
    roleTypes: [],
    locations: [],
    payRange: [0, 100],
    shiftTypes: [],
  })
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // Extract unique values for filter options
  const filterOptions = useMemo(() => {
    if (!shifts) return { roleTypes: [], locations: [] }
    
    const roleTypes = [...new Set(shifts.map(s => s.role_type).filter(Boolean))]
    const locations = [...new Set(shifts.map(s => s.location).filter(Boolean))]
    
    return { roleTypes, locations }
  }, [shifts])

  // Apply filters
  const filteredShifts = useMemo(() => {
    if (!shifts) return []
    
    return shifts.filter(shift => {
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch = 
          shift.title.toLowerCase().includes(query) ||
          shift.location.toLowerCase().includes(query) ||
          shift.role_type.toLowerCase().includes(query) ||
          shift.description?.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      // Date range filter
      if (filters.dateRange?.from) {
        const shiftDate = new Date(shift.shift_date)
        if (shiftDate < filters.dateRange.from) return false
        if (filters.dateRange.to && shiftDate > filters.dateRange.to) return false
      }

      // Role type filter
      if (filters.roleTypes.length > 0) {
        if (!filters.roleTypes.includes(shift.role_type)) return false
      }

      // Location filter
      if (filters.locations.length > 0) {
        if (!filters.locations.includes(shift.location)) return false
      }

      // Pay range filter
      if (shift.pay_rate !== null) {
        if (shift.pay_rate < filters.payRange[0] || shift.pay_rate > filters.payRange[1]) {
          return false
        }
      }

      // Shift type filter
      if (filters.shiftTypes.length > 0) {
        if (!filters.shiftTypes.includes(shift.shift_type)) return false
      }

      return true
    })
  }, [shifts, searchQuery, filters])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.dateRange?.from) count++
    if (filters.roleTypes.length > 0) count++
    if (filters.locations.length > 0) count++
    if (filters.payRange[0] > 0 || filters.payRange[1] < 100) count++
    if (filters.shiftTypes.length > 0) count++
    return count
  }, [filters])

  const clearFilters = () => {
    setFilters({
      dateRange: undefined,
      roleTypes: [],
      locations: [],
      payRange: [0, 100],
      shiftTypes: [],
    })
    setSearchQuery('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Browse Shifts</h1>
        <p className="text-muted-foreground mt-1">
          Find available shifts that match your schedule and preferences.
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, location, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card/50 border-border/50"
          />
        </div>
        
        {/* Mobile Filter Button */}
        <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="lg:hidden relative">
              <SlidersHorizontal className="size-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 size-5 rounded-full bg-teal-500 text-[10px] font-medium text-white flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:w-96 overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <ShiftFilters
                filters={filters}
                onFiltersChange={setFilters}
                roleTypes={filterOptions.roleTypes}
                locations={filterOptions.locations}
              />
              <div className="mt-6 flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={clearFilters}
                >
                  Clear All
                </Button>
                <Button 
                  className="flex-1 bg-teal-600 hover:bg-teal-700"
                  onClick={() => setMobileFiltersOpen(false)}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex gap-6">
        {/* Desktop Filters Sidebar */}
        <aside className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Filters</h2>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-teal-500">
                  Clear all
                </Button>
              )}
            </div>
            <ShiftFilters
              filters={filters}
              onFiltersChange={setFilters}
              roleTypes={filterOptions.roleTypes}
              locations={filterOptions.locations}
            />
          </div>
        </aside>

        {/* Shifts Grid */}
        <div className="flex-1 min-w-0">
          {/* Results count */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {isLoading ? (
                'Loading shifts...'
              ) : (
                <>
                  Showing <span className="font-medium text-foreground">{filteredShifts.length}</span>
                  {' '}shift{filteredShifts.length !== 1 ? 's' : ''}
                </>
              )}
            </p>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-8 animate-spin text-teal-500" />
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="text-center py-12">
              <p className="text-destructive">Failed to load shifts. Please try again.</p>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && filteredShifts.length === 0 && (
            <div className="text-center py-12 px-4">
              <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Search className="size-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">No shifts found</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                {searchQuery || activeFilterCount > 0
                  ? 'Try adjusting your search or filters to find more shifts.'
                  : 'There are no open shifts available at the moment. Check back later!'}
              </p>
              {(searchQuery || activeFilterCount > 0) && (
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </div>
          )}

          {/* Shifts grid */}
          {!isLoading && !error && filteredShifts.length > 0 && (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredShifts.map((shift) => (
                <ShiftCard key={shift.id} shift={shift} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
