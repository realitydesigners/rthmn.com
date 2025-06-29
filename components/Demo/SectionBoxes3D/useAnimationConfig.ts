import { useEffect, useState, useMemo } from "react";
import { useTransform, type MotionValue } from "framer-motion";
import { calculateCircularPosition } from "./mathUtils";

// Types for better organization
export interface AnimationState {
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  autoFocusMode: boolean;
}

export interface MotionValues {
  scale: MotionValue<number>;
  leftSidebarX: MotionValue<number>;
  rightSidebarX: MotionValue<number>;
  sidebarOpacity: MotionValue<number>;
  navbarY: MotionValue<number>;
  introTextOpacity: MotionValue<number>;
}

export interface StructureData {
  pair: string;
  position: [number, number, number];
  scale: number;
  opacity: number;
  rotation?: [number, number, number];
}

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

  // Create motion values for UI animations
  const createMotionValues = (
    scrollYProgress: MotionValue<number>,
    isFormationComplete: boolean
  ): MotionValues => {
    const introTextOpacity = useTransform(
      scrollYProgress,
      [
        0,
        0.05,
        config.timing.uiAppearance.start,
        config.timing.uiAppearance.end,
      ],
      isFormationComplete ? [1, 1, 1, 0] : [1, 1, 1, 1] // Keep visible until formation complete
    );

    const scale = useTransform(
      scrollYProgress,
      [config.timing.uiAppearance.start, config.timing.uiAppearance.end],
      [1.0, 0.8]
    );

    const leftSidebarX = useTransform(
      scrollYProgress,
      [config.timing.uiAppearance.start, config.timing.uiAppearance.end],
      [-64, 0]
    );

    const rightSidebarX = useTransform(
      scrollYProgress,
      [config.timing.uiAppearance.start, config.timing.uiAppearance.end],
      [64, 0]
    );

    const sidebarOpacity = useTransform(
      scrollYProgress,
      [
        config.timing.uiAppearance.start,
        config.timing.uiAppearance.end,
        config.timing.finalFade - 0.05,
        config.timing.finalFade,
      ],
      [0, 1, 1, 0]
    );

    const navbarY = useTransform(
      scrollYProgress,
      [config.timing.uiAppearance.start, config.timing.uiAppearance.end],
      [-56, 0]
    );

    return {
      scale,
      leftSidebarX,
      rightSidebarX,
      sidebarOpacity,
      navbarY,
      introTextOpacity,
    };
  };

  // Progressive reveal state management
  const useProgressiveReveal = (
    currentScrollProgress: number,
    isFormationComplete: boolean,
    isClient: boolean,
    setViewMode: (mode: "scene" | "box") => void
  ) => {
    const [animationState, setAnimationState] = useState<AnimationState>({
      leftSidebarOpen: false,
      rightSidebarOpen: false,
      autoFocusMode: false,
    });

    useEffect(() => {
      if (!isFormationComplete || !isClient) return; // Wait for client-side hydration

      const progress = currentScrollProgress;
      const newState = { ...animationState };
      let hasChanges = false;

      // Left sidebar opens
      const shouldOpenLeft =
        progress >= config.timing.progressiveReveal.leftSidebar;
      if (shouldOpenLeft !== animationState.leftSidebarOpen) {
        newState.leftSidebarOpen = shouldOpenLeft;
        hasChanges = true;
      }

      // Right sidebar opens
      const shouldOpenRight =
        progress >= config.timing.progressiveReveal.rightSidebar;
      if (shouldOpenRight !== animationState.rightSidebarOpen) {
        newState.rightSidebarOpen = shouldOpenRight;
        hasChanges = true;
      }

      // Focus mode activates
      const shouldActivateFocus =
        progress >= config.timing.progressiveReveal.focusMode;
      if (shouldActivateFocus !== animationState.autoFocusMode) {
        newState.autoFocusMode = shouldActivateFocus;
        setViewMode(shouldActivateFocus ? "box" : "scene");
        hasChanges = true;
      }

      if (hasChanges) {
        setAnimationState(newState);
      }
    }, [
      currentScrollProgress,
      isFormationComplete,
      isClient,
      animationState,
      setViewMode,
    ]);

    return animationState;
  };

  // Calculate structure positions and properties
  const calculateStructures = (
    cryptoStructures: any[],
    focusedIndex: number,
    viewMode: "scene" | "box",
    scrollProgress: number
  ): StructureData[] => {
    if (!isClient) return []; // Only calculate on client

    // Calculate structure position transition (right to center)
    const structureMoveProgress = getProgress(
      scrollProgress,
      config.timing.structureMovement.start,
      config.timing.structureMovement.end
    );

    // Determine what to show based on scroll progress
    const circularAppearThreshold = config.timing.structureMovement.end + 0.005;
    const showOnlyFirstStructure = scrollProgress < circularAppearThreshold;

    // Calculate transition progress for other structures appearing
    const circularAppearanceProgress = getProgress(
      scrollProgress,
      circularAppearThreshold,
      circularAppearThreshold + config.ranges.circularAppearance
    );

    return cryptoStructures.map((crypto, index) => {
      const circularPosition = calculateCircularPosition(
        index,
        focusedIndex,
        cryptoStructures.length
      );
      const isFocused = index === focusedIndex;

      // For the first structure, smoothly transition from right to center to circular position
      let basePosition = circularPosition;
      if (index === 0) {
        if (showOnlyFirstStructure) {
          // Interpolate from initial to center position based on scroll
          basePosition = interpolate(
            config.positions.initial,
            config.positions.center,
            structureMoveProgress
          );
        } else {
          // After UI appears, move from center to circular position
          basePosition = interpolate(
            config.positions.center,
            circularPosition,
            circularAppearanceProgress
          );
        }
      }

      // In box mode, center and bring forward the focused structure (matching ZenMode)
      const position: [number, number, number] =
        viewMode === "box" && isFocused ? config.positions.focus : basePosition;

      return {
        pair: crypto.pair,
        position,
        scale:
          viewMode === "box" && isFocused
            ? config.structure.focusScale
            : index === 0 && showOnlyFirstStructure
              ? config.structure.initialScale
              : isFocused
                ? config.structure.normalScale
                : config.structure.unfocusedScale,
        opacity:
          index === 0
            ? isFocused
              ? 1
              : 0.7 // First structure always visible after formation
            : circularAppearanceProgress * (isFocused ? 1 : 0.7), // Others fade in on scroll
        rotation:
          viewMode === "box" && isFocused
            ? config.structure.focusRotation
            : index === 0 && showOnlyFirstStructure
              ? config.structure.initialRotation
              : undefined,
      };
    });
  };

  // Calculate which structure should be focused
  const calculateFocusedIndex = (
    structures: StructureData[],
    scrollProgress: number
  ): number => {
    const circularAppearThreshold = config.timing.structureMovement.end + 0.005;
    const showOnlyFirstStructure = scrollProgress < circularAppearThreshold;

    if (showOnlyFirstStructure) return 0;

    return structures.reduce((closest, struct, index) => {
      const currentDistance = struct.position[0] ** 2 + struct.position[2] ** 2;
      const closestDistance =
        structures[closest].position[0] ** 2 +
        structures[closest].position[2] ** 2;
      return currentDistance < closestDistance && struct.position[2] > 0
        ? index
        : closest;
    }, 0);
  };

  return {
    isMobile,
    config,
    timing: config.timing,
    positions: config.positions,
    structure: config.structure,
    ranges: config.ranges,
    isClient,
    // Utilities
    getProgress,
    getCurrentPhase,
    interpolate,
    getRevealStates,
    // New consolidated functions
    createMotionValues,
    useProgressiveReveal,
    calculateStructures,
    calculateFocusedIndex,
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
      leftSidebar: structureEnd + 0.05 + baseConfig.ranges.circularAppearance, // After circular structures appear
      rightSidebar:
        structureEnd +
        0.05 +
        baseConfig.ranges.circularAppearance +
        baseConfig.ranges.sidebarGap,
      focusMode:
        structureEnd +
        0.05 +
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
