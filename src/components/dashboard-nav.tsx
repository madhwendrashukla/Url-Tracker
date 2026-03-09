"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Link as LinkIcon, QrCode, BarChart3 } from "lucide-react";

const items = [
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

export function DashboardNav() {
    const pathname = usePathname();

    return (
        <nav className="grid items-start gap-2 text-sm font-medium">
            {items.map((item, index) => {
                const Icon = item.icon;
                return (
                    <Link
                        key={index}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                            pathname === item.href ? "bg-muted text-primary" : "hover:bg-muted"
                        )}
                    >
                        <Icon className="h-4 w-4" />
                        {item.title}
                    </Link>
                );
            })}
        </nav>
    );
}
