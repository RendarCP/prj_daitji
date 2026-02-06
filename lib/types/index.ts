// Export all database types
export * from "./database.types";

// UI Component Props Types
export interface PageProps {
  params: { [key: string]: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

// Form Types
export interface ItemFormData {
  name: string;
  type: "FOOD" | "COSMETIC" | "MEDICINE" | "GENERAL";
  location_id: string;
  quantity: number;
  barcode?: string;
  image_url?: string;
  tags?: string[];
  metadata: {
    expiry_date?: string;
    opened_date?: string;
    pao?: number;
    purchase_date?: string;
    brand?: string;
    category?: string;
    notes?: string;
  };
}

export interface LocationFormData {
  name: string;
  level: number;
  parent_id?: string;
  icon?: string;
  color?: string;
  sort_order?: number;
}

// Filter & Sort Types
export interface ItemFilter {
  type?: string[];
  status?: string[];
  location_id?: string;
  tags?: string[];
  search?: string;
  expiring_within_days?: number;
}

export interface LocationFilter {
  level?: number;
  parent_id?: string | null;
  search?: string;
}

export interface SortOption {
  field: string;
  direction: "asc" | "desc";
}

// Dashboard Types
export interface DashboardStats {
  total_items: number;
  active_items: number;
  expiring_soon: number;
  expired: number;
  locations_count: number;
}

export interface ExpiringItem {
  id: string;
  name: string;
  type: string;
  expiry_date: string;
  days_until_expiry: number;
  location_name: string;
  location_path: string;
  image_url?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    per_page?: number;
    total?: number;
  };
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Client-side Item representation (with Date objects)
export interface ClientItem {
  id: string;
  name: string;
  type: "FOOD" | "COSMETIC" | "MEDICINE" | "GENERAL";
  status: "ACTIVE" | "CONSUMED" | "EXPIRED" | "DISCARDED";
  location_id: string;
  quantity: number;
  barcode?: string;
  image_url?: string;
  tags: string[];
  metadata: Record<string, any>;
  computed_expiry_date?: Date | null;
  created_at: Date;
  updated_at: Date;
}

// Client-side Location representation
export interface ClientLocation {
  id: string;
  name: string;
  level: number;
  parent_id?: string | null;
  icon?: string | null;
  color?: string | null;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}
