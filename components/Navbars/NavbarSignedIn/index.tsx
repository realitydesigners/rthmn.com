"use client";
import { useWebSocket } from "@/providers/WebsocketProvider";
import { useZenModeStore } from "@/stores/zenModeStore";
import { cn } from "@/utils/cn";
import type { User } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LuChevronRight, LuLayoutDashboard, LuOrbit } from "react-icons/lu";
import { ConnectionBadge } from "../../Badges/ConnectionBadge";
import { GridControl } from "../../Panels/BoxDataPanel/GridControl";

interface NavbarSignedInProps {
  user: User | null;
}

// Breadcrumb button component matching the exact design system
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
      {/* Transparent by default, gradient on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          borderRadius: "4px",
          background: "linear-gradient(180deg, #2C3137 -10.71%, #16191D 100%)",
          boxShadow: "0px 2px 4px 0px rgba(0, 0, 0, 0.15)",
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
  <Link
    href="/dashboard"
    className="group relative flex items-center justify-center w-14 h-14 transition-all duration-300 overflow-hidden"
    style={{ borderRadius: "4px" }}
  >
    {/* Transparent by default, subtle gradient on hover */}
    <div
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      style={{
        borderRadius: "4px",
        background: "linear-gradient(180deg, #24282D -10.71%, #111316 100%)",
        boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
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
  </Link>
);

// Enhanced Zen Mode Toggle component with indicator
const ZenModeToggle = ({
  isZenMode,
  hasBeenAccessed,
  onToggle,
}: {
  isZenMode: boolean;
  hasBeenAccessed: boolean;
  onToggle: () => void;
}) => (
  <div className="group relative flex items-center gap-3">
    {/* Compact balanced indicator - shows when zen mode is active */}
    {isZenMode && (
      <div
        className="absolute -left-3 top-1/2 -translate-y-1/2 bg-[#B0B0B0] z-10"
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

    <span className="font-russo text-[9px] font-medium text-[#818181] uppercase tracking-wide">
      ZEN
    </span>
    <div
      className="relative px-1 py-0.5 transition-all duration-300 overflow-hidden"
      style={{
        borderRadius: "6px",
        background: "rgba(0, 0, 0, 0.6)",
        border: "1px solid rgba(28, 30, 35, 0.4)",
      }}
    >
      {/* Very subtle first-time user hint */}
      {!hasBeenAccessed && !isZenMode && (
        <div className="absolute inset-0 bg-white/5 rounded-full blur-sm animate-pulse" />
      )}

      <button
        onClick={onToggle}
        className={cn(
          "relative flex h-5 w-9 items-center rounded-full border transition-all duration-300 overflow-hidden",
          isZenMode ? "border-[#32353C]/80" : "border-[#1C1E23]/60"
        )}
        title={
          !hasBeenAccessed
            ? "Try Zen Mode - 3D immersive view"
            : isZenMode
              ? "Exit Zen Mode"
              : "Enter Zen Mode"
        }
        style={{
          background: isZenMode
            ? "linear-gradient(180deg, #343A42 -10.71%, #1F2328 100%)"
            : "#000000",
          boxShadow: isZenMode ? "0px 2px 4px 0px rgba(0, 0, 0, 0.25)" : "none",
        }}
      >
        {/* Toggle handle */}
        <div
          className={cn(
            "relative h-3 w-3 rounded-full border transition-all duration-300 transform shadow-sm",
            isZenMode
              ? "translate-x-5 border-[#32353C]/60 bg-[#B0B0B0]"
              : "translate-x-1 border-[#32353C]/60 bg-white"
          )}
        />
      </button>
    </div>
  </div>
);

export const NavbarSignedIn: React.FC<NavbarSignedInProps> = ({ user }) => {
  const pathname = usePathname();
  const { isConnected } = useWebSocket();
  const { isZenMode, toggleZenMode, hasBeenAccessed } = useZenModeStore();

  if (pathname === "/account" || pathname === "/pricing") return null;

  // Check if we're on dashboard to show zen mode toggle
  const isDashboard = pathname === "/dashboard";

  // Get icon for path segment
  const getSegmentIcon = (segment: string) => {
    switch (segment.toLowerCase()) {
      case "dashboard":
        return <LuLayoutDashboard size={14} />;
      case "test":
        return <LuOrbit size={14} />;
      default:
        return null;
    }
  };

  const formatPathname = (path: string): string | string[] => {
    if (path === "/") return "Home";
    if (path === "/signin") return "Sign In";

    return path
      .split("/")
      .filter(Boolean)
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1));
  };

  const pathSegments = formatPathname(pathname);

  const handleZenModeToggle = () => {
    if (typeof window !== "undefined" && window.toggleZenMode) {
      window.toggleZenMode();
    } else {
      toggleZenMode();
    }
  };

  return (
    <nav className="fixed top-0 right-0 left-0 z-[1000] h-14 lg:flex">
      <div className="group relative h-full w-full">
        <div className="relative flex h-full w-full items-center justify-between rounded-lg pr-2">
          {/* Left section */}
          <div className="relative flex items-center lg:gap-2">
            <div className="flex items-center justify-center lg:w-16">
              <Link href="/dashboard" className="relative flex items-center">
                <div className="flex h-14 w-14 items-center p-2">
                  <Image
                    src="/rthmn-onboarding-logo.png"
                    alt="Rthmn Logo"
                    width={96}
                    height={96}
                    className="relative w-full h-full object-contain"
                    priority
                  />
                </div>
              </Link>
            </div>

            {/* Breadcrumb */}
            <div className="flex hidden items-center text-[#818181] lg:flex">
              {Array.isArray(pathSegments) ? (
                pathSegments.map((segment, index, array) => (
                  <div key={segment} className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1.5 px-1.5 py-1">
                      {getSegmentIcon(segment) && (
                        <span className="text-[#32353C]">
                          {getSegmentIcon(segment)}
                        </span>
                      )}
                      <span className="font-russo text-[10px] font-medium tracking-wide text-[#32353C] uppercase">
                        {segment}
                      </span>
                    </div>
                    {index < array.length - 1 && (
                      <LuChevronRight size={14} className="text-[#32353C]" />
                    )}
                  </div>
                ))
              ) : (
                <span className="font-mono text-[11px] font-medium tracking-wider text-neutral-200/50 uppercase">
                  {pathSegments}
                </span>
              )}
            </div>
          </div>

          {/* Center section - GridControl and Zen Mode */}
          <div className="absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:flex items-center gap-3">
            <GridControl />
            {/* Zen Mode Toggle - Only show on dashboard */}
            {isDashboard && (
              <ZenModeToggle
                isZenMode={isZenMode}
                hasBeenAccessed={hasBeenAccessed}
                onToggle={handleZenModeToggle}
              />
            )}
          </div>

          {/* Right section - Connection Status */}
          <div className="relative flex items-center gap-4">
            <div className="relative">
              <ConnectionBadge isConnected={isConnected} />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
