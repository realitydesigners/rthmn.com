import DynamicNavbar from '@/components/NavbarDynamic';
import { Toaster } from '@/components/Toasts/toaster';
import { getURL } from '@/utils/helpers';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import ogImage from '@/public/opengraph-image.png';
import SupabaseProvider from '@/providers/SupabaseProvider';
import { getServerClient } from '@/utils/supabase/server';
import '@/styles/main.css';

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
        height: ogImage.height
      },
    ],
  }
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const supabase = await getServerClient();

  const {
    data: { session }
  } = await supabase.auth.getSession();

  return (
    <html lang="en">
      <body className="bg-black">
        <SupabaseProvider initialSession={session}>
          <DynamicNavbar />
            {children}
          <Suspense>
            <Toaster />
          </Suspense>
        </SupabaseProvider>
      </body>
    </html>
  );
}
