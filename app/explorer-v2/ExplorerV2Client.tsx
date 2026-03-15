"use client";

import { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  FolderPlus,
  RefreshCw,
  ArrowDownToLine,
} from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";
import { FloatingActionButton } from "@/components/ui/FloatingActionButton";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { useLocations } from "@/lib/hooks/useLocations";
import { cn } from "@/lib/utils/cn";
import type { Location } from "@/lib/types";
import { LocationDetailPanel } from "@/components/ui/LocationDetailPanel";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { AddLocationClient } from "@/app/explorer/AddLocationClient";
import { LocationThumbnail } from "@/components/features/LocationThumbnail";

type TreeLocation = Omit<Location, "children"> & { children: TreeLocation[] };

type DropPosition = "before" | "after" | "inside";

interface LocationPosition {
  id: string;
  parent_id: string | null;
  level: number;
  sort_order: number;
}

interface ParsedDropTarget {
  targetId: string;
  position: DropPosition;
}

const ROOT_ID = "root";
const DRAG_PREFIX = "drag:";
const DROP_PREFIX = "drop:";

function makeDragId(locationId: string): string {
  return `${DRAG_PREFIX}${locationId}`;
}

function parseDragId(rawId: string): string | null {
  if (!rawId.startsWith(DRAG_PREFIX)) {
    return null;
  }
  return rawId.slice(DRAG_PREFIX.length);
}

function makeDropId(targetId: string, position: DropPosition): string {
  return `${DROP_PREFIX}${targetId}:${position}`;
}

function parseDropId(rawId: string): ParsedDropTarget | null {
  if (!rawId.startsWith(DROP_PREFIX)) {
    return null;
  }

  const payload = rawId.slice(DROP_PREFIX.length);
  const [targetId, position] = payload.split(":");

  if (!targetId || (position !== "before" && position !== "after" && position !== "inside")) {
    return null;
  }

  return {
    targetId,
    position,
  };
}

function cloneTree(nodes: TreeLocation[]): TreeLocation[] {
  return nodes.map((node) => ({
    ...node,
    children: cloneTree(node.children),
  }));
}

function ensureTree(nodes: Location[]): TreeLocation[] {
  return nodes.map((node) => ({
    ...node,
    children: ensureTree(node.children || []),
  }));
}

function areTreesEqual(a: TreeLocation[], b: TreeLocation[]): boolean {
  if (a.length !== b.length) {
    return false;
  }

  for (let i = 0; i < a.length; i += 1) {
    const left = a[i];
    const right = b[i];
    if (
      left.id !== right.id ||
      left.name !== right.name ||
      left.level !== right.level ||
      (left.parent_id ?? null) !== (right.parent_id ?? null) ||
      (left.itemCount ?? left.item_count ?? 0) !== (right.itemCount ?? right.item_count ?? 0) ||
      (left.icon ?? null) !== (right.icon ?? null)
    ) {
      return false;
    }

    if (!areTreesEqual(left.children, right.children)) {
      return false;
    }
  }

  return true;
}

function areSetsEqual(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) {
    return false;
  }

  for (const value of a) {
    if (!b.has(value)) {
      return false;
    }
  }

  return true;
}

function collectTreeIds(nodes: TreeLocation[], output: Set<string>): void {
  nodes.forEach((node) => {
    output.add(node.id);
    collectTreeIds(node.children, output);
  });
}

function hasNodeInSubtree(node: TreeLocation, nodeId: string): boolean {
  if (node.id === nodeId) {
    return true;
  }

  return node.children.some((child) => hasNodeInSubtree(child, nodeId));
}

function detachNode(nodes: TreeLocation[], nodeId: string): TreeLocation | null {
  const index = nodes.findIndex((node) => node.id === nodeId);
  if (index >= 0) {
    const [removed] = nodes.splice(index, 1);
    return removed;
  }

  for (const node of nodes) {
    const removed = detachNode(node.children, nodeId);
    if (removed) {
      return removed;
    }
  }

  return null;
}

function findNode(nodes: TreeLocation[], nodeId: string): TreeLocation | null {
  for (const node of nodes) {
    if (node.id === nodeId) {
      return node;
    }

    const found = findNode(node.children, nodeId);
    if (found) {
      return found;
    }
  }

  return null;
}

