import React from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbsProps {
  customItems?: Array<{ label: string; to: string }>;
}

export function Breadcrumbs({ customItems }: BreadcrumbsProps) {
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "";

  const items = React.useMemo(() => {
    if (customItems) return customItems;

    const parts = currentPath.split("/").filter(Boolean);
    const breadcrumbList = [{ label: "Home", to: "/" }];

    let currentLink = "";
    parts.forEach((part, index) => {
      currentLink += `/${part}`;
      // Clean display names
      let label = part.replace(/-/g, " ");
      label = label.charAt(0).toUpperCase() + label.slice(1);

      // Handle specific mappings
      if (part.toLowerCase() === "cps") label = "CPS Test";
      if (part.toLowerCase() === "wpm") label = "WPM Calculator";
      if (part.toLowerCase() === "cpm") label = "CPM Calculator";

      breadcrumbList.push({ label, to: currentLink });
    });

    return breadcrumbList;
  }, [currentPath, customItems]);

  if (items.length <= 1) return null;

  // Render schema structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": typeof window !== "undefined" ? `${window.location.origin}${item.to}` : item.to,
    })),
  };

  return (
    <nav aria-label="Breadcrumb" className="w-full py-3">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.to} className="flex items-center gap-1.5">
              {index > 0 && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
              {isLast ? (
                <span className="text-foreground font-semibold" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.to}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  {index === 0 && <Home className="h-3 w-3 inline" />}
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
