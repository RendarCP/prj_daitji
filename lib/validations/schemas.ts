import { z } from 'zod'

/**
 * Validation schemas for API request bodies and query parameters
 */

// Item Type and Status Enums
export const ItemTypeSchema = z.enum(['FOOD', 'COSMETIC', 'MEDICINE', 'GENERAL'])
export const ItemStatusSchema = z.enum(['ACTIVE', 'CONSUMED', 'EXPIRED', 'DISCARDED'])

// Item Metadata Schema
export const ItemMetadataSchema = z.object({
  expiry_date: z.string().datetime().optional(),
  opened_date: z.string().datetime().optional(),
  pao: z.number().int().positive().optional(),
  purchase_date: z.string().datetime().optional(),
  brand: z.string().min(1).max(100).optional(),
  category: z.string().min(1).max(100).optional(),
  notes: z.string().max(1000).optional(),
  prescription: z.boolean().optional(),
  dosage: z.string().max(200).optional(),
  warnings: z.array(z.string()).optional(),
  warranty_until: z.string().datetime().optional(),
  manufacturer: z.string().max(100).optional(),
  model: z.string().max(100).optional(),
}).passthrough() // Allow additional fields

// Item Form Data Schema
export const ItemFormDataSchema = z.object({
  name: z.string().min(1, '이름은 필수입니다').max(200),
  type: ItemTypeSchema,
  location_id: z.string().uuid('위치 ID 형식이 올바르지 않습니다'),
  quantity: z.number().int().min(0).default(1),
  barcode: z.string().max(100).optional(),
  image_url: z.string().url().optional().or(z.literal('')),
  tags: z.array(z.string().max(50)).default([]),
  metadata: ItemMetadataSchema.default({}),
})

// Partial Item Update Schema
export const ItemUpdateSchema = ItemFormDataSchema.partial()

// Location Form Data Schema
export const LocationFormDataSchema = z.object({
  name: z.string().min(1, '이름은 필수입니다').max(100),
  level: z.number().int().min(1).max(10),
  parent_id: z.string().uuid().optional().nullable(),
  icon: z.string().max(50).optional().nullable(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),
  sort_order: z.number().int().min(0).optional(),
})

// Partial Location Update Schema
export const LocationUpdateSchema = LocationFormDataSchema.partial()

// Query Parameter Schemas
export const ItemsQuerySchema = z.object({
  type: z.string().optional(),
  status: z.string().optional(),
  location_id: z.string().uuid().optional(),
  search: z.string().optional(),
  expiring_within_days: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().positive().default(1),
  per_page: z.coerce.number().int().positive().max(100).default(20),
  sort_by: z.string().default('created_at'),
  sort_dir: z.enum(['asc', 'desc']).default('desc'),
})

export const LocationsQuerySchema = z.object({
  level: z.coerce.number().int().min(1).max(10).optional(),
  parent_id: z.string().uuid().optional().nullable(),
  search: z.string().optional(),
  tree: z.enum(['true', 'false']).default('false').transform(val => val === 'true'),
})

export const ExpiringItemsQuerySchema = z.object({
  days: z.coerce.number().int().positive().default(7),
})

// Type exports
export type ItemFormDataInput = z.infer<typeof ItemFormDataSchema>
export type ItemUpdateInput = z.infer<typeof ItemUpdateSchema>
export type LocationFormDataInput = z.infer<typeof LocationFormDataSchema>
export type LocationUpdateInput = z.infer<typeof LocationUpdateSchema>
export type ItemsQueryInput = z.infer<typeof ItemsQuerySchema>
export type LocationsQueryInput = z.infer<typeof LocationsQuerySchema>
export type ExpiringItemsQueryInput = z.infer<typeof ExpiringItemsQuerySchema>
