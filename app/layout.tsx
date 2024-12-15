import { Navbar } from '@/components/Navbar';
import { Toaster } from '@/components/Toasts/toaster';
import { getURL } from '@/utils/helpers';
import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import ogImage from '@/public/opengraph-image.png';
import SupabaseProvider from '@/providers/SupabaseProvider';
import { createClient } from '@/utils/supabase/server';
import './main.css';
import { GoogleTagManager } from '@next/third-parties/google';
import Script from 'next/script';
import { kodeMono, outfit, oxanium, russo } from '@/components/Fonts/fonts';
import { Analytics } from '@vercel/analytics/react';
import UserProvider from '@/providers/UserProvider';

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

export default async function RootLayout({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
    const supabase = await createClient();

    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    return (
        <html lang='en' className={`${kodeMono.variable} ${outfit.variable} ${oxanium.variable} ${russo.variable} bg-black`}>
            <GoogleTagManager gtmId='GTM-XYZ' />
            <body className='bg-black'>
                <SupabaseProvider initialUser={user}>
                    <UserProvider initialUser={user}>
                        <Navbar />
                        {children}
                        {modal}
                        <div id='modal-root' />
                        <Suspense>
                            <Toaster />
                        </Suspense>
                    </UserProvider>
                </SupabaseProvider>
                <Analytics />
                {/* Google Analytics */}
                <script async src='https://www.googletagmanager.com/gtag/js?id=G-0PXQE0RL1G'></script>
                {/* Microsoft Clarity */}
                <Script strategy='lazyOnload' id='clarity-script'>
                    {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "o3awwft96h");
          `}
                </Script>
            </body>
        </html>
    );
}
