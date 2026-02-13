import { Skeleton, CardSkeleton } from "@/components/shared/Skeleton";

export default function ReferralLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-5 sm:py-8 space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
      <CardSkeleton />
      <CardSkeleton />
    </div>
  );
}
