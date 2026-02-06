'use client'

import { useState } from 'react'
import { Search, Filter, X, Apple, Sparkles, Pill, Package } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

interface ItemFilterProps {
  onFilterChange?: (filters: FilterState) => void
  locationOptions?: Array<{ value: string; label: string }>
  showLocationFilter?: boolean
}

interface FilterState {
  search: string
  type: string[]
  status: string[]
  location: string
  expiryFilter: string
}

const itemTypes = [
  { value: 'FOOD', label: '식품', icon: Apple, color: 'success' as const },
  { value: 'COSMETIC', label: '화장품', icon: Sparkles, color: 'primary' as const },
  { value: 'MEDICINE', label: '의약품', icon: Pill, color: 'danger' as const },
  { value: 'GENERAL', label: '일반', icon: Package, color: 'secondary' as const },
]

const expiryOptions = [
  { value: 'all', label: '전체' },
  { value: 'valid', label: '신선' },
  { value: 'expiring_3', label: '3일 이내 만료' },
  { value: 'expiring_7', label: '7일 이내 만료' },
  { value: 'expired', label: '만료됨' },
]

export function ItemFilter({ 
  onFilterChange, 
  locationOptions = [],
  showLocationFilter = true,
}: ItemFilterProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    type: [],
    status: [],
    location: '',
    expiryFilter: 'all',
  })

  const [showAdvanced, setShowAdvanced] = useState(false)

  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  const toggleType = (type: string) => {
    const newTypes = filters.type.includes(type)
      ? filters.type.filter(t => t !== type)
      : [...filters.type, type]
    updateFilter('type', newTypes)
  }

  const clearFilters = () => {
    const emptyFilters: FilterState = {
      search: '',
      type: [],
      status: [],
      location: '',
      expiryFilter: 'all',
    }
    setFilters(emptyFilters)
    onFilterChange?.(emptyFilters)
  }

  const activeFilterCount = 
    filters.type.length + 
    filters.status.length + 
    (filters.location ? 1 : 0) + 
    (filters.expiryFilter !== 'all' ? 1 : 0)

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <Input
          placeholder="물품 이름, 태그로 검색..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
          rightIcon={
            filters.search && (
              <button
                onClick={() => updateFilter('search', '')}
                className="hover:text-secondary-700"
                aria-label="검색어 지우기"
              >
                <X className="w-4 h-4" />
              </button>
            )
          }
        />
        <Button
          variant={showAdvanced ? 'primary' : 'outline'}
          onClick={() => setShowAdvanced(!showAdvanced)}
          leftIcon={<Filter className="w-4 h-4" />}
        >
          필터
          {activeFilterCount > 0 && (
            <Badge size="sm" variant="danger" className="ml-1">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="p-4 bg-secondary-50 rounded-lg space-y-4 animate-slide-down">
          {/* Type Filter */}
          <div>
            <label className="text-sm font-medium text-secondary-700 mb-2 block">
              물품 타입
            </label>
            <div className="flex flex-wrap gap-2">
              {itemTypes.map((type) => {
                const Icon = type.icon
                const isActive = filters.type.includes(type.value)
                
                return (
                  <button
                    key={type.value}
                    onClick={() => toggleType(type.value)}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all
                      ${isActive
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-secondary-200 bg-white text-secondary-700 hover:border-secondary-300'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Expiry Filter */}
          <Select
            label="유통기한 상태"
            value={filters.expiryFilter}
            onChange={(e) => updateFilter('expiryFilter', e.target.value)}
            options={expiryOptions}
          />

          {/* Location Filter */}
          {showLocationFilter && locationOptions.length > 0 && (
            <Select
              label="위치"
              value={filters.location}
              onChange={(e) => updateFilter('location', e.target.value)}
              options={[
                { value: '', label: '전체 위치' },
                ...locationOptions
              ]}
            />
          )}

          {/* Clear Button */}
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              leftIcon={<X className="w-4 h-4" />}
              fullWidth
            >
              필터 초기화
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
