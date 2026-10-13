import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Plus, ExternalLink, Link as LinkIcon } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { deleteLink } from "@/actions/link";
import { DeleteButton } from "@/components/delete-button";
import { CopyButton } from "@/components/copy-button";

export default async function LinksPage() {
    const session = await auth();
    if (!session?.user) return null;

    const links = await prisma.link.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" }
    });

    return (
        <div className="flex flex-col gap-6">
            <PageHeader title="Short Links" description="Manage your shortened URLs.">
                <Link href="/links/create">
                    <Button>
                        <Plus className="mr-1 h-4 w-4" /> Create Link
                    </Button>
                </Link>
            </PageHeader>

            <Card className="gap-0 py-0">
                <CardHeader className="border-b py-4">
                    <CardTitle className="font-semibold">Your Links</CardTitle>
                    <CardDescription>A list of all short links you have created.</CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
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
                                    <TableCell colSpan={6} className="h-40 text-center">
                                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                            <span className="grid size-10 place-items-center rounded-full bg-accent text-primary">
                                                <LinkIcon className="size-5" />
                                            </span>
                                            No links found.
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                            {links.map((link) => {
                                const shortUrl = `/url/${link.customSlug}`;
                                const absoluteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${shortUrl}`;
                                return (
                                    <TableRow key={link.id}>
                                        <TableCell className="font-medium">{link.name}</TableCell>
                                        <TableCell>
                                            <a href={shortUrl} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-1 rounded-md bg-accent px-2 py-1 font-mono text-xs font-medium text-accent-foreground hover:underline">
                                                /{link.customSlug}
                                                <ExternalLink className="h-3 w-3 opacity-60 transition-opacity group-hover:opacity-100" />
                                            </a>
                                        </TableCell>
                                        <TableCell className="max-w-[280px] truncate text-muted-foreground">
                                            {link.originalUrl}
                                        </TableCell>
                                        <TableCell>
                                            <span className="inline-flex min-w-8 justify-center rounded-full bg-muted px-2 py-0.5 text-xs font-semibold tabular-nums">{link.clicks}</span>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{new Date(link.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <CopyButton text={absoluteUrl} />
                                                <form action={deleteLink.bind(null, link.id) as any}>
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
