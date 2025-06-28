"use client";

import { cn } from "@/utils/cn";
import {
  getSidebarLocks,
  getSidebarState,
  setSidebarLocks,
  setSidebarState,
} from "@/utils/localStorage";
import { useZenModeStore } from "@/stores/zenModeStore";
import { motion } from "framer-motion";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { LuLock, LuUnlock } from "react-icons/lu";

export const SidebarWrapper = ({
  isOpen,
  children,
  title,
  isLocked,
  onLockToggle,
  position,
  initialWidth = 320,
  isCurrentTourStep,
  isCompleted,
}: {
  isOpen: boolean;
  children: React.ReactNode;
  title: string;
  isLocked: boolean;
  onLockToggle: () => void;
  position: "left" | "right";
  initialWidth?: number;
  isCurrentTourStep?: boolean;
  isCompleted?: boolean;
}) => {
  const [width, setWidth] = useState(initialWidth);
  const [mounted, setMounted] = useState(false);
  const initialLoadRef = useRef(true);
  const { isZenMode } = useZenModeStore();

  useEffect(() => {
    setMounted(true);

    // Only run this effect once on initial mount
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      const state = getSidebarState();
      const locks = getSidebarLocks();

      if (locks[position] && !state[position].isOpen) {
        setSidebarState({
          ...state,
          [position]: {
            ...state[position],
            isOpen: true,
            locked: true,
          },
        });
        onLockToggle();
      }
    }
  }, [position, onLockToggle]);

  const handleResize = useCallback((newWidth: number) => {
    setWidth(Math.max(320, Math.min(600, newWidth)));
  }, []);

  const handleLockToggle = useCallback(() => {
    const locks = getSidebarLocks();
    const state = getSidebarState();

    setSidebarLocks({
      left: locks.left,
      right: locks.right,
      [position]: !isLocked,
    });

    setSidebarState({
      ...state,
      [position]: {
        ...state[position],
        isOpen,
        locked: !isLocked,
      },
    });

    onLockToggle();
  }, [isLocked, onLockToggle, position, isOpen]);

  useEffect(() => {
    if (!mounted) return;

    const main = document.querySelector("main");
    if (!main) return;

    const handleResize = () => {
      const isMobile = window.innerWidth < 1024;
      const leftPanel = document.querySelector(
        '[data-position="left"].sidebar-content'
      );
      const rightPanel = document.querySelector(
        '[data-position="right"].sidebar-content'
      );

      if (isMobile || isZenMode) {
        main.style.paddingLeft = "";
        main.style.paddingRight = "";
        main.style.width = "100%";
        main.style.marginLeft = "0";
        main.style.marginRight = "0";
        main.style.filter = "";
        main.style.transform = "";
        return;
      }

      // Reset all styles first
      main.style.transition = "all 0.15s ease-in-out";

      // Get panel states - check both locked AND open state
      const leftPanelLocked = leftPanel?.getAttribute("data-locked") === "true";
      const rightPanelLocked =
        rightPanel?.getAttribute("data-locked") === "true";
      const leftPanelOpen = leftPanel?.getAttribute("data-open") === "true";
      const rightPanelOpen = rightPanel?.getAttribute("data-open") === "true";

      const leftWidth = leftPanel?.getAttribute("data-width") || "0";
      const rightWidth = rightPanel?.getAttribute("data-width") || "0";

      // Only adjust margins if panel is both locked AND open
      const leftPanelActive = leftPanelLocked && leftPanelOpen;
      const rightPanelActive = rightPanelLocked && rightPanelOpen;

      // Reset to layout's default padding
      main.style.paddingLeft = "64px"; // 16 * 4 = 64px (matches layout's px-16)
      main.style.paddingRight = "64px";
      main.style.width = "100%";

      // Add subtle depth effects when panels are active
      const anyPanelActive = leftPanelActive || rightPanelActive;
      if (anyPanelActive) {
        main.style.filter = "brightness(0.98) contrast(1.02)";
        main.style.transform = "scale(0.995)";
      } else {
        main.style.filter = "";
        main.style.transform = "";
      }

      // Calculate margins and width based on active panels
      // Since panels now stick to edges and icon bars move over them,
      // we need to account for both panel width AND icon bar width + spacing for visual separation
      const iconBarWidth = 60; // w-16 (64px) + 12px spacing for visual separation

      if (leftPanelActive && rightPanelActive) {
        main.style.paddingLeft = "0";
        main.style.paddingRight = "0";
        main.style.marginLeft = `${Number.parseInt(leftWidth) + iconBarWidth}px`;
        main.style.marginRight = `${Number.parseInt(rightWidth) + iconBarWidth}px`;
        main.style.width = `calc(100% - ${Number.parseInt(leftWidth) + Number.parseInt(rightWidth) + iconBarWidth * 2}px)`;
      } else if (leftPanelActive) {
        main.style.paddingLeft = "0";
        main.style.marginLeft = `${Number.parseInt(leftWidth) + iconBarWidth}px`;
        main.style.marginRight = "0";
        main.style.width = `calc(100% - ${Number.parseInt(leftWidth) + iconBarWidth}px)`;
      } else if (rightPanelActive) {
        main.style.paddingRight = "0";
        main.style.marginRight = `${Number.parseInt(rightWidth) + iconBarWidth}px`;
        main.style.marginLeft = "0";
        main.style.width = `calc(100% - ${Number.parseInt(rightWidth) + iconBarWidth}px)`;
      } else {
        // If no panels are active, reset margins
        main.style.marginLeft = "0";
        main.style.marginRight = "0";
      }
    };

    // Initial setup
    handleResize();

    // Add resize listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      main.style.transition = "";
      // Reset to layout's default padding
      main.style.paddingLeft = "60px";
      main.style.paddingRight = "60px";
      main.style.marginLeft = "0";
      main.style.marginRight = "0";
      main.style.width = "100%";
      main.style.filter = "";
      main.style.transform = "";
    };
  }, [isOpen, width, position, isLocked, mounted, isZenMode]);

  if (!mounted) return null;

  return (
    <motion.div
      initial={false}
      animate={{
        x: 0,
        opacity: isOpen ? 1 : 0,
        scale: isOpen ? 1 : 0.98,
      }}
      transition={{
        duration: 0.4,
        ease: [0.23, 1, 0.32, 1],
        opacity: { duration: 0.25 },
        scale: { duration: 0.4 },
      }}
      className={cn(
        "sidebar-content fixed top-0 z-[10] bottom-0 hidden transform lg:flex",
        position === "left" ? "left-0" : "right-0",
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      )}
      data-position={position}
      data-locked={isLocked}
      data-open={isOpen}
      data-width={width}
      style={{
        width: `${width}px`,
        // Simple dark background with barely visible content behind
        background: "rgba(0, 0, 0, 0.96)",
        backdropFilter: "blur(24px) saturate(140%) brightness(1.1)",
        // Remove hard border
        border: "none",
        borderRadius: "0",
        // Softer, more organic shadow
        boxShadow: isOpen
          ? `
            ${position === "left" ? "4px" : "-4px"} 0 24px rgba(0, 0, 0, 0.2),
            ${position === "left" ? "8px" : "-8px"} 0 48px rgba(0, 0, 0, 0.1),
            ${position === "left" ? "1px" : "-12px"} 0 72px rgba(0, 0, 0, 0.05)
          `
          : "none",
        // Very subtle glow for locked panels
        ...(isLocked &&
          isOpen && {
            filter: "drop-shadow(0 0 16px rgba(36, 255, 102, 0.04))",
          }),
      }}
    >
      <div className="relative flex h-full w-full">
        <div className={cn("relative flex h-full w-full flex-col")}>
          {/* Minimal header - just spacing for navbar */}
          <div className="relative z-10 h-4 mt-12" />
          {/* Tour Overlay */}
          {isCurrentTourStep && !isCompleted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-[#070809]/80 backdrop-blur-[4px] pointer-events-none"
            />
          )}
          <div className="relative flex-1 overflow-y-auto px-2 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {children}
          </div>
          {/* Onboarding Overlay */}
          {isCurrentTourStep && !isCompleted && (
            <div className="pointer-events-none absolute inset-0 z-[1000]">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -bottom-32 -left-16 h-32 w-32 bg-[#24FF66]/[0.35] blur-[24px]" />
                <div className="absolute -right-16 -bottom-32 h-32 w-32 bg-[#24FF66]/[0.35] blur-[24px]" />

                <div className="absolute -top-16 -left-16 h-64 w-64 bg-[radial-gradient(circle_at_0%_0%,rgba(36,255,102,0.2),transparent_70%)]" />
                <div className="absolute -top-16 -right-16 h-64 w-64 bg-[radial-gradient(circle_at_100%_0%,rgba(36,255,102,0.2),transparent_70%)]" />
              </div>

              {/* Soft edge gradients */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(36,255,102,0.15),transparent_20%,transparent_90%,rgba(36,255,102,0.15))]" />
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(36,255,102,0.15),transparent_20%,transparent_90%,rgba(36,255,102,0.15))]" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
