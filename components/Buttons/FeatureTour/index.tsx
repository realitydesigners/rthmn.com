"use client";

import { useOnboardingStore } from "@/stores/onboardingStore";
import { cn } from "@/utils/cn";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import type { IconType } from "react-icons";

export function FeatureTour({
  icon: Icon,
  onClick,
  isActive,
  isOpen,
  tourId,
  className,
  children,
  position,
}: {
  icon: IconType;
  onClick: () => void;
  isActive: boolean;
  isOpen: boolean;
  tourId: string;
  className?: string;
  children: any;
  position?: "left" | "right";
}) {
  const { currentStepId, completeStep, goToNextStep, isStepCompleted } =
    useOnboardingStore();
  const [showTooltip, setShowTooltip] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(0);
  const isCurrentTour = currentStepId === tourId;
  const isCompleted = isStepCompleted(tourId);
  const observerRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    if (!isCurrentTour || isCompleted) return;

    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [isCurrentTour, isCompleted]);

  // Track sidebar width changes
  useEffect(() => {
    if (!showTooltip) return;

    const updateTooltipPosition = () => {
      const sidebarElement = document.querySelector(
        `[data-position="${position}"]`
      );
      if (sidebarElement) {
        const width = Number.parseInt(
          sidebarElement.getAttribute("data-width") || "0"
        );
        setSidebarWidth(width);
      }
    };

    updateTooltipPosition();

    // Create a mutation observer to watch for attribute changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-width"
        ) {
          updateTooltipPosition();
        }
      });
    });

    const sidebarElement = document.querySelector(
      `[data-position="${position}"]`
    );
    if (sidebarElement) {
      observer.observe(sidebarElement, {
        attributes: true,
        attributeFilter: ["data-width"],
      });
    }

    // Also use ResizeObserver as a backup
    observerRef.current = new ResizeObserver(updateTooltipPosition);
    if (sidebarElement) {
      observerRef.current.observe(sidebarElement);
    }

    return () => {
      observer.disconnect();
      observerRef.current?.disconnect();
    };
  }, [showTooltip, position]);

  const handleComplete = () => {
    completeStep(tourId);
    goToNextStep();
    setShowTooltip(false);
  };

  return (
    <>
      <button
        onClick={
          !isCompleted && currentStepId && currentStepId !== tourId
            ? undefined
            : onClick
        }
        className={cn(
          "group relative z-[120] flex h-10 w-10 items-center justify-center transition-all duration-200 overflow-hidden",
          tourId === "account" ? "rounded-full" : "",
          isCurrentTour &&
            !isCompleted &&
            [
              "border border-[#24FF66]/40",
              "shadow-[inset_0_0_35px_rgba(36,255,102,0.4)]",
              "shadow-[inset_0_0_15px_rgba(36,255,102,0.5)]",
              "inset-shadow-sm inset-shadow-[#24FF66]/40",
              "inset-shadow-xs inset-shadow-[#24FF66]/30",
              "bg-linear-45/oklch from-[#24FF66]/25 via-[#24FF66]/15 to-transparent",
              "shadow-lg shadow-[#24FF66]/30",
              "shadow-md shadow-[#24FF66]/20",
              "inset-ring inset-ring-[#24FF66]/25",
              "hover:shadow-[inset_0_0_50px_rgba(36,255,102,0.6)]",
              "hover:shadow-[inset_0_0_25px_rgba(36,255,102,0.5)]",
              "hover:inset-shadow-sm hover:inset-shadow-[#24FF66]/50",
              "hover:inset-shadow-xs hover:inset-shadow-[#24FF66]/40",
              "hover:bg-linear-45/oklch hover:from-[#24FF66]/35 hover:via-[#24FF66]/20 hover:to-transparent",
              "hover:border-[#24FF66]/50",
              "hover:shadow-lg hover:shadow-[#24FF66]/40",
              "hover:shadow-md hover:shadow-[#24FF66]/30",
            ].join(" "),
          !isCompleted &&
            currentStepId &&
            currentStepId !== tourId &&
            "pointer-events-none cursor-not-allowed opacity-50",
          className
        )}
        style={{
          borderRadius: tourId === "account" ? "50%" : "4px",
          background:
            isActive && !isCurrentTour
              ? "linear-gradient(180deg, #343A42 -10.71%, #1F2328 100%)"
              : undefined,
          boxShadow:
            isActive && !isCurrentTour
              ? "0px 4px 4px 0px rgba(0, 0, 0, 0.25)"
              : undefined,
        }}
      >
        {/* Green indicator for active panel */}
        {isActive && !isCurrentTour && (
          <div
            className="absolute -left-4 top-1/2 -translate-y-1/2 bg-[#4EFF6E] z-10"
            style={{
              width: "30px",
              height: "4px",
              transform: "translateY(-50%) rotate(-90deg)",
              filter: "blur(10px)",
              transformOrigin: "center",
            }}
          />
        )}

        {/* Hover background for non-tour buttons */}
        {!isCurrentTour && (
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              borderRadius: tourId === "account" ? "50%" : "4px",
              background:
                "linear-gradient(180deg, #2C3137 -10.71%, #16191D 100%)",
            }}
          />
        )}
        <Icon
          size={20}
          className={cn("relative z-10 transition-colors", {
            "text-[#24FF66] group-hover:text-[#1ECC52]":
              isCurrentTour && !isCompleted,
            "text-[#B0B0B0] group-hover:text-white":
              !isCurrentTour || isCompleted,
          })}
        />
      </button>
      {typeof window !== "undefined" && (
        <AnimatePresence>
          {showTooltip && !isCompleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98, x: 0 }}
              animate={{
                opacity: 1,
                scale: 1,
                x: isOpen
                  ? position === "left"
                    ? sidebarWidth
                    : -sidebarWidth
                  : 0,
              }}
              exit={{ opacity: 0, scale: 0.98, x: 0 }}
              transition={{
                duration: 0.2,
                ease: [0.2, 1, 0.2, 1],
              }}
              className={cn(
                "fixed top-18 z-50",
                position === "left"
                  ? isOpen
                    ? "left-4"
                    : "left-20"
                  : isOpen
                    ? "right-4"
                    : "right-20"
              )}
            >
              {React.cloneElement(children, {
                onComplete: handleComplete,
                isCompleted: isCompleted,
                isCurrentTourStep: isCurrentTour,
              })}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </>
  );
}
