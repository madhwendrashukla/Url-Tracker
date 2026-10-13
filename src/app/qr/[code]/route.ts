import { NextRequest, NextResponse, after } from "next/server";
import prisma from "@/lib/prisma";
import { readClick } from "@/lib/track";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    const code = (await params).code;

    const qr = await prisma.qRCode.findUnique({
        where: { shortCode: code },
        select: { id: true, destinationUrl: true, isActive: true },
    });

    if (!qr || !qr.isActive) {
        return new NextResponse("Not Found or Inactive", { status: 404 });
    }

    // Save the scan after the redirect has been sent, so the visitor never waits for it.
    const click = readClick(req.headers);
    after(() =>
        prisma
            .$transaction([
                prisma.analytics.create({ data: { qrCodeId: qr.id, ...click } }),
                prisma.qRCode.update({ where: { id: qr.id }, data: { clicks: { increment: 1 } } }),
            ])
            .catch((error) => console.error("Tracking Error:", error))
    );

    // 302, not 301: browsers cache a 301 and repeat scans would skip tracking.
    return NextResponse.redirect(qr.destinationUrl, 302);
}
