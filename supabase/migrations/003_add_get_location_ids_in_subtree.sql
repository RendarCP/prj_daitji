-- 선택한 위치 + 그 하위(자손) 모든 위치 id를 반환 (아이템 조회 시 "이 위치와 하위" 필터용)
CREATE OR REPLACE FUNCTION get_location_ids_in_subtree(location_uuid uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
AS $$
  WITH RECURSIVE subtree AS (
    SELECT id FROM locations WHERE id = location_uuid
    UNION ALL
    SELECT l.id FROM locations l
    INNER JOIN subtree s ON l.parent_id = s.id
  )
  SELECT id FROM subtree;
$$;

COMMENT ON FUNCTION get_location_ids_in_subtree(uuid) IS
  'Returns the given location id and all descendant location ids (for filtering items by location subtree).';
