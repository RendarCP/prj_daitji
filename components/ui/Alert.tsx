import { HTMLAttributes, forwardRef, ReactNode } from 'react'
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'danger'
  title?: string
  onClose?: () => void
  icon?: ReactNode
}

const alertIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertCircle,
  danger: XCircle,
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'info', title, onClose, icon, children, ...props }, ref) => {
    const variants = {
      info: 'bg-primary-50 border-primary-200 text-primary-900',
      success: 'bg-success-50 border-success-200 text-success-900',
      warning: 'bg-warning-50 border-warning-200 text-warning-900',
      danger: 'bg-danger-50 border-danger-200 text-danger-900',
    }

    const iconColors = {
      info: 'text-primary-600',
      success: 'text-success-600',
      warning: 'text-warning-600',
      danger: 'text-danger-600',
    }

    const Icon = icon || alertIcons[variant]

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          'relative rounded-lg border p-4 flex gap-3',
          variants[variant],
          className
        )}
        {...props}
      >
        {Icon && (
          <div className={cn('flex-shrink-0 mt-0.5', iconColors[variant])}>
            {typeof Icon === 'function' ? <Icon className="w-5 h-5" /> : Icon}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          {title && (
            <h5 className="font-semibold mb-1">
              {title}
            </h5>
          )}
          <div className="text-sm">
            {children}
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className={cn(
              'flex-shrink-0 -mt-1 -mr-1 p-1 rounded-md transition-colors hover:bg-black/5',
              iconColors[variant]
            )}
            aria-label="알림 닫기"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    )
  }
)

Alert.displayName = 'Alert'
