interface ExpertQuoteProps {
  quote: string;
  attribution: string;
  role?: string;
}

export function ExpertQuote({ quote, attribution, role }: ExpertQuoteProps) {
  return (
    <div className="surface-base p-5 border-l-4 border-blue-600">
      <p className="text-sm text-gray-700 italic leading-relaxed">
        &ldquo;{quote}&rdquo;
      </p>
      <p className="text-xs text-gray-500 mt-3 font-medium">
        — {attribution}
        {role && <span className="text-gray-400">, {role}</span>}
      </p>
    </div>
  );
}
