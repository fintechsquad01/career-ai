"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { EVENTS, track } from "@/lib/analytics";

interface FAQItem {
  q: string;
  a: string;
}

interface FAQProps {
  items: FAQItem[];
}

export function FAQ({ items }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3" itemScope itemType="https://schema.org/FAQPage">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={i}
            className="glass-card overflow-hidden"
            itemScope
            itemProp="mainEntity"
            itemType="https://schema.org/Question"
          >
            <button
              onClick={() => {
                if (!isOpen) track(EVENTS.FAQ_ITEM_EXPANDED, { question: item.q });
                setOpenIndex(isOpen ? null : i);
              }}
              className="w-full flex items-center justify-between px-5 py-4 text-left min-h-[44px]"
              aria-expanded={isOpen}
            >
              <span className="text-sm font-medium text-gray-900 pr-4" itemProp="name">
                {item.q}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-300 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {/* Answer is always in DOM for crawler visibility, hidden via CSS max-height transition */}
            <div
              itemScope
              itemProp="acceptedAnswer"
              itemType="https://schema.org/Answer"
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{
                maxHeight: isOpen ? "500px" : "0px",
                opacity: isOpen ? 1 : 0,
              }}
            >
              <div className="px-5 pb-4">
                <p className="text-sm text-gray-600 leading-relaxed" itemProp="text">
                  {item.a}
                </p>
              </div>
            </div>
            {/* Hidden accessible version always in DOM for crawlers */}
            {!isOpen && (
              <div className="sr-only" itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                <span itemProp="text">{item.a}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
