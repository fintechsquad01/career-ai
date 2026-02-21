import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <span>/</span>}
          {item.href && i < items.length - 1 ? (
            <Link href={item.href} className="hover:text-gray-600 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className={i === items.length - 1 ? "text-gray-600" : ""}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
