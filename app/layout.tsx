import DynamicNavbar from '@/components/NavbarDynamic';
import Footer from './_components/Footer';
import { Toaster } from '@/components/Toasts/toaster';
import { getURL } from '@/utils/helpers';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import ogImage from '@/public/opengraph-image.png';
import SupabaseProvider from '@/providers/SupabaseProvider';
import { createClient } from '@/utils/supabase/server';
import './main.css';

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
      }
    ]
  }
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body className="bg-black">
        <SupabaseProvider initialUser={user}>
          <DynamicNavbar />
          {children}
          {/* <Footer /> */}
          <Suspense>
            <Toaster />
          </Suspense>
        </SupabaseProvider>
      </body>
    </html>
  );
}
