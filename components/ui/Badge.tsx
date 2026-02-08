import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  dot?: boolean
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', dot = false, children, ...props }, ref) => {
    const variants = {
      default: 'bg-secondary/10 text-secondary-foreground border-border',
      primary: 'bg-primary/10 text-primary border-primary/20',
      success: 'bg-success/10 text-success border-success/20',
      warning: 'bg-warning/10 text-warning border-warning/20',
      danger: 'bg-destructive/10 text-destructive border-destructive/20',
      secondary: 'bg-secondary text-secondary-foreground border-border',
    }

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
      lg: 'px-3 py-1.5 text-base',
    }

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full font-medium border whitespace-nowrap',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {dot && (
          <span 
            className={cn(
              'w-1.5 h-1.5 rounded-full',
              variant === 'success' && 'bg-success',
              variant === 'warning' && 'bg-warning',
              variant === 'danger' && 'bg-destructive',
              variant === 'primary' && 'bg-primary',
              variant === 'default' && 'bg-muted-foreground',
              variant === 'secondary' && 'bg-secondary-foreground'
            )}
            aria-hidden="true"
          />
        )}
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'
