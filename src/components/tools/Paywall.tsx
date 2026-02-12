"use client";

import { X, Coins, ArrowRight } from "lucide-react";
import { PACKS } from "@/lib/constants";

interface PaywallProps {
  requiredTokens: number;
  onClose: () => void;
  onPurchaseComplete: () => void;
}

export function Paywall({ requiredTokens, onClose, onPurchaseComplete }: PaywallProps) {
  const handlePurchase = async (packId: string) => {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Purchase error:", error);
      // Fallback to pricing page
      window.location.href = "/pricing";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6 animate-in slide-in-from-bottom-4 duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-3">
            <Coins className="w-6 h-6 text-amber-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Need more tokens</h2>
          <p className="text-sm text-gray-500 mt-1">
            This tool requires {requiredTokens} tokens. Choose a pack to continue.
          </p>
        </div>

        <div className="space-y-3">
          {PACKS.map((pack) => (
            <button
              key={pack.id}
              onClick={() => handlePurchase(pack.id)}
              className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all min-h-[44px] ${
                pack.highlighted
                  ? "border-blue-600 bg-blue-50 hover:bg-blue-100"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{pack.name}</span>
                  {pack.highlighted && (
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full">
                      BEST VALUE
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">{pack.tokens} tokens · {pack.rate}/token</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">${pack.price}</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">
          Pro pack covers ~10 full job applications
        </p>
      </div>
    </div>
  );
}
