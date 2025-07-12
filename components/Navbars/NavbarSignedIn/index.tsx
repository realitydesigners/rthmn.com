"use client";
import { useZenModeStore } from "@/stores/zenModeStore";
import { cn } from "@/utils/cn";
import type { User } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LuChevronRight, LuLayoutDashboard, LuOrbit } from "react-icons/lu";

const ZenModeToggle = ({
  isZenMode,
  hasBeenAccessed,
  onToggle,
}: {
  isZenMode: boolean;
  hasBeenAccessed: boolean;
  onToggle: () => void;
}) => (
  <div className="group relative flex items-center ">
    {isZenMode && (
      <div
        className="absolute  top-1/2 -translate-y-1/2 z-10"
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
        onClick={onToggle}
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

export const NavbarSignedIn = () => {
  const pathname = usePathname();
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
          <div className="relative flex items-center ">
            <div className="flex items-center justify-center lg:w-16">
              <Link href="/dashboard" className="relative flex items-center">
                <div className="flex h-14 w-14 items-center p-2 mr-2">
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

          <div className="relative flex items-center ">
            <div className="relative flex items-center mr-2">
              {isDashboard && (
                <ZenModeToggle
                  isZenMode={isZenMode}
                  hasBeenAccessed={hasBeenAccessed}
                  onToggle={handleZenModeToggle}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
