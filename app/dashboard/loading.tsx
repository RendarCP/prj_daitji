import {
  ExpiryItemSkeleton,
  LocationCardSkeleton,
  StatCardSkeleton,
} from '@/components/ui/Skeleton'

export default function DashboardLoading() {
  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col bg-background sm:min-h-[calc(100dvh-4rem)]">
      <div className="container mx-auto max-w-7xl flex-1 px-4 py-6 pb-[calc(5rem+env(safe-area-inset-bottom))]">
        <section className="mb-8">
          <div className="rounded-[32px] border border-border/60 bg-card/90 p-5 shadow-medium">
            <div className="h-3 w-32 animate-pulse rounded bg-secondary/30" />
            <div className="mt-3 h-8 w-56 animate-pulse rounded bg-secondary/30" />
            <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded bg-secondary/30" />
            <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <StatCardSkeleton key={i} />
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-[28px] border border-border/70 bg-card/95 p-5 shadow-soft"
              >
                <div className="h-6 w-32 animate-pulse rounded bg-secondary/30" />
                <div className="mt-2 h-4 w-44 animate-pulse rounded bg-secondary/30" />
                <div className="mt-6 h-[220px] animate-pulse rounded-3xl bg-secondary/20" />
              </div>
            ))}
          </div>
        </section>

        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="h-7 w-24 bg-secondary/30 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <ExpiryItemSkeleton key={i} />
            ))}
          </div>
        </section>

        {/* Quick Zones Section */}
        <section className="mb-6">
          <div className="h-7 w-24 bg-secondary/30 rounded animate-pulse mb-4" />
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <LocationCardSkeleton key={i} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
