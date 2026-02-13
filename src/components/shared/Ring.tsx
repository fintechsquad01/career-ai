"use client";

interface RingProps {
  score: number;
  size?: "sm" | "md" | "lg";
  label?: string;
  showLabel?: boolean;
}

const SIZES = {
  sm: 60,
  md: 100,
  lg: 140,
};

function getColor(score: number) {
  if (score < 40) return { stroke: "#EF4444", text: "text-red-500" };
  if (score < 70) return { stroke: "#F59E0B", text: "text-amber-500" };
  return { stroke: "#22C55E", text: "text-green-500" };
}

export function Ring({ score, size = "md", label, showLabel = true }: RingProps) {
  const px = SIZES[size];
  const strokeWidth = size === "sm" ? 5 : size === "md" ? 6 : 8;
  const radius = (px - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const { stroke, text } = getColor(score);

  const fontSize = size === "sm" ? "text-sm" : size === "md" ? "text-xl" : "text-3xl";
  const labelSize = size === "sm" ? "text-[9px]" : "text-xs";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: px, height: px }}>
      <svg width={px} height={px} className="-rotate-90">
        <circle
          cx={px / 2}
          cy={px / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={px / 2}
          cy={px / 2}
          r={radius}
          stroke={stroke}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700"
          style={{ filter: `drop-shadow(0 0 4px ${stroke}40)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-bold ${fontSize} ${text}`}>{score}</span>
        {showLabel && label && (
          <span className={`${labelSize} text-gray-400 font-medium`}>{label}</span>
        )}
      </div>
    </div>
  );
}
