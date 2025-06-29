import { useEffect, useState, useMemo, useCallback } from "react";
import { useTransform, type MotionValue } from "framer-motion";
import { calculateCircularPosition } from "./mathUtils";

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

  // Single useEffect for all initialization logic
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
  const getProgress = useCallback(
    (scrollProgress: number, start: number, end: number) =>
      getProgressInRange(scrollProgress, start, end),
    []
  );

  const getCurrentPhase = useCallback(
    (scrollProgress: number) => getAnimationPhase(scrollProgress, config),
    [config]
  );

  const interpolate = useCallback(
    (
      from: [number, number, number],
      to: [number, number, number],
      progress: number
    ) => interpolatePosition(from, to, progress),
    []
  );

  // Formation animation hook - consolidated here
  const useFormationAnimation = () => {
    const [formationState, setFormationState] = useState({
      formationProgress: 0,
      isFormationComplete: false,
    });

    useEffect(() => {
      const startTime = Date.now();
      const duration = 1200;

      const animateFormation = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        setFormationState((prev) => ({
          ...prev,
          formationProgress: progress,
          isFormationComplete: progress >= 1,
        }));

        if (progress < 1) {
          requestAnimationFrame(animateFormation);
        }
      };

      animateFormation();
    }, []);

    return formationState;
  };

  // Create motion values for UI animations
  const createMotionValues = useCallback(
    (
      scrollYProgress: MotionValue<number>,
      isFormationComplete: boolean
    ): any => {
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
    },
    [
      config.timing.uiAppearance.start,
      config.timing.uiAppearance.end,
      config.timing.finalFade,
    ]
  );

  // Optimized progressive reveal with useMemo for derived state
  const useProgressiveReveal = useCallback(
    (
      currentScrollProgress: number,
      isFormationComplete: boolean,
      isClient: boolean,
      setViewMode: (mode: "scene" | "box") => void
    ) => {
      // Calculate derived state without storing it in useState
      const derivedState = useMemo(() => {
        if (!isFormationComplete || !isClient) {
          return {
            leftSidebarOpen: false,
            rightSidebarOpen: false,
            autoFocusMode: false,
          };
        }

        const progress = currentScrollProgress;
        return {
          leftSidebarOpen:
            progress >= config.timing.progressiveReveal.leftSidebar,
          rightSidebarOpen:
            progress >= config.timing.progressiveReveal.rightSidebar,
          autoFocusMode: progress >= config.timing.progressiveReveal.focusMode,
        };
      }, [currentScrollProgress, isFormationComplete, isClient]);

      // Only use useEffect for side effects (setViewMode)
      useEffect(() => {
        if (isFormationComplete && isClient) {
          setViewMode(derivedState.autoFocusMode ? "box" : "scene");
        }
      }, [
        derivedState.autoFocusMode,
        isFormationComplete,
        isClient,
        setViewMode,
      ]);

      return derivedState;
    },
    [
      config.timing.progressiveReveal.leftSidebar,
      config.timing.progressiveReveal.rightSidebar,
      config.timing.progressiveReveal.focusMode,
    ]
  );

  // Calculate structure positions and properties
  const calculateStructures = useCallback(
    (
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
      const circularAppearThreshold =
        config.timing.structureMovement.end + 0.005;
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
          viewMode === "box" && isFocused
            ? config.positions.focus
            : basePosition;

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
    },
    [isClient, getProgress, interpolate, config]
  );

  // Calculate which structure should be focused
  const calculateFocusedIndex = useCallback(
    (structures: StructureData[], scrollProgress: number): number => {
      const circularAppearThreshold =
        config.timing.structureMovement.end + 0.005;
      const showOnlyFirstStructure = scrollProgress < circularAppearThreshold;

      if (showOnlyFirstStructure) return 0;

      return structures.reduce((closest, struct, index) => {
        const currentDistance =
          struct.position[0] ** 2 + struct.position[2] ** 2;
        const closestDistance =
          structures[closest].position[0] ** 2 +
          structures[closest].position[2] ** 2;
        return currentDistance < closestDistance && struct.position[2] > 0
          ? index
          : closest;
      }, 0);
    },
    [config.timing.structureMovement.end]
  );

  return {
    isMobile,
    config,
    timing: config.timing,
    positions: config.positions,
    structure: config.structure,
    ranges: config.ranges,
    isClient,
    getProgress,
    getCurrentPhase,
    interpolate,
    createMotionValues,
    useProgressiveReveal,
    calculateStructures,
    calculateFocusedIndex,
    useFormationAnimation, // New consolidated formation animation
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
