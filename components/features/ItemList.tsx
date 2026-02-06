'use client'

import { useState } from 'react'
import { Grid3x3, List, SlidersHorizontal } from 'lucide-react'
import { ItemCard } from './ItemCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'

interface Item {
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

interface ItemListProps {
  items: Item[]
  viewMode?: 'grid' | 'list'
  onViewModeChange?: (mode: 'grid' | 'list') => void
  sortBy?: string
  onSortChange?: (sort: string) => void
  onItemClick?: (item: Item) => void
  emptyMessage?: string
  emptyAction?: {
    label: string
    onClick: () => void
  }
}

const sortOptions = [
  { value: 'name_asc', label: '이름 (가나다순)' },
  { value: 'name_desc', label: '이름 (역순)' },
  { value: 'date_desc', label: '최근 추가순' },
  { value: 'date_asc', label: '오래된 순' },
  { value: 'expiry_asc', label: '유통기한 임박순' },
]

export function ItemList({ 
  items,
  viewMode = 'grid',
  onViewModeChange,
  sortBy = 'date_desc',
  onSortChange,
  onItemClick,
  emptyMessage = '등록된 물품이 없습니다',
  emptyAction,
}: ItemListProps) {
  const [localViewMode, setLocalViewMode] = useState(viewMode)
  const [localSortBy, setLocalSortBy] = useState(sortBy)

  const currentViewMode = onViewModeChange ? viewMode : localViewMode
  const currentSortBy = onSortChange ? sortBy : localSortBy

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    if (onViewModeChange) {
      onViewModeChange(mode)
    } else {
      setLocalViewMode(mode)
    }
  }

  const handleSortChange = (value: string) => {
    if (onSortChange) {
      onSortChange(value)
    } else {
      setLocalSortBy(value)
    }
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title={emptyMessage}
        description="새로운 물품을 추가하여 관리를 시작하세요"
        action={emptyAction}
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm text-secondary-600 font-medium">
            총 {items.length}개
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Sort Select */}
          <Select
            value={currentSortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            options={sortOptions}
            className="w-auto min-w-[160px]"
            fullWidth={false}
            leftIcon={<SlidersHorizontal className="w-4 h-4" />}
          />

          {/* View Mode Toggle */}
          <div className="flex items-center bg-secondary-100 rounded-lg p-1">
            <Button
              size="sm"
              variant={currentViewMode === 'grid' ? 'secondary' : 'ghost'}
              onClick={() => handleViewModeChange('grid')}
              className="px-3"
              aria-label="그리드 보기"
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={currentViewMode === 'list' ? 'secondary' : 'ghost'}
              onClick={() => handleViewModeChange('list')}
              className="px-3"
              aria-label="리스트 보기"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Items Grid/List */}
      {currentViewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item) => (
            <ItemCard 
              key={item.id} 
              item={item}
              onClick={onItemClick ? () => onItemClick(item) : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="w-full">
              <ItemCard 
                item={item}
                onClick={onItemClick ? () => onItemClick(item) : undefined}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
