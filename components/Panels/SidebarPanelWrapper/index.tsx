"use client";

import { cn } from "@/utils/cn";
import {
  getSidebarLocks,
  getSidebarState,
  setSidebarLocks,
  setSidebarState,
} from "@/utils/localStorage";
import { motion } from "framer-motion";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { LuLock, LuUnlock } from "react-icons/lu";

const LockButton = ({
  isLocked,
  onClick,
}: {
  isLocked: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "group relative z-[120] flex h-7 w-7 items-center justify-center rounded-lg border transition-all duration-200",
      isLocked
        ? "border-[#32353C] bg-gradient-to-b from-[#1C1E23] to-[#0F0F0F] text-white shadow-lg shadow-black/20"
        : "border-transparent bg-transparent text-[#32353C] hover:border-[#32353C] hover:bg-gradient-to-b hover:from-[#1C1E23] hover:to-[#0F0F0F] hover:text-white hover:shadow-lg hover:shadow-black/20"
    )}
  >
    <div className="relative flex items-center justify-center">
      {isLocked ? (
        <LuLock
          size={11}
          className="transition-transform duration-200 group-hover:scale-110"
        />
      ) : (
        <LuUnlock
          size={11}
          className="transition-transform duration-200 group-hover:scale-110"
        />
      )}
    </div>
  </button>
);

export const SidebarWrapper = ({
  isOpen,
  children,
  title,
  isLocked,
  onLockToggle,
  position,
  initialWidth = 350,
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
    setWidth(Math.max(350, Math.min(600, newWidth)));
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

      if (isMobile) {
        main.style.paddingLeft = "";
        main.style.paddingRight = "";
        main.style.width = "100%";
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

      // Calculate margins and width based on active panels
      if (leftPanelActive && rightPanelActive) {
        main.style.paddingLeft = "0";
        main.style.paddingRight = "0";
        main.style.marginLeft = `${leftWidth}px`;
        main.style.marginRight = `${rightWidth}px`;
        main.style.width = `calc(100% - ${Number.parseInt(leftWidth) + Number.parseInt(rightWidth)}px)`;
      } else if (leftPanelActive) {
        main.style.paddingLeft = "0";
        main.style.marginLeft = `${leftWidth}px`;
        main.style.marginRight = "0";
        main.style.width = `calc(100% - ${Number.parseInt(leftWidth)}px)`;
      } else if (rightPanelActive) {
        main.style.paddingRight = "0";
        main.style.marginRight = `${rightWidth}px`;
        main.style.marginLeft = "0";
        main.style.width = `calc(100% - ${Number.parseInt(rightWidth)}px)`;
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
      main.style.paddingLeft = "64px";
      main.style.paddingRight = "64px";
      main.style.marginLeft = "0";
      main.style.marginRight = "0";
      main.style.width = "100%";
    };
  }, [isOpen, width, position, isLocked, mounted]);

  if (!mounted) return null;

  return (
    <motion.div
      initial={false}
      animate={{
        x: isOpen ? 0 : position === "left" ? -width : width,
      }}
      transition={{
        duration: 0.15,
        ease: "easeInOut",
      }}
      className={cn(
        "sidebar-content fixed top-14 z-0 bottom-0 hidden transform lg:flex bg-gradient-to-b from-[#0A0B0D] to-[#070809] ",
        position === "left" ? "left-16" : "right-16",
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      )}
      data-position={position}
      data-locked={isLocked}
      data-open={isOpen}
      data-width={width}
      style={{
        width: `${width}px`,
        boxShadow:
          !isLocked && isOpen
            ? position === "left"
              ? "4px 0 16px rgba(0,0,0,0.2)"
              : "-4px 0 16px rgba(0,0,0,0.2)"
            : "none",
      }}
    >
      <div className="relative flex h-full w-full">
        <div
          className={cn(
            "relative flex h-full w-full flex-col",
            position === "left"
              ? "border-r border-[#1C1E23]"
              : "border-l border-[#1C1E23]"
          )}
        >
          {/* Header */}
          <div className="relative z-10 flex h-12 items-center justify-between px-3">
            {position === "right" && (
              <LockButton isLocked={isLocked} onClick={handleLockToggle} />
            )}
            <div
              className={cn(
                "flex items-center justify-center",
                position === "right" && "flex-1 justify-end"
              )}
            >
              <h2 className="font-russo text-[10px] font-medium tracking-wide text-[#32353C] uppercase">
                {title}
              </h2>
            </div>
            {position === "left" && (
              <LockButton isLocked={isLocked} onClick={handleLockToggle} />
            )}
          </div>
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
          <div className="relative flex-1 overflow-x-hidden overflow-y-auto px-2 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
