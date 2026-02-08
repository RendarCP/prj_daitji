import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular'
}

export function Skeleton({ className, variant = 'rectangular', ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-secondary/30',
        {
          'rounded-full': variant === 'circular',
          'rounded-md': variant === 'rectangular',
          'rounded': variant === 'text',
        },
        className
      )}
      {...props}
    />
  )
}

// 특화된 Skeleton 컴포넌트들
export function CardSkeleton() {
  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" className="w-12 h-12" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-2 w-full" />
    </div>
  )
}

export function ListItemSkeleton() {
  return (
    <div className="card p-3 flex items-center gap-3">
      <Skeleton variant="rectangular" className="w-10 h-10 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton variant="circular" className="w-5 h-5" />
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="card p-4 space-y-3">
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-8 w-1/3" />
    </div>
  )
}

export function LocationCardSkeleton() {
  return (
    <div className="card p-4">
      <div className="flex flex-col items-center text-center space-y-3">
        <Skeleton variant="rectangular" className="w-16 h-16 rounded-2xl" />
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  )
}

export function ExpiryItemSkeleton() {
  return (
    <div className="card p-3 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" className="w-12 h-12" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-1 w-full rounded-full" />
    </div>
  )
}
