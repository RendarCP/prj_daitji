"use client";

import { useCallback, useEffect, useRef } from "react";

type OverlayKey = "item-detail" | "location-detail";

interface UseOverlayHistorySyncOptions {
  isOpen: boolean;
  enabled?: boolean;
  overlayKey: OverlayKey;
  overlayId: string;
  onRequestClose: () => void;
}

function createEntryId(overlayKey: OverlayKey, overlayId: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${overlayKey}:${overlayId}:${crypto.randomUUID()}`;
  }

  return `${overlayKey}:${overlayId}:${Date.now()}:${Math.random()}`;
}

export function useOverlayHistorySync({
  isOpen,
  enabled = true,
  overlayKey,
  overlayId,
  onRequestClose,
}: UseOverlayHistorySyncOptions) {
  const onRequestCloseRef = useRef(onRequestClose);
  const activeEntryIdRef = useRef<string | null>(null);
  const isEntryActiveRef = useRef(false);
  const isUiClosingRef = useRef(false);

  useEffect(() => {
    onRequestCloseRef.current = onRequestClose;
  }, [onRequestClose]);

  useEffect(() => {
    if (!enabled || !isOpen || typeof window === "undefined") {
      return;
    }

    if (isEntryActiveRef.current) {
      return;
    }

    const entryId = createEntryId(overlayKey, overlayId);
    const nextState = {
      ...(window.history.state ?? {}),
      overlay: overlayKey,
      overlayId,
      overlayEntryId: entryId,
    };

    activeEntryIdRef.current = entryId;
    isEntryActiveRef.current = true;
    isUiClosingRef.current = false;

    window.history.pushState(nextState, "");
  }, [enabled, isOpen, overlayId, overlayKey]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handlePopState = () => {
      const activeEntryId = activeEntryIdRef.current;

      if (!activeEntryId || !isEntryActiveRef.current) {
        return;
      }

      const currentEntryId = window.history.state?.overlayEntryId;

      if (currentEntryId === activeEntryId) {
        return;
      }

      activeEntryIdRef.current = null;
      isEntryActiveRef.current = false;

      if (isUiClosingRef.current) {
        isUiClosingRef.current = false;
        return;
      }

      onRequestCloseRef.current();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const requestClose = useCallback(() => {
    if (!enabled || typeof window === "undefined") {
      onRequestCloseRef.current();
      return;
    }

    const activeEntryId = activeEntryIdRef.current;
    const currentEntryId = window.history.state?.overlayEntryId;

    if (
      activeEntryId &&
      isEntryActiveRef.current &&
      currentEntryId === activeEntryId
    ) {
      isUiClosingRef.current = true;
      window.history.back();
    } else {
      activeEntryIdRef.current = null;
      isEntryActiveRef.current = false;
      isUiClosingRef.current = false;
    }

    onRequestCloseRef.current();
  }, [enabled]);

  return {
    requestClose,
  };
}
