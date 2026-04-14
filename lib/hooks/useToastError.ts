"use client";

import { useEffect, useRef } from "react";
import { useToast } from "@/lib/providers/ToastProvider";

interface UseToastErrorOptions {
  title?: string;
}

export function useToastError(
  message: string | null | undefined,
  options: UseToastErrorOptions = {},
) {
  const { pushToast } = useToast();
  const lastMessageRef = useRef<string | null>(null);

  useEffect(() => {
    if (!message) {
      lastMessageRef.current = null;
      return;
    }

    if (lastMessageRef.current === message) {
      return;
    }

    lastMessageRef.current = message;

    pushToast({
      tone: "error",
      title: options.title ?? "문제가 발생했습니다.",
      description: message,
    });
  }, [message, options.title, pushToast]);
}
