'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 5분 캐싱
            staleTime: 5 * 60 * 1000,
            // 10분 동안 캐시 유지
            gcTime: 10 * 60 * 1000,
            // 에러 발생시 재시도 1회
            retry: 1,
            // 윈도우 포커스시 자동 refetch 비활성화
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
