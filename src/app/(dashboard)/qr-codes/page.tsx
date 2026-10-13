import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Plus, ExternalLink, QrCode } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Pagination, PAGE_SIZE, getPage } from "@/components/pagination";
import { QRCodeSVG } from "qrcode.react";
import { deleteQrCode } from "@/actions/qr";
import { QrDownloadBtn } from "@/components/qr-download-btn";
import { DeleteButton } from "@/components/delete-button";

export default async function QrCodesPage(props: { searchParams: Promise<{ page?: string }> }) {
    const session = await auth();
    if (!session?.user) return null;

    const where = { userId: session.user.id };
    const total = await prisma.qRCode.count({ where });
    const { page, totalPages, skip } = getPage((await props.searchParams).page, total);

    const qrCodes = await prisma.qRCode.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: PAGE_SIZE,
    });

    return (
        <div className="flex flex-col gap-6">
            <PageHeader title="QR Codes" description="Manage your generated QR codes.">
                <Link href="/qr-codes/create">
                    <Button>
                        <Plus className="mr-1 h-4 w-4" /> Create QR Code
                    </Button>
                </Link>
            </PageHeader>

            <Card className="gap-0 py-0">
                <CardHeader className="border-b py-4">
                    <CardTitle className="font-semibold">Your QR Codes</CardTitle>
                    <CardDescription>A list of all QR codes you have created, newest first.</CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Preview</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Destination</TableHead>
                                <TableHead>Short Code</TableHead>
                                <TableHead>Scans</TableHead>
                                <TableHead>Actions</TableHead>
                                <TableHead className="text-right">Created</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {qrCodes.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-40 text-center">
                                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                            <span className="grid size-10 place-items-center rounded-full bg-accent text-primary">
                                                <QrCode className="size-5" />
                                            </span>
                                            No QR codes found.
                                        </div>
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
                                            <div className="flex h-11 w-11 items-center justify-center rounded-lg border bg-white p-1 shadow-xs">
                                                <QRCodeSVG id={"qr-" + qr.id} value={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/qr/${qr.shortCode}`} size={32} fgColor={settings.fgColor} bgColor={settings.bgColor} />
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-[220px] truncate font-medium" title={qr.name}>{qr.name}</TableCell>
                                        <TableCell className="max-w-[220px] truncate">
                                            <a href={qr.destinationUrl} target="_blank" rel="noreferrer" title={qr.destinationUrl} className="flex items-center text-muted-foreground hover:text-primary hover:underline">
                                                <span className="truncate">{qr.destinationUrl}</span>
                                                <ExternalLink className="ml-1 h-3 w-3 shrink-0" />
                                            </a>
                                        </TableCell>
                                        <TableCell>
                                            <span className="rounded-md bg-accent px-2 py-1 font-mono text-xs font-medium text-accent-foreground">{qr.shortCode}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="inline-flex min-w-8 justify-center rounded-full bg-muted px-2 py-0.5 text-xs font-semibold tabular-nums">{qr.clicks}</span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <QrDownloadBtn id={qr.id} shortCode={qr.shortCode} />
                                                <form action={deleteQrCode.bind(null, qr.id) as any}>
                                                    <DeleteButton />
                                                </form>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground">{new Date(qr.createdAt).toLocaleDateString()}</TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                    <Pagination basePath="/qr-codes" page={page} totalPages={totalPages} total={total} />
                </CardContent>
            </Card>
        </div>
    );
}
