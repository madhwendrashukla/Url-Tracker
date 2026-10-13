import { UAParser } from "ua-parser-js";

const countryNames = new Intl.DisplayNames(["en"], { type: "region" });

// Vercel adds country (ISO code) and city (URL-encoded) headers to every request,
// so no external geolocation call is needed.
export function readClick(headers: Headers) {
    const ua = new UAParser(headers.get("user-agent") ?? "").getResult();
    const country = headers.get("x-vercel-ip-country");
    const city = headers.get("x-vercel-ip-city");

    return {
        ipAddress: headers.get("x-forwarded-for")?.split(",")[0].trim() || null,
        country: country ? countryNames.of(country) ?? country : null,
        city: city ? decodeURIComponent(city) : null,
        browser: ua.browser.name || "Unknown",
        os: ua.os.name || "Unknown",
        deviceType: ua.device.type || "Desktop",
        referrer: headers.get("referer") || "Direct",
    };
}
