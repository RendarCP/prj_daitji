'use client'

import { useQuery } from '@tanstack/react-query'
import type { Location } from '@/lib/types'

interface LocationsParams {
  tree?: boolean
  parent_id?: string | null
}

async function fetchLocations(params: LocationsParams = {}): Promise<Location[]> {
  const searchParams = new URLSearchParams()
  
  if (params.tree) {
    searchParams.append('tree', 'true')
  }
  
  if (params.parent_id) {
    searchParams.append('parent_id', params.parent_id)
  }

  const response = await fetch(`/api/locations?${searchParams.toString()}`)
  const result = await response.json()

  if (!result.success) {
    throw new Error(result.error?.message || 'Failed to fetch locations')
  }

  return result.data || []
}

export function useLocations(params: LocationsParams = {}) {
  return useQuery({
    queryKey: ['locations', params],
    queryFn: () => fetchLocations(params),
  })
}

async function fetchLocationPath(locationId: string): Promise<Location[]> {
  const response = await fetch(`/api/locations/${locationId}/path`)
  const result = await response.json()

  if (!result.success) {
    throw new Error(result.error?.message || 'Failed to fetch location path')
  }

  return result.data?.path || []
}

export function useLocationPath(locationId: string | null) {
  return useQuery({
    queryKey: ['location-path', locationId],
    queryFn: () => fetchLocationPath(locationId!),
    enabled: !!locationId,
  })
}
