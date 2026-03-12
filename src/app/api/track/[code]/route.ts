import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { UAParser } from "ua-parser-js";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ code: string }> } // Next.js 15 requires params to be awaited
) {
    const code = (await params).code;

    const link = await prisma.link.findFirst({
        where: {
            OR: [
                { customSlug: code },
                { shortCode: code }
            ]
        }
    });

    const qr = await prisma.qRCode.findUnique({ where: { shortCode: code } });

    const target = link || qr;

    if (!target || !target.isActive) {
        return new NextResponse("Not Found or Inactive", { status: 404 });
    }

    const uaString = req.headers.get("user-agent") || "";
    const parser = new UAParser(uaString);
    const result = parser.getResult();

    const browser = result.browser.name || "Unknown";
    const os = result.os.name || "Unknown";
    const deviceType = result.device.type || "Desktop";

    const forwardedFor = req.headers.get("x-forwarded-for");
    const ipAccess = forwardedFor ? forwardedFor.split(',')[0].trim() : req.headers.get("x-real-ip") || "unknown";

    let country = req.headers.get("x-vercel-ip-country") || null;
    let city = req.headers.get("x-vercel-ip-city") || null;

    // Use external IP Geolocation API if IP is valid to maximize accuracy
    if (ipAccess !== "unknown" && ipAccess !== "127.0.0.1" && ipAccess !== "::1") {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5s timeout

            const geoRes = await fetch(`http://ip-api.com/json/${ipAccess}?fields=status,country,city`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (geoRes.ok) {
                const geoData = await geoRes.json();
                if (geoData.status === "success") {
                    country = geoData.country || country;
                    city = geoData.city || city;
                }
            }
        } catch (e) {
            console.warn("External IP geolocation failed, falling back to Vercel headers", e);
        }
    }

    try {
        await prisma.analytics.create({
            data: {
                linkId: link ? link.id : null,
                qrCodeId: qr ? qr.id : null,
                ipAddress: ipAccess,
                country,
                city,
                browser,
                os,
                deviceType,
                referrer: req.headers.get("referer") || "Direct",
            }
        });

        if (link) {
            await prisma.link.update({
                where: { id: link.id },
                data: { clicks: { increment: 1 } }
            });
            return NextResponse.redirect(link.originalUrl);
        } else if (qr) {
            await prisma.qRCode.update({
                where: { id: qr.id },
                data: { clicks: { increment: 1 } }
            });
            return NextResponse.redirect(qr.destinationUrl);
        }
    } catch (error) {
        console.error("Tracking Error:", error);
        // Even if analytics fail, still redirect
        const url = link ? link.originalUrl : (qr ? qr.destinationUrl : "");
        if (url) return NextResponse.redirect(url);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
