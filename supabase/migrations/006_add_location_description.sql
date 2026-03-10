ALTER TABLE public.locations
ADD COLUMN IF NOT EXISTS description TEXT;

COMMENT ON COLUMN public.locations.description IS '위치에 대한 추가 설명';
