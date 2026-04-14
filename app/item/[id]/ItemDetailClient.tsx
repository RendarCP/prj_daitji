'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Edit2, 
  Save, 
  X, 
  Trash2, 
  Package, 
  Barcode, 
  Calendar,
  MapPin,
  Tag as TagIcon,
  Image as ImageIcon,
  Clock,
  ShoppingCart,
  Pill,
  AlertTriangle,
  Info
} from 'lucide-react'
import { BottomNav } from '@/components/layout/BottomNav'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { LocationBreadcrumb } from '@/components/features/LocationBreadcrumb'
import { ExpiryStatus } from '@/components/features/ExpiryStatus'
import { useToastError } from '@/lib/hooks/useToastError'
import { formatDate } from '@/lib/utils/format'
import type { Database } from '@/lib/types/database.types'

type ItemMetadata = {
  expiry_date?: string
  opened_date?: string
  pao?: number
  purchase_date?: string
  brand?: string
  category?: string
  notes?: string
  prescription?: boolean
  dosage?: string
  warnings?: string[]
  warranty_until?: string
  manufacturer?: string
  model?: string
}

type Item = Database['public']['Tables']['items']['Row'] & {
  location?: Database['public']['Tables']['locations']['Row']
  metadata: ItemMetadata
}

type Location = {
  id: string
  name: string
  level: number
  parent_id?: string | null
  icon?: string | null
}

interface ItemDetailClientProps {
  item: Item
  locationPath: Array<{ id: string; name: string; icon?: string | null }>
  allLocations: Location[]
}

const ITEM_TYPE_OPTIONS = [
  { value: 'FOOD', label: '식품' },
  { value: 'COSMETIC', label: '화장품' },
  { value: 'MEDICINE', label: '의약품' },
  { value: 'GENERAL', label: '일반' },
]

const ITEM_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: '사용 중' },
  { value: 'CONSUMED', label: '소비됨' },
  { value: 'EXPIRED', label: '만료됨' },
  { value: 'DISCARDED', label: '폐기됨' },
]

const DATE_METADATA_KEYS = {
  FOOD: ['expiry_date', 'purchase_date'],
  COSMETIC: ['opened_date'],
  MEDICINE: ['expiry_date'],
  GENERAL: ['purchase_date', 'warranty_until'],
} as const

// TODO: Remove this temporary fallback once date input UX is standardized.
function getLocalDateInputValue() {
  const now = new Date()
  const timezoneOffsetMs = now.getTimezoneOffset() * 60 * 1000
  return new Date(now.getTime() - timezoneOffsetMs).toISOString()
}

