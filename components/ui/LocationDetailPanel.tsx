'use client'

import { useCallback, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { MapPin } from 'lucide-react'
import { EntityDeleteActions } from '@/components/features/EntityDeleteActions'
import { ItemListRowCard } from '@/components/features/ItemListRowCard'
import { LocationThumbnail } from '@/components/features/LocationThumbnail'
import { SidePanel } from './SidePanel'
import { Badge } from './Badge'
import { Spinner } from './Spinner'

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
  type?: 'FOOD' | 'COSMETIC' | 'MEDICINE' | 'GENERAL' | null
  item_type?: 'FOOD' | 'COSMETIC' | 'MEDICINE' | 'GENERAL' | null
  image_url?: string | null
  location_name?: string | null
  location_path?: string | null
  tags?: string[] | null
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
  onEdit?: (location: Location) => void
  onAddSubLocation?: (parentId: string) => void
}

export function LocationDetailPanel({
  isOpen,
  onClose,
  onBack,
  location,
  onSubLocationClick,
  onItemClick,
  onEdit,
  onAddSubLocation,
}: LocationDetailPanelProps) {
  const queryClient = useQueryClient()
  const [subLocations, setSubLocations] = useState<Location[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!location || !isOpen) {
      setSubLocations([])
      setItems([])
      setDeleteError(null)
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

  const handleDelete = useCallback(async () => {
    if (!location) {
      return false
    }

    try {
      setIsDeleting(true)
      setDeleteError(null)

      const response = await fetch(`/api/locations/${location.id}`, {
        method: 'DELETE',
      })
      const result = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(result?.error?.message || '위치 삭제 중 오류가 발생했습니다')
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['locations'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      ])

      onClose()
      return true
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : '위치 삭제 중 오류가 발생했습니다'
      )
      return false
    } finally {
      setIsDeleting(false)
    }
  }, [location, onClose, queryClient])

  if (!location) return null

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
      onBack={onBack}
      title={location.name}
      showBackButton
      showCloseButton={false}
      showEditButton={!!onEdit}
      onEdit={() => onEdit?.(location)}
      headerActions={
        <EntityDeleteActions
          entityName={location.name}
          entityLabel="위치"
          isDeleting={isDeleting}
          deleteError={deleteError}
          onDelete={handleDelete}
          onResetState={() => setDeleteError(null)}
        />
      }
    >
      <div className="p-6 space-y-6">
        {/* Location Header */}
        <div className="text-center">
          <LocationThumbnail
            name={location.name}
            icon={location.icon || '📦'}
            className="mx-auto mb-4 h-28 w-28"
            emojiClassName="h-10 w-10 text-xl"
            labelClassName="text-[10px]"
          />
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
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border bg-secondary/20 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  위치 레벨
                </p>
                <p className="mt-1 text-lg font-semibold text-foreground">
                  {location.level}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-secondary/20 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  하위 위치
                </p>
                <p className="mt-1 text-lg font-semibold text-foreground">
                  {subLocations.length}
                </p>
              </div>
            </div>

            {onAddSubLocation && (
              <button
                type="button"
                onClick={() => onAddSubLocation(location.id)}
                className="w-full rounded-2xl border border-dashed border-border px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary/20 transition-colors"
              >
                이 위치 아래에 하위 위치 추가
              </button>
            )}

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
                        <LocationThumbnail
                          name={subLoc.name}
                          icon={subLoc.icon || '📦'}
                          className="mb-2 h-16 w-full max-w-[120px] rounded-xl"
                          emojiClassName="h-7 w-7 text-sm"
                          labelClassName="text-[10px]"
                        />
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

                    return (
                      <ItemListRowCard
                        key={item.id || item.item_id}
                        title={itemName}
                        type={itemType}
                        imageUrl={item.image_url}
                        locationText={
                          item.location_path || item.location_name || location.name
                        }
                        tags={item.tags || []}
                        daysUntilExpiry={item.days_until_expiry}
                        onClick={() => onItemClick?.(item)}
                      />
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
