"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

let nextToastId = 0;

export function showToast(message: string, type: ToastType = "info") {
  if (typeof window !== "undefined") {
    const detail: ToastItem = {
      id: `toast-${++nextToastId}`,
      message,
      type,
    };
    window.dispatchEvent(new CustomEvent("shohojogi-toast", { detail }));
  }
}

showToast.success = (message: string) => showToast(message, "success");
showToast.error = (message: string) => showToast(message, "error");
showToast.info = (message: string) => showToast(message, "info");

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    function handleToast(event: Event) {
      const customEvent = event as CustomEvent<ToastItem>;
      if (!customEvent.detail) return;
      const newToast = customEvent.detail;

      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 4500);
    }

    window.addEventListener("shohojogi-toast", handleToast);
    return () => window.removeEventListener("shohojogi-toast", handleToast);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full px-4 sm:px-0"
    >
      {toasts.map((item) => {
        const isSuccess = item.type === "success";
        const isError = item.type === "error";

        return (
          <div
            key={item.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-3 ${
              isSuccess
                ? "border-emerald-200 bg-white/95 text-emerald-950 dark:border-emerald-900/60 dark:bg-slate-900/95 dark:text-emerald-100"
                : isError
                ? "border-rose-200 bg-white/95 text-rose-950 dark:border-rose-900/60 dark:bg-slate-900/95 dark:text-rose-100"
                : "border-slate-200 bg-white/95 text-slate-900 dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-100"
            }`}
          >
            <span className="mt-0.5 shrink-0">
              {isSuccess && <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
              {isError && <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />}
              {!isSuccess && !isError && <Info className="h-5 w-5 text-teal-600 dark:text-teal-400" />}
            </span>
            <p className="flex-1 text-sm font-medium leading-snug">{item.message}</p>
            <button
              type="button"
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== item.id))}
              aria-label="Dismiss notification"
              className="shrink-0 rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
