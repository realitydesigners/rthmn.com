"use client";

import { motion } from "framer-motion";
import type { MotionValue } from "framer-motion";
import Image from "next/image";
import { memo, useState } from "react";
import { LuChevronRight, LuLayoutDashboard, LuOrbit } from "react-icons/lu";
import { ConnectionBadge } from "../../Badges/ConnectionBadge";
import { cn } from "@/utils/cn";

interface DemoNavbarProps {
  y?: MotionValue<number>;
  opacity?: MotionValue<number>;
}

// Enhanced breadcrumb button component matching the exact design system
const BreadcrumbButton = ({
  segment,
  icon,
  isLast,
}: {
  segment: string;
  icon?: React.ReactNode;
  isLast?: boolean;
}) => (
  <div className="group relative">
    <div
      className="relative flex items-center gap-1.5 px-2 py-1.5 transition-all duration-300 overflow-hidden cursor-pointer"
      style={{ borderRadius: "4px" }}
    >
      {/* Sophisticated hover gradient */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          borderRadius: "4px",
          background: "linear-gradient(180deg, #1A1D22 -10.71%, #0D0F12 100%)",
          boxShadow:
            "0px 4px 4px 0px rgba(0, 0, 0, 0.25), inset 0px 1px 0px rgba(255, 255, 255, 0.02)",
        }}
      />

      {icon && (
        <span className="relative z-10 text-[#32353C] transition-colors duration-300 group-hover:text-[#B0B0B0]">
          {icon}
        </span>
      )}
      <span className="relative z-10 font-russo text-[10px] font-medium tracking-wide text-[#32353C] uppercase transition-colors duration-300 group-hover:text-white">
        {segment}
      </span>
    </div>
  </div>
);

// Enhanced logo button component
const LogoButton = () => (
  <div
    className="group relative flex items-center justify-center w-14 h-14 transition-all duration-300 overflow-hidden cursor-pointer"
    style={{ borderRadius: "4px" }}
  >
    {/* Sophisticated hover gradient */}
    <div
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      style={{
        borderRadius: "4px",
        background: "linear-gradient(180deg, #1A1D22 -10.71%, #0D0F12 100%)",
        boxShadow:
          "0px 4px 4px 0px rgba(0, 0, 0, 0.25), inset 0px 1px 0px rgba(255, 255, 255, 0.02)",
      }}
    />

    <div className="relative z-10 p-2 w-full h-full">
      <Image
        src="/rthmn-onboarding-logo.png"
        alt="Rthmn Logo"
        width={96}
        height={96}
        className="w-full h-full object-contain transition-all duration-300 group-hover:scale-105"
        priority
      />
    </div>
  </div>
);

