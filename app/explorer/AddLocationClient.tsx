"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Save, MapPin, Box, Home } from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select, SelectOption } from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import { CascadingLocationSelect } from "@/components/features/CascadingLocationSelect";
import type { Location } from "@/lib/types";
import {
  findLocationPath,
  getSelectedParentId,
} from "@/lib/utils/location-selection";
import { cn } from "@/lib/utils/cn";

interface AddLocationClientProps {
  locations: Location[];
  mode?: "page" | "modal";
}

const LOCATION_TYPE_OPTIONS: SelectOption[] = [
  { value: "ROOM", label: "방" },
  { value: "FURNITURE", label: "가구" },
  { value: "BOX", label: "상자" },
  { value: "SHELF", label: "선반" },
  { value: "OTHER", label: "기타" },
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

  // Initialize selection path
  const [selectionPath, setSelectionPath] = useState<string[]>(() =>
    parentIdParam ? findLocationPath(locations, parentIdParam) : [],
  );

  // Sync formData.parent_id with selectionPath
  const currentParentId = getSelectedParentId(selectionPath);

  // Form state
  // We don't store parent_id in formData anymore, we derive it from selectionPath
  const [formData, setFormData] = useState({
    name: "",
    type: "ROOM",
    icon: "📦",
    description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "위치 이름을 입력해주세요";
    }

    if (!formData.type) {
      newErrors.type = "유형을 선택해주세요";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setError("입력 내용을 확인해주세요");
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
        throw new Error(result.error?.message || "위치를 추가하지 못했습니다");
      }

      // Navigate back to explorer, focusing on the new location or its parent
      if (mode === "modal") {
        const returnTo = searchParams.get("return_to");
        if (returnTo) {
          router.push(returnTo);
        } else {
          router.back();
        }
        router.refresh();
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
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isModal = mode === "modal";

  return (
    <div
      className={cn(
        "flex flex-col min-h-0",
        isModal ? "bg-background h-full" : "bg-secondary/10 flex-1",
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
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                위치 정보
              </h2>

              <div className="space-y-4">
                {/* Icon Selection */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    아이콘
                  </label>
                  <div className="flex gap-2 flex-wrap mb-2">
                    {SUGGESTED_ICONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon })}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg text-xl border transition-colors ${
                          formData.icon === icon
                            ? "bg-primary/10 border-primary ring-2 ring-primary/30"
                            : "bg-white border-border hover:bg-secondary/10"
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="직접 이모지를 입력하세요"
                      value={formData.icon || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, icon: e.target.value })
                      }
                      maxLength={2}
                      className="w-20 text-center text-2xl"
                    />
                    <div className="text-xs text-muted-foreground flex items-center">
                      아이콘을 선택하거나 이 위치를 나타낼 이모지를 직접 입력하세요.
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
                  label="유형"
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
                  <CascadingLocationSelect
                    locations={locations}
                    selectionPath={selectionPath}
                    onSelectionPathChange={setSelectionPath}
                    topLabel="부모 위치"
                    showRootOption
                    rootOptionLabel="루트 (최상위)"
                    topPlaceholder="루트 (최상위)"
                    childPlaceholder="하위 위치 선택..."
                  />
                  <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">
                    {`부모 위치를 선택하여 이 항목을 중첩하세요.
                    "루트"로두면 최상위 위치가 됩니다.`}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    설명 (선택)
                  </label>
                  <textarea
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all"
                    rows={3}
                    placeholder="위치에 대한 추가 설명을 입력하세요..."
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
                "py-3 px-4 border-t border-border bg-card/95 backdrop-blur-md",
                isModal
                  ? "z-10 absolute bottom-0 left-0 right-0"
                  : "fixed left-0 right-0 z-40 bottom-0",
              )}
            >
              <Button
                type="submit"
                className={cn(
                  "w-full font-semibold transition-all shadow-md hover:shadow-primary/15",
                  "text-base h-12 rounded-lg",
                )}
                size="md"
                variant="primary"
                leftIcon={<Save className="w-4 h-4 mr-1.5" />}
                isLoading={isSubmitting}
              >
                위치 저장
              </Button>
            </div>
          </form>
        </div>
      </main>

      {!isModal && <BottomNav />}
    </div>
  );
}
