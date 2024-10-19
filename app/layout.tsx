import DynamicNavbar from '@/components/NavbarDynamic';
import { Toaster } from '@/components/Toasts/toaster';
import { getURL } from '@/utils/helpers';
import type { Metadata } from 'next';
import { type PropsWithChildren, Suspense } from 'react';
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
    description: description
  }
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body className="bg-black">
        <DynamicNavbar />
        <main className="md:min-h[calc(100dvh-5rem)] min-h-[calc(100dvh-4rem)]">
          {children}
        </main>
        <Suspense>
          <Toaster />
        </Suspense>
      </body>
    </html>
  );
}
