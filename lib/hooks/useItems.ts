'use client'

import { useQuery } from '@tanstack/react-query'
import { apiGet, type ApiQueryParams } from '@/lib/api/client'
import { queryKeys } from '@/lib/queryKeys'
import type { Item, ExpiringItem } from '@/lib/types'

interface ItemsParams {
  location_id?: string | null
  filter?: string
}

async function fetchItems(params: ItemsParams = {}): Promise<Item[]> {
  return apiGet<Item[]>(
    '/api/items',
    params as ApiQueryParams,
    '물품 목록을 불러오지 못했습니다'
  ).then((data) => data ?? [])
}

export function useItems(params: ItemsParams = {}) {
  return useQuery({
    queryKey: queryKeys.items.list(params),
    queryFn: () => fetchItems(params),
  })
}

async function fetchExpiringItems(): Promise<ExpiringItem[]> {
  return apiGet<ExpiringItem[]>(
    '/api/items/expiring',
    undefined,
    '유통기한 임박 물품을 불러오지 못했습니다'
  ).then((data) => data ?? [])
}

export function useExpiringItems() {
  return useQuery({
    queryKey: queryKeys.items.expiring(),
    queryFn: fetchExpiringItems,
  })
}
