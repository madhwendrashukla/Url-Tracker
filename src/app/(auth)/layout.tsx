import { Logo } from "@/components/logo";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 px-4 py-12">
            <Logo className="mb-8" />
            <div className="w-full max-w-[400px]">{children}</div>
            <p className="mt-8 text-xs text-muted-foreground">© {new Date().getFullYear()} Url Tracker</p>
        </div>
    );
}
