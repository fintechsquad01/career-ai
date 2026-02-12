import { Skeleton, CardSkeleton } from "@/components/shared/Skeleton";

export default function PricingLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20">
        {/* Header */}
        <div className="text-center mb-12 space-y-3">
          <Skeleton className="h-10 w-80 mx-auto" />
          <Skeleton className="h-5 w-64 mx-auto" />
        </div>

        {/* Packs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>

        {/* Tools grid */}
        <div className="mb-16 space-y-4">
          <Skeleton className="h-8 w-64 mx-auto" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
