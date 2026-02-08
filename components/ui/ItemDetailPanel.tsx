'use client'

import { useState } from 'react'
import { Heart, Edit, MapPin, Plus, Minus, Calendar, Tag as TagIcon } from 'lucide-react'
import { SidePanel } from './SidePanel'
import { Badge } from './Badge'
import { Button } from './Button'
import { cn } from '@/lib/utils/cn'

interface ItemDetailPanelProps {
  isOpen: boolean
  onClose: () => void
  item: {
    id?: string | null
    item_id?: string | null
    name?: string | null
    item_name?: string | null
    type?: string | null
    item_type?: string | null
    quantity?: number | null
    location_path?: string | null
    location_name?: string | null
    tags?: string[] | null
    computed_expiry_date?: string | null
    expiry_date?: string | null
    created_at?: string | null
    days_until_expiry?: number | null
    metadata?: any
  } | null
  onEdit?: () => void
  onFavorite?: () => void
  onQuantityChange?: (newQuantity: number) => void
}

const getEmojiByType = (type: string) => {
  switch (type) {
    case 'FOOD':
      return '🍽️'
    case 'COSMETIC':
      return '💄'
    case 'MEDICINE':
      return '💊'
    case 'GENERAL':
      return '🔋'
    default:
      return '📦'
  }
}

const getExpiryStatus = (daysUntilExpiry: number | null | undefined): 'expired' | 'expiring' | 'fresh' => {
  if (daysUntilExpiry === null || daysUntilExpiry === undefined) return 'fresh'
  if (daysUntilExpiry < 0) return 'expired'
  if (daysUntilExpiry <= 7) return 'expiring'
  return 'fresh'
}

export function ItemDetailPanel({
  isOpen,
  onClose,
  item,
  onEdit,
  onFavorite,
  onQuantityChange,
}: ItemDetailPanelProps) {
  const [quantity, setQuantity] = useState(item?.quantity ?? 1)
  const [newTag, setNewTag] = useState('')

  if (!item) return null

  const itemName = item.item_name || item.name || '이름 없음'
  const itemType = item.item_type || item.type || 'GENERAL'
  const emoji = getEmojiByType(itemType)
  const locationPath = item.location_path || item.location_name || '위치 미지정'
  const tags = item.tags || []
  const expiryDate = item.computed_expiry_date || item.expiry_date
  const createdAt = item.created_at
  const daysUntilExpiry = item.days_until_expiry
  const expiryStatus = getExpiryStatus(daysUntilExpiry)

  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(0, quantity + delta)
    setQuantity(newQuantity)
    onQuantityChange?.(newQuantity)
  }

  const handleAddTag = () => {
    if (newTag.trim()) {
      // TODO: Implement tag addition API call
      setNewTag('')
    }
  }

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={itemName}
      showBackButton
      showFavoriteButton={!!onFavorite}
      showEditButton={!!onEdit}
      onFavorite={onFavorite}
      onEdit={onEdit}
    >
      <div className="p-6 space-y-6">
        {/* Item Icon and Status */}
        <div className="text-center">
          <div className="text-8xl mb-4">{emoji}</div>
          
          {/* Status Badge */}
          {expiryStatus === 'expired' && daysUntilExpiry !== null && daysUntilExpiry !== undefined && (
            <Badge variant="danger" size="lg" className="mb-2">
              ⚠️ EXPIRED - {Math.abs(daysUntilExpiry)}일 지남
            </Badge>
          )}
          {expiryStatus === 'expiring' && daysUntilExpiry !== null && daysUntilExpiry !== undefined && (
            <Badge variant="warning" size="lg" className="mb-2">
              ⚠️ {daysUntilExpiry}일 남음
            </Badge>
          )}
          {expiryStatus === 'fresh' && (
            <Badge variant="success" size="lg" className="mb-2">
              신선함
            </Badge>
          )}
          
          {/* Category Badge */}
          <div className="flex justify-center gap-2">
            <Badge variant="secondary" size="md">
              {emoji} {itemType}
            </Badge>
          </div>
        </div>

        {/* Item Name */}
        <div>
          <h2 className="text-2xl font-bold text-foreground">{itemName}</h2>
        </div>

        {/* Quantity Selector */}
        <div className="card p-4">
          <label className="text-sm text-muted-foreground mb-2 block">수량</label>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => handleQuantityChange(-1)}
              className="w-10 h-10 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors"
              aria-label="수량 감소"
            >
              <Minus className="w-5 h-5" />
            </button>
            <span className="text-3xl font-bold text-foreground min-w-[60px] text-center">
              {quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(1)}
              className="w-10 h-10 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors"
              aria-label="수량 증가"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Location Path */}
        <div className="card p-4">
          <div className="flex items-start gap-2">
            <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <label className="text-sm text-muted-foreground block mb-1">저장 위치</label>
              <p className="text-foreground font-medium">{locationPath}</p>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="space-y-3">
          {expiryDate && (
            <div className="card p-4">
              <div className="flex items-start gap-2">
                <Calendar className={cn(
                  "w-5 h-5 mt-0.5 flex-shrink-0",
                  expiryStatus === 'expired' ? 'text-destructive' : 'text-primary'
                )} />
                <div className="flex-1">
                  <label className="text-sm text-muted-foreground block mb-1">만료일</label>
                  <p className={cn(
                    "font-medium",
                    expiryStatus === 'expired' ? 'text-destructive' : 'text-foreground'
                  )}>
                    {new Date(expiryDate).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {createdAt && (
            <div className="card p-4">
              <div className="flex items-start gap-2">
                <Calendar className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <label className="text-sm text-muted-foreground block mb-1">등록일</label>
                  <p className="text-foreground font-medium">
                    {new Date(createdAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="card p-4">
          <div className="flex items-start gap-2 mb-3">
            <TagIcon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <label className="text-sm text-muted-foreground">태그</label>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag, idx) => (
              <Badge key={idx} variant="secondary" size="md">
                #{tag}
              </Badge>
            ))}
          </div>

          {/* Add Tag Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              placeholder="새 태그 추가..."
              className="input-field flex-1 text-sm"
            />
            <Button
              onClick={handleAddTag}
              size="sm"
              variant="secondary"
              disabled={!newTag.trim()}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button
            onClick={onEdit}
            className="flex-1"
            variant="secondary"
          >
            <Edit className="w-4 h-4 mr-2" />
            수정
          </Button>
          <Button
            onClick={onFavorite}
            className="flex-1"
            variant="secondary"
          >
            <Heart className="w-4 h-4 mr-2" />
            즐겨찾기
          </Button>
        </div>
      </div>
    </SidePanel>
  )
}
