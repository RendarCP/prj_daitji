import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { Spinner } from '@/components/ui/Spinner'

/**
 * Loading UI for Dashboard Page
 * Shows skeleton/loading state while data is being fetched
 */
export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-secondary-50 pb-20 md:pb-6">
      <Header />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Page Header Skeleton */}
        <div className="mb-6 sm:mb-8 animate-pulse">
          <div className="h-8 w-48 bg-secondary-200 rounded mb-2" />
          <div className="h-5 w-96 bg-secondary-200 rounded" />
        </div>

        {/* Stats Cards Skeleton */}
        <section className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-white border border-secondary-200 rounded-xl p-6 animate-pulse"
              >
                <div className="flex flex-col gap-3">
                  <div className="w-10 h-10 bg-secondary-200 rounded-lg" />
                  <div>
                    <div className="h-4 w-20 bg-secondary-200 rounded mb-2" />
                    <div className="h-8 w-16 bg-secondary-200 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Expiring Items Section Skeleton */}
        <section className="mb-8">
          <div className="bg-white border border-secondary-200 rounded-xl p-6 animate-pulse">
            <div className="h-6 w-48 bg-secondary-200 rounded mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-secondary-200 rounded-lg" />
              ))}
            </div>
          </div>
        </section>

        {/* Recent Items Section Skeleton */}
        <section className="mb-8">
          <div className="bg-white border border-secondary-200 rounded-xl p-6 animate-pulse">
            <div className="h-6 w-48 bg-secondary-200 rounded mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-secondary-200 rounded-lg" />
              ))}
            </div>
          </div>
        </section>

        {/* Centered Loading Spinner */}
        <div className="flex justify-center py-12">
          <Spinner size="lg" label="대시보드 로딩 중..." />
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
