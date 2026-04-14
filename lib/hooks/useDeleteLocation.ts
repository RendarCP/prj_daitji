'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiDelete } from '@/lib/api/client'
import { queryKeys } from '@/lib/queryKeys'

async function deleteLocation(locationId: string) {
  return apiDelete(`/api/locations/${locationId}`, '위치 삭제 중 오류가 발생했습니다')
}

interface UseDeleteLocationOptions {
  onSuccess?: () => void | Promise<void>
}

export function useDeleteLocation(
  locationId: string,
  options: UseDeleteLocationOptions = {}
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => deleteLocation(locationId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.locations.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
      ])

      await options.onSuccess?.()
    },
  })
}
