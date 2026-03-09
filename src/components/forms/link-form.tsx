"use client";

import { useTransition, useState } from "react";
import { createLink } from "@/actions/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";

export function LinkForm() {
    const [error, setError] = useState<string | undefined>("");
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
            const res = await createLink(formData);
            if (res?.error) {
                setError(res.error);
            } else {
                router.push("/links");
            }
        });
    };

    return (
        <Card className="max-w-2xl">
            <CardHeader>
                <CardTitle>Create Short Link</CardTitle>
                <CardDescription>Shorten a long URL and track its clicks.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="originalUrl">Original URL</Label>
                        <Input
                            id="originalUrl"
                            name="originalUrl"
                            type="url"
                            placeholder="https://very-long-url.com/some/path"
                            required
                            disabled={isPending}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="customSlug">Custom Slug (Optional)</Label>
                        <div className="flex items-center">
                            <span className="flex items-center h-10 px-3 border border-r-0 rounded-l-md bg-muted text-muted-foreground text-sm">
                                domain.com/
                            </span>
                            <Input
                                id="customSlug"
                                name="customSlug"
                                placeholder="my-custom-slug"
                                disabled={isPending}
                                className="rounded-l-none"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">Leave blank for a random short code.</p>
                    </div>

                    <Tabs defaultValue="basic" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="basic">Basic Link</TabsTrigger>
                            <TabsTrigger value="utm">UTM Parameters</TabsTrigger>
                        </TabsList>
                        <TabsContent value="basic" className="pt-2 text-sm text-muted-foreground">
                            No additional tracking parameters will be added to the requested URL.
                        </TabsContent>
                        <TabsContent value="utm" className="space-y-4 pt-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs">UTM Source</Label>
                                    <Input name="utmSource" placeholder="e.g. google, newsletter" disabled={isPending} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">UTM Medium</Label>
                                    <Input name="utmMedium" placeholder="e.g. cpc, email" disabled={isPending} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">UTM Campaign</Label>
                                    <Input name="utmCampaign" placeholder="e.g. summer_sale" disabled={isPending} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">UTM Term</Label>
                                    <Input name="utmTerm" placeholder="e.g. running_shoes" disabled={isPending} />
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>

                    {error && <div className="text-sm text-destructive">{error}</div>}
                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? "Creating..." : "Create Link"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
