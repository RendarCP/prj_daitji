'use client'

import { useQuery } from '@tanstack/react-query'
import { apiGet, type ApiQueryParams } from '@/lib/api/client'
import { queryKeys } from '@/lib/queryKeys'
import type { Location } from '@/lib/types'

interface LocationsParams {
  tree?: boolean
  parent_id?: string | null
}

async function fetchLocations(params: LocationsParams = {}): Promise<Location[]> {
  return apiGet<Location[]>(
    '/api/locations',
    params as ApiQueryParams,
    '위치 목록을 불러오지 못했습니다'
  ).then((data) => data ?? [])
}

export function useLocations(params: LocationsParams = {}) {
  return useQuery({
    queryKey: queryKeys.locations.list(params),
    queryFn: () => fetchLocations(params),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  })
}

async function fetchLocationPath(locationId: string): Promise<Location[]> {
  return apiGet<{ path?: Location[] }>(
    `/api/locations/${locationId}/path`,
    undefined,
    '위치 경로를 불러오지 못했습니다'
  ).then((data) => data?.path ?? [])
}

export function useLocationPath(locationId: string | null) {
  return useQuery({
    queryKey: queryKeys.locations.path(locationId),
    queryFn: () => fetchLocationPath(locationId!),
    enabled: !!locationId,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  })
}
