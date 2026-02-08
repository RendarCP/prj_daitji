'use client'

import { useQuery } from '@tanstack/react-query'
import type { DashboardStats, Item, Location } from '@/lib/types'

async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await fetch('/api/stats/dashboard')
  const result = await response.json()

  if (!result.success) {
    throw new Error(result.error?.message || 'Failed to fetch dashboard stats')
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
    throw new Error(result.error?.message || 'Failed to fetch recent items')
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
    throw new Error(result.error?.message || 'Failed to fetch location summary')
  }

  return result.data || []
}

export function useLocationSummary() {
  return useQuery({
    queryKey: ['locations', 'summary'],
    queryFn: fetchLocationSummary,
  })
}
