import { HTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'primary' | 'secondary' | 'white'
  label?: string
}

export function Spinner({ 
  size = 'md', 
  variant = 'primary',
  label,
  className,
  ...props 
}: SpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }

  const variants = {
    primary: 'text-primary-500',
    secondary: 'text-secondary-500',
    white: 'text-white',
  }

  return (
    <div 
      className={cn('flex flex-col items-center justify-center gap-3', className)}
      role="status"
      aria-live="polite"
      aria-label={label || '로딩 중'}
      {...props}
    >
      <Loader2 className={cn('animate-spin', sizes[size], variants[variant])} />
      {label && (
        <span className={cn('text-sm font-medium', variants[variant])}>
          {label}
        </span>
      )}
      <span className="sr-only">{label || '로딩 중'}</span>
    </div>
  )
}
