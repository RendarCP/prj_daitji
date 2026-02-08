import { 
  ExpiryItemSkeleton, 
  ListItemSkeleton, 
  LocationCardSkeleton 
} from '@/components/ui/Skeleton'

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Expiry Alerts Section */}
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

        {/* Recent Items Section */}
        <section className="mb-6">
          <div className="h-7 w-32 bg-secondary/30 rounded animate-pulse mb-3" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <ListItemSkeleton key={i} />
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
