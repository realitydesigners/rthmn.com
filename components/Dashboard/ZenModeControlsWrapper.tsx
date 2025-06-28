"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useUser } from "@/providers/UserProvider";
import { useZenModeStore } from "@/stores/zenModeStore";
import { useZenModeControlsStore } from "@/stores/zenModeControlsStore";
import { ZenModeControls } from "./ZenModeControls";

export const ZenModeControlsWrapper = () => {
  const pathname = usePathname();
  const { selectedPairs } = useUser();
  const { isZenMode } = useZenModeStore();
  const { viewMode, focusedIndex, setViewMode, setFocusedIndex } =
    useZenModeControlsStore();

  // Only show on dashboard page
  const isDashboard = pathname === "/dashboard";

  // Reset zen focus when pairs change
  useEffect(() => {
    if (focusedIndex >= selectedPairs.length) {
      setFocusedIndex(0);
    }
  }, [selectedPairs.length, focusedIndex, setFocusedIndex]);

  if (!isDashboard) return null;

  return (
    <ZenModeControls
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      focusedIndex={focusedIndex}
      pairs={selectedPairs}
      onFocusChange={setFocusedIndex}
      isZenMode={isZenMode}
    />
  );
};
