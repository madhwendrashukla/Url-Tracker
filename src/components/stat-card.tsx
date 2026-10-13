import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const tones = {
    indigo: "bg-indigo-50 text-indigo-600",
    violet: "bg-violet-50 text-violet-600",
    sky: "bg-sky-50 text-sky-600",
    emerald: "bg-emerald-50 text-emerald-600",
};

export function StatCard({
    title,
    value,
    hint,
    icon: Icon,
    tone = "indigo",
}: {
    title: string;
    value: React.ReactNode;
    hint?: string;
    icon: LucideIcon;
    tone?: keyof typeof tones;
}) {
    return (
        <Card className="gap-0 p-5">
            <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <span className={cn("grid size-9 place-items-center rounded-lg", tones[tone])}>
                    <Icon className="size-[18px]" />
                </span>
            </div>
            <div className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">{value}</div>
            {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </Card>
    );
}
