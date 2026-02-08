'use client'

import { useQuery } from '@tanstack/react-query'
import type { Item, ExpiringItem } from '@/lib/types'

interface ItemsParams {
  location_id?: string | null
  filter?: string
}

async function fetchItems(params: ItemsParams = {}): Promise<Item[]> {
  const searchParams = new URLSearchParams()
  
  if (params.location_id) {
    searchParams.append('location_id', params.location_id)
  }
  
  if (params.filter) {
    searchParams.append('filter', params.filter)
  }

  const response = await fetch(`/api/items?${searchParams.toString()}`)
  const result = await response.json()

  if (!result.success) {
    throw new Error(result.error?.message || 'Failed to fetch items')
  }

  return result.data || []
}

export function useItems(params: ItemsParams = {}) {
  return useQuery({
    queryKey: ['items', params],
    queryFn: () => fetchItems(params),
  })
}

async function fetchExpiringItems(): Promise<ExpiringItem[]> {
  const response = await fetch('/api/items/expiring')
  const result = await response.json()

  if (!result.success) {
    throw new Error(result.error?.message || 'Failed to fetch expiring items')
  }

  return result.data || []
}

export function useExpiringItems() {
  return useQuery({
    queryKey: ['items', 'expiring'],
    queryFn: fetchExpiringItems,
  })
}
