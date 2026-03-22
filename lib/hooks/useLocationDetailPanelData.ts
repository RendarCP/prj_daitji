'use client'

import { useQueries } from '@tanstack/react-query'
import type { Item, Location } from '@/lib/types'
import { queryKeys } from '@/lib/queryKeys'

async function fetchSubLocations(locationId: string): Promise<Location[]> {
  const searchParams = new URLSearchParams({
    parent_id: locationId,
  })
  const response = await fetch(`/api/locations?${searchParams.toString()}`)
  const result = await response.json()

  if (!result.success) {
    throw new Error(result.error?.message || '하위 위치를 불러오지 못했습니다')
  }

  return result.data || []
}

async function fetchLocationItems(locationId: string): Promise<Item[]> {
  const searchParams = new URLSearchParams({
    location_id: locationId,
  })
  const response = await fetch(`/api/items?${searchParams.toString()}`)
  const result = await response.json()

  if (!result.success) {
    throw new Error(result.error?.message || '물품 목록을 불러오지 못했습니다')
  }

  return result.data || []
}

export function useLocationDetailPanelData(locationId: string | null, enabled: boolean) {
  const [subLocationsQuery, itemsQuery] = useQueries({
    queries: [
      {
        queryKey: queryKeys.locations.list({ parent_id: locationId }),
        queryFn: () => fetchSubLocations(locationId!),
        enabled,
      },
      {
        queryKey: queryKeys.items.list({ location_id: locationId }),
        queryFn: () => fetchLocationItems(locationId!),
        enabled,
      },
    ],
  })

  return {
    subLocations: subLocationsQuery.data ?? [],
    items: itemsQuery.data ?? [],
    isLoading: subLocationsQuery.isLoading || itemsQuery.isLoading,
    isFetching: subLocationsQuery.isFetching || itemsQuery.isFetching,
    isError: subLocationsQuery.isError || itemsQuery.isError,
    error:
      subLocationsQuery.error ??
      itemsQuery.error ??
      null,
    refetch: async () => {
      await Promise.all([subLocationsQuery.refetch(), itemsQuery.refetch()])
    },
  }
}
