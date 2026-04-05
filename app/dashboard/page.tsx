import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query'
import { DashboardClient } from './DashboardClient'
import { Header } from '@/components/layout/Header'
import { queryKeys } from '@/lib/queryKeys'
import { fetchDashboardStatsServer, fetchLocationSummaryServer } from '@/lib/server/dashboard'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: '대시보드',
  description: '물품 관리 현황을 한눈에 확인하세요',
}

/**
 * Server Component for Dashboard Page
 * React Query로 클라이언트에서 데이터 페칭하므로 서버에서는 인증만 확인
 */
export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/dashboard')
  }

  const queryClient = new QueryClient()

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: queryKeys.dashboard.stats(),
      queryFn: fetchDashboardStatsServer,
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.locations.summary(),
      queryFn: fetchLocationSummaryServer,
    }),
  ])

  return (
    <>
      <Header />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <DashboardClient />
      </HydrationBoundary>
    </>
  )
}
