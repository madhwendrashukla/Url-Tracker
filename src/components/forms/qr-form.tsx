"use client";

import { useTransition, useState, useEffect } from "react";
import { createQrCode } from "@/actions/qr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { Loader2 } from "lucide-react";

export function QrForm() {
    const [error, setError] = useState<string | undefined>("");
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const [url, setUrl] = useState("https://example.com");
    const [fgColor, setFgColor] = useState("#000000");
    const [bgColor, setBgColor] = useState("#ffffff");

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
            const res = await createQrCode(formData);
            if (res?.error) {
                setError(res.error);
            } else {
                router.push("/qr-codes");
            }
        });
    };

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <Card className="gap-0 py-0">
                <CardHeader className="border-b py-4">
                    <CardTitle className="font-semibold">Create QR Code</CardTitle>
                    <CardDescription>Configure your new QR code destination and appearance.</CardDescription>
                </CardHeader>
                <CardContent className="py-5">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name / Label</Label>
                            <Input id="name" name="name" placeholder="Summer Campaign Options" required disabled={isPending} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="destinationUrl">Destination URL</Label>
                            <Input
                                id="destinationUrl"
                                name="destinationUrl"
                                type="url"
                                placeholder="https://example.com"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                required
                                disabled={isPending}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="fgColor">Foreground Color</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="color"
                                        id="fgColor"
                                        name="fgColor"
                                        value={fgColor}
                                        onChange={(e) => setFgColor(e.target.value)}
                                        className="w-12 p-1"
                                    />
                                    <Input value={fgColor} onChange={(e) => setFgColor(e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bgColor">Background Color</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="color"
                                        id="bgColor"
                                        name="bgColor"
                                        value={bgColor}
                                        onChange={(e) => setBgColor(e.target.value)}
                                        className="w-12 p-1"
                                    />
                                    <Input value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
                                </div>
                            </div>
                        </div>

                        {error && <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</div>}
                        <Button type="submit" size="lg" className="w-full" disabled={isPending}>
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                "Generate QR Code"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card className="gap-0 py-0">
                <CardHeader className="border-b py-4">
                    <CardTitle className="font-semibold">Live Preview</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col items-center justify-center bg-muted/40 py-12">
                    <div className="rounded-2xl border bg-white p-5 shadow-sm">
                        <QRCodeSVG
                            value={url || "https://example.com"}
                            size={200}
                            fgColor={fgColor}
                            bgColor={bgColor}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
