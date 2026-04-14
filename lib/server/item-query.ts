export const ITEM_LIST_SELECT = `
  id,
  name,
  type,
  status,
  quantity,
  barcode,
  image_url,
  tags,
  metadata,
  location_id,
  created_at,
  updated_at,
  location:locations(id, name, level)
`;

export const ITEM_WITH_LOCATION_SELECT = `
  id,
  name,
  type,
  location_id,
  quantity,
  barcode,
  image_url,
  tags,
  metadata,
  status,
  created_at,
  updated_at,
  user_id,
  location:locations(
    id,
    name,
    icon,
    parent_id,
    level,
    sort_order,
    color,
    created_at,
    updated_at,
    user_id
  )
`;

export const ITEM_DETAIL_SELECT = `
  id,
  name,
  type,
  image_url,
  location_id,
  quantity,
  tags,
  created_at,
  metadata,
  location:locations(id, name, icon, parent_id)
`;
