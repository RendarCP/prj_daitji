'use client'

import { useQuery } from '@tanstack/react-query'
import { apiGet } from '@/lib/api/client'
import { queryKeys } from '@/lib/queryKeys'
import type { DashboardOverviewResponse, Item } from '@/lib/types'

async function fetchDashboardStats(): Promise<DashboardOverviewResponse> {
  return apiGet<DashboardOverviewResponse>(
    '/api/stats/dashboard',
    undefined,
    '대시보드 통계를 불러오지 못했습니다'
  )
}

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: fetchDashboardStats,
  })
}

async function fetchRecentItems(): Promise<Item[]> {
  return apiGet<Item[]>(
    '/api/items',
    { sort: 'created_at', limit: 5 },
    '최근 물품을 불러오지 못했습니다'
  ).then((data) => data ?? [])
}

export function useRecentItems() {
  return useQuery({
    queryKey: queryKeys.items.recent(),
    queryFn: fetchRecentItems,
  })
}
