import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AdminPageHeader({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0">
        <h1 className="text-[1.625rem] font-semibold tracking-tight text-[#3d3229]">{title}</h1>
        {description ? <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[#6a5d50]">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function AdminPrimaryLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="admin-btn-primary inline-flex h-9 shrink-0 items-center justify-center gap-2 px-3.5 text-sm">
      {children}
    </Link>
  );
}
