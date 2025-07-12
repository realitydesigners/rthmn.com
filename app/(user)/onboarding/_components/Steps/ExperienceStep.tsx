"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { LuBrain, LuGraduationCap, LuLineChart } from "react-icons/lu";

interface Props {
  experience: string;
  setExperience: (experience: string) => void;
}

const experiences = [
  {
    id: "beginner",
    icon: LuBrain,
    title: "Beginner",
    description: "I'm new to trading or have less than a year of experience",
  },
  {
    id: "intermediate",
    icon: LuGraduationCap,
    title: "Intermediate",
    description: "I have 1-3 years of trading experience",
  },
  {
    id: "advanced",
    icon: LuLineChart,
    title: "Advanced",
    description: "I have more than 3 years of trading experience",
  },
];

export default function ExperienceStep({ experience, setExperience }: Props) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="space-y-2">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-russo text-2xl sm:text-3xl font-bold text-white"
        >
          Trading Experience
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-kodemono text-sm sm:text-base text-white/60"
        >
          Help us personalize your experience by telling us about your trading
          background.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid gap-3 sm:gap-4"
      >
        {experiences.map((level, index) => {
          const Icon = level.icon;
          const isSelected = experience === level.id;
          const isHovered = hoveredCard === level.id;

          return (
            <motion.button
              key={level.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              onClick={() => setExperience(level.id)}
              onMouseEnter={() => setHoveredCard(level.id)}
              onMouseLeave={() => setHoveredCard(null)}
              className="group relative w-full overflow-hidden transition-all duration-300"
              style={{
                borderRadius: "12px",
                background:
                  "linear-gradient(180deg, #0F1114 -10.71%, #080A0D 100%)",
                border: isSelected
                  ? "1px solid #24FF66/50"
                  : "1px solid #16181C",
              }}
            >
              <div
                className="absolute -inset-px rounded-xl opacity-30"
                style={{
                  background:
                    "linear-gradient(180deg, #32353C/20 0%, transparent 50%)",
                  filter: "blur(0.5px)",
                }}
              />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#4EFF6E]/15 to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-black/20 to-transparent" />
              <div
                className="pointer-events-none absolute inset-0 opacity-10"
                style={{
                  borderRadius: "12px",
                  background:
                    "linear-gradient(180deg, #32353C/15 0%, transparent 50%)",
                }}
              />

              <div
                className="pointer-events-none absolute inset-0 rounded-xl"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.1) 100%)",
                }}
              />
              <div
                className={`absolute inset-0 bg-gradient-to-b transition-opacity duration-300 ${
                  isSelected
                    ? "from-[#24FF66]/10 to-transparent opacity-100"
                    : isHovered
                      ? "from-[#24FF66]/5 to-transparent opacity-100"
                      : "from-[#24FF66]/5 to-transparent opacity-0"
                }`}
                style={{
                  borderRadius: "12px",
                }}
              />
              <div className="relative flex items-start gap-3 sm:gap-4 rounded-xl p-3 sm:p-4">
                <div
                  className={`rounded-lg p-2.5 sm:p-3 transition-colors duration-300 ${
                    isSelected
                      ? "bg-[#24FF66]/20 text-[#24FF66]"
                      : isHovered
                        ? "bg-[#1C1E23] text-white/80"
                        : "bg-[#1C1E23] text-white/60"
                  }`}
                >
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="flex-1 text-left">
                  <div
                    className={`font-russo mb-1 text-sm sm:text-base font-medium transition-colors duration-300 ${isSelected ? "text-white" : "text-white/80"}`}
                  >
                    {level.title}
                  </div>
                  <div
                    className={`font-outfit pr-6  text-xs sm:text-sm transition-colors duration-300 ${isSelected ? "text-white/70" : "text-white/60"}`}
                  >
                    {level.description}
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
