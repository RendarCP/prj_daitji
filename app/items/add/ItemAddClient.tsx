"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  X,
  Package,
  Barcode,
  Calendar,
  Tag as TagIcon,
  Image as ImageIcon,
  Clock,
  ShoppingCart,
  Pill,
  AlertTriangle,
  Info,
  FolderOpen,
  Plus,
  Minus,
} from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select, SelectOption } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { useLocations } from "@/lib/hooks/useLocations";
import type { Location } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

const ITEM_TYPE_OPTIONS: SelectOption[] = [
  { value: "FOOD", label: "식품" },
  { value: "COSMETIC", label: "화장품" },
  { value: "MEDICINE", label: "의약품" },
  { value: "GENERAL", label: "일반" },
];

interface ItemAddClientProps {
  mode?: "page" | "modal";
  isEditMode?: boolean;
  itemId?: string;
}

export function ItemAddClient({
  mode = "page",
  isEditMode = false,
  itemId,
}: ItemAddClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingItem, setIsLoadingItem] = useState(isEditMode && !!itemId);

  // React Query hook for locations
  const { data: locations = [], isLoading: isLoadingLocations } =
    useLocations();

  // Location hierarchy: parent_id (or 'root') -> Location[]
  const locationMap = locations.reduce(
    (acc, loc) => {
      const parentId = loc.parent_id || "root";
      if (!acc[parentId]) acc[parentId] = [];
      acc[parentId].push(loc);
      return acc;
    },
    {} as Record<string, Location[]>,
  );

  const [selectionPath, setSelectionPath] = useState<string[]>([]);

  const handleLocationChange = (levelIndex: number, selectedId: string) => {
    const newPath = selectionPath.slice(0, levelIndex);
    if (selectedId) newPath.push(selectedId);
    setSelectionPath(newPath);
    setFormData((prev) => ({
      ...prev,
      location_id: newPath.length > 0 ? newPath[newPath.length - 1] : "",
    }));
  };

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    type: "" as "FOOD" | "COSMETIC" | "MEDICINE" | "GENERAL" | "",
    location_id: "",
    quantity: 1,
    barcode: "",
    image_url: "",
    tags: [] as string[],
    metadata: {} as Record<string, any>,
  });

  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load item when in edit mode
  useEffect(() => {
    if (!isEditMode || !itemId) return;

    let cancelled = false;

    async function loadItem() {
      try {
        const itemRes = await fetch(`/api/items/${itemId}`);
        if (!itemRes.ok) {
          const err = await itemRes.json();
          throw new Error(err.error?.message || "물품을 불러올 수 없습니다");
        }
        const { data: item } = await itemRes.json();
        if (cancelled || !item) return;

        let pathIds: string[] = [];
        if (item.location_id) {
          const pathRes = await fetch(
            `/api/locations/${item.location_id}/path`
          );
          if (pathRes.ok) {
            const { data: pathData } = await pathRes.json();
            pathIds = (pathData?.path || []).map((p: { id: string }) => p.id);
          }
        }

        setSelectionPath(pathIds);
        setFormData({
          name: item.name ?? "",
          type: (item.type as "FOOD" | "COSMETIC" | "MEDICINE" | "GENERAL") ?? "",
          location_id: item.location_id ?? "",
          quantity: typeof item.quantity === "number" ? item.quantity : 1,
          barcode: item.barcode ?? "",
          image_url: item.image_url ?? "",
          tags: Array.isArray(item.tags) ? item.tags : [],
          metadata: (item.metadata && typeof item.metadata === "object")
            ? item.metadata
            : {},
        });
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "물품을 불러오는 중 오류가 발생했습니다"
          );
        }
      } finally {
        if (!cancelled) setIsLoadingItem(false);
      }
    }

    loadItem();
    return () => {
      cancelled = true;
    };
  }, [isEditMode, itemId]);

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  const updateMetadata = (key: string, value: any) => {
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        [key]: value || undefined,
      },
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "물품 이름은 필수입니다";
    }

    if (!formData.type) {
      newErrors.type = "타입을 선택해주세요";
    }

    if (!formData.location_id) {
      newErrors.location_id = "위치를 선택해주세요";
    }

    if (formData.quantity < 0) {
      newErrors.quantity = "수량은 0 이상이어야 합니다";
    }

    if (formData.image_url && !formData.image_url.match(/^https?:\/\/.+/)) {
      newErrors.image_url = "올바른 URL 형식이 아닙니다";
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

      // Clean metadata - remove empty values
      const cleanMetadata = Object.fromEntries(
        Object.entries(formData.metadata).filter(
          ([_, value]) => value !== undefined && value !== "" && value !== null,
        ),
      );

      const payload = {
        name: formData.name.trim(),
        type: formData.type,
        location_id: formData.location_id,
        quantity: formData.quantity,
        barcode: formData.barcode.trim() || undefined,
        image_url: formData.image_url.trim() || undefined,
        tags: formData.tags,
        metadata: cleanMetadata,
      };

      const url = isEditMode && itemId ? `/api/items/${itemId}` : "/api/items";
      const method = isEditMode && itemId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error?.message ||
            (isEditMode ? "물품 수정에 실패했습니다" : "물품 추가에 실패했습니다")
        );
      }

      const targetId = result.data?.id ?? itemId;

      if (mode === "modal") {
        window.location.href = `/item/${targetId}`;
      } else {
        router.push(`/item/${targetId}`);
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

  const handleCancel = () => {
    router.back();
  };

  const renderLocationSelects = () => {
    const selects: React.ReactNode[] = [];
    let currentLevelParentId = "root";
    let levelIndex = 0;

    while (true) {
      const options = locationMap[currentLevelParentId] || [];
      if (options.length === 0 && levelIndex > 0) break;

      const selectedId = selectionPath[levelIndex] ?? "";

      const selectOptions: SelectOption[] = [
        ...options.map((loc) => ({
          value: loc.id,
          label: `${loc.icon ? loc.icon + " " : ""}${loc.name}`,
        })),
      ];

      const index = levelIndex;
      selects.push(
        <div key={index} className="mb-2 last:mb-0">
          <Select
            label={index === 0 ? "위치" : undefined}
            options={selectOptions}
            value={selectedId}
            onChange={(e) => handleLocationChange(index, e.target.value)}
            placeholder={
              isLoadingLocations
                ? "위치 불러오는 중..."
                : levelIndex === 0
                  ? "위치를 선택하세요"
                  : "하위 위치 선택..."
            }
            required={index === 0}
            leftIcon={
              index === 0 ? <FolderOpen className="w-4 h-4" /> : undefined
            }
            error={index === 0 ? errors.location_id : undefined}
            disabled={isLoadingLocations}
          />
        </div>,
      );

      if (!selectedId) break;
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
      <main
        className={cn("flex-1 overflow-y-auto", isModal ? "pb-24" : "pb-40")}
      >
        <div
          className={cn(
            "container mx-auto px-4 py-6 max-w-4xl",
            isModal && "p-6",
          )}
        >
          {isEditMode && isLoadingItem && (
            <Alert variant="info" className="mb-6">
              물품 정보를 불러오는 중...
            </Alert>
          )}

          {error && (
            <Alert variant="danger" className="mb-6">
              {error}
            </Alert>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
            aria-busy={isEditMode && isLoadingItem}
          >
            {/* Image URL */}
            <Card>
              <h2 className="text-xl font-bold text-secondary-900 mb-4">
                이미지
              </h2>

              <div className="aspect-video bg-secondary-100 rounded-lg overflow-hidden relative mb-4">
                {formData.image_url ? (
                  <img
                    src={formData.image_url}
                    alt="물품 이미지 미리보기"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-20 h-20 text-secondary-400" />
                  </div>
                )}
              </div>

              <Input
                label="이미지 URL"
                placeholder="https://example.com/image.jpg"
                value={formData.image_url}
                onChange={(e) =>
                  setFormData({ ...formData, image_url: e.target.value })
                }
                leftIcon={<ImageIcon className="w-4 h-4" />}
                error={errors.image_url}
                helperText="물품 이미지의 URL을 입력하세요 (선택사항)"
              />
            </Card>

            {/* Basic Information */}
            <Card>
              <h2 className="text-xl font-bold text-secondary-900 mb-4">
                기본 정보
              </h2>

              <div className="space-y-4">
                <Input
                  label="물품 이름"
                  placeholder="물품 이름을 입력하세요"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  leftIcon={<Package className="w-4 h-4" />}
                  error={errors.name}
                />

                <Select
                  label="타입"
                  options={ITEM_TYPE_OPTIONS}
                  placeholder="타입을 선택하세요"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as any,
                      metadata: {},
                    })
                  }
                  required
                  error={errors.type}
                />

                <div className="space-y-2">
                  {renderLocationSelects()}
                  <p className="text-xs text-secondary-500 mt-1">
                    위치를 단계별로 선택하세요. 하위 위치가 있으면 다음 선택이
                    나타납니다.
                  </p>
                </div>

                {/* Quantity Section - stepper + number */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-secondary-700">
                    수량
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="bg-secondary/10 rounded-2xl p-2 w-fit border border-white/5">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              quantity: Math.max(0, formData.quantity - 1),
                            })
                          }
                          className="w-12 h-12 rounded-xl hover:bg-white/10 flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground active:scale-95 duration-200"
                          aria-label="수량 감소"
                        >
                          <Minus className="w-6 h-6" />
                        </button>
                        <span className="w-12 text-center text-xl font-bold font-mono">
                          {formData.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              quantity: formData.quantity + 1,
                            })
                          }
                          className="w-12 h-12 rounded-xl hover:bg-white/10 flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground active:scale-95 duration-200"
                          aria-label="수량 증가"
                        >
                          <Plus className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                    <Input
                      type="number"
                      min={0}
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          quantity: Math.max(
                            0,
                            parseInt(e.target.value, 10) || 0
                          ),
                        })
                      }
                      className="w-24"
                      error={errors.quantity}
                      aria-label="수량 직접 입력"
                    />
                  </div>
                  {errors.quantity && (
                    <p className="text-sm text-red-600">{errors.quantity}</p>
                  )}
                </div>

                <Input
                  label="바코드"
                  placeholder="바코드 번호 (선택사항)"
                  value={formData.barcode}
                  onChange={(e) =>
                    setFormData({ ...formData, barcode: e.target.value })
                  }
                  leftIcon={<Barcode className="w-4 h-4" />}
                />
              </div>
            </Card>

            {/* Tags */}
            <Card>
              <h2 className="text-xl font-bold text-secondary-900 mb-4 flex items-center gap-2">
                <TagIcon className="w-5 h-5" />
                태그
              </h2>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="태그 입력 (엔터로 추가)"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    fullWidth
                  />
                  <Button
                    size="md"
                    className="h-auto"
                    type="button"
                    onClick={addTag}
                  >
                    추가
                  </Button>
                </div>

                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="cursor-pointer hover:bg-secondary-300"
                        onClick={() => removeTag(tag)}
                      >
                        {tag}
                        <X className="w-3 h-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Type-specific Metadata */}
            {formData.type && (
              <Card>
                <h2 className="text-xl font-bold text-secondary-900 mb-4">
                  상세 정보
                </h2>

                <div className="space-y-4">
                  {/* FOOD metadata */}
                  {formData.type === "FOOD" && (
                    <>
                      <Input
                        label="유통기한"
                        type="date"
                        value={
                          formData.metadata.expiry_date
                            ? formData.metadata.expiry_date.split("T")[0]
                            : ""
                        }
                        onChange={(e) =>
                          updateMetadata(
                            "expiry_date",
                            e.target.value
                              ? new Date(e.target.value).toISOString()
                              : null,
                          )
                        }
                        leftIcon={<Calendar className="w-4 h-4" />}
                      />
                      <Input
                        label="구매일"
                        type="date"
                        value={
                          formData.metadata.purchase_date
                            ? formData.metadata.purchase_date.split("T")[0]
                            : ""
                        }
                        onChange={(e) =>
                          updateMetadata(
                            "purchase_date",
                            e.target.value
                              ? new Date(e.target.value).toISOString()
                              : null,
                          )
                        }
                        leftIcon={<ShoppingCart className="w-4 h-4" />}
                      />
                      <Input
                        label="브랜드"
                        placeholder="브랜드명"
                        value={formData.metadata.brand || ""}
                        onChange={(e) =>
                          updateMetadata("brand", e.target.value)
                        }
                      />
                      <Input
                        label="카테고리"
                        placeholder="식품 카테고리 (예: 과자, 음료)"
                        value={formData.metadata.category || ""}
                        onChange={(e) =>
                          updateMetadata("category", e.target.value)
                        }
                      />
                    </>
                  )}

                  {/* COSMETIC metadata */}
                  {formData.type === "COSMETIC" && (
                    <>
                      <Input
                        label="개봉일"
                        type="date"
                        value={
                          formData.metadata.opened_date
                            ? formData.metadata.opened_date.split("T")[0]
                            : ""
                        }
                        onChange={(e) =>
                          updateMetadata(
                            "opened_date",
                            e.target.value
                              ? new Date(e.target.value).toISOString()
                              : null,
                          )
                        }
                        leftIcon={<Calendar className="w-4 h-4" />}
                      />
                      <Input
                        label="PAO (개봉 후 사용기한)"
                        type="number"
                        placeholder="12"
                        value={formData.metadata.pao || ""}
                        onChange={(e) =>
                          updateMetadata(
                            "pao",
                            e.target.value ? parseInt(e.target.value) : null,
                          )
                        }
                        leftIcon={<Clock className="w-4 h-4" />}
                        helperText="개봉 후 사용 가능한 개월 수"
                      />
                      <Input
                        label="브랜드"
                        placeholder="브랜드명"
                        value={formData.metadata.brand || ""}
                        onChange={(e) =>
                          updateMetadata("brand", e.target.value)
                        }
                      />
                      <Input
                        label="카테고리"
                        placeholder="화장품 카테고리 (예: 스킨케어, 메이크업)"
                        value={formData.metadata.category || ""}
                        onChange={(e) =>
                          updateMetadata("category", e.target.value)
                        }
                      />
                    </>
                  )}

                  {/* MEDICINE metadata */}
                  {formData.type === "MEDICINE" && (
                    <>
                      <Input
                        label="유효기한"
                        type="date"
                        value={
                          formData.metadata.expiry_date
                            ? formData.metadata.expiry_date.split("T")[0]
                            : ""
                        }
                        onChange={(e) =>
                          updateMetadata(
                            "expiry_date",
                            e.target.value
                              ? new Date(e.target.value).toISOString()
                              : null,
                          )
                        }
                        leftIcon={<Calendar className="w-4 h-4" />}
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="prescription"
                          checked={formData.metadata.prescription || false}
                          onChange={(e) =>
                            updateMetadata("prescription", e.target.checked)
                          }
                          className="w-4 h-4 text-primary-600 rounded"
                        />
                        <label
                          htmlFor="prescription"
                          className="text-sm font-medium text-secondary-700 flex items-center gap-1"
                        >
                          <Pill className="w-4 h-4" />
                          전문의약품
                        </label>
                      </div>
                      <Input
                        label="복용량"
                        placeholder="1일 3회, 1회 1정"
                        value={formData.metadata.dosage || ""}
                        onChange={(e) =>
                          updateMetadata("dosage", e.target.value)
                        }
                      />
                      <div>
                        <label className="text-sm font-medium text-secondary-700 mb-2 flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" />
                          주의사항
                        </label>
                        <textarea
                          className="w-full px-4 py-2.5 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          rows={3}
                          placeholder="주의사항을 입력하세요 (줄바꿈으로 구분)"
                          value={formData.metadata.warnings?.join("\n") || ""}
                          onChange={(e) =>
                            updateMetadata(
                              "warnings",
                              e.target.value
                                .split("\n")
                                .filter((w) => w.trim()),
                            )
                          }
                        />
                      </div>
                    </>
                  )}

                  {/* GENERAL metadata */}
                  {formData.type === "GENERAL" && (
                    <>
                      <Input
                        label="구매일"
                        type="date"
                        value={
                          formData.metadata.purchase_date
                            ? formData.metadata.purchase_date.split("T")[0]
                            : ""
                        }
                        onChange={(e) =>
                          updateMetadata(
                            "purchase_date",
                            e.target.value
                              ? new Date(e.target.value).toISOString()
                              : null,
                          )
                        }
                        leftIcon={<ShoppingCart className="w-4 h-4" />}
                      />
                      <Input
                        label="품질보증기간"
                        type="date"
                        value={
                          formData.metadata.warranty_until
                            ? formData.metadata.warranty_until.split("T")[0]
                            : ""
                        }
                        onChange={(e) =>
                          updateMetadata(
                            "warranty_until",
                            e.target.value
                              ? new Date(e.target.value).toISOString()
                              : null,
                          )
                        }
                        leftIcon={<Calendar className="w-4 h-4" />}
                      />
                      <Input
                        label="제조사"
                        placeholder="제조사명"
                        value={formData.metadata.manufacturer || ""}
                        onChange={(e) =>
                          updateMetadata("manufacturer", e.target.value)
                        }
                      />
                      <Input
                        label="모델명"
                        placeholder="모델명/제품번호"
                        value={formData.metadata.model || ""}
                        onChange={(e) =>
                          updateMetadata("model", e.target.value)
                        }
                      />
                      <div>
                        <label className="text-sm font-medium text-secondary-700 mb-2 flex items-center gap-1">
                          <Info className="w-4 h-4" />
                          메모
                        </label>
                        <textarea
                          className="w-full px-4 py-2.5 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          rows={3}
                          placeholder="추가 정보를 입력하세요"
                          value={formData.metadata.notes || ""}
                          onChange={(e) =>
                            updateMetadata("notes", e.target.value)
                          }
                        />
                      </div>
                    </>
                  )}
                </div>
              </Card>
            )}

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
                disabled={isEditMode && isLoadingItem}
              >
                {isEditMode ? "수정하기" : "저장하기"}
              </Button>
            </div>
          </form>
        </div>
      </main>

      {!isModal && <BottomNav />}
    </div>
  );
}
