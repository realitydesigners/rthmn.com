import type { Metadata, Viewport } from 'next';
import { NavbarSignedOut } from '@/components/Navbars/NavbarSignedOut';
import SupabaseProvider from '@/providers/SupabaseProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import ogImage from '@/public/opengraph-image.png';
import { getURL } from '@/utils/helpers';
import { createClient } from '@/lib/supabase/server';
import { GoogleTagManager } from '@next/third-parties/google';
import { Analytics } from '@vercel/analytics/react';
import { kodeMono, outfit, oxanium, russo } from '@/lib/styles/fonts';
import { SectionFooter } from '@/components/Sections/SectionFooter';
import { prefetchDNS, preconnect } from 'react-dom';
import '@/lib/styles/main.css';

const title = 'RTHMN | Next Generation Forex / Stocks Toolkit';
const description =
    'RTHMN is a next generation algorithmic trading platform that provides real-time trading signals, 3D pattern recognition, gamified learning, AI-powered predictions, and comprehensive risk management.';

export const metadata: Metadata = {
    metadataBase: new URL(getURL()),
    title: title,
    description: description,
    openGraph: {
        title: title,
        description: description,
        images: [
            {
                url: ogImage.src,
                width: ogImage.width,
                height: ogImage.height,
            },
        ],
    },
};

export const viewport: Viewport = {
    maximumScale: 1,
};
export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    preconnect('https://cdn.sanity.io');
    prefetchDNS('https://cdn.sanity.io');
    preconnect('https://server.rthmn.com');
    prefetchDNS('https://server.rthmn.com');

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    return (
        <html lang='en'>
            <GoogleTagManager gtmId='GTM-XYZ' />
            <body className={`${kodeMono.variable} ${outfit.variable} ${oxanium.variable} ${russo.variable} bg-black`}>
                <SupabaseProvider initialUser={user}>
                    <QueryProvider>
                        <NavbarSignedOut user={user} />
                        {children}
                        <SectionFooter />
                    </QueryProvider>
                </SupabaseProvider>
                <Analytics />
                <script async src='https://www.googletagmanager.com/gtag/js?id=G-0PXQE0RL1G'></script>
            </body>
        </html>
    );
}
