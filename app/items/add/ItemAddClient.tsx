"use client";

import NextImage from "next/image";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Save,
  X,
  Package,
  Barcode,
  Tag as TagIcon,
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
import { CascadingLocationSelect } from "@/components/features/CascadingLocationSelect";
import { ItemTypeMetadataFields } from "@/components/features/ItemTypeMetadataFields";
import { useLocations } from "@/lib/hooks/useLocations";
import { queryKeys } from "@/lib/queryKeys";
import { cn } from "@/lib/utils/cn";

const ITEM_TYPES = ["FOOD", "COSMETIC", "MEDICINE", "GENERAL"] as const;
const MAX_OPTIMIZED_IMAGE_DIMENSION = 1600;
const OPTIMIZED_IMAGE_QUALITY = 0.82;
const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;
const IMAGE_OPTIMIZATION_THRESHOLD_BYTES = 2 * 1024 * 1024;
const OPTIMIZABLE_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const PASSTHROUGH_IMAGE_TYPES = new Set(["image/gif"]);
const BLOCKED_IMAGE_TYPES = new Set(["image/heic", "image/heif"]);

type ItemType = (typeof ITEM_TYPES)[number];

const itemFormSchema = z.object({
  name: z.string().trim().min(1, "물품 이름은 필수입니다"),
  type: z.string().refine((value) => ITEM_TYPES.includes(value as ItemType), {
    message: "타입을 선택해주세요",
  }),
  location_id: z.string().min(1, "위치를 선택해주세요"),
  quantity: z.coerce.number().int().min(0, "수량은 0 이상이어야 합니다"),
  barcode: z.string().max(100),
  image_url: z.union([
    z.literal(""),
    z.string().url("올바른 URL 형식이 아닙니다"),
  ]),
  tags: z.array(z.string().min(1).max(50)),
  metadata: z.record(z.unknown()),
});

type ItemFormValues = z.infer<typeof itemFormSchema>;

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
  onSuccess?: (targetId: string) => void;
  initialBarcode?: string;
}

function changeFileExtension(filename: string, extension: string) {
  const normalizedExtension = extension.startsWith(".")
    ? extension
    : `.${extension}`;

  return filename.replace(/\.[^/.]+$/, "") + normalizedExtension;
}

async function loadImageElement(file: File): Promise<HTMLImageElement> {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const nextImage = new window.Image();
      nextImage.onload = () => resolve(nextImage);
      nextImage.onerror = () =>
        reject(new Error("이미지 파일을 읽는 중 오류가 발생했습니다"));
      nextImage.src = objectUrl;
    });

    return image;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("이미지 최적화 결과를 생성하지 못했습니다"));
          return;
        }

        resolve(blob);
      },
      type,
      quality,
    );
  });
}

