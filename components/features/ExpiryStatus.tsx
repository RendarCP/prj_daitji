'use client'

import { Clock, AlertCircle, CheckCircle } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { isExpired, isExpiringSoon } from '@/lib/utils/format'

interface ExpiryStatusProps {
  expiryDate: string | Date
  showIcon?: boolean
  showDays?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ExpiryStatus({ 
  expiryDate, 
  showIcon = true,
  showDays = true,
  size = 'md',
  className 
}: ExpiryStatusProps) {
  const date = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate
  const now = new Date()
  const diffTime = date.getTime() - now.getTime()
  const daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  const expired = isExpired(expiryDate)
  const expiringSoon = isExpiringSoon(expiryDate)

  const status = expired ? 'expired' : expiringSoon ? 'expiring' : 'valid'

  const statusConfig = {
    expired: {
      variant: 'danger' as const,
      icon: AlertCircle,
      label: '만료됨',
      description: `${Math.abs(daysUntilExpiry)}일 경과`,
    },
    expiring: {
      variant: 'warning' as const,
      icon: Clock,
      label: '임박',
      description: `D-${daysUntilExpiry}`,
    },
    valid: {
      variant: 'success' as const,
      icon: CheckCircle,
      label: '신선',
      description: `D-${daysUntilExpiry}`,
    },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge 
      variant={config.variant} 
      size={size}
      dot={!showIcon}
      className={className}
    >
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      <span>
        {config.label}
        {showDays && ` (${config.description})`}
      </span>
    </Badge>
  )
}
