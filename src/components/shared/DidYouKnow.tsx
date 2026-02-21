import { Lightbulb } from "lucide-react";

interface DidYouKnowProps {
  text: string;
  source?: string;
}

export function DidYouKnow({ text, source }: DidYouKnowProps) {
  return (
    <div className="glass-card p-4 flex items-start gap-3 my-6">
      <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Did You Know?</p>
        <p className="text-sm text-gray-700 leading-relaxed">{text}</p>
        {source && <p className="text-[10px] text-gray-400 mt-1.5">{source}</p>}
      </div>
    </div>
  );
}
