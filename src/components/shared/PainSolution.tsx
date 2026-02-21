import { AlertTriangle, Check } from "lucide-react";

interface PainSolutionProps {
  pain: string;
  solution: string;
  source?: string;
}

export function PainSolution({ pain, solution, source }: PainSolutionProps) {
  return (
    <div className="surface-base p-5 space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-4 h-4 text-red-500" />
        </div>
        <div>
          <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">The Problem</p>
          <p className="text-sm text-gray-700 leading-relaxed">{pain}</p>
        </div>
      </div>
      <div className="h-px bg-gray-100" />
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
          <Check className="w-4 h-4 text-green-500" />
        </div>
        <div>
          <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">Our Approach</p>
          <p className="text-sm text-gray-700 leading-relaxed">{solution}</p>
        </div>
      </div>
      {source && (
        <p className="text-[10px] text-gray-400 text-right">{source}</p>
      )}
    </div>
  );
}
