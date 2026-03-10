"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Link as LinkIcon, QrCode, BarChart3, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

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

export function MobileNav() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    // Close menu when route changes
    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    return (
        <div className="md:hidden flex items-center mr-2">
            <Button variant="ghost" size="icon" onClick={() => setOpen(!open)} aria-label="Toggle menu">
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {open && (
                <div className="absolute top-16 left-0 right-0 z-50 border-b bg-background p-4 shadow-md animate-in slide-in-from-top-2">
                    <nav className="grid gap-2 text-sm font-medium">
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
                                    <Icon className="h-5 w-5" />
                                    {item.title}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            )}
        </div>
    );
}
