import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isDashboardInfo = nextUrl.pathname.startsWith('/dashboard') ||
                nextUrl.pathname.startsWith('/qr-codes') ||
                nextUrl.pathname.startsWith('/links') ||
                nextUrl.pathname.startsWith('/analytics');
            if (isDashboardInfo) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn) {
                if (nextUrl.pathname === '/login' || nextUrl.pathname === '/register' || nextUrl.pathname === '/') {
                    return Response.redirect(new URL('/dashboard', nextUrl));
                }
            }
            return true;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        }
    },
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
