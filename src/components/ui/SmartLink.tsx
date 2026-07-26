import React from "react";
import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { trackClick } from "@/lib/linking.utils";

interface SmartLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  isSponsored?: boolean;
  isUgc?: boolean;
  isNoFollow?: boolean;
  children: React.ReactNode;
}

export function SmartLink({
  href,
  isSponsored = false,
  isUgc = false,
  isNoFollow = false,
  children,
  className = "",
  target,
  rel,
  onClick,
  ...props
}: SmartLinkProps) {
  const isExternal = href.startsWith("http://") || href.startsWith("https://") || href.startsWith("//");
  const sourcePath = typeof window !== "undefined" ? window.location.pathname : "/";

  // Build rel tags based on options and SEO rules
  const relList: string[] = [];
  if (isExternal) {
    relList.push("noopener", "noreferrer");
    if (isNoFollow) relList.push("nofollow");
    if (isSponsored) relList.push("sponsored");
    if (isUgc) relList.push("ugc");
  }
  const finalRel = rel || (relList.length > 0 ? relList.join(" ") : undefined);
  const finalTarget = target || (isExternal ? "_blank" : undefined);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Record analytics click asynchronously
    const anchorText = e.currentTarget.textContent || "link";
    trackClick(isExternal ? "external" : "internal", sourcePath, href, anchorText);

    if (onClick) {
      onClick(e);
    }
  };

  if (isExternal) {
    return (
      <a
        href={href}
        target={finalTarget}
        rel={finalRel}
        onClick={handleClick}
        className={`inline-flex items-center gap-1 hover:underline ${className}`}
        {...props}
      >
        {children}
        <ExternalLink className="h-3 w-3 opacity-60 inline-block align-middle" />
      </a>
    );
  }

  return (
    <Link
      to={href}
      onClick={handleClick as any}
      className={className}
      {...(props as any)}
    >
      {children}
    </Link>
  );
}
