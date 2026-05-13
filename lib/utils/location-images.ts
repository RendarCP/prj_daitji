const LOCATION_IMAGE_PRESETS = [
  {
    key: "kitchen",
    label: "주방",
    src: "/images/locations/kitchen.png",
    patterns: ["주방", "부엌", "kitchen", "pantry", "sink", "싱크"],
  },
  {
    key: "living-room",
    label: "거실",
    src: "/images/locations/living-room.png",
    patterns: ["거실", "living", "lounge", "sofa", "tv"],
  },
  {
    key: "bedroom",
    label: "침실",
    src: "/images/locations/bedroom.png",
    patterns: ["침실", "안방", "bedroom", "bed", "sleep"],
  },
  {
    key: "bathroom",
    label: "화장실",
    src: "/images/locations/bathroom.png",
    patterns: ["화장실", "욕실", "bathroom", "restroom", "toilet", "bath"],
  },
  {
    key: "study",
    label: "서재",
    src: "/images/locations/study.png",
    patterns: ["서재", "공부방", "작업실", "오피스", "study", "office", "desk"],
  },
  {
    key: "closet",
    label: "옷방",
    src: "/images/locations/closet.png",
    patterns: ["옷방", "드레스룸", "드레스", "closet", "wardrobe", "dress"],
  },
  {
    key: "default-room",
    label: "기본 방",
    src: "/images/locations/default-room.png",
    patterns: ["방", "room"],
  },
] as const;

const FALLBACK_LOCATION_IMAGE = LOCATION_IMAGE_PRESETS.at(-1)!;

export function getLocationImage(name?: string | null) {
  if (!name) {
    return FALLBACK_LOCATION_IMAGE;
  }

  const normalizedName = name.trim().toLowerCase();
  const matchedPreset = LOCATION_IMAGE_PRESETS.find((preset) =>
    preset.patterns.some((pattern) => normalizedName.includes(pattern.toLowerCase())),
  );

  return matchedPreset ?? FALLBACK_LOCATION_IMAGE;
}
