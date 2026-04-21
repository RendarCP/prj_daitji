'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { MapPin, RefreshCw } from 'lucide-react'
import { EntityDeleteActions } from '@/components/features/EntityDeleteActions'
import { ItemListRowCard } from '@/components/features/ItemListRowCard'
import { LocationThumbnail } from '@/components/features/LocationThumbnail'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { useOverlayHistorySync } from '@/lib/hooks/useOverlayHistorySync'
import { SidePanel } from './SidePanel'
import { Badge } from './Badge'
import { Spinner } from './Spinner'
import { useDeleteLocation } from '@/lib/hooks/useDeleteLocation'
import { useLocationDetailPanelData } from '@/lib/hooks/useLocationDetailPanelData'
import type { Item, Location } from '@/lib/types'
import { getLocationItemCount } from '@/lib/utils/location-count'
import { LocationGridCard } from '@/components/features/LocationGridCard'

const PANEL_EXIT_MS = 300

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
  shouldCloseOnBack?: boolean
  enableOverlayHistorySync?: boolean
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
  shouldCloseOnBack = true,
  enableOverlayHistorySync = true,
}: LocationDetailPanelProps) {
  const [isClosing, setIsClosing] = useState(false)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const panelIsOpen = isOpen && !isClosing

  useEffect(() => {
    if (!isOpen) {
      return
    }

    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }

    const openTimer = setTimeout(() => {
      setIsClosing(false)
    }, 0)

    return () => clearTimeout(openTimer)
  }, [isOpen, location?.id])

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current)
      }
    }
  }, [])

  const { subLocations, items, isLoading, isError, error, refetch } =
    useLocationDetailPanelData(location?.id ?? null, panelIsOpen && !!location?.id)

  const handleCloseRequest = useCallback(() => {
    setIsClosing(true)

    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
    }

    closeTimerRef.current = setTimeout(() => {
      onClose()
    }, PANEL_EXIT_MS)
  }, [onClose])

  const { requestClose } = useOverlayHistorySync({
    isOpen: panelIsOpen && !!location?.id,
    enabled: enableOverlayHistorySync && !!location?.id,
    overlayKey: 'location-detail',
    overlayId: location?.id ?? 'unknown',
    onRequestClose: handleCloseRequest,
  })

  const deleteLocationMutation = useDeleteLocation(location?.id ?? '', {
    onSuccess: requestClose,
  })

  const handleDelete = useCallback(async () => {
    if (!location) {
      return false
    }

    try {
      deleteLocationMutation.reset()
      await deleteLocationMutation.mutateAsync()
      return true
    } catch {
      return false
    }
  }, [deleteLocationMutation, location])

  if (!location) return null

  return (
    <SidePanel
      isOpen={panelIsOpen}
      onClose={requestClose}
      onBack={shouldCloseOnBack ? requestClose : onBack}
      title={location.name}
      showBackButton
      showCloseButton={false}
      showEditButton={!!onEdit}
      onEdit={() => onEdit?.(location)}
      headerActions={
        <EntityDeleteActions
          entityName={location.name}
          entityLabel="위치"
          isDeleting={deleteLocationMutation.isPending}
          deleteError={
            deleteLocationMutation.error instanceof Error
              ? deleteLocationMutation.error.message
              : null
          }
          onDelete={handleDelete}
          onResetState={() => deleteLocationMutation.reset()}
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
            {getLocationItemCount(location) || items.length}개 물품
          </Badge>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            {isError && (
              <Alert
                variant="danger"
                title="위치 정보를 불러오지 못했습니다"
                className="rounded-2xl"
              >
                <div className="space-y-3">
                  <p>{error instanceof Error ? error.message : '잠시 후 다시 시도해주세요.'}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void refetch()}
                    leftIcon={<RefreshCw className="h-4 w-4" />}
                  >
                    다시 시도
                  </Button>
                </div>
              </Alert>
            )}

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
                    <LocationGridCard
                      key={subLoc.id}
                      location={subLoc}
                      onClick={(nextLocation) => onSubLocationClick?.(nextLocation)}
                      countLabel={(count) => `${count}개`}
                      className="card hover-lift p-4 transition-all duration-200"
                    />
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
                    return (
                      <ItemListRowCard
                        key={item.id}
                        title={item.item_name}
                        type={item.type}
                        imageUrl={item.image_url}
                        locationText={item.location_path || item.location_name || location.name}
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
