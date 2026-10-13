import { cn } from "@/lib/utils";

export const APP_NAME = "Url Tracker";

// Brand mark: the same geometric "T" used for the favicon (src/app/icon.svg).
export function LogoMark({ className }: { className?: string }) {
    return (
        <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground", className)}>
            <svg viewBox="0 0 64 64" className="size-[62%]" aria-hidden="true">
                <path d="M12 12h40v12H38v28H26V24H12z" fill="currentColor" />
            </svg>
        </span>
    );
}

export function Logo({ className }: { className?: string }) {
    return (
        <span className={cn("flex items-center gap-2.5", className)}>
            <LogoMark />
            <span className="text-[15px] font-semibold tracking-tight text-foreground">{APP_NAME}</span>
        </span>
    );
}
