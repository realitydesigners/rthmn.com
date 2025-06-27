"use client";

import { cn } from "@/utils/cn";
import { motion } from "framer-motion";
import type { MotionValue } from "framer-motion";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { LuLock, LuUnlock, LuX } from "react-icons/lu";

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
      "group relative z-[120] flex h-7 w-7 items-center justify-center rounded border transition-all duration-200",
      isLocked
        ? "border-[#32353C] bg-[#1C1E23] text-white"
        : "border-transparent bg-transparent text-[#32353C] hover:border-[#32353C] hover:bg-[#1C1E23] hover:text-white"
    )}
  >
    {isLocked ? (
      <LuLock size={11} className="transition-transform duration-200" />
    ) : (
      <LuUnlock size={11} className="transition-transform duration-200" />
    )}
  </button>
);

const CloseButton = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="group relative z-[120] flex h-7 w-7 items-center justify-center rounded border border-transparent bg-transparent text-[#32353C] transition-all duration-200 hover:border-[#32353C] hover:bg-[#1C1E23] hover:text-white"
  >
    <LuX size={11} className="transition-transform duration-200" />
  </button>
);

export const DemoSidebarWrapper = ({
  isOpen,
  children,
  title,
  position,
  initialWidth = 350,
  onClose,
  opacity,
}: {
  isOpen: boolean;
  children: React.ReactNode;
  title: string;
  position: "left" | "right";
  initialWidth?: number;
  onClose: () => void;
  opacity?: MotionValue<number>;
}) => {
  const [width, setWidth] = useState(initialWidth);
  const [isLocked, setIsLocked] = useState(false);

  const handleLockToggle = useCallback(() => {
    setIsLocked(!isLocked);
  }, [isLocked]);

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
        "fixed top-14 z-[100] bottom-0 transform bg-gradient-to-b from-[#0A0B0D] to-[#070809]",
        position === "left" ? "left-16" : "right-16", // Account for demo sidebar width
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      )}
      style={{
        width: `${width}px`,
        opacity: opacity,
        boxShadow: isOpen
          ? position === "left"
            ? "4px 0 16px rgba(0,0,0,0.3)"
            : "-4px 0 16px rgba(0,0,0,0.3)"
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
          <div className="relative z-10 flex h-12 items-center justify-between px-3 bg-gradient-to-b from-[#0A0B0D] to-[#070809] border-b border-[#1C1E23]">
            {position === "right" && (
              <div className="flex items-center gap-2">
                <LockButton isLocked={isLocked} onClick={handleLockToggle} />
                <CloseButton onClick={onClose} />
              </div>
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
              <div className="flex items-center gap-2">
                <CloseButton onClick={onClose} />
                <LockButton isLocked={isLocked} onClick={handleLockToggle} />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="relative flex-1 overflow-y-auto px-2 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
