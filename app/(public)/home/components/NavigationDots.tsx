'use client';
import { useState } from 'react';
import { Buttons } from '../config';
import { motion } from 'framer-motion';

interface NavigationDotsProps {
  currentSection: string;
  onButtonClick: (sectionId: string) => void;
}

export const NavigationDots: React.FC<NavigationDotsProps> = ({
  currentSection,
  onButtonClick
}) => {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  return (
    <div className="fixed bottom-8 left-1/2 z-[1000] flex -translate-x-1/2 flex-row items-center gap-6">
      {Buttons.map((button) => (
        <div key={button.sectionId} className="group relative">
          {/* Outer ring */}
          <motion.div
            className={`absolute -inset-1 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-sm transition-opacity duration-300 ${
              currentSection === button.sectionId ? 'opacity-100' : 'opacity-0'
            }`}
            layoutId="activeRing"
          />

          {/* Dot button */}
          <button
            onClick={() => onButtonClick(button.sectionId)}
            onMouseEnter={() => setHoveredButton(button.sectionId)}
            onMouseLeave={() => setHoveredButton(null)}
            className={`relative h-3 w-3 rounded-full transition-all duration-300 ${
              currentSection === button.sectionId
                ? 'bg-gradient-to-r from-blue-500 to-blue-400 shadow-lg shadow-blue-500/50'
                : 'bg-gray-600 hover:bg-gray-500'
            } before:absolute before:inset-0 before:rounded-full before:ring-2 before:ring-blue-400/20 before:transition-all before:duration-300 group-hover:before:ring-4 group-hover:before:ring-blue-400/30`}
            aria-label={`Navigate to ${button.name}`}
          >
            {currentSection === button.sectionId && (
              <motion.div
                className="absolute inset-0 rounded-full bg-blue-400/20"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            )}
          </button>

          {/* Label that appears on hover */}
          <div
            className={`absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-lg bg-gray-900/90 px-3 py-1.5 backdrop-blur-sm transition-all duration-200 ${
              hoveredButton === button.sectionId
                ? 'translate-y-0 opacity-100'
                : 'translate-y-1 opacity-0'
            } before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-t-gray-900/90`}
          >
            <span className="text-sm font-medium text-white">
              {button.name}
            </span>
          </div>

          {/* Active indicator line */}
          {currentSection === button.sectionId && (
            <motion.div
              layoutId="activeLine"
              className="absolute -bottom-2 left-1/2 h-0.5 w-8 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-blue-400"
            />
          )}
        </div>
      ))}
    </div>
  );
};
