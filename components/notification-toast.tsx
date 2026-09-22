"use client";

import { useEffect } from "react";

export type ToastType = "success" | "error";

export type ToastState = { message: string; type: ToastType } | null;

export function Toast({
  toast,
  onClose,
}: {
  toast: ToastState;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div
      role="status"
      className={`fixed bottom-4 right-4 z-50 rounded-md px-4 py-3 text-sm text-white shadow-lg transition-opacity ${
        toast.type === "success" ? "bg-green-600" : "bg-red-600"
      }`}
    >
      {toast.message}
    </div>
  );
}