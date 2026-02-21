"use client";

import Link from "next/link";
import { track } from "@/lib/analytics";

interface TrackedLinkProps {
  href: string;
  event: string;
  properties?: Record<string, string | number | boolean>;
  className?: string;
  children: React.ReactNode;
}

export function TrackedLink({ href, event, properties, className, children }: TrackedLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => track(event, properties)}
    >
      {children}
    </Link>
  );
}
