import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard-nav";
import { UserNav } from "@/components/user-nav";
import { MobileNav } from "@/components/mobile-nav";

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
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-40 border-b bg-background">
                <div className="container flex h-16 items-center justify-between py-4 px-6 max-w-[1400px] mx-auto">
                    <div className="flex items-center gap-2">
                        <MobileNav />
                        <div className="flex gap-2 items-center font-bold text-xl tracking-tight">
                            QR & Link Manager
                        </div>
                    </div>
                    <UserNav user={session.user} />
                </div>
            </header>
            <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10 px-6 max-w-[1400px] mx-auto">
                <aside className="fixed top-16 z-30 -ml-2 hidden h-[calc(100vh-4rem)] w-full shrink-0 md:sticky md:block">
                    <div className="h-full py-6 pr-6 lg:py-8">
                        <DashboardNav />
                    </div>
                </aside>
                <main className="flex w-full flex-col overflow-hidden py-6 lg:py-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
