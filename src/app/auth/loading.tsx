import { Skeleton } from "@/components/shared/Skeleton";

export default function AuthLoading() {
  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <Skeleton className="h-7 w-36" />
        </div>
        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-5">
          <Skeleton className="h-7 w-48 mx-auto" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-px w-full" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
