'use client'

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
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
    throw new Error(result.error?.message || '물품 목록을 불러오지 못했습니다')
  }

  return result.data || []
}

export function useItems(params: ItemsParams = {}) {
  return useQuery({
    queryKey: queryKeys.items.list(params),
    queryFn: () => fetchItems(params),
  })
}

async function fetchExpiringItems(): Promise<ExpiringItem[]> {
  const response = await fetch('/api/items/expiring')
  const result = await response.json()

  if (!result.success) {
    throw new Error(result.error?.message || '유통기한 임박 물품을 불러오지 못했습니다')
  }

  return result.data || []
}

export function useExpiringItems() {
  return useQuery({
    queryKey: queryKeys.items.expiring(),
    queryFn: fetchExpiringItems,
  })
}
