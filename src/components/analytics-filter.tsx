"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Layers, Link as LinkIcon, QrCode, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalyticsFilterProps {
    currentFilter: string;
    qrCodes: { id: string; name: string }[];
    links: { id: string; name: string; customSlug: string | null; originalUrl: string }[];
}

type Kind = "all" | "qr" | "link";
type Option = { value: string; label: string; detail?: string; kind: Kind };

const ALL: Option = { value: "all", label: "All links & QR codes", kind: "all" };

function KindIcon({ kind, className }: { kind: Kind; className?: string }) {
    const Icon = kind === "qr" ? QrCode : kind === "link" ? LinkIcon : Layers;
    return <Icon className={cn("size-4 shrink-0", className)} />;
}

export function AnalyticsFilter({ currentFilter, qrCodes, links }: AnalyticsFilterProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [tab, setTab] = useState<Kind>("all");
    const rootRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    const options = useMemo<Option[]>(
        () => [
            ...qrCodes.map((qr) => ({ value: `qr_${qr.id}`, label: qr.name, kind: "qr" as const })),
            ...links.map((link) => ({
                value: `link_${link.id}`,
                label: link.name,
                detail: link.customSlug ? `/${link.customSlug}` : undefined,
                kind: "link" as const,
            })),
        ],
        [qrCodes, links]
    );

    const selected = options.find((o) => o.value === currentFilter) ?? ALL;
    const q = query.trim().toLowerCase();
    const visible = options.filter(
        (o) =>
            (tab === "all" || o.kind === tab) &&
            (!q || o.label.toLowerCase().includes(q) || o.detail?.toLowerCase().includes(q))
    );

    // Close on outside click or Escape while open.
    useEffect(() => {
        if (!open) return;
        searchRef.current?.focus();
        const onPointer = (e: MouseEvent) => {
            if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("mousedown", onPointer);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onPointer);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    const choose = (value: string) => {
        setOpen(false);
        setQuery("");
        if (value !== currentFilter) router.push(`/analytics?filter=${value}`);
    };

    const tabs: { kind: Kind; label: string; count: number }[] = [
        { kind: "all", label: "All", count: options.length },
        { kind: "qr", label: "QR codes", count: qrCodes.length },
        { kind: "link", label: "Links", count: links.length },
    ];

    return (
        <div ref={rootRef} className="relative w-full sm:w-[300px]">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={open}
                className="flex h-9 w-full items-center gap-2 rounded-lg border border-input bg-card px-3 text-sm shadow-xs transition-colors outline-none hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50"
            >
                <KindIcon kind={selected.kind} className="text-primary" />
                <span className="flex-1 truncate text-left font-medium">{selected.label}</span>
                <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")} />
            </button>

            {open && (
                <div className="absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-xl border bg-popover shadow-lg sm:left-auto sm:w-[340px]">
                    <div className="border-b p-2">
                        <div className="flex h-9 items-center gap-2 rounded-lg bg-muted px-3">
                            <Search className="size-4 text-muted-foreground" />
                            <input
                                ref={searchRef}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search by name or slug"
                                className="h-full flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                            />
                        </div>
                        <div className="mt-2 grid grid-cols-3 gap-1 rounded-lg bg-muted p-1">
                            {tabs.map((t) => (
                                <button
                                    key={t.kind}
                                    type="button"
                                    onClick={() => setTab(t.kind)}
                                    className={cn(
                                        "rounded-md px-2 py-1 text-xs font-medium transition-colors",
                                        tab === t.kind ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {t.label} <span className="text-muted-foreground tabular-nums">{t.count}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <ul role="listbox" className="max-h-64 overflow-y-auto p-1">
                        {!q && tab === "all" && (
                            <FilterOption option={ALL} active={selected.value === ALL.value} onChoose={choose} />
                        )}
                        {visible.map((o) => (
                            <FilterOption key={o.value} option={o} active={selected.value === o.value} onChoose={choose} />
                        ))}
                        {visible.length === 0 && (
                            <li className="px-3 py-6 text-center text-sm text-muted-foreground">No matches.</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}

function FilterOption({ option, active, onChoose }: { option: Option; active: boolean; onChoose: (value: string) => void }) {
    return (
        <li role="option" aria-selected={active}>
            <button
                type="button"
                onClick={() => onChoose(option.value)}
                className={cn(
                    "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                    active ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                )}
            >
                <KindIcon kind={option.kind} className={active ? "text-primary" : "text-muted-foreground"} />
                <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{option.label}</span>
                    {option.detail && <span className="block truncate font-mono text-xs text-muted-foreground">{option.detail}</span>}
                </span>
                {active && <Check className="size-4 shrink-0 text-primary" />}
            </button>
        </li>
    );
}
