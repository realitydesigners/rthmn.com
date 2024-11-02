'use client';
import type React from 'react';
import { outfit, kodeMono } from '@/fonts';
import type { Box, BoxSlice } from '@/types';
import { useState, useEffect, useRef } from 'react';
import {
  getAnimationSequence,
  sequences,
  createDemoStep,
  createMockBoxData
} from '@/app/_components/constants';
import { motion, AnimatePresence } from 'framer-motion';
import { MotionDiv } from '@/components/MotionDiv';

const POINT_OF_CHANGE_INDEX = 29;
const PAUSE_DURATION = 5000;
const BOX_COUNT = 8;
const BASE_VALUES = [2000, 1732, 1500, 1299, 1125, 974, 843, 730];

interface BoxComponentProps {
  slice: BoxSlice | null;
}

interface ScanningBlock {
  x: number;
  y: number;
  z: number;
  value: number;
  isActive: boolean;
}

const ScanningGrid = ({ sequence, currentIndex }) => {
  const gridSize = 8;
  const spacing = 40;
  const scanningBlocks: ScanningBlock[] = [];

  // Create 3D grid from sequence data
  sequence[currentIndex]?.positions.forEach((pos, i) => {
    const x = (pos.position % gridSize) * spacing;
    const y = Math.floor(pos.position / gridSize) * spacing;
    const z = pos.boxNumber * spacing;

    scanningBlocks.push({
      x,
      y,
      z,
      value: pos.position,
      isActive: pos.isUp
    });
  });

  return (
    <div className="relative h-[500px] w-full overflow-hidden rounded-xl border border-white/5 bg-black/30 p-8">
      {/* 3D Scene Container */}
      <div className="relative h-full w-full overflow-hidden" style={{}}>
        {/* Scanning Effect */}
        <MotionDiv
          className="absolute inset-0 bg-gradient-to-b from-emerald-500/0 via-emerald-500/10 to-emerald-500/0"
          animate={{
            y: ['0%', '100%', '0%']
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear'
          }}
        />

        {/* Grid Lines */}
        <div className="absolute inset-0">
          {[...Array(gridSize + 1)].map((_, i) => (
            <div
              key={`grid-x-${i}`}
              className="absolute left-0 h-px w-full bg-white/5"
              style={{ top: `${(i * 100) / gridSize}%` }}
            />
          ))}
          {[...Array(gridSize + 1)].map((_, i) => (
            <div
              key={`grid-y-${i}`}
              className="absolute top-0 h-full w-px bg-white/5"
              style={{ left: `${(i * 100) / gridSize}%` }}
            />
          ))}
        </div>

        {/* Data Analysis Overlay */}
        <div className="absolute bottom-4 left-4 right-4 rounded-lg border border-white/10 bg-black/40 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className={`text-kodemono text-xs text-emerald-500`}>
              SCANNING BLOCK {currentIndex + 1}
            </div>
            <div className="flex gap-4">
              <div className={`text-kodemono text-xs text-white/40`}>
                Active Nodes: {scanningBlocks.filter((b) => b.isActive).length}
              </div>
              <div className={`text-kodemono text-xs text-white/40`}>
                Pattern Depth: {sequence[currentIndex]?.pattern.length || 0}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SectionTransformer: React.FC<BoxComponentProps> = ({ slice }) => {
  const [demoStep, setDemoStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);
  const totalStepsRef = useRef(sequences.length);

  useEffect(() => {
    if (tableRef.current) {
      const scrollContainer = tableRef.current;
      const currentRow = scrollContainer.querySelector('.current-pattern-row');
      if (currentRow) {
        currentRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [demoStep]);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentPatternIndex = Math.floor(demoStep / 1) % sequences.length;

      if (currentPatternIndex === POINT_OF_CHANGE_INDEX && !isPaused) {
        setIsPaused(true);
        setTimeout(() => {
          setIsPaused(false);
          setDemoStep((prev) => (prev + 1) % totalStepsRef.current);
        }, PAUSE_DURATION);
        return;
      }

      if (!isPaused) {
        setDemoStep((prev) => (prev + 1) % totalStepsRef.current);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [demoStep, isPaused]);

  // Data preparation
  const currentValues = createDemoStep(demoStep, sequences, BASE_VALUES);
  const mockBoxData = createMockBoxData(currentValues);
  const currentSlice = slice || {
    timestamp: new Date().toISOString(),
    boxes: mockBoxData
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-black py-32 lg:px-32">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/[0.03] to-transparent" />
      <div className="relative flex w-full gap-16 px-8">
        {/* Left Column - Copy */}
        <div className="flex-1">
          <div className="sticky top-32">
            <div
              className={`text-kodemono mb-6 text-sm tracking-wider text-emerald-500`}
            >
              FREQUENCY PATTERN ANALYSIS
            </div>
            <h2
              className={`text-outfit relative z-10 mb-8 bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-5xl font-bold leading-tight tracking-tight text-transparent`}
            >
              3D Block Scanning Algorithm
            </h2>
            <p className="mb-8 text-lg leading-relaxed text-white/70">
              Advanced pattern recognition through multi-dimensional block
              scanning. Each block represents a frequency node that adapts to
              market movements, creating a dynamic 3D visualization of complex
              trading patterns.
            </p>
            <div className="grid grid-cols-2 gap-8">
              {[
                { label: 'Scanning Depth', value: '256' },
                { label: 'Block Resolution', value: '0.03ms' },
                { label: 'Pattern Accuracy', value: '94.3%' },
                { label: 'Active Nodes', value: '1,024' }
              ].map((stat, i) => (
                <div key={i}>
                  <div
                    className={`text-kodemono mb-2 text-2xl font-bold text-white/90`}
                  >
                    {stat.value}
                  </div>
                  <div className={`text-kodemono text-sm text-white/40`}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Scanning Visualization */}
        <div className="flex-1">
          <ScanningGrid
            sequence={getAnimationSequence()}
            currentIndex={Math.floor(demoStep / 1) % sequences.length}
          />
        </div>
      </div>
    </section>
  );
};
