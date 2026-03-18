import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import RedirectClient from "@/components/RedirectClient";

export default async function RedirectPage({
    params,
}: {
    params: Promise<{ code: string }>;
}) {
    const code = (await params).code;

    const link = await prisma.link.findFirst({
        where: {
            OR: [{ customSlug: code }, { shortCode: code }],
        },
        select: { originalUrl: true, isActive: true },
    });

    if (!link || !link.isActive) {
        notFound();
    }

    return <RedirectClient destination={link.originalUrl} trackUrl={`/api/track/url/${code}`} />;
}
