import { Skeleton } from "@/components/shared/Skeleton";

export default function ShareLoading() {
  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-4">
            <div className="flex items-center gap-2">
              <Skeleton className="w-7 h-7 rounded-lg bg-white/20" />
              <Skeleton className="h-5 w-28 bg-white/20" />
            </div>
          </div>
          {/* Score area */}
          <div className="p-8 flex flex-col items-center space-y-4">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="w-32 h-32 rounded-full" />
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3 w-24" />
          </div>
          {/* CTA */}
          <div className="px-6 pb-8 flex justify-center">
            <Skeleton className="h-12 w-72 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
