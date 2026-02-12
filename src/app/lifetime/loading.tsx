import { Skeleton, CardSkeleton } from "@/components/shared/Skeleton";

export default function LifetimeLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {/* Back link */}
        <Skeleton className="h-4 w-16 mb-8" />

        {/* Header */}
        <div className="text-center mb-10 space-y-3">
          <Skeleton className="h-8 w-56 mx-auto rounded-full" />
          <Skeleton className="h-10 w-80 mx-auto" />
          <Skeleton className="h-5 w-48 mx-auto" />
          <Skeleton className="h-8 w-64 mx-auto rounded-full" />
        </div>

        {/* Price comparison */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
        </div>

        {/* ROI */}
        <CardSkeleton />

        {/* What 100 tokens covers */}
        <div className="mt-10">
          <CardSkeleton />
        </div>
      </div>
    </div>
  );
}
