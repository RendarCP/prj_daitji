import { LocationCardSkeleton, ListItemSkeleton } from '@/components/ui/Skeleton'

export default function ExplorerLoading() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Page Title */}
      <div className="pt-6 pb-2 text-center relative px-4">
        <div className="h-7 w-48 bg-secondary/30 rounded animate-pulse mx-auto" />
      </div>

      {/* Breadcrumb Skeleton */}
      <div className="px-4 py-2 flex items-center justify-center gap-2 mb-6">
        <div className="h-8 w-20 bg-secondary/30 rounded-full animate-pulse" />
      </div>

      <div className="container mx-auto px-4 max-w-3xl space-y-6">
        {/* Locations Section */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="h-4 w-24 bg-secondary/30 rounded animate-pulse" />
            <div className="h-4 w-28 bg-secondary/30 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <LocationCardSkeleton key={i} />
            ))}
          </div>
        </div>

        {/* Search Bar Skeleton */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-10 bg-secondary/30 rounded-xl animate-pulse" />
          <div className="w-10 h-10 bg-secondary/30 rounded-xl animate-pulse" />
        </div>

        {/* Items Section Skeleton */}
        <div className="pb-20">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="h-4 w-32 bg-secondary/30 rounded animate-pulse" />
            <div className="h-4 w-24 bg-secondary/30 rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <ListItemSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
