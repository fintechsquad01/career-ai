import { SettingsSkeleton } from "@/components/shared/Skeleton";

export default function SettingsLoading() {
  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto space-y-6">
      <div className="animate-pulse bg-gray-200 rounded-xl h-6 w-32" />
      <SettingsSkeleton />
    </div>
  );
}
