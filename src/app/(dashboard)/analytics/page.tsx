import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AnalyticsChart } from "@/components/charts/analytics-chart";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AnalyticsFilter } from "@/components/analytics-filter";
import { LocalTime } from "@/components/local-time";

export default async function AnalyticsPage(props: { searchParams: Promise<{ filter?: string }> }) {
    const searchParams = await props.searchParams;
    const filter = searchParams.filter;
    const session = await auth();
    if (!session?.user) return null;

    // Fetch user items for dropdown
    const qrCodes = await prisma.qRCode.findMany({ where: { userId: session.user.id } });
    const links = await prisma.link.findMany({ where: { userId: session.user.id } });

    // Build query based on filter
    const whereClause: any = {
        OR: [
            { link: { userId: session.user.id } },
            { qrCode: { userId: session.user.id } }
        ]
    };

    if (filter && filter !== "all") {
        if (filter.startsWith("qr_")) {
            whereClause.qrCodeId = filter.replace("qr_", "");
            delete whereClause.OR;
        } else if (filter.startsWith("link_")) {
            whereClause.linkId = filter.replace("link_", "");
            delete whereClause.OR;
        }
    }

    const analytics = await prisma.analytics.findMany({
        where: whereClause,
        include: {
            link: true,
            qrCode: true
        },
        orderBy: { createdAt: "desc" }
    });

    const browsers: Record<string, number> = {};
    const locations: Record<string, number> = {};
    const timeSeries: Record<string, number> = {};
    const uniqueIps = new Set<string>();

    analytics.forEach(a => {
        browsers[a.browser || "Unknown"] = (browsers[a.browser || "Unknown"] || 0) + 1;

        const loc = a.country ? (a.city ? `${a.country} - ${a.city}` : a.country) : "Unknown";
        locations[loc] = (locations[loc] || 0) + 1;

        if (a.ipAddress) uniqueIps.add(a.ipAddress);

        const dateStr = new Date(a.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        timeSeries[dateStr] = (timeSeries[dateStr] || 0) + 1;
    });

    // Backfill empty days in the last 7 days logically or just show what's there
    const chartData = Object.entries(timeSeries).map(([date, clicks]) => ({ date, clicks })).reverse();
    const topBrowsers = Object.entries(browsers).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topLocations = Object.entries(locations).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const totalClicks = analytics.length;
    const uniqueVisitors = uniqueIps.size;

    return (
        <div className="flex flex-col space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Analytics Explorer</h2>
                    <p className="text-muted-foreground">Deep dive into your traffic metrics.</p>
                </div>

                <AnalyticsFilter currentFilter={filter || "all"} qrCodes={qrCodes} links={links} />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalClicks}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{uniqueVisitors}</div>
                    </CardContent>
                </Card>
            </div>

            <AnalyticsChart data={chartData} />

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Top Locations</CardTitle>
                        <CardDescription>Countries and cities where your audience is based.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topLocations.length === 0 ? <p className="text-sm text-muted-foreground">No data.</p> : null}
                            {topLocations.map(([loc, count]) => (
                                <div key={loc} className="flex items-center justify-between">
                                    <div className="font-medium text-sm">{loc}</div>
                                    <div className="text-sm text-muted-foreground">{count} clicks</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Top Browsers</CardTitle>
                        <CardDescription>Most popular browsers used to access your links.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topBrowsers.length === 0 ? <p className="text-sm text-muted-foreground">No data.</p> : null}
                            {topBrowsers.map(([browser, count]) => (
                                <div key={browser} className="flex items-center justify-between">
                                    <div className="font-medium text-sm">{browser}</div>
                                    <div className="text-sm text-muted-foreground">{count} clicks</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Scans & Clicks</CardTitle>
                    <CardDescription>The most recent activity trailing your codes and links.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Time</TableHead>
                                <TableHead>Item</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Browser/OS</TableHead>
                                <TableHead>Device</TableHead>
                                <TableHead>IP</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {analytics.slice(0, 10).map((a) => (
                                <TableRow key={a.id}>
                                    <TableCell><LocalTime date={a.createdAt} /></TableCell>
                                    <TableCell className="font-semibold text-sm">
                                        {a.qrCodeId ? `QR: ${a.qrCode?.name}` : `Link: ${a.link?.name}`}
                                    </TableCell>
                                    <TableCell>{a.country ? `${a.country} ${a.city ? `(${a.city})` : ''}` : 'Unknown'}</TableCell>
                                    <TableCell>{a.browser} / {a.os}</TableCell>
                                    <TableCell className="capitalize">{a.deviceType}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground">{a.ipAddress}</TableCell>
                                </TableRow>
                            ))}
                            {analytics.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                        No activity to display.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

