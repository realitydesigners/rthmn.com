import { NavbarSignedOut } from "@/components/Navbars/NavbarSignedOut";
import { SectionFooter } from "@/components/Sections/SectionFooter";
import { kodemono, outfit, oxanium, russo } from "@/lib/styles/fonts";
import { createClient } from "@/lib/supabase/server";
import { QueryProvider } from "@/providers/QueryProvider";
import SupabaseProvider from "@/providers/SupabaseProvider";
import ogImage from "@/public/opengraph-image.png";
import { getURL } from "@/utils/helpers";
import { GoogleTagManager } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata, Viewport } from "next";
import { preconnect, prefetchDNS } from "react-dom";
import "@/lib/styles/main.css";
import { cn } from "@/utils/cn";
import { Inter } from "next/font/google";

const title = "RTHMN | Next Generation Forex / Stocks Toolkit";
const description =
	"RTHMN is a next generation algorithmic trading platform that provides real-time trading signals, 3D pattern recognition, gamified learning, AI-powered predictions, and comprehensive risk management.";

const inter = Inter({ subsets: ["latin"] });

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
	preconnect("https://cdn.sanity.io");
	prefetchDNS("https://cdn.sanity.io");
	preconnect("https://server.rthmn.com");
	prefetchDNS("https://server.rthmn.com");

	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	return (
		<html
			lang="en"
			className="[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
		>
			{/* <GoogleTagManager gtmId="GTM-XYZ" /> */}
			<body
				className={cn(
					inter.className,
					kodemono.variable,
					outfit.variable,
					oxanium.variable,
					russo.variable,
					"overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
				)}
			>
				<SupabaseProvider initialUser={user}>
					<QueryProvider>
						<NavbarSignedOut user={user} />
						{children}
						<SectionFooter />
					</QueryProvider>
				</SupabaseProvider>
				<Analytics />
				{/* <script
					async
					src="https://www.googletagmanager.com/gtag/js?id=G-0PXQE0RL1G"
				></script> */}
			</body>
		</html>
	);
}
