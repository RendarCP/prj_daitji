-- ============================================================================
-- DAITJI Database Migration v1.3 - Enable RLS And Secure Views
-- ============================================================================
-- Description: public.items / public.locations RLS 활성화 및 view 보안 속성 정리
-- Created: 2026-04-21
-- ============================================================================

-- ============================================================================
-- 1. ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.locations FORCE ROW LEVEL SECURITY;
ALTER TABLE public.items FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own locations" ON public.locations;
DROP POLICY IF EXISTS "Users can create their own locations" ON public.locations;
DROP POLICY IF EXISTS "Users can update their own locations" ON public.locations;
DROP POLICY IF EXISTS "Users can delete their own locations" ON public.locations;

CREATE POLICY "Users can view their own locations"
  ON public.locations
  FOR SELECT
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can create their own locations"
  ON public.locations
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update their own locations"
  ON public.locations
  FOR UPDATE
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can delete their own locations"
  ON public.locations
  FOR DELETE
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own items" ON public.items;
DROP POLICY IF EXISTS "Users can create their own items" ON public.items;
DROP POLICY IF EXISTS "Users can update their own items" ON public.items;
DROP POLICY IF EXISTS "Users can delete their own items" ON public.items;

CREATE POLICY "Users can view their own items"
  ON public.items
  FOR SELECT
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can create their own items"
  ON public.items
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update their own items"
  ON public.items
  FOR UPDATE
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can delete their own items"
  ON public.items
  FOR DELETE
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

COMMENT ON POLICY "Users can view their own locations" ON public.locations IS
  'Authenticated users can read only their own locations.';
COMMENT ON POLICY "Users can create their own locations" ON public.locations IS
  'Authenticated users can create only locations owned by themselves.';
COMMENT ON POLICY "Users can update their own locations" ON public.locations IS
  'Authenticated users can update only their own locations.';
COMMENT ON POLICY "Users can delete their own locations" ON public.locations IS
  'Authenticated users can delete only their own locations.';

COMMENT ON POLICY "Users can view their own items" ON public.items IS
  'Authenticated users can read only their own items.';
COMMENT ON POLICY "Users can create their own items" ON public.items IS
  'Authenticated users can create only items owned by themselves.';
COMMENT ON POLICY "Users can update their own items" ON public.items IS
  'Authenticated users can update only their own items.';
COMMENT ON POLICY "Users can delete their own items" ON public.items IS
  'Authenticated users can delete only their own items.';

-- ============================================================================
-- 2. VIEW SECURITY
-- ============================================================================

ALTER VIEW IF EXISTS public.v_active_items_with_location
  SET (security_invoker = true);

ALTER VIEW IF EXISTS public.v_location_item_counts
  SET (security_invoker = true);

-- 원격 프로젝트에 남아 있을 수 있는 legacy view도 함께 정리한다.
ALTER VIEW IF EXISTS public.v_location_stats
  SET (security_invoker = true);
