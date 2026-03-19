"use client";

import { useCallback, useMemo, useState } from "react";

interface UseDialogOptions<TData> {
  initialOpen?: boolean;
  initialData?: TData | null;
}

interface DialogState<TData> {
  isOpen: boolean;
  data: TData | null;
}

export function useDialog<TData = never>({
  initialOpen = false,
  initialData = null,
}: UseDialogOptions<TData> = {}) {
  const [state, setState] = useState<DialogState<TData>>(() => ({
    isOpen: initialOpen,
    data: initialData,
  }));

  const open = useCallback((data?: TData | null) => {
    setState({
      isOpen: true,
      data: data === undefined ? null : data,
    });
  }, []);

  const close = useCallback(() => {
    setState((current) =>
      current.isOpen ? { ...current, isOpen: false } : current,
    );
  }, []);

  const toggle = useCallback(() => {
    setState((current) => ({
      ...current,
      isOpen: !current.isOpen,
    }));
  }, []);

  const setData = useCallback((data: TData | null) => {
    setState((current) => ({
      ...current,
      data,
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      isOpen: false,
      data: null,
    });
  }, []);

  return useMemo(
    () => ({
      isOpen: state.isOpen,
      data: state.data,
      open,
      close,
      toggle,
      setData,
      reset,
    }),
    [state.isOpen, state.data, open, close, toggle, setData, reset],
  );
}

export const useModal = useDialog;
