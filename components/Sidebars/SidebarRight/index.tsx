"use client";

import { OnboardingContent } from "@/app/(user)/onboarding/_components/FeatureTour/OnboardingContent";
import { SettingsContent } from "@/app/(user)/onboarding/_components/FeatureTour/SettingsContent";
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
			tourContent: <OnboardingContent />,
			panelContent: <Onboarding />,
		},
		{
			id: "settings",
			icon: LuSettings,
			tourContent: <SettingsContent />,
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
