import React from 'react';

interface StyleControlProps {
    label?: string;
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step: number;
    unit?: string;
    hideLabel?: boolean;
    preview?: React.ReactNode;
}

export const StyleControl: React.FC<StyleControlProps> = ({ label, value, onChange, min, max, step, unit = '', hideLabel = false, preview }) => {
    const percentage = ((value - min) / (max - min)) * 100;

    return (
        <div className='space-y-2'>
            {!hideLabel && (
                <div className='flex items-center justify-between px-1'>
                    <div className='space-y-1'>
                        <label className='text-[10px] font-medium tracking-wider text-white/50 uppercase'>{label}</label>
                    </div>
                    <div className='flex items-center gap-2'>
                        <span className='font-mono text-sm text-white/90'>{step < 1 ? value.toFixed(2) : value}</span>
                        {unit && <span className='font-mono text-[10px] tracking-wider text-white/30'>{unit}</span>}
                    </div>
                </div>
            )}
            <div className='group relative'>
                {preview && <div className='mb-2 h-12 rounded-lg border border-white/[0.08]'>{preview}</div>}
                <div className='absolute inset-y-0 left-0 flex w-full items-center px-3'>
                    <div className='relative h-[2px] w-full bg-white/[0.08]'>
                        <div className='absolute h-full bg-white/20' style={{ width: `${percentage}%` }} />
                        <div className='absolute h-full bg-white/30' style={{ width: `${percentage}%` }} />
                    </div>
                </div>
                <input
                    type='range'
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onChange(parseFloat(e.target.value))}
                    className='relative h-8 w-full cursor-pointer appearance-none rounded-lg bg-transparent transition-all hover:cursor-grab active:cursor-grabbing'
                    style={
                        {
                            '--thumb-size': '16px',
                            '--thumb-color': '#fff',
                        } as React.CSSProperties
                    }
                />
                <style jsx global>{`
                    input[type='range']::-webkit-slider-thumb {
                        -webkit-appearance: none;
                        height: var(--thumb-size);
                        width: var(--thumb-size);
                        border-radius: 50%;
                        background: var(--thumb-color);
                        box-shadow: 0 0 15px rgba(255, 255, 255, 0.15);
                        border: 2px solid rgba(255, 255, 255, 0.2);
                        cursor: grab;
                        transition: all 0.15s ease;
                    }
                    input[type='range']::-webkit-slider-thumb:hover {
                        transform: scale(1.1);
                        box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
                        border-color: rgba(255, 255, 255, 0.3);
                    }
                    input[type='range']::-webkit-slider-thumb:active {
                        cursor: grabbing;
                        transform: scale(0.95);
                    }
                `}</style>
            </div>
        </div>
    );
};
