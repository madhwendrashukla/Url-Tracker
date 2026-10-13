"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { navItems, isActivePath } from "@/components/dashboard-nav";

export function MobileNav() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    // Close menu when route changes
    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    return (
        <div className="flex items-center md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setOpen(!open)} aria-label="Toggle menu">
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {open && (
                <div className="absolute top-16 left-0 right-0 z-50 border-b bg-background p-3 shadow-lg animate-in slide-in-from-top-2">
                    <nav className="grid gap-1 text-sm font-medium">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActivePath(pathname, item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                                        active
                                            ? "bg-accent text-accent-foreground"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                >
                                    <Icon className={cn("h-5 w-5", active && "text-primary")} />
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
