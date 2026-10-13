import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Link as LinkIcon, QrCode } from "lucide-react";
import { DashboardNav } from "@/components/dashboard-nav";
import { UserNav } from "@/components/user-nav";
import { MobileNav } from "@/components/mobile-nav";
import { Logo } from "@/components/logo";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-background md:grid md:grid-cols-[256px_minmax(0,1fr)]">
            <aside className="sticky top-0 hidden h-screen flex-col border-r bg-sidebar md:flex">
                <div className="flex h-16 items-center border-b px-5">
                    <Link href="/dashboard">
                        <Logo />
                    </Link>
                </div>
                <div className="flex-1 overflow-y-auto px-3 py-5">
                    <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Workspace
                    </p>
                    <DashboardNav />
                </div>
                <div className="space-y-1 border-t p-3">
                    <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Quick create
                    </p>
                    <Link
                        href="/links/create"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                        <LinkIcon className="size-4" /> New short link
                    </Link>
                    <Link
                        href="/qr-codes/create"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                        <QrCode className="size-4" /> New QR code
                    </Link>
                </div>
            </aside>

            <div className="flex min-w-0 flex-col">
                <header className="sticky top-0 z-40 flex h-16 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur-md md:px-8">
                    <MobileNav />
                    <Link href="/dashboard" className="md:hidden">
                        <Logo />
                    </Link>
                    <div className="ml-auto flex items-center gap-3">
                        <span className="hidden text-sm text-muted-foreground sm:block">{session.user.name}</span>
                        <UserNav user={session.user} />
                    </div>
                </header>
                <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-8 md:py-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
