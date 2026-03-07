import { CardSkeleton } from '@/components/ui/Skeleton'

export default function ItemAddLoading() {
  return (
    <div className="min-h-screen bg-secondary/10 pb-24">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header Skeleton */}
        <div className="mb-6">
          <div className="h-8 w-32 bg-secondary/30 rounded animate-pulse mb-2" />
          <div className="h-5 w-48 bg-secondary/30 rounded animate-pulse" />
        </div>

        {/* Form Sections Skeleton */}
        <div className="space-y-6">
          {[...Array(4)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
