"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

interface BackgroundProps {
  className?: string;
}

// Define gradient themes for different sections
const sectionThemes = {
  hero: {
    colors: ["#1a4040", "#2d4040", "#1a2040"],
    accents: ["#4EFF6E", "#10b981", "#06b6d4"],
  },
  boxes3d: {
    colors: ["#0B1426", "#1A0B26", "#0A1B1A"],
    accents: ["#3b82f6", "#8b5cf6", "#10b981"],
  },
  instruments: {
    colors: ["#1a1a2e", "#16213e", "#0f3460"],
    accents: ["#06b6d4", "#3b82f6", "#8b5cf6"],
  },
  pricing: {
    colors: ["#2d1b69", "#1a1a2e", "#16213e"],
    accents: ["#8b5cf6", "#ec4899", "#f59e0b"],
  },
  faq: {
    colors: ["#1a2e1a", "#2d1b40", "#1a1a2e"],
    accents: ["#10b981", "#06b6d4", "#3b82f6"],
  },
  cta: {
    colors: ["#2d1b40", "#1a2040", "#0B1426"],
    accents: ["#ec4899", "#8b5cf6", "#3b82f6"],
  },
};

export const Background = ({ className = "" }: BackgroundProps) => {
  const [currentSection, setCurrentSection] =
    useState<keyof typeof sectionThemes>("hero");
  const { scrollY } = useScroll();

  // Detect which section is currently in view
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;

      // Define section boundaries (adjust these based on your actual sections)
      if (scrollPosition < windowHeight * 0.5) {
        setCurrentSection("hero");
      } else if (scrollPosition < windowHeight * 1.5) {
        setCurrentSection("boxes3d");
      } else if (scrollPosition < windowHeight * 2.5) {
        setCurrentSection("instruments");
      } else if (scrollPosition < windowHeight * 3.5) {
        setCurrentSection("pricing");
      } else if (scrollPosition < windowHeight * 4.5) {
        setCurrentSection("faq");
      } else {
        setCurrentSection("cta");
      }
    };

    const unsubscribe = scrollY.onChange(handleScroll);
    handleScroll(); // Initial call

    return unsubscribe;
  }, [scrollY]);

  const currentTheme = sectionThemes[currentSection];

  // Animated gradient transitions
  const gradientOpacity = useTransform(scrollY, [0, 100], [0.6, 0.8]);

  return (
    <div className={`fixed inset-0 z-0 ${className}`}>
      {/* Black base background */}
      <div className="absolute inset-0 bg-black" />

      {/* Center lighting effect */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1200px] rounded-full blur-3xl opacity-40"
        style={{
          background: `radial-gradient(ellipse, ${currentTheme.colors[0]}80, ${currentTheme.colors[1]}60 40%, transparent 65%)`,
        }}
        animate={{
          background: `radial-gradient(ellipse, ${currentTheme.colors[0]}80, ${currentTheme.colors[1]}60 40%, transparent 65%)`,
        }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />

      {/* Accent lights */}
      <motion.div className="absolute inset-0" style={{ opacity: 0.3 }}>
        {/* Top left accent light */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-[500px] h-[700px] rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, ${currentTheme.accents[0]}60, transparent 50%)`,
          }}
          animate={{
            background: `radial-gradient(circle, ${currentTheme.accents[0]}60, transparent 50%)`,
          }}
          transition={{ duration: 3, ease: "easeInOut" }}
        />

        {/* Bottom right accent light */}
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[450px] h-[650px] rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, ${currentTheme.accents[1]}50, transparent 50%)`,
          }}
          animate={{
            background: `radial-gradient(circle, ${currentTheme.accents[1]}50, transparent 50%)`,
          }}
          transition={{ duration: 3, ease: "easeInOut", delay: 0.5 }}
        />

        {/* Top right accent light */}
        <motion.div
          className="absolute top-1/3 right-1/3 w-[400px] h-[600px] rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, ${currentTheme.accents[2]}45, transparent 50%)`,
          }}
          animate={{
            background: `radial-gradient(circle, ${currentTheme.accents[2]}45, transparent 50%)`,
          }}
          transition={{ duration: 3, ease: "easeInOut", delay: 1 }}
        />
      </motion.div>

      {/* Vignette effect to keep edges dark */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/40" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />

      {/* Moving light sweep */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full blur-3xl opacity-25"
        style={{
          background: `linear-gradient(90deg, transparent, ${currentTheme.accents[0]}40, transparent)`,
        }}
        animate={{
          background: `linear-gradient(90deg, transparent, ${currentTheme.accents[0]}40, transparent)`,
          x: [-150, 150, -150],
        }}
        transition={{
          background: { duration: 2, ease: "easeInOut" },
          x: { duration: 12, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, ${currentTheme.accents[0]}80 1px, transparent 0)`,
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
};