export function ItemDetailClient({ item: initialItem, locationPath, allLocations }: ItemDetailClientProps) {
  const router = useRouter()
  const [item, setItem] = useState(initialItem)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  useToastError(error, {
    title: isEditing ? '물품을 수정할 수 없습니다.' : '물품을 처리할 수 없습니다.',
  })

  // Form state
  const [formData, setFormData] = useState({
    name: item.name,
    type: item.type,
    status: item.status,
    location_id: item.location_id,
    quantity: item.quantity ?? 0,
    barcode: item.barcode || '',
    image_url: item.image_url || '',
    tags: item.tags || [],
    metadata: (item.metadata || {}) as ItemMetadata,
  })

  const [tagInput, setTagInput] = useState('')

  const handleEdit = () => {
    setIsEditing(true)
    setError(null)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({
      name: item.name,
      type: item.type,
      status: item.status,
      location_id: item.location_id,
      quantity: item.quantity ?? 0,
      barcode: item.barcode || '',
      image_url: item.image_url || '',
      tags: item.tags || [],
      metadata: (item.metadata || {}) as ItemMetadata,
    })
    setError(null)
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError(null)

      const response = await fetch(`/api/items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error?.message || '물품 수정에 실패했습니다')
      }

      setItem(result.data)
      setIsEditing(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      setError(null)

      const response = await fetch(`/api/items/${item.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error?.message || '물품 삭제에 실패했습니다')
      }

      router.push('/explorer')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다')
      setIsDeleteModalOpen(false)
    } finally {
      setIsDeleting(false)
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      })
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag),
    })
  }

  const updateMetadata = (key: string, value: any) => {
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        [key]: value || undefined,
      },
    })
  }

  useEffect(() => {
    if (!isEditing) {
      return
    }

    const dateKeys = DATE_METADATA_KEYS[formData.type as keyof typeof DATE_METADATA_KEYS]
    if (!dateKeys) {
      return
    }

    const missingDateKeys = dateKeys.filter((key) => {
      const value = formData.metadata[key as keyof ItemMetadata]
      return typeof value !== 'string' || !value
    })

    if (missingDateKeys.length === 0) {
      return
    }

    const defaultDateValue = getLocalDateInputValue()

    setFormData((currentFormData) => {
      const nextMetadata = { ...currentFormData.metadata }

      for (const key of missingDateKeys) {
        const currentValue = nextMetadata[key as keyof ItemMetadata]
        if (typeof currentValue !== 'string' || !currentValue) {
          nextMetadata[key as keyof ItemMetadata] = defaultDateValue as never
        }
      }

      return {
        ...currentFormData,
        metadata: nextMetadata,
      }
    })
  }, [formData.metadata, formData.type, isEditing])

  const locationOptions = allLocations.map(loc => ({
    value: loc.id,
    label: `${'  '.repeat(loc.level - 1)}${loc.icon ? loc.icon + ' ' : ''}${loc.name}`,
  }))

  // Calculate expiry date for display
  const getExpiryDate = (): string | null => {
    const metadata = item.metadata as ItemMetadata
    if (item.type === 'FOOD' && metadata?.expiry_date) {
      return metadata.expiry_date
    }
    if (item.type === 'COSMETIC' && metadata?.opened_date && metadata?.pao) {
      const openedDate = new Date(metadata.opened_date)
      const expiryDate = new Date(openedDate)
      expiryDate.setMonth(expiryDate.getMonth() + metadata.pao)
      return expiryDate.toISOString()
    }
    if (item.type === 'MEDICINE' && metadata?.expiry_date) {
      return metadata.expiry_date
    }
    return null
  }

  const expiryDate = getExpiryDate()

  return (
    <div className="min-h-screen bg-secondary/10">
      <main className="pb-24">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <PageHeader
            title={isEditing ? '물품 수정' : item.name}
            description={isEditing ? '물품 정보를 수정하세요' : '물품 상세 정보'}
            onBack={() => router.back()}
          />

          <div className="space-y-6">
            {/* Image Section */}
            <Card>
              <div className="aspect-video bg-secondary/20 rounded-lg overflow-hidden relative">
                {(isEditing ? formData.image_url : item.image_url) ? (
                  <Image
                    src={isEditing ? formData.image_url : item.image_url!}
                    alt={item.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 1024px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-20 h-20 text-muted-foreground" />
                  </div>
                )}
              </div>
              
              {isEditing && (
                <div className="mt-4">
                  <Input
                    label="이미지 URL"
                    placeholder="https://example.com/image.jpg"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    leftIcon={<ImageIcon className="w-4 h-4" />}
                  />
                </div>
              )}
            </Card>

            {/* Basic Information */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">기본 정보</h2>
                {!isEditing && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Edit2 className="w-4 h-4" />}
                      onClick={handleEdit}
                    >
                      수정
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      leftIcon={<Trash2 className="w-4 h-4" />}
                      onClick={() => setIsDeleteModalOpen(true)}
                    >
                      삭제
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {isEditing ? (
                  <>
                    <Input
                      label="물품 이름"
                      placeholder="물품 이름을 입력하세요"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      leftIcon={<Package className="w-4 h-4" />}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Select
                        label="타입"
                        options={ITEM_TYPE_OPTIONS}
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                        required
                      />

                      <Select
                        label="상태"
                        options={ITEM_STATUS_OPTIONS}
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        required
                      />
                    </div>

                    <Input
                      label="수량"
                      type="number"
                      min="0"
                      value={formData.quantity ?? 0}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                      required
                    />

                    <Input
                      label="바코드"
                      placeholder="바코드 번호"
                      value={formData.barcode}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      leftIcon={<Barcode className="w-4 h-4" />}
                    />

                    <Select
                      label="위치"
                      options={locationOptions}
                      value={formData.location_id}
                      onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
                      required
                      leftIcon={<MapPin className="w-4 h-4" />}
                    />
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <Badge variant="primary">{ITEM_TYPE_OPTIONS.find(o => o.value === item.type)?.label}</Badge>
                      <Badge variant={item.status === 'ACTIVE' ? 'success' : 'secondary'}>
                        {ITEM_STATUS_OPTIONS.find(o => o.value === item.status)?.label}
                      </Badge>
                      {expiryDate && <ExpiryStatus expiryDate={expiryDate} size="sm" />}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">수량</div>
                        <div className="font-medium">{item.quantity}개</div>
                      </div>

                      {item.barcode && (
                        <div>
                          <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                            <Barcode className="w-4 h-4" />
                            바코드
                          </div>
                          <div className="font-mono text-sm">{item.barcode}</div>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        위치
                      </div>
                      <LocationBreadcrumb 
                        path={locationPath} 
                        onNavigate={(id) => router.push(`/explorer?location=${id}`)}
                      />
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Tags */}
            <Card>
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <TagIcon className="w-5 h-5" />
                태그
              </h2>

              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="태그 입력 (엔터로 추가)"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addTag()
                        }
                      }}
                      fullWidth
                    />
                    <Button size="sm" onClick={addTag}>추가</Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                        {tag}
                        <X className="w-3 h-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {item.tags && item.tags.length > 0 ? (
                    item.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground">태그가 없습니다</p>
                  )}
                </div>
              )}
            </Card>

            {/* Type-specific Metadata */}
            {(isEditing || Object.keys((item.metadata as ItemMetadata) || {}).length > 0) && (
              <Card>
                <h2 className="text-xl font-bold text-foreground mb-4">상세 정보</h2>

                <div className="space-y-4">
                  {/* FOOD metadata */}
                  {formData.type === 'FOOD' && (
                    <>
                      <Input
                        label="유통기한"
                        type="date"
                        value={formData.metadata.expiry_date ? formData.metadata.expiry_date.split('T')[0] : ''}
                        onChange={(e) => updateMetadata('expiry_date', e.target.value ? new Date(e.target.value).toISOString() : null)}
                        leftIcon={<Calendar className="w-4 h-4" />}
                        disabled={!isEditing}
                      />
                      <Input
                        label="구매일"
                        type="date"
                        value={formData.metadata.purchase_date ? formData.metadata.purchase_date.split('T')[0] : ''}
                        onChange={(e) => updateMetadata('purchase_date', e.target.value ? new Date(e.target.value).toISOString() : null)}
                        leftIcon={<ShoppingCart className="w-4 h-4" />}
                        disabled={!isEditing}
                      />
                      <Input
                        label="브랜드"
                        placeholder="브랜드명"
                        value={formData.metadata.brand || ''}
                        onChange={(e) => updateMetadata('brand', e.target.value)}
                        disabled={!isEditing}
                      />
                      <Input
                        label="카테고리"
                        placeholder="식품 카테고리"
                        value={formData.metadata.category || ''}
                        onChange={(e) => updateMetadata('category', e.target.value)}
                        disabled={!isEditing}
                      />
                    </>
                  )}

                  {/* COSMETIC metadata */}
                  {formData.type === 'COSMETIC' && (
                    <>
                      <Input
                        label="개봉일"
                        type="date"
                        value={formData.metadata.opened_date ? formData.metadata.opened_date.split('T')[0] : ''}
                        onChange={(e) => updateMetadata('opened_date', e.target.value ? new Date(e.target.value).toISOString() : null)}
                        leftIcon={<Calendar className="w-4 h-4" />}
                        disabled={!isEditing}
                      />
                      <Input
                        label="PAO (개봉 후 사용기한, 개월)"
                        type="number"
                        placeholder="12"
                        value={formData.metadata.pao || ''}
                        onChange={(e) => updateMetadata('pao', e.target.value ? parseInt(e.target.value) : null)}
                        leftIcon={<Clock className="w-4 h-4" />}
                        disabled={!isEditing}
                        helperText="개봉 후 사용 가능한 개월 수"
                      />
                      <Input
                        label="브랜드"
                        placeholder="브랜드명"
                        value={formData.metadata.brand || ''}
                        onChange={(e) => updateMetadata('brand', e.target.value)}
                        disabled={!isEditing}
                      />
                      <Input
                        label="카테고리"
                        placeholder="화장품 카테고리"
                        value={formData.metadata.category || ''}
                        onChange={(e) => updateMetadata('category', e.target.value)}
                        disabled={!isEditing}
                      />
                    </>
                  )}

                  {/* MEDICINE metadata */}
                  {formData.type === 'MEDICINE' && (
                    <>
                      <Input
                        label="유효기한"
                        type="date"
                        value={formData.metadata.expiry_date ? formData.metadata.expiry_date.split('T')[0] : ''}
                        onChange={(e) => updateMetadata('expiry_date', e.target.value ? new Date(e.target.value).toISOString() : null)}
                        leftIcon={<Calendar className="w-4 h-4" />}
                        disabled={!isEditing}
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="prescription"
                          checked={formData.metadata.prescription || false}
                          onChange={(e) => updateMetadata('prescription', e.target.checked)}
                          disabled={!isEditing}
                          className="w-4 h-4 text-primary rounded"
                        />
                        <label htmlFor="prescription" className="text-sm font-medium text-foreground flex items-center gap-1">
                          <Pill className="w-4 h-4" />
                          전문의약품
                        </label>
                      </div>
                      <Input
                        label="복용량"
                        placeholder="1일 3회, 1회 1정"
                        value={formData.metadata.dosage || ''}
                        onChange={(e) => updateMetadata('dosage', e.target.value)}
                        disabled={!isEditing}
                      />
                      {isEditing ? (
                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4" />
                            주의사항
                          </label>
                          <textarea
                            className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                            rows={3}
                            placeholder="주의사항을 입력하세요 (줄바꿈으로 구분)"
                            value={formData.metadata.warnings?.join('\n') || ''}
                            onChange={(e) => updateMetadata('warnings', e.target.value.split('\n').filter(w => w.trim()))}
                          />
                        </div>
                      ) : (
                        formData.metadata.warnings && formData.metadata.warnings.length > 0 && (
                          <div>
                            <div className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
                              <AlertTriangle className="w-4 h-4" />
                              주의사항
                            </div>
                            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                              {formData.metadata.warnings.map((warning: string, idx: number) => (
                                <li key={idx}>{warning}</li>
                              ))}
                            </ul>
                          </div>
                        )
                      )}
                    </>
                  )}

                  {/* GENERAL metadata */}
                  {formData.type === 'GENERAL' && (
                    <>
                      <Input
                        label="구매일"
                        type="date"
                        value={formData.metadata.purchase_date ? formData.metadata.purchase_date.split('T')[0] : ''}
                        onChange={(e) => updateMetadata('purchase_date', e.target.value ? new Date(e.target.value).toISOString() : null)}
                        leftIcon={<ShoppingCart className="w-4 h-4" />}
                        disabled={!isEditing}
                      />
                      <Input
                        label="품질보증기간"
                        type="date"
                        value={formData.metadata.warranty_until ? formData.metadata.warranty_until.split('T')[0] : ''}
                        onChange={(e) => updateMetadata('warranty_until', e.target.value ? new Date(e.target.value).toISOString() : null)}
                        leftIcon={<Calendar className="w-4 h-4" />}
                        disabled={!isEditing}
                      />
                      <Input
                        label="제조사"
                        placeholder="제조사명"
                        value={formData.metadata.manufacturer || ''}
                        onChange={(e) => updateMetadata('manufacturer', e.target.value)}
                        disabled={!isEditing}
                      />
                      <Input
                        label="모델명"
                        placeholder="모델명/제품번호"
                        value={formData.metadata.model || ''}
                        onChange={(e) => updateMetadata('model', e.target.value)}
                        disabled={!isEditing}
                      />
                      {isEditing ? (
                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
                            <Info className="w-4 h-4" />
                            메모
                          </label>
                          <textarea
                            className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                            rows={3}
                            placeholder="추가 정보를 입력하세요"
                            value={formData.metadata.notes || ''}
                            onChange={(e) => updateMetadata('notes', e.target.value)}
                          />
                        </div>
                      ) : (
                        formData.metadata.notes && (
                          <div>
                            <div className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
                              <Info className="w-4 h-4" />
                              메모
                            </div>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{formData.metadata.notes}</p>
                          </div>
                        )
                      )}
                    </>
                  )}
                </div>
              </Card>
            )}

            {/* Metadata - Created/Updated */}
            <Card>
              <h2 className="text-xl font-bold text-foreground mb-4">시스템 정보</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground mb-1">등록일</div>
                  <div className="font-medium">{item.created_at ? formatDate(item.created_at) : '-'}</div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">수정일</div>
                  <div className="font-medium">{item.updated_at ? formatDate(item.updated_at) : '-'}</div>
                </div>
              </div>
            </Card>

            {/* Action Buttons (Edit Mode) */}
            {isEditing && (
              <div className="flex gap-3">
                <Button
                  variant="primary"
                  leftIcon={<Save className="w-4 h-4" />}
                  onClick={handleSave}
                  isLoading={isSaving}
                  fullWidth
                >
                  저장
                </Button>
                <Button
                  variant="secondary"
                  leftIcon={<X className="w-4 h-4" />}
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  취소
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <BottomNav />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="물품 삭제"
        description="정말 이 물품을 삭제하시겠습니까?"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              취소
            </Button>
            <Button
              variant="danger"
              leftIcon={<Trash2 className="w-4 h-4" />}
              onClick={handleDelete}
              isLoading={isDeleting}
            >
              삭제
            </Button>
          </>
        }
      >
        <p className="text-foreground">
          <strong>{item.name}</strong>을(를) 삭제하면 복구할 수 없습니다.
        </p>
      </Modal>
    </div>
  )
}
