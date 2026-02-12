"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Crosshair, Wrench, Coins, User } from "lucide-react";

const ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/mission", icon: Crosshair, label: "Mission" },
  { href: "/tools", icon: Wrench, label: "Tools" },
  { href: "/pricing", icon: Coins, label: "Tokens" },
  { href: "/settings", icon: User, label: "Profile" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 md:hidden">
      <div className="flex items-center justify-around">
        {ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-2 px-3 min-h-[48px] min-w-[48px] transition-colors ${
                active ? "text-blue-600" : "text-gray-400"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
