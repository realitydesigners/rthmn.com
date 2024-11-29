'use client';
import React, { useState } from 'react';
import { LuChevronRight, LuPipette } from 'react-icons/lu';
import { useDashboard } from '@/providers/DashboardProvider';
import { colorPresets } from '@/utils/colorPresets';
import { BoxColors } from '@/utils/localStorage';
import { cn } from '@/utils/cn';

type SettingsSection = 'colors' | 'boxStyles' | null;

interface SettingsBarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const MenuButton = ({
  label,
  isActive,
  onClick
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={cn(
      'flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm font-medium transition-all',
      isActive
        ? 'bg-[#1A1A1A] text-white shadow-lg'
        : 'text-gray-400 hover:bg-[#1A1A1A]/50'
    )}
  >
    <span>{label}</span>
    <LuChevronRight
      className={cn(
        'transition-transform duration-200',
        isActive && 'rotate-90'
      )}
      size={16}
    />
  </button>
);

const ColorPresetButton = ({
  preset,
  isSelected,
  onClick
}: {
  preset: { name: string; positive: string; negative: string };
  isSelected: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={cn(
      'group relative flex h-12 w-full items-center gap-3 rounded-lg border border-[#222] bg-[#141414] p-2 text-left transition-all hover:border-[#333] hover:bg-[#1A1A1A]',
      isSelected &&
        'border-emerald-500/30 shadow-[0_0_15px_rgba(52,211,153,0.1)]'
    )}
  >
    <div className="flex gap-2">
      <div
        className="h-8 w-8 rounded-md shadow-md transition-transform group-hover:scale-105"
        style={{ backgroundColor: preset.positive }}
      />
      <div
        className="h-8 w-8 rounded-md shadow-md transition-transform group-hover:scale-105"
        style={{ backgroundColor: preset.negative }}
      />
    </div>
    <span className="text-sm text-gray-400 group-hover:text-gray-300">
      {preset.name}
    </span>
    {isSelected && (
      <div className="absolute top-1/2 right-3 -translate-y-1/2">
        <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
      </div>
    )}
  </button>
);

const ColorPicker = ({
  label,
  color,
  onChange
}: {
  label: string;
  color: string;
  onChange: (color: string) => void;
}) => (
  <div className="group flex items-center justify-between rounded-lg border border-[#222] bg-[#141414] p-3 transition-all hover:border-[#333] hover:bg-[#1A1A1A]">
    <div className="flex items-center gap-3">
      <div className="relative">
        <div
          className="h-8 w-8 rounded-md shadow-md transition-all group-hover:scale-105"
          style={{ backgroundColor: color }}
        />
        <LuPipette className="absolute -right-1 -bottom-1 h-4 w-4 text-gray-400" />
      </div>
      <span className="text-sm text-gray-400 group-hover:text-gray-300">
        {label}
      </span>
    </div>
    <input
      type="color"
      value={color}
      onChange={(e) => onChange(e.target.value)}
      className="invisible absolute h-8 w-8 cursor-pointer group-hover:visible"
    />
  </div>
);

const StyleControl = ({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit = ''
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <label className="text-xs font-medium text-gray-400">{label}</label>
        <span className="font-mono text-xs font-medium text-emerald-500">
          {step < 1 ? value.toFixed(2) : value}
          {unit}
        </span>
      </div>
      <div className="group relative">
        <div className="absolute inset-y-0 left-0 flex w-full items-center px-3">
          <div className="relative h-1 w-full rounded-full bg-[#222]">
            <div
              className="absolute h-full rounded-full bg-emerald-500/30"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="relative h-8 w-full cursor-pointer appearance-none rounded-lg bg-transparent transition-all"
        />
      </div>
    </div>
  );
};

export const SettingsBar: React.FC<SettingsBarProps> = ({
  isOpen,
  onToggle
}) => {
  const { boxColors, updateBoxColors } = useDashboard();
  const [activeSection, setActiveSection] = useState<SettingsSection>(null);

  const handleStyleChange = (
    property: keyof BoxColors['styles'],
    value: number
  ) => {
    updateBoxColors({
      ...boxColors,
      styles: {
        ...boxColors.styles,
        [property]: value
      }
    });
  };

  return (
    <div className="flex h-[calc(100vh-120px)] flex-col space-y-1 overflow-y-auto p-4">
      <MenuButton
        label="Colors"
        isActive={activeSection === 'colors'}
        onClick={() =>
          setActiveSection(activeSection === 'colors' ? null : 'colors')
        }
      />

      {activeSection === 'colors' && (
        <div className="space-y-4 px-2 py-3">
          <div className="space-y-2">
            <ColorPicker
              label="Positive Color"
              color={boxColors.positive}
              onChange={(color) =>
                updateBoxColors({
                  ...boxColors,
                  positive: color
                })
              }
            />
            <ColorPicker
              label="Negative Color"
              color={boxColors.negative}
              onChange={(color) =>
                updateBoxColors({
                  ...boxColors,
                  negative: color
                })
              }
            />
          </div>

          <div className="relative py-3">
            <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[#222]" />
          </div>

          <div className="space-y-1">
            <p className="px-1 text-xs font-medium text-gray-500">
              Color Presets
            </p>
            <div className="grid grid-cols-1 gap-2">
              {colorPresets.map((preset) => (
                <ColorPresetButton
                  key={preset.name}
                  preset={preset}
                  isSelected={
                    boxColors.positive === preset.positive &&
                    boxColors.negative === preset.negative
                  }
                  onClick={() => {
                    updateBoxColors({
                      ...boxColors,
                      positive: preset.positive,
                      negative: preset.negative
                    });
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <MenuButton
        label="Box Styles"
        isActive={activeSection === 'boxStyles'}
        onClick={() =>
          setActiveSection(activeSection === 'boxStyles' ? null : 'boxStyles')
        }
      />

      {activeSection === 'boxStyles' && (
        <div className="space-y-6 px-2 py-3">
          <StyleControl
            label="Border Radius"
            value={boxColors.styles?.borderRadius ?? 8}
            onChange={(value) => handleStyleChange('borderRadius', value)}
            min={0}
            max={16}
            step={1}
            unit="px"
          />
          <StyleControl
            label="Pattern Length"
            value={boxColors.styles?.maxBoxCount ?? 10}
            onChange={(value) => handleStyleChange('maxBoxCount', value)}
            min={2}
            max={38}
            step={1}
            unit=" boxes"
          />
          <StyleControl
            label="Shadow Depth"
            value={boxColors.styles?.shadowIntensity ?? 0.25}
            onChange={(value) => handleStyleChange('shadowIntensity', value)}
            min={0}
            max={1}
            step={0.05}
          />
        </div>
      )}
    </div>
  );
};
