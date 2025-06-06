"use client";
import { useWebSocket } from "@/providers/WebsocketProvider";
import type { User } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	LuChevronRight,
	LuHelpCircle,
	LuLayoutDashboard,
	LuOrbit,
} from "react-icons/lu";
import { ConnectionBadge } from "../../Badges/ConnectionBadge";
import { GridControl } from "../../Panels/BoxDataPanel/GridControl";

interface NavbarSignedInProps {
	user: User | null;
}

export const NavbarSignedIn: React.FC<NavbarSignedInProps> = ({ user }) => {
	const pathname = usePathname();
	const { isConnected } = useWebSocket();

	if (pathname === "/account" || pathname === "/pricing") return null;

	// Get icon for path segment
	const getSegmentIcon = (segment: string) => {
		switch (segment.toLowerCase()) {
			case "dashboard":
				return <LuLayoutDashboard size={14} />;
			case "test":
				return <LuOrbit size={14} />;
			default:
				return null;
		}
	};

	const formatPathname = (path: string): string | string[] => {
		if (path === "/") return "Home";
		if (path === "/signin") return "Sign In";

		return path
			.split("/")
			.filter(Boolean)
			.map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1));
	};

	const pathSegments = formatPathname(pathname);

	return (
		<nav className="fixed top-0 right-0 left-0 z-[1000] h-14 border-b border-[#1C1E23] bg-[#0A0B0D]  lg:flex ">
			{/* Enhanced depth effects */}

			<div className="group relative  h-full w-full">
				<div className="relative flex h-full w-full items-center justify-between rounded-lg pr-2">
					{/* Left section */}
					<div className="relative flex items-center lg:gap-2 ">
						<div className="flex items-center  justify-center lg:border-r lg:w-16 lg:border-[#1C1E23]">
							<Link
								href="/dashboard"
								className="group relative flex items-center  rounded-lg "
							>
								<div className="flex h-14 w-14 items-center p-2">
									<Image
										src="/rthmn-onboarding-logo.png"
										alt="Rthmn Logo"
										width={96}
										height={96}
										className="relative w-full h-full object-contain"
										priority
									/>
								</div>
							</Link>
						</div>

						{/* Breadcrumb */}
						<div className="flex hidden items-center text-[#818181] lg:flex">
							{Array.isArray(pathSegments) ? (
								pathSegments.map((segment, index, array) => (
									<div key={segment} className="flex items-center gap-1.5">
										<div className="flex items-center gap-1.5 rounded-md px-1.5 py-1">
											{getSegmentIcon(segment) && (
												<span className="text-[#32353C]">
													{getSegmentIcon(segment)}
												</span>
											)}
											<span className="font-russo text-[10px] font-medium tracking-wide text-[#32353C] uppercase">
												{segment}
											</span>
										</div>
										{index < array.length - 1 && (
											<LuChevronRight size={14} className="text-[#32353C]" />
										)}
									</div>
								))
							) : (
								<span className="font-mono text-[11px] font-medium tracking-wider text-neutral-200/50 uppercase">
									{pathSegments}
								</span>
							)}
						</div>
					</div>

					{/* Center section - GridControl */}
					<div className="absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:block">
						<GridControl />
					</div>

					{/* Right section - Connection Status */}
					<div className="relative flex items-center gap-2">
						<Link
							href="/support"
							className="h-4 w-4 items-center justify-center lg:flex hidden"
						>
							<LuHelpCircle className="h-4 w-4 text-[#818181] group-hover:text-white" />
						</Link>
						<ConnectionBadge isConnected={isConnected} />
					</div>
				</div>
			</div>
		</nav>
	);
};
