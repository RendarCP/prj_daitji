'use client'

import { useQuery } from '@tanstack/react-query'
import type { DashboardOverviewResponse, Item, Location } from '@/lib/types'

async function fetchDashboardStats(): Promise<DashboardOverviewResponse> {
  const response = await fetch('/api/stats/dashboard')
  const result = await response.json()

  if (!result.success) {
    throw new Error(result.error?.message || '대시보드 통계를 불러오지 못했습니다')
  }

  return result.data
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: fetchDashboardStats,
  })
}

async function fetchRecentItems(): Promise<Item[]> {
  const response = await fetch('/api/items?sort=created_at&limit=5')
  const result = await response.json()

  if (!result.success) {
    throw new Error(result.error?.message || '최근 물품을 불러오지 못했습니다')
  }

  return result.data || []
}

export function useRecentItems() {
  return useQuery({
    queryKey: ['items', 'recent'],
    queryFn: fetchRecentItems,
  })
}

async function fetchLocationSummary(): Promise<Location[]> {
  const response = await fetch('/api/locations?tree=true')
  const result = await response.json()

  if (!result.success) {
    throw new Error(result.error?.message || '위치 요약 정보를 불러오지 못했습니다')
  }

  return result.data || []
}

export function useLocationSummary() {
  return useQuery({
    queryKey: ['locations', 'summary'],
    queryFn: fetchLocationSummary,
  })
}
