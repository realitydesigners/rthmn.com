"use client";

import { NestedBoxes } from "@/components/Charts/NestedBoxes";
import {
  BASE_VALUES,
  createDemoStep,
  createMockBoxData,
  sequences,
} from "@/components/Constants/constants";
import { FEATURE_TAGS } from "@/components/Constants/text";
import { StartButton } from "@/components/Sections/StartNowButton";
import type { BoxSlice } from "@/types/types";
import { motion } from "framer-motion";
import type React from "react";
import { memo, useEffect, useMemo, useRef, useState } from "react";

const POINT_OF_CHANGE_INDEX = 29;
const PAUSE_DURATION = 5000;

const AuroraBackground = ({ dominantState }: { dominantState: string }) => {
  // Define the colors to match colorStore defaults
  const colors = {
    blue: {
      primary: "rgba(36, 255, 102, 0.3)", // #24FF66 - Matrix green
      secondary: "rgba(36, 255, 102, 0.2)",
      tertiary: "rgba(36, 255, 102, 0.15)",
    },
    red: {
      primary: "rgba(48, 50, 56, 0.4)", // #303238 - Dark gray
      secondary: "rgba(48, 50, 56, 0.3)",
      tertiary: "rgba(48, 50, 56, 0.2)",
    },
    neutral: {
      primary: "rgba(36, 255, 102, 0.2)", // Default to Matrix green
      secondary: "rgba(36, 255, 102, 0.15)",
      tertiary: "rgba(36, 255, 102, 0.1)",
    },
  };

  const currentColors =
    colors[dominantState as keyof typeof colors] || colors.neutral;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        opacity: 0.3,
        backgroundPosition: ["0% 50%, 0% 50%", "100% 50%, 100% 50%"],
        filter: "blur(30px)",
      }}
      className="pointer-events-none absolute inset-0 overflow-hidden [background-image:var(--white-gradient),var(--aurora)] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)] [background-size:200%,_200%] [background-position:0%_50%,0%_50%] backdrop-blur-[100px] will-change-transform"
      style={
        {
          "--aurora": `repeating-linear-gradient(100deg,
                    ${currentColors.primary} 10%,
                    ${currentColors.secondary} 15%,
                    ${currentColors.tertiary} 20%,
                    ${currentColors.secondary} 25%,
                    ${currentColors.primary} 30%)`,
          "--white-gradient":
            "repeating-linear-gradient(100deg,rgba(255,255,255,0.05) 0%,rgba(255,255,255,0.05) 7%,transparent 10%,transparent 12%,rgba(255,255,255,0.05) 16%)",
        } as React.CSSProperties
      }
    />
  );
};

