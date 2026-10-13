import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const PAGE_SIZE = 10;

// Reads ?page= and clamps it to the available pages.
export function getPage(raw: string | undefined, total: number) {
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const page = Math.min(Math.max(1, Number.parseInt(raw ?? "1", 10) || 1), totalPages);
    return { page, totalPages, skip: (page - 1) * PAGE_SIZE };
}

// 1 … 4 5 6 … 12
function pageWindow(page: number, totalPages: number): (number | "gap")[] {
    const pages = new Set([1, totalPages, page - 1, page, page + 1]);
    const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
    const out: (number | "gap")[] = [];
    sorted.forEach((p, i) => {
        if (i > 0 && p - sorted[i - 1] > 1) out.push("gap");
        out.push(p);
    });
    return out;
}

const itemClass = "inline-flex h-8 min-w-8 items-center justify-center gap-1 rounded-md px-2 text-sm font-medium transition-colors";

export function Pagination({
    basePath,
    page,
    totalPages,
    total,
}: {
    basePath: string;
    page: number;
    totalPages: number;
    total: number;
}) {
    if (total === 0) return null;
    const from = (page - 1) * PAGE_SIZE + 1;
    const to = Math.min(page * PAGE_SIZE, total);
    const href = (p: number) => (p === 1 ? basePath : `${basePath}?page=${p}`);

    return (
        <div className="flex flex-col items-center justify-between gap-3 border-t px-4 py-3 sm:flex-row">
            <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground tabular-nums">{from}–{to}</span> of{" "}
                <span className="font-medium text-foreground tabular-nums">{total}</span>
            </p>
            {totalPages > 1 && (
                <nav className="flex items-center gap-1" aria-label="Pagination">
                    {page > 1 ? (
                        <Link href={href(page - 1)} className={cn(itemClass, "text-muted-foreground hover:bg-muted hover:text-foreground")}>
                            <ChevronLeft className="size-4" /> <span className="hidden sm:inline">Previous</span>
                        </Link>
                    ) : (
                        <span className={cn(itemClass, "pointer-events-none text-muted-foreground/50")}>
                            <ChevronLeft className="size-4" /> <span className="hidden sm:inline">Previous</span>
                        </span>
                    )}
                    {pageWindow(page, totalPages).map((p, i) =>
                        p === "gap" ? (
                            <span key={`gap-${i}`} className="px-1 text-sm text-muted-foreground">…</span>
                        ) : (
                            <Link
                                key={p}
                                href={href(p)}
                                aria-current={p === page ? "page" : undefined}
                                className={cn(
                                    itemClass,
                                    p === page ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                {p}
                            </Link>
                        )
                    )}
                    {page < totalPages ? (
                        <Link href={href(page + 1)} className={cn(itemClass, "text-muted-foreground hover:bg-muted hover:text-foreground")}>
                            <span className="hidden sm:inline">Next</span> <ChevronRight className="size-4" />
                        </Link>
                    ) : (
                        <span className={cn(itemClass, "pointer-events-none text-muted-foreground/50")}>
                            <span className="hidden sm:inline">Next</span> <ChevronRight className="size-4" />
                        </span>
                    )}
                </nav>
            )}
        </div>
    );
}
