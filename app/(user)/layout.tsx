import { ZenModeControlsWrapper } from "@/components/Dashboard/ZenModeControlsWrapper";
import { MobileNavbar } from "@/components/Navbars/MobileNavbar";
import { NavbarSignedIn } from "@/components/Navbars/NavbarSignedIn";
import { SidebarLeft } from "@/components/Sidebars/SidebarLeft";
import { SidebarRight } from "@/components/Sidebars/SidebarRight";
import { getSubscription, getUser } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { DashboardProvider } from "@/providers/DashboardProvider/client";
import { UserProvider } from "@/providers/UserProvider";
import { WebSocketProvider } from "@/providers/WebsocketProvider";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

interface UserLayoutProps {
	children: React.ReactNode;
	modal: React.ReactNode;
}

export default async function UserLayout({ children, modal }: UserLayoutProps) {
	const supabase = await createClient();
	const user = await getUser(supabase);
	const headersList = await headers();
	const pathname = headersList.get("x-pathname") || "";
	const isPairPage = pathname.includes("pair/");

	if (!isPairPage && !user) {
		redirect("/signin");
	}

	if (isPairPage && !user) {
		return (
			<WebSocketProvider>
				<UserProvider>
					<DashboardProvider>
						<div id="app-container" className="min-h-screen bg-black">
							<main className="h-screen w-full bg-black transition-all duration-300 ease-in-out">
								{children}
							</main>
						</div>
					</DashboardProvider>
				</UserProvider>
			</WebSocketProvider>
		);
	}

	const subscription = await getSubscription(supabase);
	if (!subscription) {
		redirect("/pricing");
	}

	return (
		<WebSocketProvider>
			<UserProvider>
				<DashboardProvider>
					<div
						id="app-container"
						className="[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
					>
						<NavbarSignedIn user={user} />
						<main className="w-full bg-black transition-all duration-300 ease-in-out pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
							{children}
						</main>
						<SidebarLeft />
						<SidebarRight />
						<MobileNavbar />
						<ZenModeControlsWrapper />
						{modal}
					</div>
				</DashboardProvider>
			</UserProvider>
		</WebSocketProvider>
	);
}
