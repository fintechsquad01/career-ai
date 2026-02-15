"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertCircle, Info, Sparkles, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info" | "celebration";

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
      const duration = data?.type === "celebration" ? 4000 : 3000;
      const timer = setTimeout(() => setVisible(false), duration);
      return () => clearTimeout(timer);
    }
  }, [visible, data?.type]);

  if (!visible || !data) return null;

  const iconMap: Record<ToastType, typeof CheckCircle> = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
    celebration: Sparkles,
  };
  const bgMap: Record<ToastType, string> = {
    success: "bg-gray-900",
    error: "bg-red-600",
    warning: "bg-amber-600",
    info: "bg-blue-600",
    celebration: "bg-gray-900",
  };

  const toastType = data.type || "success";
  const Icon = iconMap[toastType];
  const isCelebration = toastType === "celebration";

  return (
    <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 ${isCelebration ? "celebrate" : ""}`} role="alert" aria-live="assertive" aria-atomic="true">
      <div className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg ${bgMap[toastType]} text-white text-sm font-medium ${isCelebration ? "border-l-4 border-l-transparent" : ""}`}
        style={isCelebration ? { borderImage: "linear-gradient(to bottom, #7c3aed, #2563eb) 1", borderLeftWidth: 4, borderLeftStyle: "solid" } : undefined}
      >
        <Icon className={`w-4 h-4 shrink-0 ${isCelebration ? "text-violet-300" : ""}`} />
        <span>{data.message}</span>
        <button onClick={() => setVisible(false)} className="ml-2 hover:opacity-70 min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
