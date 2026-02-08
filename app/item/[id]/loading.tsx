import { CardSkeleton } from '@/components/ui/Skeleton'

export default function ItemDetailLoading() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header Skeleton */}
        <div className="mb-6">
          <div className="h-8 w-48 bg-secondary/30 rounded animate-pulse mb-2" />
          <div className="h-5 w-64 bg-secondary/30 rounded animate-pulse" />
        </div>

        {/* Content Sections Skeleton */}
        <div className="space-y-6">
          {/* Image Skeleton */}
          <div className="card">
            <div className="aspect-video bg-secondary/30 rounded-lg animate-pulse" />
          </div>

          {/* Details Skeleton */}
          {[...Array(3)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
