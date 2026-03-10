import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Plus, Download, Trash2, ExternalLink } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { deleteQrCode } from "@/actions/qr";
import { QrDownloadBtn } from "@/components/qr-download-btn";
import { DeleteButton } from "@/components/delete-button";

export default async function QrCodesPage() {
    const session = await auth();
    if (!session?.user) return null;

    const qrCodes = await prisma.qRCode.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" }
    });

    return (
        <div className="flex flex-col space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">QR Codes</h2>
                    <p className="text-muted-foreground">Manage your generated QR codes.</p>
                </div>
                <Link href="/qr-codes/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Create QR Code
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Your QR Codes</CardTitle>
                    <CardDescription>A list of all QR codes you have created.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Preview</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Destination</TableHead>
                                <TableHead>Short Code</TableHead>
                                <TableHead>Scans</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {qrCodes.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                        No QR codes found.
                                    </TableCell>
                                </TableRow>
                            )}
                            {qrCodes.map((qr) => {
                                let settings = { fgColor: "#000000", bgColor: "#ffffff" };
                                try {
                                    if (qr.customizedSettings) settings = JSON.parse(qr.customizedSettings);
                                } catch (e) { }

                                return (
                                    <TableRow key={qr.id}>
                                        <TableCell>
                                            <div className="w-10 h-10 bg-white rounded flex items-center justify-center p-1 border">
                                                <QRCodeSVG id={"qr-" + qr.id} value={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/track/${qr.shortCode}`} size={32} fgColor={settings.fgColor} bgColor={settings.bgColor} />
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">{qr.name}</TableCell>
                                        <TableCell className="max-w-[200px] truncate">
                                            <a href={qr.destinationUrl} target="_blank" rel="noreferrer" className="flex items-center text-primary hover:underline">
                                                <span className="truncate">{qr.destinationUrl}</span>
                                                <ExternalLink className="ml-1 h-3 w-3 shrink-0" />
                                            </a>
                                        </TableCell>
                                        <TableCell>{qr.shortCode}</TableCell>
                                        <TableCell>{qr.clicks}</TableCell>
                                        <TableCell>{new Date(qr.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <QrDownloadBtn id={qr.id} shortCode={qr.shortCode} />
                                                <form action={deleteQrCode.bind(null, qr.id) as any}>
                                                    <DeleteButton />
                                                </form>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
