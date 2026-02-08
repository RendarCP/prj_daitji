import { ListItemSkeleton } from '@/components/ui/Skeleton'

export default function ItemsLoading() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Title Skeleton */}
        <div className="h-8 w-32 bg-secondary/30 rounded animate-pulse mb-6" />

        {/* Search Bar Skeleton */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex-1 h-10 bg-secondary/30 rounded-xl animate-pulse" />
          <div className="w-10 h-10 bg-secondary/30 rounded-xl animate-pulse" />
        </div>

        {/* Items List Skeleton */}
        <div className="space-y-2">
          {[...Array(10)].map((_, i) => (
            <ListItemSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
