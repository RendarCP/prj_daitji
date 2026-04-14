export type LocationPathItem = {
  id: string;
  name: string;
  icon?: string | null;
};

export type ItemLocationInfo = {
  id: string;
  name: string | null;
  icon?: string | null;
  parent_id?: string | null;
};

export type DbItemForPanel = {
  id: string;
  name: string;
  type: string;
  image_url?: string | null;
  location_id: string;
  quantity: number | null;
  tags: string[] | null;
  created_at: string | null;
  metadata?: Record<string, unknown> | null;
};
