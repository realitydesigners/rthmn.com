'use client';
import { MotionDiv } from '@/components/MotionDiv';
import { ReactNode } from 'react';

interface GlowingCardProps {
  children?: ReactNode;
  color?: string;
  className?: string;
  index?: number;
  belief?: {
    title: string;
    description: string;
    icon: React.ElementType;
    keyPoints: string[];
    stats: {
      value: string;
      label: string;
    };
    tags: string[];
  };
}

const hexToRGBA = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export function GlowingCard({
  color = '#22c55e',
  className = '',
  index = 0,
  belief
}: GlowingCardProps) {
  const IconComponent = belief.icon;

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: index * 0.2 }}
      className={`group relative isolate overflow-hidden rounded-3xl bg-black/40 backdrop-blur-xl ${className}`}
    >
      {/* Background Glow */}
      <div
        className="absolute inset-0 opacity-25 transition-opacity duration-500 group-hover:opacity-40"
        style={{
          background: `
            radial-gradient(
              circle at 50% 0%, 
              ${color}, 
              transparent 70%
            )
          `
        }}
      />

      <div className="relative z-10 flex flex-col gap-6 p-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-3xl font-bold text-transparent">
              {belief.title}
            </h3>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 p-3 backdrop-blur-sm">
            <IconComponent className="h-8 w-8 text-white/80" />
          </div>
        </div>

        {/* Highlight Quote */}
        {/* <blockquote className="border-l-2 border-white/10 pl-4 font-mono text-sm italic text-white/40">
          "{belief.highlight}"
        </blockquote> */}

        {/* Description */}
        <p className="font-mono text-sm leading-relaxed text-white/60">
          {belief.description}
        </p>

        {/* Key Points */}
        <div className="flex flex-wrap gap-2">
          {belief.keyPoints.map((point, i) => (
            <span
              key={i}
              className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/70 backdrop-blur-sm"
            >
              {point}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-auto flex items-end justify-between border-t border-white/5 pt-6">
          <div>
            <div className="text-3xl font-bold text-white">
              {belief.stats.value}
            </div>
            <div className="text-sm text-white/40">{belief.stats.label}</div>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            {belief.tags.map((tag, i) => (
              <span
                key={i}
                className="rounded bg-white/[0.03] px-2 py-1 text-xs text-white/40 backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Border Glow */}
      <div className="absolute inset-0 rounded-3xl border border-white/10 transition-colors duration-500 group-hover:border-white/20" />
    </MotionDiv>
  );
}
