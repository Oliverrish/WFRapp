"use client";

import { Fragment } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  eyebrow?: string;
}

export function AdminPageHeader({
  title,
  description,
  actions,
  breadcrumbs,
  eyebrow = "System Admin",
}: AdminPageHeaderProps) {
  return (
    <header className="px-4 pt-6 md:px-8 md:pt-8">
      <div className="rounded-[28px] border border-white/80 bg-white/82 px-5 py-5 shadow-[0_28px_70px_-40px_rgba(15,23,42,0.4)] backdrop-blur md:px-7 md:py-6">
        {breadcrumbs && (
          <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
            {breadcrumbs.map((crumb, index) => (
              <Fragment key={index}>
                {index > 0 && <ChevronRight className="h-3.5 w-3.5" />}
                {crumb.href ? (
                  <Link href={crumb.href} className="transition-colors hover:text-slate-950">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-slate-950">{crumb.label}</span>
                )}
              </Fragment>
            ))}
          </nav>
        )}

        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-sky-700">
              {eyebrow}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
              {title}
            </h1>
            {description && (
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
                {description}
              </p>
            )}
          </div>

          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
      </div>
    </header>
  );
}
