// Item types
export interface Item {
  id: string;
  item_name: string;
  type: "FOOD" | "COSMETIC" | "MEDICINE" | "GENERAL";
  location_id: string;
  image_url?: string | null;
  location_name?: string | null;
  location_path?: string | null;
  quantity: number;
  expiry_date?: string;
  computed_expiry_date?: string;
  days_until_expiry?: number;
  tags?: string[];
  created_at?: string;
  metadata?: Record<string, any>;
}

// Expiring Item (from API)
export interface ExpiringItem {
  item_id: string;
  item_name: string;
  item_type: "FOOD" | "COSMETIC" | "MEDICINE" | "GENERAL";
  image_url?: string | null;
  expiry_date?: string;
  computed_expiry_date?: string;
  days_until_expiry: number;
  location_name?: string;
  location_path?: string;
}

// Location types
export interface Location {
  id: string;
  name: string;
  parent_id?: string | null;
  level: number;
  path?: string;
  itemCount?: number;
  item_count?: number;
  icon?: string | null;
  color?: string | null;
  description?: string | null;
  sort_order?: number;
  children?: Location[];
}

// Dashboard types
export interface DashboardStats {
  total_items: number;
  active_items: number;
  expiring_soon: number;
  expired: number;
  locations_count: number;
}

export interface DashboardTypeStat {
  type: "FOOD" | "COSMETIC" | "MEDICINE" | "GENERAL";
  count: number;
}

export interface DashboardLocationStat {
  location_id: string;
  location_name: string;
  item_count: number;
  expiring_soon_count: number;
  level: number;
}

export interface DashboardExpiryBuckets {
  expired: number;
  due_in_3_days: number;
  due_in_7_days: number;
  safe: number;
}

export interface DashboardRecentAddedPoint {
  week_start: string;
  count: number;
}

export interface DashboardLocationHighlight {
  location_id: string;
  location_name: string;
  item_count: number;
  expiring_soon_count: number;
}

export interface DashboardHighlights {
  busiest_location: DashboardLocationHighlight | null;
  highest_risk_location: DashboardLocationHighlight | null;
}

export interface DashboardOverviewResponse extends DashboardStats {
  low_stock_count: number;
  by_type: DashboardTypeStat[];
  by_location: DashboardLocationStat[];
  expiry_buckets: DashboardExpiryBuckets;
  recent_added_by_week: DashboardRecentAddedPoint[];
  highlights: DashboardHighlights;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: Record<string, unknown>;
}
