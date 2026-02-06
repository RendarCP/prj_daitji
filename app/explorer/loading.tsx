import { Spinner } from '@/components/ui/Spinner'

export default function ExplorerLoading() {
  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="flex">
        {/* Sidebar Skeleton */}
        <aside className="w-80 h-screen bg-white border-r border-secondary-200 hidden lg:block">
          <div className="p-4 border-b border-secondary-200">
            <div className="h-7 bg-secondary-200 rounded animate-pulse w-24" />
          </div>
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-secondary-200 rounded animate-pulse" />
                <div className="h-5 bg-secondary-200 rounded animate-pulse flex-1" />
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content Skeleton */}
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            {/* Header Skeleton */}
            <div className="mb-6">
              <div className="h-9 bg-secondary-200 rounded animate-pulse w-48 mb-2" />
              <div className="h-5 bg-secondary-200 rounded animate-pulse w-64" />
            </div>

            {/* Filter Skeleton */}
            <div className="mb-6">
              <div className="h-12 bg-white border border-secondary-200 rounded-lg animate-pulse" />
            </div>

            {/* Content Skeleton */}
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
