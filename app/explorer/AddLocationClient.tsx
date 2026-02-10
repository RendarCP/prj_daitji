"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Save, X, MapPin, Box, Home, FolderOpen } from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select, SelectOption } from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import { cn } from "@/lib/utils/cn";

type Location = {
  id: string;
  name: string;
  level: number;
  parent_id?: string | null;
  icon?: string | null;
};

interface AddLocationClientProps {
  locations: Location[];
  mode?: "page" | "modal";
}

const LOCATION_TYPE_OPTIONS: SelectOption[] = [
  { value: "ROOM", label: "Room (방)" },
  { value: "FURNITURE", label: "Furniture (가구)" },
  { value: "BOX", label: "Box (상자)" },
  { value: "SHELF", label: "Shelf (선반)" },
  { value: "OTHER", label: "Other (기타)" },
];

const SUGGESTED_ICONS = [
  "🏠",
  "🛏️",
  "🛋️",
  "📦",
  "📚",
  "👗",
  "🍽️",
  "🚿",
  "🚗",
  "🏢",
];

export function AddLocationClient({
  locations,
  mode = "page",
}: AddLocationClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const parentIdParam = searchParams.get("parent_id");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-process locations into a map for children lookup
  // Key: parent_id (or 'root'), Value: Location[]
  const locationMap = locations.reduce(
    (acc, loc) => {
      const parentId = loc.parent_id || "root";
      if (!acc[parentId]) {
        acc[parentId] = [];
      }
      acc[parentId].push(loc);
      return acc;
    },
    {} as Record<string, Location[]>,
  );

  // Find path to a location (for auto-fill)
  const findPathToLocation = (targetId: string): string[] => {
    const path: string[] = [];
    let currentId: string | null | undefined = targetId;

    // Safety break to prevent infinite loops in cyclic data (though shouldn't happen)
    let depth = 0;
    while (currentId && depth < 20) {
      const loc = locations.find((l) => l.id === currentId);
      if (loc) {
        path.unshift(loc.id);
        currentId = loc.parent_id;
      } else {
        break;
      }
      depth++;
    }
    return path;
  };

  // Initialize selection path
  const initialPath = parentIdParam ? findPathToLocation(parentIdParam) : [];
  const [selectionPath, setSelectionPath] = useState<string[]>(initialPath);

  // Sync formData.parent_id with selectionPath
  const currentParentId =
    selectionPath.length > 0 ? selectionPath[selectionPath.length - 1] : "";

  // Form state
  // We don't store parent_id in formData anymore, we derive it from selectionPath
  const [formData, setFormData] = useState({
    name: "",
    type: "ROOM",
    icon: "📦",
    description: "",
  });

  // Update selection path when user changes a dropdown
  // levelIndex: 0 for root, 1 for child of root, etc.
  // selectedId: the ID selected at this level
  const handleLocationChange = (levelIndex: number, selectedId: string) => {
    const newPath = selectionPath.slice(0, levelIndex);
    if (selectedId) {
      newPath.push(selectedId);
    }
    setSelectionPath(newPath);
  };

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Location name is required";
    }

    if (!formData.type) {
      newErrors.type = "Type is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setError("Please check your input");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Calculate level
      let level = 1;
      if (currentParentId) {
        const parentLocation = locations.find(
          (loc) => loc.id === currentParentId,
        );
        if (parentLocation) {
          level = parentLocation.level + 1;
        }
      }

      const payload = {
        name: formData.name.trim(),
        type: formData.type,
        parent_id: currentParentId || null,
        level: level,
        icon: formData.icon,
        description: formData.description.trim() || undefined,
      };

      const response = await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || "Failed to add location");
      }

      // Navigate back to explorer, focusing on the new location or its parent
      if (mode === "modal") {
        window.location.href = currentParentId
          ? `/explorer?location_id=${currentParentId}`
          : "/explorer";
      } else {
        if (currentParentId) {
          router.push(`/explorer?location_id=${currentParentId}`);
        } else {
          router.push("/explorer");
        }
        router.refresh();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  // Render location selects
  const renderLocationSelects = () => {
    const selects = [];

    // Always show root level
    // Id of the parent for this level's options
    // For level 0, parent is 'root'
    // For level 1, parent is selectionPath[0]

    // We iterate up to selectionPath.length + 1 to show the next available level
    // But only if the last selected item has children

    // Actually, simpler logic:
    // Starts with parentId = 'root'
    // Loop:
    // 1. Get options for parentId.
    // 2. If no options, break.
    // 3. Render select.
    // 4. Get selectedId from selectionPath at current index.
    // 5. If selectedId exists, set parentId = selectedId and continue.
    // 6. Else break.

    let currentLevelParentId = "root";
    let levelIndex = 0;

    while (true) {
      const options = locationMap[currentLevelParentId] || [];

      if (options.length === 0 && levelIndex > 0) {
        break;
      }

      const selectedId = selectionPath[levelIndex] || "";

      const selectOptions: SelectOption[] = [
        {
          value: "",
          label: levelIndex === 0 ? "루트 (최상위)" : "선택...",
        },
        ...options.map((loc) => ({
          value: loc.id,
          label: `${loc.icon ? loc.icon + " " : ""}${loc.name}`,
        })),
      ];

      // Capture current index for closure
      const index = levelIndex;

      selects.push(
        <div key={index} className="mb-2 last:mb-0">
          <Select
            label={index === 0 ? "Parent Location" : undefined}
            options={selectOptions}
            value={selectedId}
            onChange={(e) => handleLocationChange(index, e.target.value)}
            leftIcon={
              index === 0 ? <FolderOpen className="w-4 h-4" /> : undefined
            }
            placeholder={index === 0 ? "루트 (최상위)" : "하위 위치 선택..."}
            // className={
            //   index > 0 ? "ml-8 border-l-2 border-l-secondary-200 pl-4" : ""
            // }
          />
        </div>,
      );

      if (!selectedId) {
        break;
      }

      currentLevelParentId = selectedId;
      levelIndex++;
    }

    return selects;
  };

  const isModal = mode === "modal";

  return (
    <div
      className={cn(
        "flex flex-col min-h-0",
        isModal ? "bg-background h-full" : "bg-secondary-50 flex-1",
      )}
    >
      <main className={cn("flex-1 overflow-y-auto", "pb-20")}>
        <div
          className={cn(
            "container mx-auto px-4 py-6 max-w-4xl",
            isModal && "p-6",
          )}
        >
          {error && (
            <Alert variant="danger" className="mb-6">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <h2 className="text-xl font-bold text-secondary-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Location Details
              </h2>

              <div className="space-y-4">
                {/* Icon Selection */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Icon
                  </label>
                  <div className="flex gap-2 flex-wrap mb-2">
                    {SUGGESTED_ICONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon })}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg text-xl border transition-colors ${
                          formData.icon === icon
                            ? "bg-primary-50 border-primary-500 ring-2 ring-primary-200"
                            : "bg-white border-secondary-200 hover:bg-secondary-50"
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Or type an emoji..."
                      value={formData.icon || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, icon: e.target.value })
                      }
                      maxLength={2}
                      className="w-20 text-center text-2xl"
                    />
                    <div className="text-xs text-secondary-500 flex items-center">
                      Select an icon or type your own emoji to represent this
                      location.
                    </div>
                  </div>
                </div>

                <Input
                  label="위치 이름"
                  placeholder="예: 거실, 빨간색 상자, 상단 선반.."
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  leftIcon={<Home className="w-4 h-4" />}
                  error={errors.name}
                />

                <Select
                  label="Type"
                  options={LOCATION_TYPE_OPTIONS}
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  required
                  leftIcon={<Box className="w-4 h-4" />}
                  error={errors.type}
                />

                {/* Cascading Location Selection */}
                <div className="space-y-2">
                  {renderLocationSelects()}
                  <p className="text-xs text-secondary-500 mt-1 whitespace-pre-wrap">
                    {`부모 위치를 선택하여 이 항목을 중첩하세요.
                    "루트"로두면 최상위 위치가 됩니다.`}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    rows={3}
                    placeholder="Add details about this location..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
              </div>
            </Card>

            {/* Action Buttons - 모달/페이지 동일 스타일 (하단 바, 페이지에서는 BottomNav 위에 고정) */}
            <div
              className={cn(
                "py-4 p-4 border-t border-border bg-card/95 backdrop-blur-md",
                isModal
                  ? "z-10 absolute bottom-0 left-0 right-0"
                  : "fixed left-0 right-0 z-40 bottom-0",
              )}
            >
              <Button
                type="submit"
                className={cn(
                  "w-full font-bold transition-all shadow-lg hover:shadow-primary/20",
                  "text-lg h-14 rounded-xl hover:-translate-y-0.5",
                )}
                size="lg"
                variant="primary"
                leftIcon={<Save className="w-5 h-5 mr-2" />}
                isLoading={isSubmitting}
              >
                위치 저장하기
              </Button>
            </div>
          </form>
        </div>
      </main>

      {!isModal && <BottomNav />}
    </div>
  );
}
