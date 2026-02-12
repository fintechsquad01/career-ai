import Link from "next/link";
import { Brain, Home, LayoutDashboard } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-2xl text-gray-900">CareerAI</span>
        </div>

        {/* Message */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6">
          <p className="text-6xl font-bold text-gray-200 mb-4">404</p>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
          <p className="text-sm text-gray-500 mb-6">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity min-h-[48px]"
            >
              <LayoutDashboard className="w-4 h-4" />
              Go to Dashboard
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-3 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors min-h-[48px]"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Link>
          </div>
        </div>

        <p className="text-xs text-gray-400">
          Need help? Contact us at support@careerai.com
        </p>
      </div>
    </div>
  );
}
