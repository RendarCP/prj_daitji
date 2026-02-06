import Link from 'next/link'
import { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/Button'

interface PageHeaderProps {
  title: string
  description?: string
  backHref?: string
  onBack?: () => void
  actions?: ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  backHref,
  onBack,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('mb-6 sm:mb-8', className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Back Button */}
          {(backHref || onBack) && (
            <div className="mb-2">
              {backHref ? (
                <Link href={backHref} className="inline-block -ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                  >
                    뒤로
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                  onClick={onBack}
                  className="-ml-2"
                >
                  뒤로
                </Button>
              )}
            </div>
          )}

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900 leading-tight">
            {title}
          </h1>

          {/* Description */}
          {description && (
            <p className="mt-2 text-base text-secondary-600">
              {description}
            </p>
          )}
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
