'use client';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  color: string;
  className?: string;
  index?: number;
}

const hexToRGBA = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const FlowingRadialEffect = ({ color }: { color: string }) => (
  <div className="absolute inset-0">
    <motion.div
      className="absolute inset-0"
      animate={{
        background: [
          `radial-gradient(circle at 0% 0%, ${hexToRGBA(color, 0.15)} 0%, transparent 50%)`,
          `radial-gradient(circle at 100% 100%, ${hexToRGBA(color, 0.15)} 0%, transparent 50%)`,
          `radial-gradient(circle at 0% 100%, ${hexToRGBA(color, 0.15)} 0%, transparent 50%)`,
          `radial-gradient(circle at 100% 0%, ${hexToRGBA(color, 0.15)} 0%, transparent 50%)`,
          `radial-gradient(circle at 0% 0%, ${hexToRGBA(color, 0.15)} 0%, transparent 50%)`
        ]
      }}
      transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
    />
  </div>
);

const DynamicBackground = ({ color }: { color: string }) => (
  <div className="absolute inset-0">
    <motion.div
      className="absolute inset-0"
      animate={{
        backgroundPosition: ['0% 0%', '100% 100%'],
        opacity: [0.3, 0.5]
      }}
      transition={{ duration: 30, repeat: Infinity, repeatType: 'reverse' }}
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `radial-gradient(circle at center, ${hexToRGBA(color, 0.2)}, transparent)`,
        filter: 'blur-sm(40px)'
      }}
    />
  </div>
);

const BorderHighlight = () => (
  <div className="pointer-events-none absolute inset-0">
    <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent" />
  </div>
);

const GradientOverlay = () => (
  <div className="pointer-events-none absolute inset-0">
    <div className="absolute inset-0 rounded-lg bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03),transparent_30%)]" />
  </div>
);

const HoverEffect = ({ color }: { color: string }) => (
  <div className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100">
    <div
      className="h-full w-full bg-linear-to-br"
      style={{
        backgroundImage: `linear-gradient(to bottom right, ${hexToRGBA(color, 0.1)}, transparent)`
      }}
    />
  </div>
);

export function Card({
  children,
  color = '#22c55e',
  className = '',
  index = 0
}: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: index * 0.2 }}
      className={`group relative overflow-hidden rounded-lg border border-white/10 bg-black/40 p-8 backdrop-blur-md transition-all duration-700 hover:bg-black/50 ${className}`}
    >
      <FlowingRadialEffect color={color} />
      <DynamicBackground color={color} />
      <BorderHighlight />
      <GradientOverlay />
      <div className="relative z-10">{children}</div>
      <HoverEffect color={color} />
    </motion.div>
  );
}
