'use client';
import { MotionDiv } from '../../../components/MotionDiv';
import { TypeAnimation } from 'react-type-animation';
import { ALGORITHM_FEATURES, TECHNICAL_SPECS } from '@/app/_components/text';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useState, useRef } from 'react';

const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden">
    {[...Array(50)].map((_, i) => (
      <MotionDiv
        key={i}
        className="absolute h-1 w-1 rounded-full bg-[#22c55e]"
        initial={{
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          opacity: 0.1
        }}
        animate={{
          y: [null, '-100vh'],
          opacity: [0.1, 0.8, 0.1],
          scale: [1, 1.5, 1]
        }}
        transition={{
          duration: Math.random() * 10 + 10,
          repeat: Infinity,
          ease: 'linear',
          delay: Math.random() * 5
        }}
      />
    ))}
  </div>
);

const AlgorithmExplanation = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 1, 0.3]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1.1, 0.9]);

  return (
    <div ref={containerRef} className="grid grid-cols-2 gap-16">
      <MotionDiv className="space-y-8" style={{ opacity, scale }}>
        <h3 className="text-outfit text-4xl font-bold text-white/90">
          Pattern Recognition Process
        </h3>
        <div className="space-y-4">
          {[
            'Market position analysis',
            'Pattern formation detection',
            'Signal strength calculation',
            'Trend confirmation'
          ].map((step, i) => (
            <MotionDiv
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.2 }}
              className="group flex items-center gap-4"
            >
              <div className="relative flex h-12 w-12 items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-[#22c55e]/10" />
                <div className="absolute inset-0 animate-ping rounded-full bg-[#22c55e]/5" />
                <span className="text-kodemono relative text-lg text-white/60">
                  {i + 1}
                </span>
              </div>
              <span className="text-xl text-white/80 transition-colors duration-300 group-hover:text-white">
                {step}
              </span>
            </MotionDiv>
          ))}
        </div>
      </MotionDiv>

      <MotionDiv
        className="relative overflow-hidden rounded-xl border border-white/10 bg-black/30 p-8 backdrop-blur-lg"
        style={{ opacity, scale }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#22c55e]/5 to-transparent" />
        <div className="relative space-y-6">
          <code className="text-kodemono block text-sm leading-relaxed text-white/60">
            {`// Pattern Recognition Algorithm
function analyzePattern(positions: Position[]) {
  const formations = detectFormations(positions);
  
  return formations.map(formation => {
    const strength = calculateStrength(formation);
    const confidence = validateTrend(strength);
    
    return {
      pattern: formation.type,
      strength,
      confidence,
      signal: deriveSignal(formation)
    };
  });
}`}
          </code>
        </div>
      </MotionDiv>
    </div>
  );
};

// Enhanced TechnicalSpec component
const TechnicalSpec = ({ spec }) => (
  <MotionDiv
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.02] p-8 backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.05]"
  >
    <MotionDiv
      className="absolute inset-0"
      animate={{
        background: [
          'radial-gradient(circle at 0% 0%, #22c55e15 0%, transparent 50%)',
          'radial-gradient(circle at 100% 100%, #22c55e15 0%, transparent 50%)',
          'radial-gradient(circle at 0% 0%, #22c55e15 0%, transparent 50%)'
        ]
      }}
      transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
    />
    <div className="relative z-10 flex flex-col items-center">
      <div className="text-kodemono mb-4 text-4xl font-bold text-white/90">
        {spec.value}
      </div>
      <div className="text-kodemono mb-2 text-lg font-medium text-white/60">
        {spec.label}
      </div>
      <div className="text-center text-sm text-white/40">
        {spec.description}
      </div>
    </div>
  </MotionDiv>
);

export const SectionAlgorithm = () => {
  return (
    <section className="relative overflow-hidden">
      <FloatingParticles />
      {/* Hero Section */}
      <div className="">
        <div className="mx-auto max-w-7xl px-8 pt-32">
          <div className="mb-16 text-center">
            <div className="text-kodemono mb-6 flex items-center justify-center gap-3 text-sm tracking-wider text-white/60">
              <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              ALGORITHMIC ARCHITECTURE
              <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>
            <h2 className="text-outfit text-gray-gradient mb-8 text-7xl font-bold tracking-tight">
              Position-Based
              <br />
              Pattern Recognition
            </h2>
            <TypeAnimation
              sequence={[
                'Analyzing market structure through position-based mathematics.',
                1000,
                'Identifying patterns from multiple market positions.',
                1000,
                'Transforming complexity into clear trading signals.',
                1000
              ]}
              wrapper="p"
              speed={50}
              className="text-kodemono mx-auto max-w-2xl text-lg leading-relaxed text-white/60"
              repeat={Infinity}
            />
          </div>
        </div>
      </div>

      <div className="py-32">
        <div className="mx-auto max-w-7xl px-8">
          <div className="mb-16">
            <h3 className="text-outfit mb-4 text-5xl font-bold text-white/90">
              Technical Specifications
            </h3>
            <p className="text-kodemono max-w-2xl text-lg text-white/60">
              Our algorithm processes market data through multiple layers of
              analysis
            </p>
          </div>
          <div className="grid grid-cols-3 gap-8">
            {TECHNICAL_SPECS.map((spec, index) => (
              <TechnicalSpec key={index} spec={spec} />
            ))}
          </div>
        </div>
      </div>
      {/* Algorithm Explanation */}
      <div className="py-32">
        <div className="mx-auto max-w-7xl px-8">
          <AlgorithmExplanation />
        </div>
      </div>
    </section>
  );
};
