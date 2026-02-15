"use client";

interface SourceItem {
  text: string;
  verified: boolean;
  source: string;
}

interface SourceVerificationProps {
  items: SourceItem[];
}

export function SourceVerification({ items }: SourceVerificationProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Source Verification</h4>
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2 text-xs">
            <span className={item.verified ? "text-green-500" : "text-amber-500"}>
              {item.verified ? "✓" : "⚠"}
            </span>
            <span className="text-gray-600">
              <span className="font-medium text-gray-900">&ldquo;{item.text}&rdquo;</span>
              {" — "}
              <span className={item.verified ? "text-green-700" : "text-amber-600"}>
                {item.source}
              </span>
            </span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-gray-400 mt-2">
        All facts should come from your resume. Items marked ⚠ may need manual verification.
      </p>
    </div>
  );
}
