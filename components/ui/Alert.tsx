import {
  HTMLAttributes,
  createElement,
  forwardRef,
  isValidElement,
  ReactNode,
  ElementType,
} from 'react'
import { AlertCircle, CheckCircle, Info, XCircle, X, LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'danger'
  title?: string
  onClose?: () => void
  icon?: ReactNode | LucideIcon | ElementType
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
      info: 'bg-primary/10 border-primary/20 text-primary',
      success: 'bg-success/10 border-success/20 text-success',
      warning: 'bg-warning/10 border-warning/20 text-warning',
      danger: 'bg-destructive/10 border-destructive/20 text-destructive',
    }

    const iconColors = {
      info: 'text-primary',
      success: 'text-success',
      warning: 'text-warning',
      danger: 'text-destructive',
    }

    const Icon = icon || alertIcons[variant]

    const renderedIcon = isValidElement(Icon)
      ? Icon
      : typeof Icon === 'string'
        ? Icon
        : Icon
          ? createElement(Icon as ElementType, { className: 'w-5 h-5' })
          : null

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
            {renderedIcon}
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
