"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Up to this many pages every number is shown; beyond it the list collapses with "…"
const MAX_PAGES_WITHOUT_ELLIPSIS = 7;
// How many pages to show at the start/end when the current page is near that edge
const EDGE_RUN = 3;

type PageSlot = number | "ellipsis-start" | "ellipsis-end";

// e.g. 25 pages: on 1 → 1 2 3 … 25, on 12 → 1 … 11 12 13 … 25, on 25 → 1 … 23 24 25
const pageSlots = (currentPage: number, totalPages: number): PageSlot[] => {
  if (totalPages <= MAX_PAGES_WITHOUT_ELLIPSIS) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);

  if (currentPage < EDGE_RUN) return [...range(1, EDGE_RUN), "ellipsis-end", totalPages];
  if (currentPage > totalPages - EDGE_RUN + 1) return [1, "ellipsis-start", ...range(totalPages - EDGE_RUN + 1, totalPages)];

  const secondPage = 2;
  const middle = range(Math.max(secondPage, currentPage - 1), Math.min(totalPages - 1, currentPage + 1));
  const startGap: PageSlot[] = middle[0] > secondPage ? ["ellipsis-start"] : [];
  const endGap: PageSlot[] = middle[middle.length - 1] < totalPages - 1 ? ["ellipsis-end"] : [];
  return [1, ...startGap, ...middle, ...endGap, totalPages];
};

export function DataTablePagination({ totalPages }: { totalPages: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  if (totalPages <= 1) return null;

  return (
    <Pagination className="mt-4">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={createPageURL(currentPage - 1)}
            className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
        
        {pageSlots(currentPage, totalPages).map((slot) =>
          typeof slot === "number" ? (
            <PaginationItem key={slot}>
              <PaginationLink
                href={createPageURL(slot)}
                isActive={currentPage === slot}
              >
                {slot}
              </PaginationLink>
            </PaginationItem>
          ) : (
            <PaginationItem key={slot}>
              <PaginationEllipsis />
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationNext
            href={createPageURL(currentPage + 1)}
            className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
