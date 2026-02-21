import Link from "next/link";
import { ArrowRight, Lightbulb } from "lucide-react";
import { TOOLS_MAP } from "@/lib/constants";

interface ContentSidebarProps {
  tools?: string[];
  relatedPages?: { label: string; href: string }[];
  insight?: { text: string; source?: string };
  ctaText?: string;
  ctaHref?: string;
}

export function ContentSidebar({
  tools,
  relatedPages,
  insight,
  ctaText = "Get Started Free",
  ctaHref = "/auth",
}: ContentSidebarProps) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24 space-y-6">
        {tools && tools.length > 0 && (
          <div className="surface-base p-4 space-y-2.5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recommended Tools</p>
            {tools.map((toolId) => {
              const tool = TOOLS_MAP[toolId];
              if (!tool) return null;
              return (
                <Link
                  key={toolId}
                  href={`/tools/${toolId}`}
                  className="flex items-center justify-between group"
                >
                  <span className="text-xs text-gray-700 group-hover:text-blue-600 transition-colors truncate">
                    {tool.title}
                  </span>
                  <span className={`ui-badge text-[10px] shrink-0 ml-2 ${tool.tokens === 0 ? "ui-badge-green" : "ui-badge-blue"}`}>
                    {tool.tokens === 0 ? "Free" : `${tool.tokens} tok`}
                  </span>
                </Link>
              );
            })}
          </div>
        )}

        {relatedPages && relatedPages.length > 0 && (
          <div className="surface-base p-4 space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Related</p>
            {relatedPages.map((page) => (
              <Link
                key={page.href}
                href={page.href}
                className="block text-xs text-gray-600 hover:text-blue-600 transition-colors truncate"
              >
                {page.label}
              </Link>
            ))}
          </div>
        )}

        {insight && (
          <div className="surface-base p-4">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Did You Know?</p>
                <p className="text-[11px] text-gray-600 leading-relaxed">{insight.text}</p>
                {insight.source && (
                  <p className="text-[10px] text-gray-400 mt-1">{insight.source}</p>
                )}
              </div>
            </div>
          </div>
        )}

        <Link href={ctaHref} className="surface-base surface-hover p-4 flex items-center gap-2 group">
          <div>
            <p className="text-xs font-semibold text-gray-900 group-hover:text-blue-600">{ctaText}</p>
            <p className="text-[10px] text-gray-400">15 free tokens. No card.</p>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        </Link>
      </div>
    </aside>
  );
}