const FeatureTags = memo(() => (
  <div className="font-russo mt-8 flex flex-col items-center gap-3 lg:flex-row lg:items-start lg:gap-4">
    {FEATURE_TAGS.map((feature, index) => (
      <motion.div
        initial={{ opacity: 0, x: -15 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
        key={feature.text}
        className="group flex cursor-pointer items-center gap-2"
      >
        <feature.icon className="h-3.5 w-3.5 primary-text transition-colors duration-300 group-hover:text-blue-400 group-hover:drop-shadow-[0_0_3px_rgba(34,197,94,0.4)]" />
        <span className="font-kodemono  text-xs primary-text transition-colors duration-300 group-hover:text-neutral-200">
          {feature.text}
        </span>
      </motion.div>
    ))}
  </div>
));
FeatureTags.displayName = "FeatureTags";

interface BoxVisualizationProps {
  currentSlice: BoxSlice;
  demoStep: number;
  isPaused: boolean;
}

// Memoize BoxVisualization component - Added Aura Pulse & Corners
const BoxVisualization = memo(
  ({ currentSlice, demoStep, isPaused }: BoxVisualizationProps) => {
    const [baseSize, setBaseSize] = useState(250);
    useEffect(() => {
      const handleResize = () => {
        if (window.innerWidth >= 1024) setBaseSize(400);
        else if (window.innerWidth >= 640) setBaseSize(300);
        else setBaseSize(250);
      };
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);
    const sortedBoxes = useMemo(
      () =>
        currentSlice?.boxes?.sort(
          (a, b) => Math.abs(b.value) - Math.abs(a.value)
        ) || [],
      [currentSlice]
    );
    const isPointOfChange = useMemo(
      () =>
        Math.floor(demoStep / 1) % sequences.length === POINT_OF_CHANGE_INDEX,
      [demoStep]
    );

    return (
      <motion.div
        className="relative h-[250px] w-[250px] sm:h-[300px] sm:w-[300px] lg:h-[400px] lg:w-[400px]"
        style={{ transformStyle: "preserve-3d" }}
        initial={{ rotateX: 10, rotateY: -15, opacity: 0, scale: 0.8 }}
        whileInView={{ rotateX: 0, rotateY: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Decorative Corners */}

        {/* NestedBoxes container - Apply conditional rotation here */}
        <motion.div
          className="relative h-full w-full"
          style={{ transform: "translateZ(20px)" }}
        >
          {currentSlice && sortedBoxes.length > 0 && (
            <NestedBoxes
              boxes={sortedBoxes}
              demoStep={demoStep}
              isPaused={isPaused}
              isPointOfChange={isPointOfChange}
              baseSize={baseSize}
              colorScheme="blue-red"
            />
          )}
        </motion.div>
      </motion.div>
    );
  }
);
BoxVisualization.displayName = "BoxVisualization";

// Memoize the static content - Added Corner Framing
const StaticContent = memo(() => (
  <motion.div
    className="flex flex-col justify-center"
    style={{ transformStyle: "preserve-3d" }}
    initial={{ rotateX: -8, rotateY: 10, opacity: 0, y: 30 }}
    whileInView={{ rotateX: 0, rotateY: 0, opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
  >
    <div className="relative p-4 lg:p-0">
      {/* Decorative Corners */}

      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-3"
        >
          <h2 className="font-kodemono text-neutral-gradient text-md leading-none font-medium  lg:text-md mb-4">
            Multi-Dimensional
          </h2>
          <h2 className="font-russo text-neutral-gradient -mt-4 text-5xl leading-none font-bold  sm:text-6xl lg:text-7xl">
            Trend Analysis
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-8"
        >
          <p
            className="font-outfit text-neutral-gradient max-w-xl text-base leading-relaxed sm:text-lg"
            style={{ textShadow: "0 0 8px rgba(200, 200, 255, 0.1)" }}
          >
            Transform market data into clear visual insights. Rthmn analyzes
            price structure to reveal hidden patterns and key market levels.
          </p>
        </motion.div>

        <StartButton href="/dashboard" variant="shimmer">
          Start now
        </StartButton>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <FeatureTags />
        </motion.div>
      </div>
    </div>
  </motion.div>
));
StaticContent.displayName = "StaticContent";

// Main component
export const SectionBoxes = memo(() => {
  const [demoStep, setDemoStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentSlice = useMemo(() => {
    const currentValues = createDemoStep(demoStep, sequences, BASE_VALUES);
    const mockBoxData = createMockBoxData(currentValues);
    return { timestamp: new Date().toISOString(), boxes: mockBoxData };
  }, [demoStep]);

  const dominantState = useMemo(() => {
    if (!currentSlice?.boxes || currentSlice.boxes.length === 0)
      return "neutral";
    return currentSlice.boxes[0].value > 0 ? "blue" : "red";
  }, [currentSlice]);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentPatternIndex = Math.floor(demoStep / 1) % sequences.length;
      if (currentPatternIndex === POINT_OF_CHANGE_INDEX && !isPaused) {
        setIsPaused(true);
        setTimeout(() => {
          setIsPaused(false);
          setDemoStep((prev) => (prev + 1) % sequences.length);
        }, PAUSE_DURATION);
        return;
      }
      if (!isPaused) {
        setDemoStep((prev) => (prev + 1) % sequences.length);
      }
    }, 150);
    return () => clearInterval(interval);
  }, [demoStep, isPaused]);

  return (
    <section
      ref={containerRef}
      className="relative h-full w-full overflow-hidden bg-black px-4 py-24 sm:px-8 lg:px-[10vw] lg:py-40"
      style={{
        perspective: "1500px",
        backgroundImage: `
                    linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
                `,
        backgroundSize: "40px 40px",
      }}
    >
      <AuroraBackground dominantState={dominantState} />
      <div className="relative z-10 mx-auto max-w-7xl ">
        <div className="grid grid-cols-1 items-center gap-2 lg:grid-cols-2 lg:gap-32">
          <StaticContent />
          <div className="order-first flex items-center justify-center lg:order-none lg:pt-0 py-8">
            <BoxVisualization
              currentSlice={currentSlice}
              demoStep={demoStep}
              isPaused={isPaused}
            />
          </div>
        </div>
      </div>
    </section>
  );
});
SectionBoxes.displayName = "SectionBoxes";
