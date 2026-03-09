"use client";

import { useTransition, useState, useEffect } from "react";
import { createQrCode } from "@/actions/qr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";

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
            <Card>
                <CardHeader>
                    <CardTitle>Create QR Code</CardTitle>
                    <CardDescription>Configure your new QR code destination and appearance.</CardDescription>
                </CardHeader>
                <CardContent>
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

                        {error && <div className="text-sm text-destructive">{error}</div>}
                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending ? "Generating..." : "Generate QR Code"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Live Preview</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-10">
                    <div className="p-4 bg-white border rounded-xl shadow-sm">
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
