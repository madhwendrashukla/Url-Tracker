import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { QrCode, Link as LinkIcon, MousePointerClick, Activity, Plus, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export default async function DashboardOverview() {
    const session = await auth();
    if (!session?.user) return null;

    // Totals come from the per-item click counters instead of scanning every Analytics row.
    const [qrStats, linkStats, activeQrs, activeLinks, recentActivities] = await Promise.all([
        prisma.qRCode.aggregate({ where: { userId: session.user.id }, _count: true, _sum: { clicks: true } }),
        prisma.link.aggregate({ where: { userId: session.user.id }, _count: true, _sum: { clicks: true } }),
        prisma.qRCode.count({ where: { userId: session.user.id, isActive: true } }),
        prisma.link.count({ where: { userId: session.user.id, isActive: true } }),
        prisma.analytics.findMany({
            where: {
                OR: [
                    { link: { userId: session.user.id } },
                    { qrCode: { userId: session.user.id } }
                ]
            },
            orderBy: { createdAt: "desc" },
            take: 5
        })
    ]);

    const qrCount = qrStats._count;
    const linkCount = linkStats._count;
    const totalClicks = (qrStats._sum.clicks ?? 0) + (linkStats._sum.clicks ?? 0);

    return (
        <div className="flex flex-col gap-8">
            <PageHeader title="Dashboard" description="Overview of your QR codes and links performance.">
                <Link href="/links/create">
                    <Button variant="outline">
                        <LinkIcon className="mr-1 h-4 w-4" /> New link
                    </Button>
                </Link>
                <Link href="/qr-codes/create">
                    <Button>
                        <Plus className="mr-1 h-4 w-4" /> New QR code
                    </Button>
                </Link>
            </PageHeader>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total QR Codes" value={qrCount} hint={`${activeQrs} active QR codes`} icon={QrCode} tone="indigo" />
                <StatCard title="Total Links" value={linkCount} hint={`${activeLinks} active links`} icon={LinkIcon} tone="violet" />
                <StatCard title="Total Scans/Clicks" value={totalClicks} hint="Total engagements" icon={MousePointerClick} tone="sky" />
                <StatCard title="Active Items" value={activeQrs + activeLinks} hint="Currently routing traffic" icon={Activity} tone="emerald" />
            </div>

            <div className="grid gap-4 lg:grid-cols-7">
                <Card className="gap-0 py-0 lg:col-span-4">
                    <CardHeader className="border-b py-4">
                        <CardTitle className="font-semibold">Recent Activity</CardTitle>
                        <CardDescription>The latest scans and clicks across your account.</CardDescription>
                    </CardHeader>
                    <CardContent className="px-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Time</TableHead>
                                    <TableHead>Device/OS</TableHead>
                                    <TableHead>Location</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentActivities.map(a => (
                                    <TableRow key={a.id}>
                                        <TableCell className="text-sm text-muted-foreground">{new Date(a.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-sm font-medium">{a.browser} on {a.os}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{a.ipAddress}</TableCell>
                                    </TableRow>
                                ))}
                                {recentActivities.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-28 text-center text-muted-foreground">No recent activity.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                <Card className="gap-0 py-0 lg:col-span-3">
                    <CardHeader className="border-b py-4">
                        <CardTitle className="font-semibold">Top Performing</CardTitle>
                        <CardDescription>Your most-clicked links and QR codes.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex h-[220px] flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
                        <span className="grid size-10 place-items-center rounded-full bg-muted">
                            <TrendingUp className="size-5" />
                        </span>
                        No data available yet.
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
