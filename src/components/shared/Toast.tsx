"use client";

import { useEffect, useState } from "react";
import { CheckCircle, X } from "lucide-react";

interface ToastData {
  message: string;
  type?: "success" | "error";
}

let showToastFn: ((data: ToastData) => void) | null = null;

export function toast(message: string, type: "success" | "error" = "success") {
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

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-200" role="status" aria-live="polite" aria-atomic="true">
      <div className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg ${
        data.type === "error" ? "bg-red-600" : "bg-gray-900"
      } text-white text-sm font-medium`}>
        <CheckCircle className="w-4 h-4" />
        <span>{data.message}</span>
        <button onClick={() => setVisible(false)} className="ml-2 hover:opacity-70">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
