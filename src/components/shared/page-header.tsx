"use client";

import { Fragment } from "react";
import Link from "next/link";
import { useSidebar } from "./sidebar-context";
import { ChevronRight, Menu } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}

export function PageHeader({ title, description, actions, breadcrumbs }: PageHeaderProps) {
  const { isMobile, hideChrome, open } = useSidebar();

  if (isMobile && hideChrome) return null;

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-white/95 backdrop-blur-sm px-4 md:px-8 py-4 md:py-6">
      {breadcrumbs && (
        <nav className="mb-2 flex items-center gap-1.5 text-sm text-muted-foreground">
          {breadcrumbs.map((crumb, i) => (
            <Fragment key={i}>
              {i > 0 && <ChevronRight className="h-3.5 w-3.5" />}
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-primary transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-foreground">{crumb.label}</span>
              )}
            </Fragment>
          ))}
        </nav>
      )}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={open}
            className="md:hidden p-2 -ml-2 rounded-lg hover:bg-secondary transition-colors shrink-0"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6 text-foreground" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight truncate">
              {title}
            </h1>
            {description && (
              <p className="mt-0.5 text-sm md:text-base text-muted-foreground truncate">
                {description}
              </p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-3 shrink-0">{actions}</div>
        )}
      </div>
    </header>
  );
}
