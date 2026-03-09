import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Plus, Trash2, ExternalLink, Copy } from "lucide-react";
import { deleteLink } from "@/actions/link";

export default async function LinksPage() {
    const session = await auth();
    if (!session?.user) return null;

    const links = await prisma.link.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" }
    });

    return (
        <div className="flex flex-col space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Short Links</h2>
                    <p className="text-muted-foreground">Manage your shortened URLs.</p>
                </div>
                <Link href="/links/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Create Link
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Your Links</CardTitle>
                    <CardDescription>A list of all short links you have created.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Short Link</TableHead>
                                <TableHead>Original URL</TableHead>
                                <TableHead>Clicks</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {links.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        No links found.
                                    </TableCell>
                                </TableRow>
                            )}
                            {links.map((link) => {
                                const shortUrl = `/api/track/${link.customSlug}`;
                                return (
                                    <TableRow key={link.id}>
                                        <TableCell className="font-medium">
                                            <a href={shortUrl} target="_blank" rel="noreferrer" className="flex items-center text-primary hover:underline group">
                                                /{link.customSlug}
                                                <ExternalLink className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </a>
                                        </TableCell>
                                        <TableCell className="max-w-[300px] truncate text-muted-foreground">
                                            {link.originalUrl}
                                        </TableCell>
                                        <TableCell>{link.clicks}</TableCell>
                                        <TableCell>{new Date(link.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <form action={deleteLink.bind(null, link.id) as any}>
                                                    <Button variant="destructive" size="icon" title="Delete">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
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
