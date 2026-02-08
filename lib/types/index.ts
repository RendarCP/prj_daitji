// Item types
export interface Item {
  id: string
  name: string
  type: 'FOOD' | 'COSMETIC' | 'MEDICINE' | 'GENERAL'
  location_id: string
  location_path?: string
  quantity: number
  expiry_date?: string
  computed_expiry_date?: string
  days_until_expiry?: number
  tags?: string[]
  created_at?: string
  metadata?: Record<string, any>
}

// Expiring Item (from API)
export interface ExpiringItem {
  item_id: string
  item_name: string
  item_type: 'FOOD' | 'COSMETIC' | 'MEDICINE' | 'GENERAL'
  expiry_date?: string
  computed_expiry_date?: string
  days_until_expiry: number
  location_name?: string
  location_path?: string
}

// Location types
export interface Location {
  id: string
  name: string
  type?: string
  parent_id?: string | null
  level: number
  path?: string
  itemCount?: number
  item_count?: number
  icon?: string
  color?: string
  children?: Location[]
}

// Dashboard types
export interface DashboardStats {
  total_items: number
  active_items: number
  expiring_soon: number
  expired: number
  locations_count: number
}
