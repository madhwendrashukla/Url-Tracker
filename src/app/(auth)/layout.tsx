import { BarChart3, Link as LinkIcon, QrCode } from "lucide-react";
import { Logo } from "@/components/logo";

const features = [
    { icon: LinkIcon, title: "Short links", text: "Custom slugs and one-click copy for every link." },
    { icon: QrCode, title: "Branded QR codes", text: "Pick your colours and download high-res PNGs." },
    { icon: BarChart3, title: "Live analytics", text: "See clicks and scans by day, place and browser." },
];

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
            <div className="relative hidden overflow-hidden bg-linear-to-br from-indigo-600 via-indigo-700 to-violet-700 p-10 text-white lg:flex lg:flex-col">
                <div className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-white/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-32 -left-20 size-[28rem] rounded-full bg-violet-400/20 blur-3xl" />

                <Logo inverted className="relative" />

                <div className="relative mt-auto max-w-md space-y-8">
                    <h2 className="text-3xl leading-tight font-semibold tracking-tight">
                        Short links and QR codes that show you who clicked.
                    </h2>
                    <ul className="space-y-5">
                        {features.map(({ icon: Icon, title, text }) => (
                            <li key={title} className="flex gap-4">
                                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white/10 ring-1 ring-white/20">
                                    <Icon className="size-5" />
                                </span>
                                <div>
                                    <p className="font-medium">{title}</p>
                                    <p className="text-sm text-indigo-100/80">{text}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                <p className="relative mt-12 text-xs text-indigo-100/70">© {new Date().getFullYear()} Url Tracker</p>
            </div>

            <div className="flex items-center justify-center bg-background px-4 py-12">
                <div className="w-full max-w-[400px]">
                    <Logo className="mb-8 lg:hidden" />
                    {children}
                </div>
            </div>
        </div>
    );
}
