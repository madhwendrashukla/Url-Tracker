import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AnalyticsChart } from "@/components/charts/analytics-chart";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AnalyticsFilter } from "@/components/analytics-filter";
import { LocalTime } from "@/components/local-time";

const CHART_TIME_ZONE = "Asia/Kolkata";

export default async function AnalyticsPage(props: { searchParams: Promise<{ filter?: string }> }) {
    const searchParams = await props.searchParams;
    const filter = searchParams.filter;
    const session = await auth();
    if (!session?.user) return null;

    const userId = session.user.id;

    // Only the fields the filter dropdown needs.
    const [qrCodes, links] = await Promise.all([
        prisma.qRCode.findMany({ where: { userId }, select: { id: true, name: true } }),
        prisma.link.findMany({ where: { userId }, select: { id: true, name: true, customSlug: true, originalUrl: true } }),
    ]);
    const qrIds = qrCodes.map((q) => q.id);
    const linkIds = links.map((l) => l.id);

    // A filter only applies to an item this user owns; anything else falls back to "all".
    const filterId = filter?.replace(/^(qr|link)_/, "") ?? "";
    const qrFilter = filter?.startsWith("qr_") && qrIds.includes(filterId);
    const linkFilter = filter?.startsWith("link_") && linkIds.includes(filterId);

    const where: Prisma.AnalyticsWhereInput = qrFilter
        ? { qrCodeId: filterId }
        : linkFilter
            ? { linkId: filterId }
            : { OR: [{ linkId: { in: linkIds } }, { qrCodeId: { in: qrIds } }] };
    const whereSql = qrFilter
        ? Prisma.sql`"qrCodeId" = ${filterId}`
        : linkFilter
            ? Prisma.sql`"linkId" = ${filterId}`
            : Prisma.sql`("linkId" = ANY(${linkIds}::text[]) OR "qrCodeId" = ANY(${qrIds}::text[]))`;

    // createdAt is stored in UTC; group days in the dashboard's time zone.
    const day = Prisma.sql`date_trunc('day', ("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE ${CHART_TIME_ZONE})`;

    const [totalClicks, browserGroups, locationGroups, recent, uniques, perDay] = await Promise.all([
        prisma.analytics.count({ where }),
        prisma.analytics.groupBy({
            by: ["browser"], where, _count: { browser: true },
            orderBy: { _count: { browser: "desc" } }, take: 5,
        }),
        prisma.analytics.groupBy({
            by: ["country", "city"], where, _count: { country: true },
            orderBy: { _count: { country: "desc" } }, take: 5,
        }),
        prisma.analytics.findMany({
            where, orderBy: { createdAt: "desc" }, take: 10,
            include: { link: { select: { name: true } }, qrCode: { select: { name: true } } },
        }),
        prisma.$queryRaw<{ n: number }[]>`SELECT count(DISTINCT "ipAddress")::int AS n FROM "Analytics" WHERE ${whereSql}`,
        prisma.$queryRaw<{ date: string; clicks: number }[]>`
            SELECT to_char(d, 'Mon FMDD') AS date, count(*)::int AS clicks
            FROM (SELECT ${day} AS d FROM "Analytics" WHERE ${whereSql}) AS days
            GROUP BY d ORDER BY d`,
    ]);

    const chartData = perDay;
    const topBrowsers = browserGroups.map((g) => [g.browser || "Unknown", g._count.browser] as const);
    const topLocations = locationGroups.map((g) => [
        g.country ? (g.city ? `${g.country} - ${g.city}` : g.country) : "Unknown",
        g._count.country,
    ] as const);
    const uniqueVisitors = uniques[0]?.n ?? 0;

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
                            {recent.map((a) => (
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
                            {recent.length === 0 && (
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

