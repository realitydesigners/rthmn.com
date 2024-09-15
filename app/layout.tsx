import Footer from '@/components/ui/Footer';
import DynamicNavbar from '@/components/DynamicNavbar';
import { Toaster } from '@/components/ui/Toasts/toaster';
import { getURL } from '@/utils/helpers';
import type { Metadata } from 'next';
import { type PropsWithChildren, Suspense } from 'react';
import 'styles/main.css';

const title = 'Next.js Subscription Starter';
const description = 'Brought to you by Vercel, Stripe, and Supabase.';

export const metadata: Metadata = {
  metadataBase: new URL(getURL()),
  title: title,
  description: description,
  openGraph: {
    title: title,
    description: description
  }
};

export default async function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body className="bg-black">
        <DynamicNavbar />
        <main
          id="skip"
          className="md:min-h[calc(100dvh-5rem)] min-h-[calc(100dvh-4rem)]"
        >
          {children}
        </main>
        {/* <Footer /> */}
        <Suspense>
          <Toaster />
        </Suspense>
      </body>
    </html>
  );
}
