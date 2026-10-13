"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Link as LinkIcon, QrCode, BarChart3 } from "lucide-react";

export const navItems = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "QR Codes",
        href: "/qr-codes",
        icon: QrCode,
    },
    {
        title: "Links",
        href: "/links",
        icon: LinkIcon,
    },
    {
        title: "Analytics",
        href: "/analytics",
        icon: BarChart3,
    },
];

export function isActivePath(pathname: string, href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardNav() {
    const pathname = usePathname();

    return (
        <nav className="grid gap-1 text-sm font-medium">
            {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActivePath(pathname, item.href);
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                            active
                                ? "bg-accent text-accent-foreground"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                    >
                        <Icon className={cn("size-4", active && "text-primary")} />
                        {item.title}
                    </Link>
                );
            })}
        </nav>
    );
}
