"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AnalyticsChart({ data }: { data: { date: string, clicks: number }[] }) {
    return (
        <Card className="col-span-full mb-6">
            <CardHeader>
                <CardTitle>Clicks Over Time</CardTitle>
                <CardDescription>Daily engagement metrics for all your links and QR codes.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
                {data.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        No click data available yet.
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                            <Tooltip
                                contentStyle={{ borderRadius: "8px", border: "1px solid #eaeaea", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
                                cursor={{ stroke: "#eaeaea", strokeWidth: 1 }}
                            />
                            <Line type="monotone" dataKey="clicks" stroke="#000" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}
