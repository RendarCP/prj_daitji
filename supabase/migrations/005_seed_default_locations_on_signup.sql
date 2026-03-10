-- ============================================================================
-- DAITJI Database Migration v1.2 - Default Locations On Signup
-- ============================================================================
-- Description: 신규 회원 가입 시 기본 위치(침실, 주방, 화장실) 자동 생성
-- Created: 2026-03-07
-- ============================================================================

-- 신규 회원 생성 시 기본 위치를 자동으로 주입한다.
CREATE OR REPLACE FUNCTION public.seed_default_locations_for_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 동일 유저에 대해 레벨 1 기본 위치가 이미 있다면 중복 생성하지 않는다.
  IF EXISTS (
    SELECT 1
    FROM public.locations
    WHERE user_id = NEW.id
      AND level = 1
      AND name IN ('침실', '주방', '화장실')
  ) THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.locations (user_id, parent_id, name, level, icon, sort_order)
  VALUES
    (NEW.id, NULL, '침실', 1, 'bed', 0),
    (NEW.id, NULL, '주방', 1, 'chef-hat', 1),
    (NEW.id, NULL, '화장실', 1, 'bath', 2);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_seed_default_locations_on_signup ON auth.users;

CREATE TRIGGER trg_seed_default_locations_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.seed_default_locations_for_new_user();
