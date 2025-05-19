"use client";

import { TourInstruments } from "@/app/(user)/onboarding/_components/Tours/TourInstruments";
import { TourVisualizers } from "@/app/(user)/onboarding/_components/Tours/TourVisualizers";
import { TourOnboarding } from "@/app/(user)/onboarding/_components/Tours/TourOnboarding";
import { TourSettings } from "@/app/(user)/onboarding/_components/Tours/TourSettings";
import { ChartStyleOptions } from "@/components/Charts/ChartStyleOptions";
import { InstrumentsPanel } from "@/components/Panels/InstrumentsPanel";
import { TimeFrameSlider } from "@/components/Panels/PanelComponents/TimeFrameSlider";
import { AccountPanel } from "@/components/Panels/AccountPanel";
import { Onboarding } from "@/components/Panels/OnboardingPanel";
import { BoxVisualizer } from "@/components/Panels/PanelComponents/BoxVisualizer";
import { ColorStyleOptions } from "@/components/Panels/PanelComponents/ColorStyleOptions";
import { ProfileIcon } from "@/components/Badges/ProfileIcon";
import { LuLineChart, LuLayoutGrid, LuGraduationCap, LuSettings } from "react-icons/lu";
import { MobileNavbarContent } from "@/components/Navbars/MobileNavbarContent";

export const MobileNavbar = () => {
  const buttons = [
    {
      id: "instruments",
      icon: LuLineChart,
      tourContent: <TourInstruments />,
      panelContent: <InstrumentsPanel />,
    },
    {
      id: "visualizer",
      icon: LuLayoutGrid,
      tourContent: <TourVisualizers />,
      panelContent: (
        <>
          <ChartStyleOptions />
          <TimeFrameSlider global />
        </>
      ),
    },
    // {
    //   id: "onboarding",
    //   icon: LuGraduationCap,
    //   tourContent: <TourOnboarding />,
    //   panelContent: <Onboarding />,
    // },
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

  return <MobileNavbarContent buttons={buttons} />;
}; 