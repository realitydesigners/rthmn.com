"use client";

import { TourOnboarding } from "@/app/(user)/onboarding/_components/Tours/TourOnboarding";
import { TourSettings } from "@/app/(user)/onboarding/_components/Tours/TourSettings";
import { ProfileIcon } from "@/components/Badges/ProfileIcon";
import { AccountPanel } from "@/components/Panels/AccountPanel";
import { Onboarding } from "@/components/Panels/OnboardingPanel";
import { BoxVisualizer } from "@/components/Panels/PanelComponents/BoxVisualizer";
import { ColorStyleOptions } from "@/components/Panels/PanelComponents/ColorStyleOptions";
import { Sidebar } from "@/components/Sidebars/Sidebar";
import Link from "next/link";
import { LuGraduationCap, LuHelpCircle, LuSettings } from "react-icons/lu";

export const SidebarRight = () => {
	const buttons = [
		{
			id: "onboarding",
			icon: LuGraduationCap,
			tourContent: <TourOnboarding />,
			panelContent: <Onboarding />,
		},
		{
			id: "settings",
			icon: LuSettings,
			tourContent: <TourSettings />,
			panelContent: (
				<>
					<ColorStyleOptions />
					<BoxVisualizer />
				</>
			),
		},
		{
			id: "account",
			icon: ProfileIcon,
			tourContent: <></>,
			panelContent: <AccountPanel />,
		},
	];

	const linkButtons = [
		{
			id: "help",
			icon: LuHelpCircle,
			href: "/support",
			title: "Help & Support",
		},
	];

	return (
		<Sidebar position="right" buttons={buttons} linkButtons={linkButtons} />
	);
};
