import { COMPETITOR_PRICES, type TCompetitorPrice } from "@/lib/pain-stats";

interface CompetitorAnchorProps {
  competitors?: string[];
  layout?: "inline" | "grid";
}

export function CompetitorAnchor({ competitors, layout = "inline" }: CompetitorAnchorProps) {
  const items: TCompetitorPrice[] = competitors
    ? COMPETITOR_PRICES.filter((c) => competitors.includes(c.name))
    : COMPETITOR_PRICES;

  if (layout === "grid") {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {items.map((c) => (
          <div key={c.name} className="text-center px-3 py-2 rounded-full bg-gray-100">
            <span className="text-xs text-gray-500 line-through">{c.name} {c.price}{c.period}</span>
          </div>
        ))}
        <div className="text-center px-3 py-2 rounded-full bg-blue-600 col-span-2 sm:col-span-1">
          <span className="text-xs text-white font-semibold">AISkillScore: from free</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {items.map((c) => (
        <span key={c.name} className="px-3 py-1.5 rounded-full bg-gray-100 text-xs text-gray-500 line-through">
          {c.name} {c.price}{c.period}
        </span>
      ))}
      <span className="px-3 py-1.5 rounded-full bg-blue-600 text-xs text-white font-semibold">
        AISkillScore: from free
      </span>
    </div>
  );
}
