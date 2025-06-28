import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  FaTimes,
  FaArrowUp,
  FaClock,
  FaCrosshairs,
  FaBell,
} from "react-icons/fa";

interface Signal {
  id: string;
  pair: string;
  signal: number[];
  boxes: number[];
  start_time: string;
  created_at: string;
}

interface SignalAlertsProps {
  newSignals: Signal[];
  onClearSignal: (signalId: string) => void;
  onClearAll: () => void;
}

export function SignalAlerts({
  newSignals,
  onClearSignal,
  onClearAll,
}: SignalAlertsProps) {
  const [currentSignal, setCurrentSignal] = useState<Signal | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Show only the most recent signal
  useEffect(() => {
    if (newSignals.length > 0) {
      // Get the most recent signal
      const mostRecent = newSignals.sort((a, b) => {
        const timeA = new Date(a.created_at || a.start_time).getTime();
        const timeB = new Date(b.created_at || b.start_time).getTime();
        return timeB - timeA;
      })[0];

      setCurrentSignal(mostRecent);
      setIsVisible(true);

      // Auto-hide after 1 minute
      const timer = setTimeout(() => {
        handleDismiss();
      }, 60000);

      return () => clearTimeout(timer);
    } else {
      setCurrentSignal(null);
      setIsVisible(false);
    }
  }, [newSignals]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatPattern = (pattern: number[]) => {
    return pattern.join(", ");
  };

  const getPatternType = (pattern: number[]) => {
    if (pattern.length === 1) {
      return pattern[0] > 0 ? "Buy" : "Sell";
    }
    const positive = pattern.filter((p) => p > 0).length;
    const negative = pattern.filter((p) => p < 0).length;

    if (positive > negative) return " ";
    if (negative > positive) return "Sell";
    return "Mixed";
  };

  const getPatternColors = (pattern: number[]) => {
    const type = getPatternType(pattern);
    switch (type) {
      case "Buy":
        return {
          background: "linear-gradient(180deg, #1A2B1A -10.71%, #0F1514 100%)",
          border: "#4EFF6E",
          text: "#4EFF6E",
          badge: "#4EFF6E",
          glow: "rgba(78, 255, 110, 0.2)",
        };
      case "Sell":
        return {
          background: "linear-gradient(180deg, #2B1A1A -10.71%, #15100F 100%)",
          border: "#FF6E4E",
          text: "#FF6E4E",
          badge: "#FF6E4E",
          glow: "rgba(255, 110, 78, 0.2)",
        };
      default:
        return {
          background: "linear-gradient(180deg, #2B2A1A -10.71%, #15140F 100%)",
          border: "#FFE64E",
          text: "#FFE64E",
          badge: "#FFE64E",
          glow: "rgba(255, 230, 78, 0.2)",
        };
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (currentSignal) {
        onClearSignal(currentSignal.id);
      }
    }, 300); // Wait for exit animation
  };

  if (!currentSignal || !isVisible) return null;

  const colors = getPatternColors(currentSignal.signal);

  // Only render on client side to avoid SSR issues
  if (typeof window === "undefined") return null;

  return createPortal(
    <div
      className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none"
      style={{ position: "fixed" }}
    >
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -100, scale: 0.95 }}
            transition={{
              type: "spring",
              duration: 0.6,
              bounce: 0.25,
            }}
            className="mx-auto mt-14 w-full max-w-md px-4 pointer-events-auto"
          >
            <div
              className="relative overflow-hidden rounded-lg border backdrop-blur-md"
              style={{
                background: colors.background,
                borderColor: `${colors.border}40`,
                boxShadow: `0px 8px 25px 0px rgba(0,0,0,0.4), 0px 4px 12px 0px ${colors.glow}`,
              }}
            >
              {/* Animated border glow */}
              <div
                className="absolute inset-0 rounded-lg opacity-30"
                style={{
                  background: `linear-gradient(90deg, transparent, ${colors.border}40, transparent)`,
                  animation: "shimmer 2s infinite",
                }}
              />

              {/* Progress bar */}
              <motion.div
                className="absolute top-0 left-0 h-0.5 rounded-full"
                style={{ backgroundColor: colors.border }}
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 60, ease: "linear" }}
              />

              {/* Header */}
              <div className="relative p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Animated notification icon */}
                    <div className="relative">
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          rotate: [0, 10, -10, 0],
                        }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          repeatDelay: 2,
                        }}
                      >
                        <FaBell
                          className="w-4 h-4"
                          style={{ color: colors.text }}
                        />
                      </motion.div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-outfit text-sm font-medium text-white">
                        Pattern Alert
                      </span>
                      <div
                        className="px-2 py-0.5 text-xs font-outfit font-medium rounded-full"
                        style={{
                          backgroundColor: `${colors.badge}20`,
                          color: colors.text,
                          border: `1px solid ${colors.border}30`,
                        }}
                      >
                        {getPatternType(currentSignal.signal)}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleDismiss}
                    className="text-[#545963] hover:text-white transition-colors p-1 rounded hover:bg-white/10"
                  >
                    <FaTimes className="w-3 h-3" />
                  </button>
                </div>

                {/* Signal Content */}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Pair */}
                    <div className="flex items-center gap-2">
                      <FaCrosshairs className="w-3 h-3 text-[#545963]" />
                      <span className="font-outfit text-base font-bold text-white tracking-wide">
                        {currentSignal.pair}
                      </span>
                    </div>

                    {/* Pattern */}
                    <div className="flex items-center gap-2">
                      <span className="font-outfit text-xs text-[#545963]">
                        Pattern:
                      </span>
                      <span
                        className="font-kodemono text-sm font-medium tracking-wider px-2 py-1 rounded"
                        style={{
                          color: colors.text,
                          backgroundColor: `${colors.border}10`,
                          border: `1px solid ${colors.border}20`,
                        }}
                      >
                        [{formatPattern(currentSignal.signal)}]
                      </span>
                    </div>
                  </div>

                  {/* Time */}
                  <div className="flex items-center gap-1.5">
                    <FaClock className="w-3 h-3 text-[#545963]" />
                    <span className="font-kodemono text-xs text-[#545963] tracking-wider">
                      {formatTime(currentSignal.start_time)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add shimmer animation styles */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>,
    document.body
  );
}
