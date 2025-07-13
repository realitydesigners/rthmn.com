import type React from "react";
import { BsBoxArrowInDown, BsBoxArrowInUp, BsBoxes } from "react-icons/bs";
import { RiBarChartBoxLine } from "react-icons/ri";
import { TbChartCandle, TbChartLine } from "react-icons/tb";
import { HiMagnifyingGlass } from "react-icons/hi2";
import { cn } from "@/utils/cn";

interface ChartControlsProps {
  chartType: "candle" | "line";
  setChartType: (type: "candle" | "line") => void;
  showBoxLevels: boolean;
  setShowBoxLevels: (show: boolean) => void;
  boxVisibilityFilter: "all" | "positive" | "negative";
  setBoxVisibilityFilter: (filter: "all" | "positive" | "negative") => void;
  zoomLevel: number;
  setZoomLevel: (level: number) => void;
  currentPrice?: string | number;
  pair: string;
}

const ChartControls: React.FC<ChartControlsProps> = ({
  chartType,
  setChartType,
  showBoxLevels,
  setShowBoxLevels,
  boxVisibilityFilter,
  setBoxVisibilityFilter,
  zoomLevel,
  setZoomLevel,
  currentPrice,
  pair,
}) => {
  const zoomLevels = [10, 20, 50, 100];
  const currentIndex = zoomLevels.indexOf(zoomLevel);

  const handleZoomIn = () => {
    if (currentIndex > 0) {
      setZoomLevel(zoomLevels[currentIndex - 1]);
    }
  };

  const handleZoomOut = () => {
    if (currentIndex < zoomLevels.length - 1) {
      setZoomLevel(zoomLevels[currentIndex + 1]);
    }
  };
  return (
    <div
      className="flex flex-col gap-2 p-2 rounded-2xl border backdrop-blur-md shadow-lg shadow-black/40"
      style={{
        background: "linear-gradient(180deg, #1A1D22 -10.71%, #0D0F12 100%)",
        border: "1px solid #16181C",
        boxShadow:
          "0px 12px 40px rgba(0, 0, 0, 0.6), 0px 8px 16px rgba(0, 0, 0, 0.4), 0px 4px 8px rgba(0, 0, 0, 0.25), inset 0px 1px 0px rgba(255, 255, 255, 0.02)",
      }}
    >
      {/* Chart Type Toggle */}
      <button
        onClick={() => setChartType(chartType === "candle" ? "line" : "candle")}
        className={cn(
          "group relative overflow-hidden w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ease-out",
          "text-[#B0B0B0] hover:text-white"
        )}
        style={{
          background: "linear-gradient(180deg, #0A0B0D 0%, #070809 100%)",
          boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.05)",
        }}
      >
        <div
          className={cn(
            "absolute inset-0 transition-all duration-300 rounded-xl",
            "opacity-0 group-hover:opacity-100"
          )}
          style={{
            background: "linear-gradient(180deg, #16181C 0%, #1C1E23 100%)",
            boxShadow:
              "inset 0 2px 4px rgba(0, 0, 0, 0.6), inset 0 -1px 0 rgba(255, 255, 255, 0.1)",
          }}
        />
        {chartType === "candle" ? (
          <TbChartCandle className="w-5 h-5 relative z-10 transition-colors duration-200 text-white" />
        ) : (
          <TbChartLine className="w-5 h-5 relative z-10 transition-colors duration-200 text-white" />
        )}
      </button>

      {/* Zoom Controls */}
      <div className="flex flex-col gap-1">
        <button
          onClick={handleZoomIn}
          disabled={currentIndex === 0}
          className={cn(
            "group relative overflow-hidden w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ease-out",
            currentIndex === 0
              ? "text-[#606060] cursor-not-allowed"
              : "text-[#B0B0B0] hover:text-white"
          )}
          style={{
            background: "linear-gradient(180deg, #0A0B0D 0%, #070809 100%)",
            boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.05)",
            opacity: currentIndex === 0 ? 0.5 : 1,
          }}
        >
          <div
            className={cn(
              "absolute inset-0 transition-all duration-300 rounded-xl",
              currentIndex === 0
                ? "opacity-0"
                : "opacity-0 group-hover:opacity-100"
            )}
            style={{
              background: "linear-gradient(180deg, #16181C 0%, #1C1E23 100%)",
              boxShadow:
                "inset 0 2px 4px rgba(0, 0, 0, 0.6), inset 0 -1px 0 rgba(255, 255, 255, 0.1)",
            }}
          />
          <HiMagnifyingGlass className="w-4 h-4 relative z-10 transition-colors duration-200" />
          <span className="absolute -top-1 -right-1 text-xs font-mono text-white/70 bg-black/70 px-1 rounded">
            +
          </span>
        </button>

        <button
          onClick={handleZoomOut}
          disabled={currentIndex === zoomLevels.length - 1}
          className={cn(
            "group relative overflow-hidden w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ease-out",
            currentIndex === zoomLevels.length - 1
              ? "text-[#606060] cursor-not-allowed"
              : "text-[#B0B0B0] hover:text-white"
          )}
          style={{
            background: "linear-gradient(180deg, #0A0B0D 0%, #070809 100%)",
            boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.05)",
            opacity: currentIndex === zoomLevels.length - 1 ? 0.5 : 1,
          }}
        >
          <div
            className={cn(
              "absolute inset-0 transition-all duration-300 rounded-xl",
              currentIndex === zoomLevels.length - 1
                ? "opacity-0"
                : "opacity-0 group-hover:opacity-100"
            )}
            style={{
              background: "linear-gradient(180deg, #16181C 0%, #1C1E23 100%)",
              boxShadow:
                "inset 0 2px 4px rgba(0, 0, 0, 0.6), inset 0 -1px 0 rgba(255, 255, 255, 0.1)",
            }}
          />
          <HiMagnifyingGlass className="w-4 h-4 relative z-10 transition-colors duration-200" />
          <span className="absolute -top-1 -right-1 text-xs font-mono text-white/70 bg-black/70 px-1 rounded">
            -
          </span>
        </button>
      </div>

      {/* Zoom Level Display */}
      <div className="w-10 h-6 rounded-lg bg-black/50 flex items-center justify-center">
        <span className="text-xs font-mono text-white/70">{zoomLevel}</span>
      </div>

      {/* Box Levels Toggle */}
      <button
        onClick={() => setShowBoxLevels(!showBoxLevels)}
        className={cn(
          "group relative overflow-hidden w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ease-out",
          !showBoxLevels && "text-[#B0B0B0] hover:text-white",
          showBoxLevels && ""
        )}
        style={{
          background: showBoxLevels
            ? "linear-gradient(180deg, #1A1D22 -10.71%, #0D0F12 100%)"
            : "linear-gradient(180deg, #0A0B0D 0%, #070809 100%)",
          boxShadow: showBoxLevels
            ? "0px 12px 40px rgba(0, 0, 0, 0.6), 0px 8px 16px rgba(0, 0, 0, 0.4), 0px 4px 8px rgba(0, 0, 0, 0.25), inset 0px 1px 0px rgba(255, 255, 255, 0.02)"
            : "inset 0 1px 0 rgba(255, 255, 255, 0.05)",
        }}
      >
        <div
          className={cn(
            "absolute inset-0 transition-all duration-300 rounded-xl",
            showBoxLevels ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
          style={{
            background: "linear-gradient(180deg, #16181C 0%, #1C1E23 100%)",
            boxShadow:
              "inset 0 2px 4px rgba(0, 0, 0, 0.6), inset 0 -1px 0 rgba(255, 255, 255, 0.1)",
          }}
        />
        <RiBarChartBoxLine
          className={cn(
            "w-5 h-5 relative z-10 transition-colors duration-200",
            showBoxLevels ? "text-white" : ""
          )}
        />
      </button>

      {/* Box Visibility Filters */}
      {showBoxLevels && (
        <>
          <button
            onClick={() => setBoxVisibilityFilter("all")}
            className={cn(
              "group relative overflow-hidden w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ease-out",
              boxVisibilityFilter !== "all" && "text-[#B0B0B0] hover:text-white"
            )}
            style={{
              background:
                boxVisibilityFilter === "all"
                  ? "linear-gradient(180deg, #1A1D22 -10.71%, #0D0F12 100%)"
                  : "linear-gradient(180deg, #0A0B0D 0%, #070809 100%)",
              boxShadow:
                boxVisibilityFilter === "all"
                  ? "0px 12px 40px rgba(0, 0, 0, 0.6), 0px 8px 16px rgba(0, 0, 0, 0.4), 0px 4px 8px rgba(0, 0, 0, 0.25), inset 0px 1px 0px rgba(255, 255, 255, 0.02)"
                  : "inset 0 1px 0 rgba(255, 255, 255, 0.05)",
            }}
          >
            <div
              className={cn(
                "absolute inset-0 transition-all duration-300 rounded-xl",
                boxVisibilityFilter === "all"
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100"
              )}
              style={{
                background: "linear-gradient(180deg, #16181C 0%, #1C1E23 100%)",
                boxShadow:
                  "inset 0 2px 4px rgba(0, 0, 0, 0.6), inset 0 -1px 0 rgba(255, 255, 255, 0.1)",
              }}
            />
            <BsBoxes
              className={cn(
                "w-5 h-5 relative z-10 transition-colors duration-200",
                boxVisibilityFilter === "all" ? "text-white" : ""
              )}
            />
          </button>

          <button
            onClick={() => setBoxVisibilityFilter("positive")}
            className={cn(
              "group relative overflow-hidden w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ease-out",
              boxVisibilityFilter !== "positive" &&
                "text-[#B0B0B0] hover:text-white"
            )}
            style={{
              background:
                boxVisibilityFilter === "positive"
                  ? "linear-gradient(180deg, #1A1D22 -10.71%, #0D0F12 100%)"
                  : "linear-gradient(180deg, #0A0B0D 0%, #070809 100%)",
              boxShadow:
                boxVisibilityFilter === "positive"
                  ? "0px 12px 40px rgba(0, 0, 0, 0.6), 0px 8px 16px rgba(0, 0, 0, 0.4), 0px 4px 8px rgba(0, 0, 0, 0.25), inset 0px 1px 0px rgba(255, 255, 255, 0.02)"
                  : "inset 0 1px 0 rgba(255, 255, 255, 0.05)",
            }}
          >
            <div
              className={cn(
                "absolute inset-0 transition-all duration-300 rounded-xl",
                boxVisibilityFilter === "positive"
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100"
              )}
              style={{
                background: "linear-gradient(180deg, #16181C 0%, #1C1E23 100%)",
                boxShadow:
                  "inset 0 2px 4px rgba(0, 0, 0, 0.6), inset 0 -1px 0 rgba(255, 255, 255, 0.1)",
              }}
            />
            <BsBoxArrowInUp
              className={cn(
                "w-5 h-5 relative z-10 transition-colors duration-200",
                boxVisibilityFilter === "positive" ? "text-white" : ""
              )}
            />
          </button>

          <button
            onClick={() => setBoxVisibilityFilter("negative")}
            className={cn(
              "group relative overflow-hidden w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ease-out",
              boxVisibilityFilter !== "negative" &&
                "text-[#B0B0B0] hover:text-white"
            )}
            style={{
              background:
                boxVisibilityFilter === "negative"
                  ? "linear-gradient(180deg, #1A1D22 -10.71%, #0D0F12 100%)"
                  : "linear-gradient(180deg, #0A0B0D 0%, #070809 100%)",
              boxShadow:
                boxVisibilityFilter === "negative"
                  ? "0px 12px 40px rgba(0, 0, 0, 0.6), 0px 8px 16px rgba(0, 0, 0, 0.4), 0px 4px 8px rgba(0, 0, 0, 0.25), inset 0px 1px 0px rgba(255, 255, 255, 0.02)"
                  : "inset 0 1px 0 rgba(255, 255, 255, 0.05)",
            }}
          >
            <div
              className={cn(
                "absolute inset-0 transition-all duration-300 rounded-xl",
                boxVisibilityFilter === "negative"
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100"
              )}
              style={{
                background: "linear-gradient(180deg, #16181C 0%, #1C1E23 100%)",
                boxShadow:
                  "inset 0 2px 4px rgba(0, 0, 0, 0.6), inset 0 -1px 0 rgba(255, 255, 255, 0.1)",
              }}
            />
            <BsBoxArrowInDown
              className={cn(
                "w-5 h-5 relative z-10 transition-colors duration-200",
                boxVisibilityFilter === "negative" ? "text-white" : ""
              )}
            />
          </button>
        </>
      )}
    </div>
  );
};

export default ChartControls;
