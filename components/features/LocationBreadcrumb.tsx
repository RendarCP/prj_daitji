'use client'

import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface BreadcrumbItem {
  id: string
  name: string
  icon?: string | null
}

interface LocationBreadcrumbProps {
  path: BreadcrumbItem[]
  onNavigate?: (id: string) => void
  className?: string
}

export function LocationBreadcrumb({ path, onNavigate, className }: LocationBreadcrumbProps) {
  if (path.length === 0) {
    return null
  }

  return (
    <nav 
      className={cn('flex items-center gap-1 overflow-x-auto py-2', className)}
      aria-label="위치 경로"
    >
      {/* Home Icon */}
      <button
        onClick={() => onNavigate?.(path[0].id)}
        className="flex items-center gap-1 px-2 py-1 rounded-md text-sm text-secondary-600 hover:text-primary-600 hover:bg-primary-50 transition-colors flex-shrink-0"
        aria-label="홈으로"
      >
        <Home className="w-4 h-4" />
      </button>

      {/* Breadcrumb Items */}
      {path.map((item, index) => {
        const isLast = index === path.length - 1
        
        return (
          <div key={item.id} className="flex items-center gap-1 flex-shrink-0">
            <ChevronRight className="w-4 h-4 text-secondary-400" />
            
            {isLast ? (
              <span className="px-2 py-1 text-sm font-medium text-secondary-900 truncate max-w-[200px]">
                {item.icon && (
                  <span className="mr-1" role="img" aria-hidden="true">
                    {item.icon}
                  </span>
                )}
                {item.name}
              </span>
            ) : (
              <button
                onClick={() => onNavigate?.(item.id)}
                className="px-2 py-1 rounded-md text-sm text-secondary-600 hover:text-primary-600 hover:bg-primary-50 transition-colors truncate max-w-[200px]"
              >
                {item.icon && (
                  <span className="mr-1" role="img" aria-hidden="true">
                    {item.icon}
                  </span>
                )}
                {item.name}
              </button>
            )}
          </div>
        )
      })}
    </nav>
  )
}
