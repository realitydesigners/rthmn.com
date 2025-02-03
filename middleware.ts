import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
    // Update session for user routes
    if (request.nextUrl.pathname.startsWith('/user')) {
        const response = await updateSession(request);
        // Add pathname to headers
        response.headers.set('x-pathname', request.nextUrl.pathname);
        return response;
    }

    // For other routes, just add pathname
    const response = NextResponse.next();
    response.headers.set('x-pathname', request.nextUrl.pathname);
    return response;
}

export const config = {
    matcher: [
        // Match user routes
        '/user/:path*',
        // Exclude static files and images
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