async function optimizeImageFile(file: File): Promise<File> {
  if (BLOCKED_IMAGE_TYPES.has(file.type)) {
    throw new Error(
      "HEIC/HEIF 이미지는 아직 지원하지 않습니다. JPG, PNG, WebP 또는 GIF를 사용해주세요.",
    );
  }

  if (PASSTHROUGH_IMAGE_TYPES.has(file.type)) {
    return file;
  }

  if (!OPTIMIZABLE_IMAGE_TYPES.has(file.type)) {
    throw new Error(
      "지원하지 않는 이미지 형식입니다. JPG, PNG, WebP 또는 GIF를 사용해주세요.",
    );
  }

  if (file.size <= IMAGE_OPTIMIZATION_THRESHOLD_BYTES) {
    return file;
  }

  const image = await loadImageElement(file);
  const largestSide = Math.max(image.width, image.height);
  const scale =
    largestSide > MAX_OPTIMIZED_IMAGE_DIMENSION
      ? MAX_OPTIMIZED_IMAGE_DIMENSION / largestSide
      : 1;
  const targetWidth = Math.max(1, Math.round(image.width * scale));
  const targetHeight = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("이미지 최적화를 위한 브라우저 기능을 사용할 수 없습니다.");
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, targetWidth, targetHeight);
  context.drawImage(image, 0, 0, targetWidth, targetHeight);

  const optimizedBlob = await canvasToBlob(
    canvas,
    "image/jpeg",
    OPTIMIZED_IMAGE_QUALITY,
  );

  return new File([optimizedBlob], changeFileExtension(file.name, "jpg"), {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

export function ItemAddClient({
  mode = "page",
  isEditMode = false,
  itemId,
  onSuccess,
  initialBarcode = "",
}: ItemAddClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [isLoadingItem, setIsLoadingItem] = useState(isEditMode && !!itemId);
  const [selectionPath, setSelectionPath] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isTagComposing, setIsTagComposing] = useState(false);
  const [isTagEditorOpen, setIsTagEditorOpen] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedImagePreviewUrl, setSelectedImagePreviewUrl] = useState<
    string | null
  >(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { data: locations = [], isLoading: isLoadingLocations } =
    useLocations();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      name: "",
      type: "",
      location_id: "",
      quantity: 1,
      barcode: "",
      image_url: "",
      tags: [],
      metadata: {},
    },
  });

  const imageUrl = watch("image_url") || "";
  const itemType = watch("type");
  const tags = watch("tags") || [];
  const metadata = watch("metadata") || {};
  const quantity = watch("quantity") || 0;
  const barcodeValue = watch("barcode") || "";
  const displayImageUrl = selectedImagePreviewUrl ?? imageUrl;

  useEffect(() => {
    return () => {
      if (selectedImagePreviewUrl) {
        URL.revokeObjectURL(selectedImagePreviewUrl);
      }
    };
  }, [selectedImagePreviewUrl]);

  useEffect(() => {
    if (isEditMode) {
      return;
    }

    const scannedBarcode = initialBarcode.trim();

    if (!scannedBarcode || barcodeValue.trim()) {
      return;
    }

    setValue("barcode", scannedBarcode, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }, [barcodeValue, initialBarcode, isEditMode, setValue]);

  useEffect(() => {
    if (!isEditMode || !itemId) {
      return;
    }

    let cancelled = false;

    async function loadItem() {
      try {
        const itemRes = await fetch(`/api/items/${itemId}`);
        if (!itemRes.ok) {
          const err = await itemRes.json();
          throw new Error(err.error?.message || "물품을 불러올 수 없습니다");
        }

        const { data: item } = await itemRes.json();
        if (cancelled || !item) {
          return;
        }

        let pathIds: string[] = [];
        if (item.location_id) {
          const pathRes = await fetch(
            `/api/locations/${item.location_id}/path`,
          );
          if (pathRes.ok) {
            const { data: pathData } = await pathRes.json();
            pathIds = (pathData?.path || []).map(
              (path: { id: string }) => path.id,
            );
          }
        }

        setSelectionPath(pathIds);
        setSelectedImageFile(null);
        setSelectedImagePreviewUrl(null);
        reset({
          name: item.name ?? "",
          type: (item.type as ItemType) ?? "",
          location_id: item.location_id ?? "",
          quantity: typeof item.quantity === "number" ? item.quantity : 1,
          barcode: item.barcode ?? "",
          image_url: item.image_url ?? "",
          tags: Array.isArray(item.tags) ? item.tags : [],
          metadata:
            item.metadata && typeof item.metadata === "object"
              ? item.metadata
              : {},
        });
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "물품을 불러오는 중 오류가 발생했습니다",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingItem(false);
        }
      }
    }

    loadItem();

    return () => {
      cancelled = true;
    };
  }, [isEditMode, itemId, reset]);

  const updateMetadata = (key: string, value: unknown) => {
    const nextMetadata = {
      ...metadata,
      [key]: value || undefined,
    };

    setValue("metadata", nextMetadata, {
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const addTag = () => {
    const nextTag = tagInput.trim();

    if (!nextTag || tags.includes(nextTag)) {
      return;
    }

    setValue("tags", [...tags, nextTag], {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    setTagInput("");
    setIsTagEditorOpen(true);
  };

  const removeTag = (tag: string) => {
    setValue(
      "tags",
      tags.filter((existingTag: string) => existingTag !== tag),
      {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      },
    );
  };

  const handleClearSelectedImage = () => {
    if (selectedImagePreviewUrl) {
      URL.revokeObjectURL(selectedImagePreviewUrl);
    }

    setSelectedImageFile(null);
    setSelectedImagePreviewUrl(null);
    setValue("image_url", "", {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const uploadImageFile = async (file: File) => {
    const uploadFile = await optimizeImageFile(file);

    if (uploadFile.size > MAX_UPLOAD_SIZE_BYTES) {
      throw new Error(
        "최적화 후에도 이미지가 10MB를 초과합니다. 더 작은 이미지를 선택해주세요.",
      );
    }

    const presignResponse = await fetch("/api/uploads/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: uploadFile.name,
        contentType: uploadFile.type,
        size: uploadFile.size,
      }),
    });

    const presignResult = await presignResponse.json();
    if (!presignResponse.ok) {
      throw new Error(
        presignResult.error?.details?.message ||
          presignResult.error?.message ||
          "업로드 URL 생성에 실패했습니다",
      );
    }

    const { uploadUrl, publicUrl } = presignResult.data as {
      uploadUrl: string;
      publicUrl: string;
    };

    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": uploadFile.type,
      },
      body: uploadFile,
    });

    if (!uploadResponse.ok) {
      throw new Error("이미지 업로드에 실패했습니다");
    }

    return publicUrl;
  };

  const handleImageSelection = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      setError(null);
      if (BLOCKED_IMAGE_TYPES.has(file.type)) {
        throw new Error(
          "HEIC/HEIF 이미지는 아직 지원하지 않습니다. JPG, PNG, WebP 또는 GIF를 사용해주세요.",
        );
      }

      if (
        !OPTIMIZABLE_IMAGE_TYPES.has(file.type) &&
        !PASSTHROUGH_IMAGE_TYPES.has(file.type)
      ) {
        throw new Error(
          "지원하지 않는 이미지 형식입니다. JPG, PNG, WebP 또는 GIF를 사용해주세요.",
        );
      }

      if (file.size > MAX_UPLOAD_SIZE_BYTES) {
        throw new Error("이미지 파일이 10MB를 초과합니다. 더 작은 파일을 선택해주세요.");
      }

      if (selectedImagePreviewUrl) {
        URL.revokeObjectURL(selectedImagePreviewUrl);
      }

      setSelectedImageFile(file);
      setSelectedImagePreviewUrl(URL.createObjectURL(file));
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "이미지 파일을 준비하는 중 오류가 발생했습니다",
      );
    }
  };

  const onSubmit = async (values: ItemFormValues) => {
    try {
      setError(null);
      setIsUploadingImage(Boolean(selectedImageFile));

      const uploadedImageUrl = selectedImageFile
        ? await uploadImageFile(selectedImageFile)
        : values.image_url.trim() || undefined;

      const cleanMetadata = Object.fromEntries(
        Object.entries(values.metadata || {}).filter(
          ([, value]) => value !== undefined && value !== "" && value !== null,
        ),
      );

      const payload = {
        name: values.name.trim(),
        type: values.type as ItemType,
        location_id: values.location_id,
        quantity: values.quantity,
        barcode: values.barcode.trim() || undefined,
        image_url: uploadedImageUrl,
        tags: values.tags,
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
            (isEditMode
              ? "물품 수정에 실패했습니다"
              : "물품 추가에 실패했습니다"),
        );
      }

      const targetId = result.data?.id ?? itemId;

      if (targetId) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: queryKeys.items.all }),
          queryClient.invalidateQueries({
            queryKey: queryKeys.items.detail(targetId),
          }),
        ]);
      }

      if (selectedImagePreviewUrl) {
        URL.revokeObjectURL(selectedImagePreviewUrl);
      }
      setSelectedImageFile(null);
      setSelectedImagePreviewUrl(null);

      if (targetId && onSuccess) {
        onSuccess(targetId);
        return;
      }

      router.replace(`/item/${targetId}`);
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "알 수 없는 오류가 발생했습니다",
      );
    } finally {
      setIsUploadingImage(false);
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
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
            aria-busy={isEditMode && isLoadingItem}
          >
            <Card>
              <h2 className="text-xl font-bold text-foreground mb-4">이미지</h2>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleImageSelection}
              />

              <div
                className={cn(
                  "group relative flex aspect-square w-full overflow-hidden rounded-[24px] border text-center transition-all duration-200 sm:aspect-[4/3]",
                  displayImageUrl
                    ? "border-border bg-secondary/20 hover:border-primary/40"
                    : "items-center justify-center border-dashed border-border/80 bg-secondary/10 hover:border-primary/50 hover:bg-secondary/20",
                  (isSubmitting || isUploadingImage) &&
                    "cursor-not-allowed opacity-70",
                )}
              >
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting || isUploadingImage}
                  className="absolute inset-0 z-10"
                  aria-label={displayImageUrl ? "이미지 변경" : "이미지 업로드"}
                />
                {displayImageUrl ? (
                  <>
                    <NextImage
                      src={displayImageUrl}
                      alt="물품 이미지 미리보기"
                      fill
                      sizes="(max-width: 768px) 100vw, 768px"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      unoptimized={displayImageUrl.startsWith("blob:")}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                    <div className="absolute inset-x-0 top-0 z-20 flex items-start justify-end p-4">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleClearSelectedImage();
                        }}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
                        aria-label="이미지 삭제"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center p-6">
                    <div className="flex size-16 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-105">
                      {isUploadingImage ? (
                        <span className="text-sm font-semibold">...</span>
                      ) : (
                        <Plus className="h-8 w-8" />
                      )}
                    </div>
                    <div className="mt-5 space-y-1.5">
                      <p className="text-base font-semibold text-foreground">
                        {isUploadingImage
                          ? "이미지 업로드 중..."
                          : "이미지 업로드"}
                      </p>
                      <p className="mx-auto max-w-sm text-sm leading-6 text-muted-foreground">
                        탭해서 사진을 선택하거나 새로 촬영한 이미지를 추가하세요
                      </p>
                      <p className="text-xs text-muted-foreground">
                        JPG, PNG, WebP, GIF · 최대 10MB
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* <Input
                label="이미지 URL"
                placeholder="https://example.com/image.jpg"
                leftIcon={<ImageIcon className="size-4" />}
                error={errors.image_url?.message}
                helperText="물품 이미지의 URL을 입력하세요 (선택사항)"
                {...register("image_url")}
              /> */}
            </Card>

            <Card>
              <h2 className="text-xl font-bold text-foreground mb-4">
                기본 정보
              </h2>

              <div className="space-y-4">
                <Input
                  label="물품 이름"
                  placeholder="물품 이름을 입력하세요"
                  required
                  leftIcon={<Package className="w-4 h-4" />}
                  error={errors.name?.message}
                  {...register("name")}
                />

                <Controller
                  name="type"
                  control={control}
                  render={({
                    field,
                  }: {
                    field: { value: string; onChange: (value: string) => void };
                  }) => (
                    <Select
                      label="타입"
                      options={ITEM_TYPE_OPTIONS}
                      placeholder="타입을 선택하세요"
                      value={field.value}
                      onChange={(event) => {
                        field.onChange(event.target.value);
                        setValue("metadata", {}, { shouldDirty: true });
                      }}
                      required
                      error={errors.type?.message}
                    />
                  )}
                />

                <div className="space-y-2">
                  <CascadingLocationSelect
                    locations={locations}
                    selectionPath={selectionPath}
                    onSelectionPathChange={(nextPath) => {
                      setSelectionPath(nextPath);
                      setValue(
                        "location_id",
                        nextPath.length > 0
                          ? nextPath[nextPath.length - 1]
                          : "",
                        { shouldDirty: true, shouldValidate: true },
                      );
                    }}
                    topLabel="위치"
                    topRequired
                    topError={errors.location_id?.message}
                    disabled={isLoadingLocations}
                    loading={isLoadingLocations}
                    loadingPlaceholder="위치 불러오는 중..."
                    topPlaceholder="위치를 선택하세요"
                    childPlaceholder="하위 위치 선택..."
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    위치를 단계별로 선택하세요. 하위 위치가 있으면 다음 선택이
                    나타납니다.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    수량
                  </label>
                  <div className="flex w-full items-center py-4">
                    <button
                      type="button"
                      onClick={() =>
                        setValue("quantity", Math.max(0, quantity - 1), {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                      className="flex size-12 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-all duration-200 hover:border-border/80 hover:bg-secondary hover:text-foreground active:scale-95"
                      aria-label="수량 감소"
                    >
                      <Minus className="size-5" />
                    </button>
                    <span className="flex-1 text-center text-2xl font-bold font-mono text-foreground">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setValue("quantity", quantity + 1, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                      className="flex size-12 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-all duration-200 hover:border-border/80 hover:bg-secondary hover:text-foreground active:scale-95"
                      aria-label="수량 증가"
                    >
                      <Plus className="size-5" />
                    </button>
                  </div>
                  <input
                    type="hidden"
                    {...register("quantity", { valueAsNumber: true })}
                  />
                  {errors.quantity?.message ? (
                    <p className="text-sm text-destructive">
                      {errors.quantity.message}
                    </p>
                  ) : null}
                </div>

                <Input
                  label="바코드"
                  placeholder="바코드 번호 (선택사항)"
                  leftIcon={<Barcode className="w-4 h-4" />}
                  {...register("barcode")}
                />
              </div>
            </Card>

            {(tags.length > 0 || isTagEditorOpen) && (
              <Card>
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <TagIcon className="w-5 h-5" />
                  태그
                </h2>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="태그 입력 (엔터로 추가)"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onCompositionStart={() => setIsTagComposing(true)}
                      onCompositionEnd={(e) => {
                        setIsTagComposing(false);
                        setTagInput(e.currentTarget.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          if (isTagComposing || e.nativeEvent.isComposing) {
                            return;
                          }
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

                  {tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag: string) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="cursor-pointer hover:bg-secondary/30"
                          onClick={() => removeTag(tag)}
                        >
                          {tag}
                          <X className="w-3 h-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </div>
              </Card>
            )}

            {!tags.length && !isTagEditorOpen && (
              <div className="flex justify-start">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsTagEditorOpen(true)}
                  leftIcon={<TagIcon className="h-4 w-4" />}
                >
                  태그 추가
                </Button>
              </div>
            )}

            {itemType && (
              <Card>
                <h2 className="text-xl font-bold text-foreground mb-4">
                  상세 정보
                </h2>
                <ItemTypeMetadataFields
                  type={itemType}
                  metadata={metadata}
                  onChange={updateMetadata}
                />
              </Card>
            )}

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
                disabled={isEditMode && isLoadingItem}
              >
                {isEditMode ? "수정 저장" : "저장"}
              </Button>
            </div>
          </form>
        </div>
      </main>

      {!isModal && <BottomNav />}
    </div>
  );
}
