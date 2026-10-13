import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

// Use only authConfig (no Prisma) for edge-compatible middleware
const { auth } = NextAuth(authConfig);

const protectedRoutes = ["/dashboard", "/qr-codes", "/links", "/analytics"];
const authRoutes = ["/login", "/register"];

export default auth((req: any) => {
    const { nextUrl, auth: session } = req;
    const isLoggedIn = !!session?.user;

    const isProtected = protectedRoutes.some((route) =>
        nextUrl.pathname.startsWith(route)
    );
    const isAuthRoute = authRoutes.includes(nextUrl.pathname);

    if (isProtected && !isLoggedIn) {
        return NextResponse.redirect(new URL("/login", nextUrl));
    }

    if (isAuthRoute && isLoggedIn) {
        return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }

    return NextResponse.next();
});

export const config = {
    // Skip public redirect paths (/url/*, /qr/*); the trailing slash keeps /qr-codes protected.
    matcher: ["/((?!api/|url/|qr/|_next/static|_next/image|favicon.ico).*)"],
};
