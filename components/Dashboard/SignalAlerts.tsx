import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { FaTimes, FaArrowUp, FaClock, FaCrosshairs } from "react-icons/fa";

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
  const [visibleSignals, setVisibleSignals] = useState<Signal[]>([]);

  useEffect(() => {
    setVisibleSignals(newSignals);
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
      return pattern[0] > 0 ? "Bullish" : "Bearish";
    }
    const positive = pattern.filter((p) => p > 0).length;
    const negative = pattern.filter((p) => p < 0).length;

    if (positive > negative) return "Bullish";
    if (negative > positive) return "Bearish";
    return "Mixed";
  };

  const getPatternColors = (pattern: number[]) => {
    const type = getPatternType(pattern);
    switch (type) {
      case "Bullish":
        return {
          background: "linear-gradient(180deg, #1A2B1A -10.71%, #0F1514 100%)",
          border: "#4EFF6E",
          text: "#4EFF6E",
          badge: "#4EFF6E",
        };
      case "Bearish":
        return {
          background: "linear-gradient(180deg, #2B1A1A -10.71%, #15100F 100%)",
          border: "#FF6E4E",
          text: "#FF6E4E",
          badge: "#FF6E4E",
        };
      default:
        return {
          background: "linear-gradient(180deg, #2B2A1A -10.71%, #15140F 100%)",
          border: "#FFE64E",
          text: "#FFE64E",
          badge: "#FFE64E",
        };
    }
  };

  if (visibleSignals.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4">
      <AnimatePresence mode="popLayout">
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          transition={{
            type: "spring",
            duration: 0.6,
            bounce: 0.25,
          }}
          className="backdrop-blur-md rounded-lg border border-[#111215] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] overflow-hidden"
          style={{
            background:
              "linear-gradient(180deg, #191B1F -10.71%, #131618 100%)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#111215]">
            <div className="flex items-center gap-2">
              <div className="relative">
                <FaArrowUp className="w-3 h-3 text-[#4EFF6E]" />
                <div className="absolute -inset-1 bg-[#4EFF6E] opacity-20 blur-sm rounded-full" />
              </div>
              <span className="font-outfit text-sm font-medium text-white">
                Pattern Detected
              </span>
              <div
                className="px-2 py-1 text-xs font-outfit font-medium text-white rounded-full"
                style={{
                  background:
                    "linear-gradient(180deg, #2C3137 -10.71%, #16191D 100%)",
                  boxShadow: "0px 2px 4px 0px rgba(0, 0, 0, 0.15)",
                }}
              >
                {visibleSignals.length} signal
                {visibleSignals.length !== 1 ? "s" : ""}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {visibleSignals.length > 1 && (
                <button
                  onClick={onClearAll}
                  className="text-xs font-outfit text-[#545963] hover:text-white transition-colors px-2 py-1 rounded hover:bg-[#1C1E23]"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={() => onClearAll()}
                className="text-[#545963] hover:text-white transition-colors p-1 rounded hover:bg-[#1C1E23]"
              >
                <FaTimes className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Signals List */}
          <div className="max-h-48 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <AnimatePresence>
              {visibleSignals.map((signal, index) => {
                const colors = getPatternColors(signal.signal);

                return (
                  <motion.div
                    key={signal.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{
                      delay: index * 0.1,
                      duration: 0.3,
                    }}
                    className="relative group/signal border-b border-[#111215] last:border-b-0"
                  >
                    {/* Progress bar - disabled for debugging */}
                    {/* <motion.div
                       className="absolute bottom-0 left-0 h-0.5 opacity-60"
                       style={{ backgroundColor: colors.border }}
                       initial={{ width: "100%" }}
                       animate={{ width: "0%" }}
                       transition={{ duration: 8, ease: "linear" }}
                       onAnimationComplete={() => onClearSignal(signal.id)}
                     /> */}

                    <div className="flex items-center justify-between p-4 hover:bg-[#1A1D22] transition-colors">
                      <div className="flex items-center gap-3 flex-1">
                        {/* Pair */}
                        <div className="flex items-center gap-2">
                          <FaCrosshairs className="w-3 h-3 text-[#545963]" />
                          <span className="font-outfit text-sm font-bold text-white tracking-wide">
                            {signal.pair}
                          </span>
                          <div
                            className="px-2 py-0.5 text-xs font-outfit font-medium rounded"
                            style={{
                              backgroundColor: `${colors.badge}20`,
                              color: colors.text,
                              border: `1px solid ${colors.border}30`,
                            }}
                          >
                            {getPatternType(signal.signal)}
                          </div>
                        </div>

                        {/* Pattern */}
                        <div className="flex items-center gap-2">
                          <span className="font-outfit text-xs text-[#545963]">
                            Pattern:
                          </span>
                          <span className="font-kodemono text-xs text-white tracking-wider">
                            [{formatPattern(signal.signal)}]
                          </span>
                        </div>
                      </div>

                      {/* Time & Close */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <FaClock className="w-3 h-3 text-[#545963]" />
                          <span className="font-kodemono text-xs text-[#545963] tracking-wider">
                            {formatTime(signal.start_time)}
                          </span>
                        </div>

                        <button
                          onClick={() => onClearSignal(signal.id)}
                          className="opacity-0 group-hover/signal:opacity-100 text-[#545963] hover:text-white transition-all p-1 rounded hover:bg-[#1C1E23]"
                        >
                          <FaTimes className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
