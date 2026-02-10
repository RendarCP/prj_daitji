"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  X,
  Package,
  Barcode,
  Calendar,
  MapPin,
  Tag as TagIcon,
  Image as ImageIcon,
  Clock,
  ShoppingCart,
  Pill,
  AlertTriangle,
  Info,
} from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select, SelectOption } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { useLocations } from "@/lib/hooks/useLocations";
import type { Location } from "@/lib/types";

const ITEM_TYPE_OPTIONS: SelectOption[] = [
  { value: "FOOD", label: "식품" },
  { value: "COSMETIC", label: "화장품" },
  { value: "MEDICINE", label: "의약품" },
  { value: "GENERAL", label: "일반" },
];

export function ItemAddClient() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // React Query hook for locations
  const { data: locations = [], isLoading: isLoadingLocations } =
    useLocations();

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

      const response = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || "물품 추가에 실패했습니다");
      }

      // Navigate to the new item's detail page
      router.push(`/item/${result.data.id}`);
      router.refresh();
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

  const locationOptions: SelectOption[] = locations
    .sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level;
      return a.name.localeCompare(b.name);
    })
    .map((loc: Location) => ({
      value: loc.id,
      label: `${"  ".repeat(loc.level - 1)}${loc.icon ? loc.icon + " " : ""}${loc.name}`,
    }));

  return (
    <div className="min-h-screen bg-secondary-50">
      <main className="pb-24">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <PageHeader
            title="물품 추가"
            description="새로운 물품을 등록하세요"
            onBack={() => router.back()}
          />

          {error && (
            <Alert variant="danger" className="mb-6">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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

                <Select
                  label="위치"
                  options={locationOptions}
                  placeholder={
                    isLoadingLocations
                      ? "위치 불러오는 중..."
                      : "위치를 선택하세요"
                  }
                  value={formData.location_id}
                  onChange={(e) =>
                    setFormData({ ...formData, location_id: e.target.value })
                  }
                  required
                  leftIcon={<MapPin className="w-4 h-4" />}
                  error={errors.location_id}
                  disabled={isLoadingLocations}
                />

                <Input
                  label="수량"
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: parseInt(e.target.value) || 0,
                    })
                  }
                  required
                  error={errors.quantity}
                />

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
                  <Button type="button" size="sm" onClick={addTag}>
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

            {/* Action Buttons */}
            <div className="flex gap-3 sticky bottom-20 bg-secondary-50 py-4 -mx-4 px-4 border-t border-secondary-200">
              <Button
                type="submit"
                variant="primary"
                leftIcon={<Save className="w-4 h-4" />}
                isLoading={isSubmitting}
                fullWidth
              >
                저장
              </Button>
              <Button
                type="button"
                variant="secondary"
                leftIcon={<X className="w-4 h-4" />}
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                취소
              </Button>
            </div>
          </form>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
