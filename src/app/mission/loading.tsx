import { MissionSkeleton } from "@/components/shared/Skeleton";

export default function MissionLoading() {
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <div className="animate-pulse bg-gray-200 rounded-xl h-6 w-40" />
      <MissionSkeleton />
    </div>
  );
}
