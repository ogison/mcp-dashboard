import { useEffect } from "react";
import type { Toast as ToastType } from "../types";

interface ToastProps {
  toast: ToastType;
  onClose: (id: string) => void;
}

export function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const bgColor = {
    success: "bg-success",
    error: "bg-error",
    warning: "bg-warning",
    info: "bg-primary",
  }[toast.type];

  return (
    <div
      className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-lg mb-4 flex items-center justify-between min-w-80 max-w-md`}
    >
      <span>{toast.message}</span>
      <button
        onClick={() => onClose(toast.id)}
        className="ml-4 text-white hover:text-gray-200 font-bold text-lg"
      >
        ×
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastType[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
}
