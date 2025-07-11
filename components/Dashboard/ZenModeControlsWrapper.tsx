"use client";

import { useUser } from "@/providers/UserProvider";
import { useZenModeControlsStore } from "@/stores/zenModeControlsStore";
import { useZenModeStore } from "@/stores/zenModeStore";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ZenModeControls } from "./ZenModeControls";

export const ZenModeControlsWrapper = () => {
  const pathname = usePathname();
  const { favorites } = useUser();
  const { isZenMode } = useZenModeStore();
  const { viewMode, focusedIndex, setViewMode, setFocusedIndex } =
    useZenModeControlsStore();
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Only show on dashboard page
  const isDashboard = pathname === "/dashboard";

  // Reset zen focus when pairs change
  useEffect(() => {
    if (focusedIndex >= favorites.length) {
      setFocusedIndex(0);
    }
  }, [favorites.length, focusedIndex, setFocusedIndex]);

  // Don't render until hydrated to avoid hydration mismatch
  if (!isHydrated) {
    return null;
  }

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
