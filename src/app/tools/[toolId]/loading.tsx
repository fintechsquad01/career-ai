import { Skeleton, CardSkeleton } from "@/components/shared/Skeleton";

export default function ToolLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-5 sm:py-8 space-y-6">
      {/* Back link */}
      <Skeleton className="h-4 w-24" />

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full max-w-md" />
      </div>

      {/* Insights */}
      <div className="space-y-2">
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>

      {/* Input area */}
      <CardSkeleton />
    </div>
  );
}
