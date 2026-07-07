'use client'

import useSWR from 'swr'
import type { ShiftSwapRequest } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface UseSwapRequestsOptions {
  status?: ShiftSwapRequest['status']
  userId?: string
}

export function useSwapRequests(options: UseSwapRequestsOptions = {}) {
  const params = new URLSearchParams()
  if (options.status) params.set('status', options.status)
  if (options.userId) params.set('userId', options.userId)

  const queryString = params.toString()
  const url = `/api/swap-requests${queryString ? `?${queryString}` : ''}`

  const { data, error, isLoading, mutate } = useSWR<ShiftSwapRequest[]>(url, fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 30000,
  })

  return {
    requests: data,
    isLoading,
    isError: error,
    mutate,
  }
}

export function useCreateSwapRequest() {
  const createRequest = async (data: {
    shift_id: string
    target_user_id?: string
    message?: string
  }) => {
    const response = await fetch('/api/swap-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create request')
    }

    return response.json()
  }

  return { createRequest }
}

export function useUpdateSwapRequest() {
  const updateRequest = async (data: {
    id: string
    status: ShiftSwapRequest['status']
    target_user_id?: string
  }) => {
    const response = await fetch('/api/swap-requests', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update request')
    }

    return response.json()
  }

  return { updateRequest }
}
