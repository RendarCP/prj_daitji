'use client'

import { useEffect, useState } from 'react'
import { MapPin, ChevronRight } from 'lucide-react'
import { SidePanel } from './SidePanel'
import { Badge } from './Badge'
import { Spinner } from './Spinner'
import { cn } from '@/lib/utils/cn'
import { FALLBACK_COLORS } from '@/lib/constants/colors'

interface Location {
  id: string
  name: string
  icon?: string | null
  color?: string | null
  level: number
  parent_id?: string | null
  itemCount?: number
  item_count?: number
}

interface Item {
  id?: string | null
  item_id?: string | null
  name?: string | null
  item_name?: string | null
  type?: string | null
  item_type?: string | null
  location_path?: string | null
  days_until_expiry?: number | null
}

interface LocationDetailPanelProps {
  isOpen: boolean
  onClose: () => void
  /** 루트일 때: 패널 닫기, 하위일 때: 한 단계 뒤로 */
  onBack?: () => void
  location: Location | null
  onSubLocationClick?: (location: Location) => void
  onItemClick?: (item: Item) => void
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

export function LocationDetailPanel({
  isOpen,
  onClose,
  onBack,
  location,
  onSubLocationClick,
  onItemClick,
}: LocationDetailPanelProps) {
  const [subLocations, setSubLocations] = useState<Location[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!location || !isOpen) {
      setSubLocations([])
      setItems([])
      return
    }

    const fetchLocationData = async () => {
      setLoading(true)
      try {
        // Fetch sub-locations
        const locationsRes = await fetch(`/api/locations?parent_id=${location.id}`)
        const locationsData = await locationsRes.json()
        if (locationsData.success) {
          setSubLocations(locationsData.data || [])
        }

        // Fetch items in this location
        const itemsRes = await fetch(`/api/items?location_id=${location.id}`)
        const itemsData = await itemsRes.json()
        if (itemsData.success) {
          setItems(itemsData.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch location data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLocationData()
  }, [location, isOpen])

  if (!location) return null

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
      onBack={onBack}
      title={location.name}
      showBackButton
    >
      <div className="p-6 space-y-6">
        {/* Location Header */}
        <div className="text-center">
          <div
            className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: location.color || FALLBACK_COLORS.locationBackground }}
          >
            <span className="text-5xl">{location.icon || '📦'}</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {location.name}
          </h2>
          <Badge variant="secondary" size="lg">
            {location.item_count ?? location.itemCount ?? items.length}개 물품
          </Badge>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            {/* Sub-locations */}
            {subLocations.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  하위 구역
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {subLocations.map((subLoc) => (
                    <button
                      key={subLoc.id}
                      onClick={() => onSubLocationClick?.(subLoc)}
                      className="card hover-lift p-4 transition-all duration-200"
                    >
                      <div className="flex flex-col items-center text-center">
                        <div
                          className="w-12 h-12 rounded-xl mb-2 flex items-center justify-center"
                          style={{ backgroundColor: subLoc.color || FALLBACK_COLORS.locationBackground }}
                        >
                          <span className="text-2xl">{subLoc.icon || '📦'}</span>
                        </div>
                        <h4 className="font-semibold text-foreground text-sm mb-1">
                          {subLoc.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {subLoc.item_count ?? subLoc.itemCount ?? 0}개
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Items in this location */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                이 위치의 물품
              </h3>
              {items.length === 0 ? (
                <div className="card p-6 text-center">
                  <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-sm text-muted-foreground">
                    이 위치에 등록된 물품이 없어요
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map((item) => {
                    const itemName = item.item_name || item.name || '이름 없음'
                    const itemType = item.item_type || item.type || 'GENERAL'
                    const emoji = getEmojiByType(itemType)
                    const daysUntilExpiry = item.days_until_expiry

                    return (
                      <button
                        key={item.id || item.item_id}
                        onClick={() => onItemClick?.(item)}
                        className="w-full card hover-lift group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">{emoji}</div>
                          <div className="flex-1 text-left min-w-0">
                            <h4 className="font-semibold text-foreground truncate">
                              {itemName}
                            </h4>
                            {daysUntilExpiry !== null && daysUntilExpiry !== undefined && (
                              <p className={cn(
                                "text-xs",
                                daysUntilExpiry < 0
                                  ? "text-destructive"
                                  : daysUntilExpiry <= 7
                                  ? "text-warning"
                                  : "text-muted-foreground"
                              )}>
                                {daysUntilExpiry < 0
                                  ? `${Math.abs(daysUntilExpiry)}일 지남`
                                  : `${daysUntilExpiry}일 남음`}
                              </p>
                            )}
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </SidePanel>
  )
}
