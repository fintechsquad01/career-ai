import type { TStat } from "@/lib/pain-stats";
import { AnimateOnScroll } from "./AnimateOnScroll";

interface StatBlockProps {
  stats: TStat[];
  columns?: 2 | 3;
}

export function StatBlock({ stats, columns = 3 }: StatBlockProps) {
  const gridCols = columns === 2
    ? "grid-cols-1 sm:grid-cols-2"
    : "grid-cols-1 sm:grid-cols-3";

  return (
    <AnimateOnScroll>
      <div className={`grid ${gridCols} gap-4 stagger-children`}>
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card p-5 text-center">
            <p className="text-3xl font-bold text-gradient">{stat.value}</p>
            <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">{stat.label}</p>
            <p className="text-[10px] text-gray-400 mt-2">{stat.source}</p>
          </div>
        ))}
      </div>
    </AnimateOnScroll>
  );
}
