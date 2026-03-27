"use client";

import {
  AlertTriangle,
  Calendar,
  Clock,
  Info,
  Pill,
  ShoppingCart,
} from "lucide-react";
import { Input } from "@/components/ui/Input";

interface ItemTypeMetadataFieldsProps {
  type: string;
  metadata: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
}

function toDateInputValue(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.split("T")[0] || "";
}

function toStringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function ItemTypeMetadataFields({
  type,
  metadata,
  onChange,
}: ItemTypeMetadataFieldsProps) {
  if (!type) {
    return null;
  }

  return (
    <div className="space-y-4">
      {type === "FOOD" && (
        <>
          <Input
            label="유통기한"
            type="date"
            value={toDateInputValue(metadata.expiry_date)}
            onChange={(e) =>
              onChange(
                "expiry_date",
                e.target.value ? new Date(e.target.value).toISOString() : null,
              )
            }
            leftIcon={<Calendar className="w-4 h-4" />}
          />
          <Input
            label="구매일"
            type="date"
            value={toDateInputValue(metadata.purchase_date)}
            onChange={(e) =>
              onChange(
                "purchase_date",
                e.target.value ? new Date(e.target.value).toISOString() : null,
              )
            }
            leftIcon={<ShoppingCart className="w-4 h-4" />}
          />
          <Input
            label="브랜드"
            placeholder="브랜드명"
            value={toStringValue(metadata.brand)}
            onChange={(e) => onChange("brand", e.target.value)}
          />
          <Input
            label="카테고리"
            placeholder="식품 카테고리 (예: 과자, 음료)"
            value={toStringValue(metadata.category)}
            onChange={(e) => onChange("category", e.target.value)}
          />
        </>
      )}

      {type === "COSMETIC" && (
        <>
          <Input
            label="개봉일"
            type="date"
            value={toDateInputValue(metadata.opened_date)}
            onChange={(e) =>
              onChange(
                "opened_date",
                e.target.value ? new Date(e.target.value).toISOString() : null,
              )
            }
            leftIcon={<Calendar className="w-4 h-4" />}
          />
          <Input
            label="PAO (개봉 후 사용기한)"
            type="number"
            placeholder="12"
            value={typeof metadata.pao === "number" ? metadata.pao : ""}
            onChange={(e) =>
              onChange(
                "pao",
                e.target.value ? parseInt(e.target.value, 10) : null,
              )
            }
            leftIcon={<Clock className="w-4 h-4" />}
            helperText="개봉 후 사용 가능한 개월 수"
          />
          <Input
            label="브랜드"
            placeholder="브랜드명"
            value={toStringValue(metadata.brand)}
            onChange={(e) => onChange("brand", e.target.value)}
          />
          <Input
            label="카테고리"
            placeholder="화장품 카테고리 (예: 스킨케어, 메이크업)"
            value={toStringValue(metadata.category)}
            onChange={(e) => onChange("category", e.target.value)}
          />
        </>
      )}

      {type === "MEDICINE" && (
        <>
          <Input
            label="유효기한"
            type="date"
            value={toDateInputValue(metadata.expiry_date)}
            onChange={(e) =>
              onChange(
                "expiry_date",
                e.target.value ? new Date(e.target.value).toISOString() : null,
              )
            }
            leftIcon={<Calendar className="w-4 h-4" />}
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="prescription"
              checked={Boolean(metadata.prescription)}
              onChange={(e) => onChange("prescription", e.target.checked)}
              className="w-4 h-4 text-primary rounded"
            />
            <label
              htmlFor="prescription"
              className="text-sm font-medium text-foreground flex items-center gap-1"
            >
              <Pill className="w-4 h-4" />
              전문의약품
            </label>
          </div>
          <Input
            label="복용량"
            placeholder="1일 3회, 1회 1정"
            value={toStringValue(metadata.dosage)}
            onChange={(e) => onChange("dosage", e.target.value)}
          />
          <div>
            <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              주의사항
            </label>
            <textarea
              className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent focus:bg-white"
              rows={3}
              placeholder="주의사항을 입력하세요 (줄바꿈으로 구분)"
              value={
                Array.isArray(metadata.warnings)
                  ? metadata.warnings.join("\n")
                  : ""
              }
              onChange={(e) =>
                onChange(
                  "warnings",
                  e.target.value
                    .split("\n")
                    .map((warning) => warning.trim())
                    .filter(Boolean),
                )
              }
            />
          </div>
        </>
      )}

      {type === "GENERAL" && (
        <>
          <Input
            label="구매일"
            type="date"
            value={toDateInputValue(metadata.purchase_date)}
            onChange={(e) =>
              onChange(
                "purchase_date",
                e.target.value ? new Date(e.target.value).toISOString() : null,
              )
            }
            leftIcon={<ShoppingCart className="w-4 h-4" />}
          />
          <Input
            label="품질보증기간"
            type="date"
            value={toDateInputValue(metadata.warranty_until)}
            onChange={(e) =>
              onChange(
                "warranty_until",
                e.target.value ? new Date(e.target.value).toISOString() : null,
              )
            }
            leftIcon={<Calendar className="w-4 h-4" />}
          />
          <Input
            label="제조사"
            placeholder="제조사명"
            value={toStringValue(metadata.manufacturer)}
            onChange={(e) => onChange("manufacturer", e.target.value)}
          />
          <Input
            label="모델명"
            placeholder="모델명/제품번호"
            value={toStringValue(metadata.model)}
            onChange={(e) => onChange("model", e.target.value)}
          />
          <div>
            <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
              <Info className="w-4 h-4" />
              메모
            </label>
            <textarea
              className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent focus:bg-white"
              rows={3}
              placeholder="추가 정보를 입력하세요"
              value={toStringValue(metadata.notes)}
              onChange={(e) => onChange("notes", e.target.value)}
            />
          </div>
        </>
      )}
    </div>
  );
}
