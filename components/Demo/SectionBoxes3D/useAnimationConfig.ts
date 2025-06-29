import { useEffect, useState } from "react";

export const useAnimationConfig = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [config, setConfig] = useState<any>(
    () => createAnimationConfig(false) // Always start with desktop config for SSR
  );
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Mark as client-side after hydration
    setIsClient(true);

    const checkMobile = () => {
      const mobile = window.innerWidth < 1024 || "ontouchstart" in window;
      setIsMobile(mobile);
      setConfig(createAnimationConfig(mobile));
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Commonly used animation utilities
  const getProgress = (scrollProgress: number, start: number, end: number) =>
    getProgressInRange(scrollProgress, start, end);

  const getCurrentPhase = (scrollProgress: number) =>
    getAnimationPhase(scrollProgress, config);

  const interpolate = (
    from: [number, number, number],
    to: [number, number, number],
    progress: number
  ) => interpolatePosition(from, to, progress);

  // Progressive reveal state helpers
  const getRevealStates = (scrollProgress: number) => ({
    shouldShowLeftSidebar:
      scrollProgress >= config.timing.progressiveReveal.leftSidebar,
    shouldShowRightSidebar:
      scrollProgress >= config.timing.progressiveReveal.rightSidebar,
    shouldActivateFocusMode:
      scrollProgress >= config.timing.progressiveReveal.focusMode,
    isInFinalFade: scrollProgress >= config.timing.finalFade,
  });

  return {
    isMobile,
    config,
    timing: config.timing,
    positions: config.positions,
    structure: config.structure,
    ranges: config.ranges,
    isClient, // Add this to know when we're on client-side
    // Utilities
    getProgress,
    getCurrentPhase,
    interpolate,
    getRevealStates,
  };
};

// Create configuration based on device type
export const createAnimationConfig = (isMobile: boolean): any => {
  const baseConfig = {
    mobile: {
      structureMoveStart: 0.18,
      structureMoveRange: 0.03,
    },
    desktop: {
      structureMoveStart: 0.1,
      structureMoveRange: 0.03,
    },
    ranges: {
      structureMovement: 0.03,
      uiTransition: 0.05,
      circularAppearance: 0.05,
      sidebarGap: 0.08,
      focusModeDelay: 0.06,
    },
    positions: {
      initial: [12, 0, 30] as [number, number, number],
      center: [0, 0, 40] as [number, number, number],
      focus: [0, 0, 25] as [number, number, number],
    },
    structure: {
      initialScale: 1.4,
      focusScale: 1.5,
      normalScale: 1.2,
      unfocusedScale: 0.8,
      initialRotation: [0, -Math.PI / 4, 0] as [number, number, number],
      focusRotation: [0, -Math.PI / 4, 0] as [number, number, number],
    },
  };

  // Calculate derived timing based on device
  const deviceConfig = isMobile ? baseConfig.mobile : baseConfig.desktop;
  const structureEnd =
    deviceConfig.structureMoveStart + deviceConfig.structureMoveRange;
  const uiStart = structureEnd;
  const uiEnd = uiStart + baseConfig.ranges.uiTransition;

  const timing = {
    structureMovement: {
      start: deviceConfig.structureMoveStart,
      end: structureEnd,
    },
    uiAppearance: {
      start: uiStart,
      end: uiEnd,
    },
    progressiveReveal: {
      leftSidebar: structureEnd + 0.005 + baseConfig.ranges.circularAppearance, // After circular structures appear
      rightSidebar:
        structureEnd +
        0.005 +
        baseConfig.ranges.circularAppearance +
        baseConfig.ranges.sidebarGap,
      focusMode:
        structureEnd +
        0.005 +
        baseConfig.ranges.circularAppearance +
        baseConfig.ranges.sidebarGap +
        baseConfig.ranges.focusModeDelay,
    },
    finalFade: 0.9,
  };

  return {
    ...baseConfig,
    timing,
  };
};

// Animation phase helpers
export const getAnimationPhase = (scrollProgress: number, config: any) => {
  if (scrollProgress < config.timing.structureMovement.start) {
    return "initial";
  } else if (scrollProgress < config.timing.structureMovement.end) {
    return "structureMoving";
  } else if (scrollProgress < config.timing.uiAppearance.end) {
    return "uiAppearing";
  } else if (scrollProgress < config.timing.progressiveReveal.leftSidebar) {
    return "uiVisible";
  } else if (scrollProgress < config.timing.progressiveReveal.rightSidebar) {
    return "leftSidebarOpen";
  } else if (scrollProgress < config.timing.progressiveReveal.focusMode) {
    return "rightSidebarOpen";
  } else if (scrollProgress < config.timing.finalFade) {
    return "focusMode";
  } else {
    return "finalFade";
  }
};

// Progress calculation helpers
export const getProgressInRange = (
  value: number,
  start: number,
  end: number
): number => {
  return Math.min(1, Math.max(0, (value - start) / (end - start)));
};

// Structure position interpolation
export const interpolatePosition = (
  from: [number, number, number],
  to: [number, number, number],
  progress: number
): [number, number, number] => {
  return [
    from[0] + (to[0] - from[0]) * progress,
    from[1] + (to[1] - from[1]) * progress,
    from[2] + (to[2] - from[2]) * progress,
  ];
};

// Debug helper to log current animation state
export const debugAnimationState = (scrollProgress: number, config: any) => {
  const phase = getAnimationPhase(scrollProgress, config);
  console.log(`Scroll: ${scrollProgress.toFixed(3)} | Phase: ${phase}`, {
    structureMove: getProgressInRange(
      scrollProgress,
      config.timing.structureMovement.start,
      config.timing.structureMovement.end
    ).toFixed(3),
    uiAppear: getProgressInRange(
      scrollProgress,
      config.timing.uiAppearance.start,
      config.timing.uiAppearance.end
    ).toFixed(3),
  });
};
