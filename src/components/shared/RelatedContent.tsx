import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AnimateOnScroll } from "./AnimateOnScroll";

interface RelatedItem {
  title: string;
  description: string;
  href: string;
  badge?: string;
}

interface RelatedContentProps {
  items: RelatedItem[];
  heading?: string;
}

export function RelatedContent({ items, heading = "Continue exploring" }: RelatedContentProps) {
  if (items.length === 0) return null;

  return (
    <AnimateOnScroll>
      <div className="mt-10">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{heading}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 stagger-children">
          {items.slice(0, 3).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="surface-base surface-hover p-4 flex flex-col group"
            >
              {item.badge && (
                <span className="ui-badge ui-badge-gray text-[10px] self-start mb-2">{item.badge}</span>
              )}
              <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                {item.title}
              </p>
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 flex-1">
                {item.description}
              </p>
              <span className="text-xs text-blue-600 font-medium inline-flex items-center gap-1 mt-2">
                Explore <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </AnimateOnScroll>
  );
}
