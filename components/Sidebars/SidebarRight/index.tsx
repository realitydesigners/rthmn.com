"use client";

import { TourOnboarding } from "@/app/(user)/onboarding/_components/Tours/TourOnboarding";
import { TourSettings } from "@/app/(user)/onboarding/_components/Tours/TourSettings";
import { AccountPanel } from "@/components/Panels/AccountPanel";
import { Onboarding } from "@/components/Panels/OnboardingPanel";
import { Sidebar } from "@/components/Sidebars/Sidebar";
import { LuGraduationCap, LuSettings } from "react-icons/lu";
import { ProfileIcon } from "@/components/Badges/ProfileIcon";
import { ColorStyleOptions } from "@/components/Panels/PanelComponents/ColorStyleOptions";
import { BoxVisualizer } from "@/components/Panels/PanelComponents/BoxVisualizer";

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

	return (
		<Sidebar position="right" buttons={buttons} defaultPanel="onboarding" />
	);
};
