import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { QrCode, Link as LinkIcon, MousePointerClick, Activity } from "lucide-react";
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
        <div className="flex flex-col space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground">Overview of your QR codes and links performance.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total QR Codes</CardTitle>
                        <QrCode className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{qrCount}</div>
                        <p className="text-xs text-muted-foreground">
                            {activeQrs} active QR codes
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total Links</CardTitle>
                        <LinkIcon className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{linkCount}</div>
                        <p className="text-xs text-muted-foreground">
                            {activeLinks} active links
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total Scans/Clicks</CardTitle>
                        <MousePointerClick className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalClicks}</div>
                        <p className="text-xs text-muted-foreground">
                            Total engagements
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Active Items</CardTitle>
                        <Activity className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeQrs + activeLinks}</div>
                        <p className="text-xs text-muted-foreground">
                            Currently routing traffic
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="px-2">
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
                                        <TableCell className="text-sm">{new Date(a.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-sm">{a.browser} on {a.os}</TableCell>
                                        <TableCell className="text-sm">{a.ipAddress}</TableCell>
                                    </TableRow>
                                ))}
                                {recentActivities.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">No recent activity.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Top Performing</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
                            No data available yet.
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
