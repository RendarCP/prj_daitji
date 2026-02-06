'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Package, 
  MapPin, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Plus,
  TrendingUp,
  ChevronRight,
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { ItemCard } from '@/components/features/ItemCard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { Alert } from '@/components/ui/Alert'
import { EmptyState } from '@/components/ui/EmptyState'
import { QuickAddButton } from '@/components/features/QuickAddButton'
import { DashboardStats } from '@/lib/types'
import { cn } from '@/lib/utils/cn'

interface DashboardClientProps {
  initialStats: DashboardStats | null
  initialExpiringItems: any[]
  initialRecentItems: any[]
  initialLocationSummary: any[]
  statsError: string | null
  expiringError: string | null
  recentError: string | null
  locationError: string | null
}

export function DashboardClient({
  initialStats,
  initialExpiringItems,
  initialRecentItems,
  initialLocationSummary,
  statsError: initialStatsError,
  expiringError: initialExpiringError,
  recentError: initialRecentError,
  locationError: initialLocationError,
}: DashboardClientProps) {
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    router.refresh()
    // Simulate minimum refresh time for UX
    setTimeout(() => {
      setIsRefreshing(false)
    }, 500)
  }

  const handleAddItem = () => {
    router.push('/item/add')
  }

  const handleAddLocation = () => {
    router.push('/explorer?action=add-location')
  }

  return (
    <div className="min-h-screen bg-secondary-50 pb-20 md:pb-6">
      <Header />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Page Header */}
        <PageHeader
          title="대시보드"
          description="물품 관리 현황을 한눈에 확인하세요"
          actions={
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              aria-label="새로고침"
            >
              <RefreshCw className={cn('w-5 h-5', isRefreshing && 'animate-spin')} />
            </Button>
          }
        />

        {/* Stats Cards Section */}
        <section className="mb-8 animate-fade-in">
          {initialStatsError ? (
            <Alert variant="danger" title="오류">
              {initialStatsError}
            </Alert>
          ) : !initialStats ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" label="통계 로딩 중..." />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* Total Items */}
              <Card className="animate-slide-up" style={{ animationDelay: '0ms' }}>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <Package className="w-5 h-5 text-primary-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-secondary-600 mb-1">전체 물품</p>
                    <p className="text-2xl font-bold text-secondary-900">
                      {initialStats.total_items.toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Active Items */}
              <Card className="animate-slide-up" style={{ animationDelay: '50ms' }}>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-success-100 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-success-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-secondary-600 mb-1">활성 물품</p>
                    <p className="text-2xl font-bold text-secondary-900">
                      {initialStats.active_items.toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Expiring Soon */}
              <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-warning-100 rounded-lg">
                      <Clock className="w-5 h-5 text-warning-600" />
                    </div>
                    {initialStats.expiring_soon > 0 && (
                      <Badge variant="warning" size="sm" dot>
                        주의
                      </Badge>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-secondary-600 mb-1">만료 임박</p>
                    <p className="text-2xl font-bold text-secondary-900">
                      {initialStats.expiring_soon.toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Expired Items */}
              <Card className="animate-slide-up" style={{ animationDelay: '150ms' }}>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-danger-100 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-danger-600" />
                    </div>
                    {initialStats.expired > 0 && (
                      <Badge variant="danger" size="sm" dot>
                        만료
                      </Badge>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-secondary-600 mb-1">만료됨</p>
                    <p className="text-2xl font-bold text-secondary-900">
                      {initialStats.expired.toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Locations */}
              <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <MapPin className="w-5 h-5 text-primary-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-secondary-600 mb-1">위치 개수</p>
                    <p className="text-2xl font-bold text-secondary-900">
                      {initialStats.locations_count.toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </section>

        {/* Expiring Items Section */}
        <section className="mb-8 animate-fade-in" style={{ animationDelay: '250ms' }}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-warning-600" />
                  <CardTitle>만료 임박 물품</CardTitle>
                  {initialExpiringItems.length > 0 && (
                    <Badge variant="warning" size="sm">
                      {initialExpiringItems.length}개
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {initialExpiringError ? (
                <Alert variant="danger">{initialExpiringError}</Alert>
              ) : initialExpiringItems.length === 0 ? (
                <EmptyState
                  icon={<CheckCircle className="w-full h-full" />}
                  title="만료 임박 물품 없음"
                  description="7일 이내에 만료되는 물품이 없습니다."
                  size="sm"
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {initialExpiringItems.map((item) => (
                    <ItemCard
                      key={item.item_id}
                      item={{
                        id: item.item_id,
                        name: item.item_name,
                        type: item.item_type,
                        image_url: item.image_url,
                        tags: item.tags,
                        location: {
                          id: item.location_id,
                          name: item.location_name,
                        },
                        metadata: {
                          expiry_date: item.expiry_date,
                        },
                      }}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Recent Items Section */}
        <section className="mb-8 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary-600" />
                  <CardTitle>최근 등록 물품</CardTitle>
                </div>
                {initialRecentItems.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    rightIcon={<ChevronRight className="w-4 h-4" />}
                    onClick={() => router.push('/items')}
                  >
                    전체보기
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {initialRecentError ? (
                <Alert variant="danger">{initialRecentError}</Alert>
              ) : initialRecentItems.length === 0 ? (
                <EmptyState
                  icon={<Package className="w-full h-full" />}
                  title="등록된 물품 없음"
                  description="아직 등록된 물품이 없습니다. 첫 물품을 추가해보세요."
                  size="sm"
                  action={{
                    label: '물품 추가',
                    onClick: handleAddItem,
                    icon: <Plus className="w-4 h-4" />,
                  }}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {initialRecentItems.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={{
                        id: item.id,
                        name: item.name,
                        type: item.type,
                        quantity: item.quantity,
                        image_url: item.image_url,
                        tags: item.tags,
                        location: item.location_id && item.location_name ? {
                          id: item.location_id,
                          name: item.location_name,
                        } : undefined,
                        metadata: {
                          purchase_date: item.purchase_date,
                          expiry_date: item.computed_expiry_date,
                        },
                      }}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Location Summary Section (Optional) */}
        {initialLocationSummary.length > 0 && (
          <section className="mb-8 animate-fade-in" style={{ animationDelay: '350ms' }}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary-600" />
                    <CardTitle>위치별 물품 요약</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    rightIcon={<ChevronRight className="w-4 h-4" />}
                    onClick={() => router.push('/explorer')}
                  >
                    전체보기
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {initialLocationError ? (
                  <Alert variant="danger">{initialLocationError}</Alert>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {initialLocationSummary.map((location) => (
                      <button
                        key={location.id}
                        onClick={() => router.push(`/explorer?location=${location.id}`)}
                        className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-secondary-200 hover:border-primary-300 hover:bg-primary-50 transition-all active:scale-95"
                      >
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                          style={{ backgroundColor: location.color || '#E5E7EB' }}
                        >
                          {location.icon || '📦'}
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-semibold text-secondary-900 mb-1">
                            {location.name}
                          </p>
                          <Badge variant="default" size="sm">
                            {location.item_count}개
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        )}
      </div>

      {/* Quick Add Button */}
      <QuickAddButton
        onAddItem={handleAddItem}
        onAddLocation={handleAddLocation}
      />

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
