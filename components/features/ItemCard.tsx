'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Apple, Sparkles, Pill, Package, MapPin, Calendar } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatRelativeDate, isExpired, isExpiringSoon } from '@/lib/utils/format'
import { ITEM_TYPE_ICON_COLORS } from '@/lib/constants/colors'

interface ItemCardProps {
  item: {
    id: string
    name: string
    type: 'FOOD' | 'COSMETIC' | 'MEDICINE' | 'GENERAL'
    quantity?: number
    image_url?: string
    tags?: string[]
    location?: {
      id: string
      name: string
    }
    metadata?: {
      purchase_date?: string
      expiry_date?: string
      category?: string
    }
  }
  onClick?: () => void
}

const typeIcons = {
  FOOD: Apple,
  COSMETIC: Sparkles,
  MEDICINE: Pill,
  GENERAL: Package,
}

const typeColors = ITEM_TYPE_ICON_COLORS

const typeLabels = {
  FOOD: '식품',
  COSMETIC: '화장품',
  MEDICINE: '의약품',
  GENERAL: '일반',
}

export function ItemCard({ item, onClick }: ItemCardProps) {
  const Icon = typeIcons[item.type]
  const expiryDate = item.metadata?.expiry_date
  
  const expiryStatus = expiryDate 
    ? isExpired(expiryDate) 
      ? 'expired' 
      : isExpiringSoon(expiryDate) 
        ? 'expiring' 
        : 'valid'
    : null

  const expiryBadgeVariant = 
    expiryStatus === 'expired' ? 'danger' :
    expiryStatus === 'expiring' ? 'warning' : 'success'

  const content = (
    <Card hover className="h-full">
      <div className="flex flex-col gap-4">
        {/* Image or Icon */}
        <div className="relative aspect-square w-full bg-secondary/10 rounded-lg overflow-hidden">
          {item.image_url ? (
            <Image 
              src={item.image_url} 
              alt={item.name} 
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${typeColors[item.type]}`}>
              <Icon className="w-16 h-16" />
            </div>
          )}
          
          {/* Type Badge */}
          <div className="absolute top-2 left-2">
            <Badge size="sm" variant="secondary" className="bg-white/90 backdrop-blur-sm">
              {typeLabels[item.type]}
            </Badge>
          </div>

          {/* Quantity Badge */}
          {item.quantity !== undefined && item.quantity > 1 && (
            <div className="absolute top-2 right-2">
              <Badge size="sm" variant="primary" className="bg-white/90 backdrop-blur-sm text-primary">
                × {item.quantity}
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col gap-2">
          <h3 className="font-semibold text-foreground leading-tight line-clamp-2">
            {item.name}
          </h3>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} size="sm" variant="default">
                  {tag}
                </Badge>
              ))}
              {item.tags.length > 2 && (
                <Badge size="sm" variant="default">
                  +{item.tags.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Location */}
          {item.location && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{item.location.name}</span>
            </div>
          )}

          {/* Purchase Date */}
          {item.metadata?.purchase_date && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span>{formatRelativeDate(item.metadata.purchase_date)}</span>
            </div>
          )}

          {/* Expiry Status */}
          {expiryDate && expiryStatus && (
            <Badge variant={expiryBadgeVariant} dot size="sm" className="self-start">
              {expiryStatus === 'expired' 
                ? '만료됨' 
                : expiryStatus === 'expiring'
                  ? `임박 (${formatRelativeDate(expiryDate)})`
                  : `신선 (${formatRelativeDate(expiryDate)})`}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  )

  if (onClick) {
    return (
      <button onClick={onClick} className="w-full text-left">
        {content}
      </button>
    )
  }

  return (
    <Link href={`/item/${item.id}`} className="block">
      {content}
    </Link>
  )
}
