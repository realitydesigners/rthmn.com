import { type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
    // Only check auth for /user routes
    if (request.nextUrl.pathname.startsWith('/user')) {
        return await updateSession(request);
    }
    return NextResponse.next();
}

export const config = {
    matcher: [
        // Match user routes
        '/user/:path*',
        // Exclude static files and images
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
