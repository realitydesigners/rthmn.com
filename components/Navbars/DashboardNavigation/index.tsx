"use client";

import { PairNavigator } from "@/components/Navbars/DashboardNavigation/PairNavigator";
import { ProfilePanel } from "@/components/Navbars/DashboardNavigation/ProfilePanel";
import { BoxVisualizer } from "@/components/Panels/PanelComponents/BoxVisualizer";
import { ColorStyleOptions } from "@/components/Panels/PanelComponents/ColorStyleOptions";
import { SupportPanel } from "@/components/Panels/SupportPanel";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { useScrollLock } from "@/hooks/useScrollLock";
import { useAuth } from "@/providers/SupabaseProvider";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { IconType } from "react-icons";
import { LuHelpCircle, LuSearch, LuSettings } from "react-icons/lu";

type Panel = "pairs" | "settings" | "alerts" | "profile" | "support" | null;

const ProfileIcon = ({
	setActivePanel,
}: { setActivePanel: (panel: Panel) => void }) => {
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const { signOut, user, userDetails } = useAuth();

	const userInitial =
		user?.user_metadata?.full_name?.[0].toUpperCase() ||
		user?.email?.[0].toUpperCase() ||
		"?";

	return (
		<div className="relative" ref={dropdownRef}>
			<button
				type="button"
				onClick={() => {
					setIsDropdownOpen(!isDropdownOpen);
					setActivePanel("profile");
				}}
				className="group flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-b from-[#333333] to-[#181818] p-[1px] transition-all duration-200 hover:from-[#444444] hover:to-[#282828]"
			>
				<div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-b from-[#0A0A0A] to-[#181818]">
					<div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-black">
						{userDetails?.avatar_url ? (
							<Image
								src={userDetails.avatar_url}
								alt="Profile"
								className="object-cover"
								width={80}
								height={80}
							/>
						) : (
							<span className="text-lg font-bold">{userInitial}</span>
						)}
					</div>
				</div>
			</button>
		</div>
	);
};

const PanelWrapper = ({
	children,
	onClose,
}: { children: React.ReactNode; onClose: () => void }) => (
	<div className="relative z-[150]">
		<div
			className="fixed inset-0"
			onClick={(e) => {
				if (e.target === e.currentTarget) {
					onClose();
				}
			}}
		/>
		{children}
	</div>
);

export const DashboardNavigation = () => {
	const router = useRouter();
	const pathname = usePathname();

	const [activePanel, setActivePanel] = useState<Panel>(null);
	const scrollDirection = useScrollDirection();
	const panelRef = useRef<HTMLDivElement>(null);

	// Check if we're viewing a pair modal
	const isPairModalOpen = pathname.includes("/pair/");

	useScrollLock(activePanel !== null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				panelRef.current &&
				!panelRef.current.contains(event.target as Node)
			) {
				setActivePanel(null);
			}
		};

		if (activePanel) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [activePanel]);

	const handleButtonClick = (panel: Panel, path?: string) => {
		if (path) {
			setActivePanel(null);
			router.push(path);
			return;
		}

		if (activePanel === panel) {
			setActivePanel(null);
			return;
		}
		setActivePanel(panel);
	};

	const renderPanel = () => {
		const handleClose = () => setActivePanel(null);

		const panels = {
			pairs: (
				<PairNavigator isModalOpen={isPairModalOpen} onClose={handleClose} />
			),
			settings: (
				<div className="fixed z-[2050] h-[100vh] w-screen overflow-y-auto bg-black">
					<div className="p-4 pb-30">
						<>
							<ColorStyleOptions />
							<BoxVisualizer />
						</>
					</div>
				</div>
			),
			profile: <ProfilePanel />,
			support: <SupportPanel isOpen={true} onClose={handleClose} />,
		};

		const content = panels[activePanel as keyof typeof panels];

		if (!content) return null;

		return <PanelWrapper onClose={handleClose}>{content}</PanelWrapper>;
	};

	return (
		<>
			<div
				className={`fixed inset-0 z-[2040] transition-all duration-500 ease-in-out ${activePanel ? "pointer-events-auto bg-black/80" : "pointer-events-none bg-transparent"}`}
			>
				{renderPanel()}
			</div>

			<div
				className={`fixed bottom-4 left-1/2 z-[2060] flex -translate-x-1/2 transform transition-all duration-500 ease-in-out lg:hidden ${
					scrollDirection === "down" ? "translate-y-24" : "translate-y-0"
				}`}
			>
				<div className="flex h-full gap-2 rounded-full border border-[#222] bg-black px-2 py-2">
					<ProfileIcon setActivePanel={setActivePanel} />
					<SidebarIconButton
						icon={LuSearch}
						isActive={activePanel === "pairs"}
						onClick={() => handleButtonClick("pairs")}
					/>
					<SidebarIconButton
						icon={LuHelpCircle}
						isActive={activePanel === "support"}
						onClick={() => handleButtonClick("support")}
					/>
					<SidebarIconButton
						icon={LuSettings}
						isActive={activePanel === "settings"}
						onClick={() => handleButtonClick("settings")}
					/>
				</div>
			</div>
		</>
	);
};

const SidebarIconButton = ({
	icon: Icon,
	isActive,
	onClick,
}: { icon: IconType; isActive: boolean; onClick: () => void }) => {
	return (
		<button onClick={onClick} className="group relative flex items-center">
			<div
				className={`group flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-b p-[1px] transition-all duration-200 ${
					isActive
						? "from-[#444444] to-[#282828]"
						: "from-[#333333] to-[#181818] hover:from-[#444444] hover:to-[#282828]"
				}`}
			>
				<div
					className={`flex h-full w-full items-center justify-center rounded-full bg-gradient-to-b from-[#0A0A0A] to-[#181818] ${
						isActive ? "text-white" : "text-[#818181]"
					}`}
				>
					<Icon size={24} />
				</div>
			</div>
		</button>
	);
};
