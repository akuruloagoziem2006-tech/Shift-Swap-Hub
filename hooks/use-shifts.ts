'use client'

import useSWR from 'swr'
import type { Shift } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface UseShiftsOptions {
  status?: Shift['status']
  department?: string
  date?: string
}

export function useShifts(options: UseShiftsOptions = {}) {
  const params = new URLSearchParams()
  if (options.status) params.set('status', options.status)
  if (options.department) params.set('department', options.department)
  if (options.date) params.set('date', options.date)

  const queryString = params.toString()
  const url = `/api/shifts${queryString ? `?${queryString}` : ''}`

  const { data, error, isLoading, mutate } = useSWR<Shift[]>(url, fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 30000, // Refresh every 30 seconds
  })

  return {
    shifts: data,
    isLoading,
    isError: error,
    mutate,
  }
}

export function useShift(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Shift>(
    id ? `/api/shifts/${id}` : null,
    fetcher
  )

  return {
    shift: data,
    isLoading,
    isError: error,
    mutate,
  }
}
