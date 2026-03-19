"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type ToastTone = "success" | "error" | "info";

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
}

interface ToastContextValue {
  pushToast: (toast: Omit<ToastItem, "id">) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

function getToastIcon(tone: ToastTone) {
  switch (tone) {
    case "success":
      return CheckCircle2;
    case "error":
      return AlertCircle;
    case "info":
    default:
      return Info;
  }
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    (toast: Omit<ToastItem, "id">) => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { ...toast, id }]);

      window.setTimeout(() => {
        dismissToast(id);
      }, 3600);
    },
    [dismissToast],
  );

  const value = useMemo(
    () => ({
      pushToast,
      dismissToast,
    }),
    [dismissToast, pushToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] mx-auto flex w-full max-w-md flex-col gap-3 px-4">
        {toasts.map((toast) => {
          const Icon = getToastIcon(toast.tone);

          return (
            <div
              key={toast.id}
              className={cn(
                "pointer-events-auto animate-scale-in rounded-2xl border px-4 py-3 shadow-medium backdrop-blur",
                toast.tone === "success" &&
                  "border-success/30 bg-success/15 text-foreground",
                toast.tone === "error" &&
                  "border-destructive/30 bg-destructive/15 text-foreground",
                toast.tone === "info" &&
                  "border-border bg-card/95 text-foreground",
              )}
              role="status"
              aria-live="polite"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-background/60 p-1">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{toast.title}</p>
                  {toast.description ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {toast.description}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => dismissToast(toast.id)}
                  className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-background/60 hover:text-foreground"
                  aria-label="토스트 닫기"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider.");
  }

  return context;
}