// Enhanced GridControl component for demo
const MockGridControl = () => {
  const [activeLayout, setActiveLayout] = useState<"compact" | "balanced">(
    "balanced"
  );

  const layouts = [
    { id: "compact" as const, label: "Compact" },
    { id: "balanced" as const, label: "Balanced" },
  ];

  return (
    <div
      className="flex items-center gap-1 p-1 rounded-full transition-all duration-300 overflow-hidden border backdrop-blur-md"
      style={{
        borderRadius: "6px",
        background: "linear-gradient(180deg, #1A1D22 -10.71%, #0D0F12 100%)",
        border: "1px solid #16181C",
        boxShadow:
          "0px 4px 4px 0px rgba(0, 0, 0, 0.25), inset 0px 1px 0px rgba(255, 255, 255, 0.02)",
      }}
    >
      <div className="flex gap-1">
        {layouts.map((layout) => (
          <button
            key={layout.id}
            onClick={() => setActiveLayout(layout.id)}
            className="group/gridcontrol font-russo relative flex h-7 items-center px-2 text-[10px] font-medium transition-all duration-300 overflow-hidden"
            style={{ borderRadius: "4px" }}
          >
            {/* Compact balanced indicator - shows when active */}
            {activeLayout === layout.id && (
              <div
                className="absolute -left-4 top-1/2 -translate-y-1/2 bg-[#B0B0B0] z-10"
                style={{
                  width: "20px",
                  height: "3px",
                  transform: "translateY(-50%) rotate(-90deg)",
                  filter: "blur(6px)",
                  transformOrigin: "center",
                }}
              />
            )}

            {/* Enhanced active background */}
            {activeLayout === layout.id && (
              <div
                className="absolute inset-0"
                style={{
                  borderRadius: "4px",
                  background:
                    "linear-gradient(180deg, #24282D -10.71%, #111316 100%)",
                  boxShadow:
                    "0px 4px 4px 0px rgba(0, 0, 0, 0.25), inset 0px 1px 0px rgba(255, 255, 255, 0.02)",
                }}
              />
            )}

            {/* Enhanced hover background */}
            {activeLayout !== layout.id && (
              <div
                className="absolute inset-0 opacity-0 group-hover/gridcontrol:opacity-100 transition-opacity duration-300"
                style={{
                  borderRadius: "4px",
                  background:
                    "linear-gradient(180deg, #16181C -10.71%, #0A0B0D 100%)",
                  boxShadow: "0px 2px 4px 0px rgba(0, 0, 0, 0.15)",
                }}
              />
            )}

            <span
              className={`relative z-10 transition-colors duration-300 ${
                activeLayout === layout.id
                  ? "text-[#B0B0B0]"
                  : "text-[#818181] group-hover/gridcontrol:text-white"
              }`}
            >
              {layout.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

// Mock Zen Mode Toggle component for demo - matching original design
const MockZenModeToggle = () => {
  const [isZenMode, setIsZenMode] = useState(false);
  const [hasBeenAccessed] = useState(true);

  return (
    <div className="group relative flex items-center">
      {isZenMode && (
        <div
          className="absolute top-1/2 -translate-y-1/2 z-10"
          style={{
            width: "18px",
            height: "2px",
            transform: "translateY(-50%) rotate(-90deg)",
            filter: "blur(5px)",
            transformOrigin: "center",
            opacity: 0.6,
          }}
        />
      )}
      <span className="font-russo text-[10px] font-medium text-[#818181] uppercase tracking-wide mr-2">
        ZEN MODE
      </span>
      <div className="relative transition-all duration-300 overflow-hidden">
        {!hasBeenAccessed && !isZenMode && (
          <div className="absolute inset-0 bg-white/5 rounded-full blur-sm animate-pulse" />
        )}

        <button
          onClick={() => setIsZenMode(!isZenMode)}
          className={cn(
            "group relative flex h-5 w-10 items-center rounded-full transition-all duration-500 overflow-hidden",
            isZenMode
              ? "bg-gradient-to-r from-slate-300/25 via-gray-200/30 via-slate-100/35 to-slate-300/25 border border-slate-200/50 shadow-lg shadow-slate-500/20"
              : "bg-transparent border border-white/10"
          )}
          title={
            !hasBeenAccessed
              ? "Try Zen Mode - 3D immersive view"
              : isZenMode
                ? "Exit Zen Mode"
                : "Enter Zen Mode"
          }
        >
          <div
            className={cn(
              "absolute inset-0 rounded-full transition-all duration-500",
              isZenMode
                ? "bg-gradient-to-r from-slate-300/15 via-gray-200/20 to-slate-300/15 opacity-100"
                : "opacity-0"
            )}
          />

          <div className="absolute inset-0 rounded-full overflow-hidden">
            {isZenMode && (
              <>
                <div className="absolute top-1 left-1.5 w-0.5 h-0.5 bg-slate-200/80 rounded-full animate-pulse" />
                <div className="absolute top-2.5 left-3 w-0.5 h-0.5 bg-gray-100/80 rounded-full animate-pulse delay-300" />
                <div className="absolute top-1.5 right-2.5 w-0.5 h-0.5 bg-slate-200/80 rounded-full animate-pulse delay-700" />
              </>
            )}
          </div>

          <div
            className={cn(
              "relative z-10 h-3.5 w-3.5 rounded-full transition-all duration-500 transform shadow-lg border backdrop-blur-sm",
              "flex items-center justify-center",
              isZenMode
                ? "translate-x-5.5 bg-gradient-to-br from-white via-slate-50 to-slate-100 border-slate-200/70 shadow-slate-400/30"
                : "translate-x-0.5 bg-gradient-to-br from-white to-gray-100 border-gray-300/60 shadow-gray-500/20"
            )}
          >
            <div
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all duration-300",
                isZenMode
                  ? "bg-gradient-to-br from-slate-400 via-gray-400 to-slate-500 animate-pulse"
                  : "bg-gradient-to-br from-gray-400 to-gray-500"
              )}
            />
          </div>

          <div
            className={cn(
              "absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/5 to-transparent",
              "transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"
            )}
          />
        </button>
      </div>
    </div>
  );
};

// Enhanced Demo Navbar Component - matching NavbarSignedIn design system
export const DemoNavbar = memo(({ y, opacity }: DemoNavbarProps) => {
  // Mock data for demo
  const mockPathSegments = ["Dashboard", "Trading"];

  const getSegmentIcon = (segment: string) => {
    switch (segment.toLowerCase()) {
      case "dashboard":
        return <LuLayoutDashboard size={14} />;
      case "trading":
        return <LuOrbit size={14} />;
      default:
        return null;
    }
  };

  return (
    <motion.nav
      style={{ y, opacity }}
      className="fixed top-0 right-0 left-0 z-[1000] h-14 lg:flex"
    >
      <div className="group relative h-full w-full">
        {/* Sophisticated background overlay */}

        <div className="relative flex h-full w-full items-center justify-between rounded-lg pr-2">
          {/* Left section */}
          <div className="relative flex items-center lg:gap-2">
            <div className="flex items-center justify-center lg:w-16">
              <LogoButton />
            </div>

            {/* Breadcrumb */}
            <div className="flex hidden items-center text-[#818181] lg:flex">
              {mockPathSegments.map((segment, index, array) => (
                <div key={segment} className="flex items-center gap-1.5">
                  <BreadcrumbButton
                    segment={segment}
                    icon={getSegmentIcon(segment)}
                    isLast={index === array.length - 1}
                  />
                  {index < array.length - 1 && (
                    <LuChevronRight size={14} className="text-[#32353C]" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right section - Connection Status */}
          <div className="relative flex items-center gap-4">
            <MockZenModeToggle />
          </div>
        </div>
      </div>
    </motion.nav>
  );
});

DemoNavbar.displayName = "DemoNavbar";
