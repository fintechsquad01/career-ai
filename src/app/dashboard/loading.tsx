import { DashboardSkeleton } from "@/components/shared/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <DashboardSkeleton />
    </div>
  );
}