function findSiblingsArray(
  nodes: TreeLocation[],
  nodeId: string,
): TreeLocation[] | null {
  const index = nodes.findIndex((node) => node.id === nodeId);
  if (index >= 0) {
    return nodes;
  }

  for (const node of nodes) {
    const found = findSiblingsArray(node.children, nodeId);
    if (found) {
      return found;
    }
  }

  return null;
}

function normalizeTree(
  nodes: TreeLocation[],
  parentId: string | null,
  level: number,
): void {
  nodes.forEach((node, index) => {
    node.parent_id = parentId;
    node.level = level;
    (node as TreeLocation & { sort_order?: number }).sort_order = index;
    normalizeTree(node.children, node.id, level + 1);
  });
}

function flattenPositions(
  nodes: TreeLocation[],
  parentId: string | null,
  level: number,
  output: Map<string, LocationPosition>,
): void {
  nodes.forEach((node, index) => {
    output.set(node.id, {
      id: node.id,
      parent_id: parentId,
      level,
      sort_order: index,
    });

    flattenPositions(node.children, node.id, level + 1, output);
  });
}

function flattenTreeLocations(nodes: TreeLocation[]): Location[] {
  return nodes.flatMap((node) => [
    {
      id: node.id,
      name: node.name,
      parent_id: node.parent_id,
      level: node.level,
      path: node.path,
      itemCount: node.itemCount,
      item_count: node.item_count,
      icon: node.icon,
      color: node.color,
      description: node.description,
      sort_order: node.sort_order,
    },
    ...flattenTreeLocations(node.children),
  ]);
}

