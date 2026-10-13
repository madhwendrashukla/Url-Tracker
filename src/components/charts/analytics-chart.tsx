"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const BRAND = "#4f46e5";

export function AnalyticsChart({ data }: { data: { date: string, clicks: number }[] }) {
    return (
        <Card className="col-span-full gap-0 py-0">
            <CardHeader className="border-b py-4">
                <CardTitle className="font-semibold">Clicks Over Time</CardTitle>
                <CardDescription>Daily engagement metrics for all your links and QR codes.</CardDescription>
            </CardHeader>
            <CardContent className="h-[320px] px-2 py-5 sm:px-4">
                {data.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        No click data available yet.
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 5, right: 12, left: -20, bottom: 0 }}>
                            <CartesianGrid vertical={false} stroke="#e5e7eb" strokeDasharray="3 3" />
                            <XAxis dataKey="date" stroke="#8b8fa3" fontSize={12} tickLine={false} axisLine={false} tickMargin={8} minTickGap={16} />
                            <YAxis stroke="#8b8fa3" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} tickFormatter={(value) => `${value}`} />
                            <Tooltip
                                contentStyle={{ borderRadius: "10px", border: "1px solid #e5e7eb", boxShadow: "0 8px 24px rgba(17,24,39,0.08)" }}
                                cursor={{ stroke: "#c7d2fe", strokeWidth: 1 }}
                            />
                            <Area type="monotone" dataKey="clicks" stroke={BRAND} strokeWidth={2} fill={BRAND} fillOpacity={0.08} dot={false} activeDot={{ r: 5, fill: BRAND, stroke: "#fff", strokeWidth: 2 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}
