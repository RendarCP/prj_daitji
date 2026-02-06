import { HTMLAttributes, ReactNode } from 'react'
import { PackageX } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Button } from './Button'

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    icon?: ReactNode
  }
  size?: 'sm' | 'md' | 'lg'
}

export function EmptyState({ 
  icon,
  title, 
  description, 
  action,
  size = 'md',
  className,
  ...props 
}: EmptyStateProps) {
  const sizes = {
    sm: {
      container: 'py-8',
      icon: 'w-12 h-12',
      title: 'text-base',
      description: 'text-sm',
    },
    md: {
      container: 'py-12',
      icon: 'w-16 h-16',
      title: 'text-lg',
      description: 'text-base',
    },
    lg: {
      container: 'py-16',
      icon: 'w-20 h-20',
      title: 'text-xl',
      description: 'text-lg',
    },
  }

  const sizeConfig = sizes[size]

  return (
    <div 
      className={cn(
        'flex flex-col items-center justify-center text-center',
        sizeConfig.container,
        className
      )}
      {...props}
    >
      <div className={cn('mb-4 text-secondary-400', sizeConfig.icon)}>
        {icon || <PackageX className="w-full h-full" />}
      </div>
      
      <h3 className={cn('font-semibold text-secondary-900 mb-2', sizeConfig.title)}>
        {title}
      </h3>
      
      {description && (
        <p className={cn('text-secondary-600 max-w-md mb-6', sizeConfig.description)}>
          {description}
        </p>
      )}

      {action && (
        <Button
          onClick={action.onClick}
          leftIcon={action.icon}
          size={size === 'sm' ? 'sm' : 'md'}
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}
