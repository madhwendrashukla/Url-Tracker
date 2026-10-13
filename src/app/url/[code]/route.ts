import { NextRequest, NextResponse, after } from "next/server";
import prisma from "@/lib/prisma";
import { readClick } from "@/lib/track";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    const code = (await params).code;

    const link = await prisma.link.findFirst({
        where: { OR: [{ customSlug: code }, { shortCode: code }] },
        select: { id: true, originalUrl: true, isActive: true },
    });

    if (!link || !link.isActive) {
        return new NextResponse("Not Found or Inactive", { status: 404 });
    }

    // Save the click after the redirect has been sent, so the visitor never waits for it.
    const click = readClick(req.headers);
    after(() =>
        prisma
            .$transaction([
                prisma.analytics.create({ data: { linkId: link.id, ...click } }),
                prisma.link.update({ where: { id: link.id }, data: { clicks: { increment: 1 } } }),
            ])
            .catch((error) => console.error("Tracking Error:", error))
    );

    // 302, not 301: browsers cache a 301 and repeat clicks would skip tracking.
    return NextResponse.redirect(link.originalUrl, 302);
}
