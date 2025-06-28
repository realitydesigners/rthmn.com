"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useUser } from "@/providers/UserProvider";
import { useZenModeStore } from "@/stores/zenModeStore";
import { useZenModeControlsStore } from "@/stores/zenModeControlsStore";
import { ZenModeControls } from "./ZenModeControls";

export const ZenModeControlsWrapper = () => {
  const pathname = usePathname();
  const { favorites } = useUser();
  const { isZenMode } = useZenModeStore();
  const { viewMode, focusedIndex, setViewMode, setFocusedIndex } =
    useZenModeControlsStore();

  // Only show on dashboard page
  const isDashboard = pathname === "/dashboard";

  // Reset zen focus when pairs change
  useEffect(() => {
    if (focusedIndex >= favorites.length) {
      setFocusedIndex(0);
    }
  }, [favorites.length, focusedIndex, setFocusedIndex]);

  if (!isDashboard) return null;

  return (
    <ZenModeControls
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      focusedIndex={focusedIndex}
      pairs={favorites}
      onFocusChange={setFocusedIndex}
      isZenMode={isZenMode}
    />
  );
};