async function patchLocationPosition(position: LocationPosition): Promise<void> {
  const response = await fetch(`/api/locations/${position.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      parent_id: position.parent_id,
      level: position.level,
      sort_order: position.sort_order,
    }),
  });

  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.error?.message || "위치 이동 저장에 실패했습니다.");
  }
}

function moveNode(
  sourceTree: TreeLocation[],
  draggedId: string,
  targetId: string,
  position: DropPosition,
): TreeLocation[] | null {
  if (draggedId === targetId && position === "inside") {
    return null;
  }

  const nextTree = cloneTree(sourceTree);
  const movingNode = detachNode(nextTree, draggedId);

  if (!movingNode) {
    return null;
  }

  if (hasNodeInSubtree(movingNode, targetId)) {
    return null;
  }

  if (position === "inside") {
    const targetNode = findNode(nextTree, targetId);
    if (!targetNode) {
      return null;
    }
    targetNode.children.push(movingNode);
  } else {
    const siblings = findSiblingsArray(nextTree, targetId);
    if (!siblings) {
      return null;
    }

    const targetIndex = siblings.findIndex((node) => node.id === targetId);
    const insertIndex = position === "before" ? targetIndex : targetIndex + 1;
    siblings.splice(insertIndex, 0, movingNode);
  }

  normalizeTree(nextTree, null, 1);
  return nextTree;
}

interface TreeNodeProps {
  node: TreeLocation;
  depth: number;
  expanded: Set<string>;
  isDragging: boolean;
  onToggle: (id: string) => void;
  onOpenAdd: (parentId: string | null) => void;
  onOpenDetail: (location: TreeLocation) => void;
}

function TreeNode({
  node,
  depth,
  expanded,
  isDragging,
  onToggle,
  onOpenAdd,
  onOpenDetail,
}: TreeNodeProps) {
  const isExpanded = expanded.has(node.id);
  const hasChildren = node.children.length > 0;

  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    transform,
    isDragging: isNodeDragging,
  } = useDraggable({
    id: makeDragId(node.id),
  });

  const { setNodeRef: setInsideRef, isOver: isOverInside } = useDroppable({
    id: makeDropId(node.id, "inside"),
  });

  const { setNodeRef: setBeforeRef, isOver: isOverBefore } = useDroppable({
    id: makeDropId(node.id, "before"),
  });

  const { setNodeRef: setAfterRef, isOver: isOverAfter } = useDroppable({
    id: makeDropId(node.id, "after"),
  });

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div className="relative space-y-2" style={{ paddingLeft: `${depth * 20}px` }}>
      <div className="relative">
        {isDragging && (
          <div
            ref={setBeforeRef}
            className={cn(
              "absolute left-0 right-0 -top-1 h-2 z-20",
              isOverBefore ? "bg-primary/40 rounded-md" : "bg-transparent",
            )}
          />
        )}

        {isDragging && (
          <div
            ref={setAfterRef}
            className={cn(
              "absolute left-0 right-0 -bottom-1 h-2 z-20",
              isOverAfter ? "bg-primary/40 rounded-md" : "bg-transparent",
            )}
          />
        )}

        {depth > 0 && (
          <div className="absolute left-2 top-0 bottom-0 w-px bg-border" />
        )}

        <div ref={setInsideRef} className="relative">
          <div
            ref={setDraggableRef}
            style={style}
            className={cn(
              "relative flex items-center gap-2 rounded-2xl border px-3 py-3",
              "bg-card border-border text-card-foreground shadow-soft",
              "transition-all duration-150",
              isNodeDragging && "opacity-50",
              isOverInside && isDragging && "ring-2 ring-primary",
            )}
          >
            <button
              type="button"
              className="p-1 rounded-md hover:bg-secondary/80"
              aria-label={`${node.name} 드래그 핸들`}
              {...attributes}
              {...listeners}
            >
              <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab touch-none" />
            </button>

            <button
              type="button"
              onClick={() => hasChildren && onToggle(node.id)}
              className="w-5 h-5 flex items-center justify-center text-muted-foreground"
            >
              {hasChildren ? (
                isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )
              ) : (
                <ChevronRight className="w-4 h-4 opacity-20" />
              )}
            </button>

            <button
              type="button"
              onClick={() => onOpenDetail(node)}
              className="min-w-0 flex flex-1 items-center gap-3 text-left"
            >
              <LocationThumbnail
                name={node.name}
                icon={node.icon || "📁"}
                className="h-10 w-10 rounded-xl"
                emojiClassName="left-1 top-1 h-5 w-5 text-[10px]"
                labelClassName="hidden"
              />

              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold truncate">{node.name}</p>
                <p className="text-xs text-muted-foreground">
                  레벨 {node.level} · 물품 {node.itemCount || node.item_count || 0}개
                </p>
              </div>
            </button>

            <Badge
              size="sm"
              variant="default"
              className="bg-secondary text-secondary-foreground"
            >
              {node.children.length}
            </Badge>

            <button
              type="button"
              onClick={() => onOpenAdd(node.id)}
              className="w-8 h-8 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors flex items-center justify-center"
              title="하위 위치 추가"
            >
              <FolderPlus className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div className="space-y-2">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              expanded={expanded}
              isDragging={isDragging}
              onToggle={onToggle}
              onOpenAdd={onOpenAdd}
              onOpenDetail={onOpenDetail}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface DragPreviewProps {
  node: TreeLocation | null;
}

function DragPreview({ node }: DragPreviewProps) {
  if (!node) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 rounded-2xl border px-3 py-3 bg-card border-border text-card-foreground shadow-medium w-[280px]">
      <GripVertical className="w-4 h-4 text-muted-foreground" />
      <LocationThumbnail
        name={node.name}
        icon={node.icon || "📁"}
        className="h-10 w-10 rounded-xl"
        emojiClassName="left-1 top-1 h-5 w-5 text-[10px]"
        labelClassName="hidden"
      />
      <div className="min-w-0 flex-1">
        <p className="text-base font-semibold truncate">{node.name}</p>
        <p className="text-xs text-muted-foreground">레벨 {node.level}</p>
      </div>
    </div>
  );
}

export default function ExplorerV2Client() {
  const SHEET_EXIT_MS = 300;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const {
    data: treeResponse = [],
    isLoading,
    isError,
    refetch,
  } = useLocations({ tree: true });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(MouseSensor, {
      activationConstraint: { distance: 4 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 8 },
    }),
  );

  const [tree, setTree] = useState<TreeLocation[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [isPersisting, setIsPersisting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [locationStack, setLocationStack] = useState<Location[]>([]);
  const [editingLocationId, setEditingLocationId] = useState<string | null>(null);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const editSheetCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { setNodeRef: setRootDropRef, isOver: isOverRoot } = useDroppable({
    id: makeDropId(ROOT_ID, "inside"),
  });

  useEffect(() => {
    const normalized = ensureTree(treeResponse);
    setTree((prev) => (areTreesEqual(prev, normalized) ? prev : normalized));

    const allIds = new Set<string>();
    collectTreeIds(normalized, allIds);
    const topLevelIds = new Set<string>();
    normalized.forEach((node) => {
      topLevelIds.add(node.id);
    });

    setExpanded((prev) => {
      const next = new Set<string>();
      let changed = false;

      for (const id of prev) {
        if (allIds.has(id)) {
          next.add(id);
        } else {
          changed = true;
        }
      }

      for (const id of topLevelIds) {
        if (!next.has(id)) {
          next.add(id);
          changed = true;
        }
      }

      return changed || !areSetsEqual(prev, next) ? next : prev;
    });
  }, [treeResponse]);

  useEffect(() => {
    return () => {
      if (editSheetCloseTimerRef.current) {
        clearTimeout(editSheetCloseTimerRef.current);
      }
    };
  }, []);

  const activeNode = activeDragId ? findNode(tree, activeDragId) : null;
  const flatLocations = useMemo(() => flattenTreeLocations(tree), [tree]);

  const persistMovedTree = useCallback(
    async (prevTree: TreeLocation[], nextTree: TreeLocation[]) => {
      const prevMap = new Map<string, LocationPosition>();
      const nextMap = new Map<string, LocationPosition>();

      flattenPositions(prevTree, null, 1, prevMap);
      flattenPositions(nextTree, null, 1, nextMap);

      const changed: LocationPosition[] = [];
      nextMap.forEach((position, id) => {
        const old = prevMap.get(id);
        if (
          !old ||
          old.parent_id !== position.parent_id ||
          old.level !== position.level ||
          old.sort_order !== position.sort_order
        ) {
          changed.push(position);
        }
      });

      if (changed.length === 0) {
        return;
      }

      for (const position of changed) {
        await patchLocationPosition(position);
      }
    },
    [],
  );

  const openAddModal = (parentId: string | null) => {
    const params = new URLSearchParams();
    if (parentId) {
      params.set("parent_id", parentId);
    }

    const currentQuery = searchParams.toString();
    const returnTo = currentQuery ? `${pathname}?${currentQuery}` : pathname;
    params.set("return_to", returnTo);

    router.push(`/explorer/add?${params.toString()}`);
  };

  const openEditSheet = (location: Location) => {
    setEditingLocationId(location.id);
    setIsEditSheetOpen(true);
  };

  const closeEditSheetWithAnimation = () => {
    setIsEditSheetOpen(false);
    editSheetCloseTimerRef.current = setTimeout(() => {
      setEditingLocationId(null);
    }, SHEET_EXIT_MS);
  };

  const handleToggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const dragId = parseDragId(String(event.active.id));
    if (!dragId) {
      return;
    }

    setActiveDragId(dragId);
    setErrorMessage(null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const dragId = parseDragId(String(event.active.id));
    const overId = event.over ? String(event.over.id) : null;

    setActiveDragId(null);

    if (!dragId || !overId) {
      return;
    }

    const parsedDrop = parseDropId(overId);
    if (!parsedDrop) {
      return;
    }

    const previousTree = cloneTree(tree);
    let nextTree: TreeLocation[] | null = null;

    if (parsedDrop.targetId === ROOT_ID && parsedDrop.position === "inside") {
      const copied = cloneTree(tree);
      const movingNode = detachNode(copied, dragId);
      if (!movingNode) {
        return;
      }
      copied.push(movingNode);
      normalizeTree(copied, null, 1);
      nextTree = copied;
    } else {
      nextTree = moveNode(tree, dragId, parsedDrop.targetId, parsedDrop.position);
      if (parsedDrop.position === "inside") {
        setExpanded((prev) => {
          const next = new Set(prev);
          next.add(parsedDrop.targetId);
          return next;
        });
      }
    }

    if (!nextTree) {
      return;
    }

    setTree(nextTree);
    setIsPersisting(true);

    try {
      await persistMovedTree(previousTree, nextTree);
      await refetch();
    } catch (error) {
      setTree(previousTree);
      setErrorMessage(
        error instanceof Error ? error.message : "위치 이동 저장에 실패했습니다.",
      );
    } finally {
      setIsPersisting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col bg-background sm:min-h-[calc(100dvh-4rem)]">
      <div className="container mx-auto max-w-3xl flex-1 space-y-4 px-4 py-6 pb-[calc(5rem+env(safe-area-inset-bottom))]">
        <h1 className="text-2xl font-bold text-foreground">우리집 위치구조</h1>

        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={(event: DragEndEvent) => {
            void handleDragEnd(event);
          }}
        >
          <section
            ref={setRootDropRef}
            className={cn(
              "rounded-xl border border-dashed p-3 text-sm flex items-center gap-2",
              activeDragId && isOverRoot
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border bg-card text-muted-foreground",
            )}
          >
            <ArrowDownToLine className="w-4 h-4" />
            여기에 드롭하면 루트 위치로 이동
          </section>

          <section className="space-y-2">
            {isLoading && (
              <div className="rounded-xl border border-border bg-card p-4 text-muted-foreground">
                위치 목록을 불러오는 중...
              </div>
            )}

            {isError && (
              <div className="rounded-xl border border-red-800 bg-red-950/40 p-4 text-red-100 text-sm">
                위치 트리를 불러오지 못했습니다.
                <button
                  type="button"
                  onClick={() => void refetch()}
                  className="ml-3 inline-flex items-center gap-1 underline"
                >
                  <RefreshCw className="w-3 h-3" />
                  다시 시도
                </button>
              </div>
            )}

            {!isLoading && !isError && tree.length === 0 && (
              <div className="flex min-h-[50vh] items-center justify-center">
                <EmptyState
                  size="sm"
                  title="등록된 위치가 없습니다"
                  description="플로팅 버튼으로 첫 위치를 추가해보세요"
                  action={{
                    label: "위치 추가",
                    onClick: () => openAddModal(null),
                  }}
                  className="py-0"
                />
              </div>
            )}

            {!isLoading && tree.length > 0 && (
              <div className="space-y-2">
                {tree.map((node) => (
                  <TreeNode
                    key={node.id}
                    node={node}
                    depth={0}
                    expanded={expanded}
                    isDragging={!!activeDragId}
                    onToggle={handleToggle}
                    onOpenAdd={openAddModal}
                    onOpenDetail={(location) => {
                      setLocationStack([]);
                      setSelectedLocation(location);
                    }}
                  />
                ))}
              </div>
            )}
          </section>

          <DragOverlay dropAnimation={null}>
            <DragPreview node={activeNode} />
          </DragOverlay>
        </DndContext>

        {isPersisting && (
          <p className="text-xs text-muted-foreground">위치 변경사항 저장 중...</p>
        )}
      </div>

      <FloatingActionButton onClick={() => openAddModal(null)} label="위치 추가" />

      <LocationDetailPanel
        isOpen={!!selectedLocation}
        onClose={() => {
          setSelectedLocation(null);
          setLocationStack([]);
        }}
        onBack={() => {
          if (locationStack.length > 0) {
            const parentLocation = locationStack[locationStack.length - 1];
            setLocationStack((prev) => prev.slice(0, -1));
            setSelectedLocation(parentLocation);
            return;
          }

          setSelectedLocation(null);
        }}
        location={selectedLocation}
        onSubLocationClick={(location) => {
          if (selectedLocation) {
            setLocationStack((prev) => [...prev, selectedLocation]);
          }
          setSelectedLocation(location);
        }}
        onEdit={(location) => openEditSheet(location)}
        onAddSubLocation={(parentId) => openAddModal(parentId)}
      />

      {editingLocationId && (
        <BottomSheet
          isOpen={isEditSheetOpen}
          onClose={closeEditSheetWithAnimation}
          title="위치 수정"
          maxHeight="max-h-[95vh]"
          closeOnOverlayClick={false}
        >
          <div className="-mx-6 -my-4">
            <AddLocationClient
              locations={flatLocations}
              mode="modal"
              isEditMode
              locationId={editingLocationId}
              onSuccess={async (_targetId, location) => {
                await queryClient.invalidateQueries({ queryKey: ["locations"] });

                if (location) {
                  setSelectedLocation(location);
                }

                closeEditSheetWithAnimation();
              }}
            />
          </div>
        </BottomSheet>
      )}

      <BottomNav />
    </div>
  );
}
