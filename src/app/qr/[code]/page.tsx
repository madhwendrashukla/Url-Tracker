import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import RedirectClient from "@/components/RedirectClient";

export default async function QRRedirectPage({
    params,
}: {
    params: Promise<{ code: string }>;
}) {
    const code = (await params).code;

    const qr = await prisma.qRCode.findUnique({
        where: { shortCode: code },
        select: { destinationUrl: true, isActive: true },
    });

    if (!qr || !qr.isActive) {
        notFound();
    }

    return <RedirectClient destination={qr.destinationUrl} trackUrl={`/api/track/qr/${code}`} />;
}
