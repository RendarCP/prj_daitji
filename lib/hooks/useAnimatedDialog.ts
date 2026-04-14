"use client";

import { useCallback, useEffect, useRef } from "react";
import { useDialog } from "@/lib/hooks/useDialog";

interface UseAnimatedDialogOptions<TData> {
  exitMs?: number;
  initialData?: TData | null;
  initialOpen?: boolean;
}

export function useAnimatedDialog<TData = never>({
  exitMs = 300,
  initialData = null,
  initialOpen = false,
}: UseAnimatedDialogOptions<TData> = {}) {
  const dialog = useDialog<TData>({
    initialData,
    initialOpen,
  });
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const closeWithAnimation = useCallback(() => {
    dialog.close();

    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }

    closeTimerRef.current = setTimeout(() => {
      dialog.reset();
    }, exitMs);
  }, [dialog, exitMs]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  return {
    ...dialog,
    closeWithAnimation,
  };
}
