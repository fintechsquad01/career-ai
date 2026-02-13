"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastData {
  message: string;
  type?: ToastType;
}

let showToastFn: ((data: ToastData) => void) | null = null;

export function toast(message: string, type: ToastType = "success") {
  showToastFn?.({ message, type });
}

export function ToastProvider() {
  const [data, setData] = useState<ToastData | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    showToastFn = (d) => {
      setData(d);
      setVisible(true);
    };
    return () => {
      showToastFn = null;
    };
  }, []);

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible || !data) return null;

  const iconMap = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };
  const bgMap = {
    success: "bg-gray-900",
    error: "bg-red-600",
    warning: "bg-amber-600",
    info: "bg-blue-600",
  };
  const Icon = iconMap[data.type || "success"];

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-200" role="status" aria-live="polite" aria-atomic="true">
      <div className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg ${bgMap[data.type || "success"]} text-white text-sm font-medium`}>
        <Icon className="w-4 h-4 shrink-0" />
        <span>{data.message}</span>
        <button onClick={() => setVisible(false)} className="ml-2 hover:opacity-70">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
