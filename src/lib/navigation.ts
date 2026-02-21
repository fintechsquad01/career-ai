import {
  BookOpen,
  Clock,
  Crosshair,
  LayoutDashboard,
  Settings,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

export interface AppNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  key: string;
}

export const CORE_NAV_ITEMS: AppNavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, key: "dashboard" },
  { href: "/mission", label: "Mission Control", icon: Crosshair, key: "mission" },
  { href: "/tools", label: "Tools", icon: Wrench, key: "tools" },
  { href: "/settings", label: "Settings", icon: Settings, key: "settings" },
];

export const EXTENDED_NAV_ITEMS: AppNavItem[] = [
  { href: "/history", label: "History", icon: Clock, key: "history" },
  { href: "/quick-apply", label: "Quick Apply", icon: Zap, key: "quick_apply" },
  { href: "/resources", label: "Resources", icon: BookOpen, key: "resources" },
];

export function isActiveRoute(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}
