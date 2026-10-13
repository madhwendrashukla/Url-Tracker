import { cn } from "@/lib/utils";

export const APP_NAME = "Url Tracker";

// Brand mark: the same geometric "T" used for the favicon (src/app/icon.svg).
export function LogoMark({ className }: { className?: string }) {
    return (
        <span
            className={cn(
                "grid size-8 shrink-0 place-items-center rounded-lg bg-linear-to-br from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-600/30",
                className
            )}
        >
            <svg viewBox="0 0 64 64" className="size-[62%]" aria-hidden="true">
                <path d="M12 12h40v12H38v28H26V24H12z" fill="currentColor" />
            </svg>
        </span>
    );
}

export function Logo({ className, inverted = false }: { className?: string; inverted?: boolean }) {
    return (
        <span className={cn("flex items-center gap-2.5", className)}>
            <LogoMark className={inverted ? "bg-white/15 from-white/20 to-white/5 shadow-none ring-1 ring-white/25" : undefined} />
            <span className={cn("text-[15px] font-semibold tracking-tight", inverted ? "text-white" : "text-foreground")}>
                {APP_NAME}
            </span>
        </span>
    );
}
