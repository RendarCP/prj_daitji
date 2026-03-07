"use client";

import { useMemo, type ReactNode } from "react";
import { FolderOpen } from "lucide-react";
import { Select, type SelectOption } from "@/components/ui/Select";
import type { Location } from "@/lib/types";
import {
  ROOT_LOCATION_KEY,
  buildLocationChildrenMap,
  createNextSelectionPath,
} from "@/lib/utils/location-selection";

type LocationNode = Pick<Location, "id" | "name" | "parent_id" | "icon">;

interface CascadingLocationSelectProps {
  locations: LocationNode[];
  selectionPath: string[];
  onSelectionPathChange: (path: string[]) => void;
  topLabel?: string;
  topRequired?: boolean;
  topError?: string;
  disabled?: boolean;
  showRootOption?: boolean;
  rootOptionLabel?: string;
  loading?: boolean;
  loadingPlaceholder?: string;
  topPlaceholder?: string;
  childPlaceholder?: string;
}

export function CascadingLocationSelect({
  locations,
  selectionPath,
  onSelectionPathChange,
  topLabel,
  topRequired = false,
  topError,
  disabled = false,
  showRootOption = false,
  rootOptionLabel = "루트 (최상위)",
  loading = false,
  loadingPlaceholder = "위치 불러오는 중...",
  topPlaceholder = "위치를 선택하세요",
  childPlaceholder = "하위 위치 선택...",
}: CascadingLocationSelectProps) {
  const childrenMap = useMemo(
    () => buildLocationChildrenMap(locations),
    [locations],
  );

  const selects: ReactNode[] = [];
  let currentLevelParentId = ROOT_LOCATION_KEY;
  let levelIndex = 0;

  while (true) {
    const options = childrenMap[currentLevelParentId] || [];

    if (options.length === 0 && levelIndex > 0) {
      break;
    }

    const selectedId = selectionPath[levelIndex] || "";
    const selectOptions: SelectOption[] = [
      ...(showRootOption && levelIndex === 0
        ? [{ value: "", label: rootOptionLabel }]
        : []),
      ...options.map((location) => ({
        value: location.id,
        label: `${location.icon ? `${location.icon} ` : ""}${location.name}`,
      })),
    ];

    const index = levelIndex;

    selects.push(
      <div key={index} className="mb-2 last:mb-0">
        <Select
          label={index === 0 ? topLabel : undefined}
          options={selectOptions}
          value={selectedId}
          onChange={(event) =>
            onSelectionPathChange(
              createNextSelectionPath(selectionPath, index, event.target.value),
            )
          }
          placeholder={
            loading
              ? loadingPlaceholder
              : index === 0
                ? topPlaceholder
                : childPlaceholder
          }
          required={index === 0 && topRequired}
          leftIcon={index === 0 ? <FolderOpen className="w-4 h-4" /> : undefined}
          error={index === 0 ? topError : undefined}
          disabled={disabled}
        />
      </div>,
    );

    if (!selectedId) {
      break;
    }

    currentLevelParentId = selectedId;
    levelIndex += 1;
  }

  return <>{selects}</>;
}
