import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AnalyticsChart } from "@/components/charts/analytics-chart";
import { AnalyticsFilter } from "@/components/analytics-filter";
import { LocalTime } from "@/components/local-time";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Globe, MapPin, MousePointerClick, Users } from "lucide-react";

const CHART_TIME_ZONE = "Asia/Kolkata";

export default async function AnalyticsPage(props: { searchParams: Promise<{ filter?: string }> }) {
    const searchParams = await props.searchParams;
    const filter = searchParams.filter;
    const session = await auth();
    if (!session?.user) return null;

    const userId = session.user.id;

    // Only the fields the filter dropdown needs.
    const [qrCodes, links] = await Promise.all([
        prisma.qRCode.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, select: { id: true, name: true, createdAt: true } }),
        prisma.link.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, select: { id: true, name: true, customSlug: true, originalUrl: true, createdAt: true } }),
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

    const maxLocation = Math.max(1, ...topLocations.map(([, count]) => count));
    const maxBrowser = Math.max(1, ...topBrowsers.map(([, count]) => count));

    return (
        <div className="flex flex-col gap-6">
            <PageHeader title="Analytics Explorer" description="Deep dive into your traffic metrics.">
                <AnalyticsFilter currentFilter={filter || "all"} qrCodes={qrCodes} links={links} />
            </PageHeader>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Clicks" value={totalClicks} icon={MousePointerClick} tone="indigo" />
                <StatCard title="Unique Visitors" value={uniqueVisitors} icon={Users} tone="violet" />
            </div>

            <AnalyticsChart data={chartData} />

            <div className="grid gap-4 md:grid-cols-2">
                <Card className="gap-0 py-0">
                    <CardHeader className="border-b py-4">
                        <CardTitle className="flex items-center gap-2 font-semibold">
                            <MapPin className="size-4 text-primary" /> Top Locations
                        </CardTitle>
                        <CardDescription>Countries and cities where your audience is based.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 py-5">
                        {topLocations.length === 0 ? <p className="text-sm text-muted-foreground">No data.</p> : null}
                        {topLocations.map(([loc, count]) => (
                            <div key={loc} className="space-y-1.5">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">{loc}</span>
                                    <span className="text-muted-foreground tabular-nums">{count} clicks</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-muted">
                                    <div className="h-1.5 rounded-full bg-primary" style={{ width: `${(count / maxLocation) * 100}%` }} />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="gap-0 py-0">
                    <CardHeader className="border-b py-4">
                        <CardTitle className="flex items-center gap-2 font-semibold">
                            <Globe className="size-4 text-primary" /> Top Browsers
                        </CardTitle>
                        <CardDescription>Most popular browsers used to access your links.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 py-5">
                        {topBrowsers.length === 0 ? <p className="text-sm text-muted-foreground">No data.</p> : null}
                        {topBrowsers.map(([browser, count]) => (
                            <div key={browser} className="space-y-1.5">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">{browser}</span>
                                    <span className="text-muted-foreground tabular-nums">{count} clicks</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-muted">
                                    <div className="h-1.5 rounded-full bg-violet-500" style={{ width: `${(count / maxBrowser) * 100}%` }} />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <Card className="gap-0 py-0">
                <CardHeader className="border-b py-4">
                    <CardTitle className="font-semibold">Recent Scans & Clicks</CardTitle>
                    <CardDescription>The most recent activity trailing your codes and links.</CardDescription>
                </CardHeader>
                <CardContent className="px-0">
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
                                    <TableCell className="text-muted-foreground"><LocalTime date={a.createdAt} /></TableCell>
                                    <TableCell>
                                        <span className={a.qrCodeId
                                            ? "rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700"
                                            : "rounded-md bg-violet-50 px-2 py-1 text-xs font-medium text-violet-700"}>
                                            {a.qrCodeId ? `QR: ${a.qrCode?.name}` : `Link: ${a.link?.name}`}
                                        </span>
                                    </TableCell>
                                    <TableCell>{a.country ? `${a.country} ${a.city ? `(${a.city})` : ''}` : 'Unknown'}</TableCell>
                                    <TableCell>{a.browser} / {a.os}</TableCell>
                                    <TableCell className="capitalize">{a.deviceType}</TableCell>
                                    <TableCell className="font-mono text-xs text-muted-foreground">{a.ipAddress}</TableCell>
                                </TableRow>
                            ))}
                            {recent.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-28 text-center text-muted-foreground">
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
