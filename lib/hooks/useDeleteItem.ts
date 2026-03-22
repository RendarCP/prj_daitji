'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'

async function deleteItem(itemId: string) {
  const response = await fetch(`/api/items/${itemId}`, {
    method: 'DELETE',
  })
  const result = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(result?.error?.message ?? '물품 삭제 중 오류가 발생했습니다')
  }

  return result
}

interface UseDeleteItemOptions {
  onSuccess?: () => void | Promise<void>
}

export function useDeleteItem(itemId: string, options: UseDeleteItemOptions = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => deleteItem(itemId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.items.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.locations.all }),
      ])
      queryClient.removeQueries({ queryKey: queryKeys.items.detail(itemId) })

      await options.onSuccess?.()
    },
  })
}
