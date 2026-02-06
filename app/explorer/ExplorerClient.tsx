'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Menu, X, ChevronLeft, Folder } from 'lucide-react'
import { LocationBreadcrumb } from '@/components/features/LocationBreadcrumb'
import { LocationTree } from '@/components/features/LocationTree'
import { ItemList } from '@/components/features/ItemList'
import { ItemFilter } from '@/components/features/ItemFilter'
import { QuickAddButton } from '@/components/features/QuickAddButton'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { Alert } from '@/components/ui/Alert'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/utils/cn'

interface Location {
  id: string
  name: string
  level: number
  parent_id?: string | null
  icon?: string | null
  color?: string | null
  sort_order?: number
  itemCount?: number
  children?: Location[]
}

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

interface FilterState {
  search: string
  type: string[]
  status: string[]
  location: string
  expiryFilter: string
}

export default function ExplorerClient() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // State
  const [locations, setLocations] = useState<Location[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [filteredItems, setFilteredItems] = useState<Item[]>([])
  const [breadcrumbPath, setBreadcrumbPath] = useState<Array<{ id: string; name: string; icon?: string | null }>>([])
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('date_desc')
  
  // Loading and error states
  const [isLoadingLocations, setIsLoadingLocations] = useState(true)
  const [isLoadingItems, setIsLoadingItems] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Create query string helper
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      return params.toString()
    },
    [searchParams]
  )

  // Fetch locations tree
  const fetchLocations = useCallback(async () => {
    try {
      setIsLoadingLocations(true)
      setError(null)
      
      const response = await fetch('/api/locations?tree=true')
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error?.message || '위치를 불러올 수 없습니다')
      }
      
      setLocations(result.data || [])
    } catch (err) {
      console.error('Failed to fetch locations:', err)
      setError(err instanceof Error ? err.message : '위치를 불러오는 중 오류가 발생했습니다')
    } finally {
      setIsLoadingLocations(false)
    }
  }, [])

  // Fetch items for selected location
  const fetchItems = useCallback(async (locationId: string | null) => {
    try {
      setIsLoadingItems(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (locationId) {
        params.append('location_id', locationId)
      }
      
      const response = await fetch(`/api/items?${params.toString()}`)
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error?.message || '물품을 불러올 수 없습니다')
      }
      
      setItems(result.data || [])
      setFilteredItems(result.data || [])
    } catch (err) {
      console.error('Failed to fetch items:', err)
      setError(err instanceof Error ? err.message : '물품을 불러오는 중 오류가 발생했습니다')
    } finally {
      setIsLoadingItems(false)
    }
  }, [])

  // Fetch location path for breadcrumb
  const fetchLocationPath = useCallback(async (locationId: string) => {
    try {
      const response = await fetch(`/api/locations/${locationId}/path`)
      const result = await response.json()
      
      if (result.success && result.data?.path) {
        setBreadcrumbPath(result.data.path)
      }
    } catch (err) {
      console.error('Failed to fetch location path:', err)
    }
  }, [])

  // Handle location selection
  const handleLocationSelect = useCallback((location: Location) => {
    const newLocationId = location.id
    setSelectedLocationId(newLocationId)
    
    // Update URL
    const queryString = createQueryString('location_id', newLocationId)
    router.push(`${pathname}?${queryString}`)
    
    // Fetch items and path
    fetchItems(newLocationId)
    fetchLocationPath(newLocationId)
    
    // Close sidebar on mobile
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false)
    }
  }, [router, pathname, createQueryString, fetchItems, fetchLocationPath])

  // Handle breadcrumb navigation
  const handleBreadcrumbNavigate = useCallback((locationId: string) => {
    // Find location in tree
    const findLocation = (locations: Location[]): Location | null => {
      for (const loc of locations) {
        if (loc.id === locationId) return loc
        if (loc.children) {
          const found = findLocation(loc.children)
          if (found) return found
        }
      }
      return null
    }
    
    const location = findLocation(locations)
    if (location) {
      handleLocationSelect(location)
    }
  }, [locations, handleLocationSelect])

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: FilterState) => {
    
    // Apply filters to items
    let filtered = [...items]
    
    // Search filter
    if (newFilters.search) {
      const searchLower = newFilters.search.toLowerCase()
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchLower) ||
        item.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }
    
    // Type filter
    if (newFilters.type.length > 0) {
      filtered = filtered.filter(item => newFilters.type.includes(item.type))
    }
    
    // Expiry filter
    if (newFilters.expiryFilter !== 'all') {
      filtered = filtered.filter(item => {
        if (!item.metadata?.expiry_date) return false
        
        const expiryDate = new Date(item.metadata.expiry_date)
        const now = new Date()
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        
        switch (newFilters.expiryFilter) {
          case 'valid':
            return daysUntilExpiry > 7
          case 'expiring_3':
            return daysUntilExpiry >= 0 && daysUntilExpiry <= 3
          case 'expiring_7':
            return daysUntilExpiry >= 0 && daysUntilExpiry <= 7
          case 'expired':
            return daysUntilExpiry < 0
          default:
            return true
        }
      })
    }
    
    setFilteredItems(filtered)
  }, [items])

  // Handle sort change
  const handleSortChange = useCallback((newSortBy: string) => {
    setSortBy(newSortBy)
    
    const sorted = [...filteredItems]
    
    switch (newSortBy) {
      case 'name_asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name, 'ko'))
        break
      case 'name_desc':
        sorted.sort((a, b) => b.name.localeCompare(a.name, 'ko'))
        break
      case 'date_asc':
        // Assuming items are already sorted by created_at desc from API
        sorted.reverse()
        break
      case 'date_desc':
        // Default order from API
        break
      case 'expiry_asc':
        sorted.sort((a, b) => {
          const aDate = a.metadata?.expiry_date ? new Date(a.metadata.expiry_date).getTime() : Infinity
          const bDate = b.metadata?.expiry_date ? new Date(b.metadata.expiry_date).getTime() : Infinity
          return aDate - bDate
        })
        break
    }
    
    setFilteredItems(sorted)
  }, [filteredItems])

  // Handle item click
  const handleItemClick = useCallback((item: Item) => {
    router.push(`/item/${item.id}`)
  }, [router])

  // Initialize from URL params
  useEffect(() => {
    const locationIdParam = searchParams.get('location_id')
    
    if (locationIdParam) {
      setSelectedLocationId(locationIdParam)
      fetchItems(locationIdParam)
      fetchLocationPath(locationIdParam)
    } else {
      // Show all items initially
      fetchItems(null)
      setBreadcrumbPath([])
    }
  }, [searchParams, fetchItems, fetchLocationPath])

  // Fetch locations on mount
  useEffect(() => {
    fetchLocations()
  }, [fetchLocations])

  // Handle back to root
  const handleBackToRoot = useCallback(() => {
    setSelectedLocationId(null)
    setBreadcrumbPath([])
    
    const queryString = createQueryString('location_id', '')
    router.push(`${pathname}?${queryString}`)
    
    fetchItems(null)
  }, [router, pathname, createQueryString, fetchItems])

  // Render location cards for Level 1 (root) locations
  const renderLocationCards = () => {
    const rootLocations = locations.filter(loc => loc.level === 1)
    
    if (rootLocations.length === 0) {
      return null
    }
    
    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold text-secondary-900 mb-4">위치 둘러보기</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {rootLocations.map((location) => (
            <Card
              key={location.id}
              hover
              className="cursor-pointer"
              onClick={() => handleLocationSelect(location)}
            >
              <div className="flex flex-col items-center text-center p-4">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
                  style={{ backgroundColor: location.color || '#E5E7EB' }}
                >
                  {location.icon ? (
                    <span className="text-3xl" role="img" aria-hidden="true">
                      {location.icon}
                    </span>
                  ) : (
                    <Folder className="w-8 h-8 text-white" />
                  )}
                </div>
                <h3 className="font-semibold text-secondary-900 mb-1">
                  {location.name}
                </h3>
                {location.itemCount !== undefined && (
                  <p className="text-sm text-secondary-600">
                    {location.itemCount}개 물품
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-secondary-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              leftIcon={isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            >
              {isSidebarOpen ? '닫기' : '위치'}
            </Button>
            <h1 className="text-lg font-bold text-secondary-900">탐색</h1>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex">
        {/* Sidebar - Location Tree */}
        <aside
          className={cn(
            'fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-secondary-200 z-20 transition-transform duration-300',
            'lg:translate-x-0',
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
            'w-80 lg:w-80'
          )}
        >
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-secondary-200">
              <h2 className="text-lg font-bold text-secondary-900">위치</h2>
              {selectedLocationId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToRoot}
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                  className="mt-2"
                >
                  전체 보기
                </Button>
              )}
            </div>

            {/* Location Tree */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoadingLocations ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner size="lg" />
                </div>
              ) : error ? (
                <Alert variant="danger" className="mb-4">
                  {error}
                </Alert>
              ) : locations.length === 0 ? (
                <EmptyState
                  title="위치가 없습니다"
                  description="새로운 위치를 추가하여 시작하세요"
                />
              ) : (
                <div className="space-y-1">
                  {locations.map((location) => (
                    <LocationTree
                      key={location.id}
                      location={location}
                      onSelect={handleLocationSelect}
                      selectedId={selectedLocationId || undefined}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Backdrop for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-10 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          <div className="container mx-auto px-4 py-6 lg:py-8">
            {/* Breadcrumb */}
            {breadcrumbPath.length > 0 && (
              <div className="mb-6">
                <LocationBreadcrumb
                  path={breadcrumbPath}
                  onNavigate={handleBreadcrumbNavigate}
                />
              </div>
            )}

            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-2xl lg:text-3xl font-bold text-secondary-900 mb-2">
                {selectedLocationId ? breadcrumbPath[breadcrumbPath.length - 1]?.name || '탐색' : '물건 탐색'}
              </h1>
              <p className="text-secondary-600">
                {selectedLocationId 
                  ? '선택한 위치의 물품을 확인하세요' 
                  : '등록된 물품을 검색하고 찾아보세요'}
              </p>
            </div>

            {/* Location Cards (only show when no location selected) */}
            {!selectedLocationId && renderLocationCards()}

            {/* Filters */}
            <div className="mb-6">
              <ItemFilter
                onFilterChange={handleFilterChange}
                showLocationFilter={false}
              />
            </div>

            {/* Items List */}
            {isLoadingItems ? (
              <div className="flex items-center justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : error ? (
              <Alert variant="danger">
                {error}
              </Alert>
            ) : filteredItems.length === 0 && items.length > 0 ? (
              <EmptyState
                title="검색 결과가 없습니다"
                description="필터를 조정하거나 다른 검색어를 시도해보세요"
              />
            ) : (
              <ItemList
                items={filteredItems}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                sortBy={sortBy}
                onSortChange={handleSortChange}
                onItemClick={handleItemClick}
                emptyMessage={selectedLocationId ? '이 위치에 등록된 물품이 없습니다' : '등록된 물품이 없습니다'}
                emptyAction={{
                  label: '물품 추가하기',
                  onClick: () => router.push('/'),
                }}
              />
            )}
          </div>
        </main>
      </div>

      {/* Quick Add Button */}
      <QuickAddButton
        onAddItem={() => {
          router.push('/item/add')
        }}
        onAddLocation={() => {
          // TODO: Open add location modal
          router.push('/')
        }}
      />
    </div>
  )
}
