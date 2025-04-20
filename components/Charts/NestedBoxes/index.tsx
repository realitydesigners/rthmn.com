import type { CSSProperties } from 'react';
import { useMemo } from 'react';
import type { Box } from '@/types/types';

interface NestedBoxesProps {
    boxes: Box[];
    demoStep?: number;
    isPaused?: boolean;
    isPointOfChange?: boolean;
    maxSize?: number;
    baseSize?: number;
    colorScheme?: 'green-red' | 'white-gradient';
    showLabels?: boolean;
    mode?: 'animated' | 'static';
    containerClassName?: string;
    showPriceLines?: boolean;
    boxColors?: {
        positive?: string;
        negative?: string;
        styles?: {
            opacity?: number;
            shadowIntensity?: number;
            borderRadius?: number;
            showBorder?: boolean;
        };
    };
}

const defaultColors = {
    positive: '#3FFFA2', // Green
    negative: '#FF5959', // Darker Green
    styles: {
        borderRadius: 0,
        shadowIntensity: 1,
        opacity: 0.4,
        showBorder: true,
        globalTimeframeControl: false,
        showLineChart: false,
        perspective: false,
        viewMode: 'default',
    },
};

export const NestedBoxes = ({
    boxes,
    demoStep = 0,
    isPaused = false,
    isPointOfChange = false,
    maxSize: providedMaxSize,
    baseSize = 400,
    colorScheme = 'white-gradient',
    showLabels = false,
    mode = 'animated',
    containerClassName = '',
    showPriceLines = false,
    boxColors: propBoxColors,
}: NestedBoxesProps) => {
    if (!boxes || boxes.length === 0) return null;

    const maxSize = providedMaxSize || Math.abs(boxes[0].value);
    const colors = { ...defaultColors, ...propBoxColors };

    const renderBox = (box: Box, index: number, prevBox: Box | null = null) => {
        const isFirstDifferent = prevBox && ((prevBox.value > 0 && box.value < 0) || (prevBox.value < 0 && box.value > 0));

        const boxStyles = useMemo(() => {
            const baseColor = box.value > 0 ? colors.positive : colors.negative;
            const opacity = colors.styles.opacity;
            const shadowIntensity = colors.styles.shadowIntensity;
            const shadowY = Math.floor(shadowIntensity * 16);
            const shadowBlur = Math.floor(shadowIntensity * 80);
            const shadowColor = (alpha: number) => baseColor.replace(')', `, ${alpha})`);

            return {
                baseColor,
                opacity,
                shadowY,
                shadowBlur,
                shadowColor,
                borderRadius: `${colors.styles.borderRadius}px`,
                shadowIntensity,
            };
        }, [box.value]);

        const size = (Math.abs(box.value) / maxSize) * baseSize;
        const basePosition = prevBox
            ? isFirstDifferent
                ? prevBox.value > 0
                    ? { top: 0, right: 0 }
                    : { bottom: 0, right: 0 }
                : box.value > 0
                  ? { top: 0, right: 0 }
                  : { bottom: 0, right: 0 }
            : { top: 0, right: 0 };

        const style: CSSProperties = {
            width: `${size}px`,
            height: `${size}px`,
            ...basePosition,
            margin: colors.styles.showBorder ? '-1px' : '0',
            borderRadius: boxStyles.borderRadius,
            borderWidth: colors.styles.showBorder ? '1px' : '0',
            border: colors.styles.showBorder ? '1px solid rgba(0, 0, 0, 0.3)' : 'none',
            transition: 'all 0.15s ease-out',
            position: 'absolute',
            ...(mode === 'animated' && isPaused
                ? {
                      transform: `translateX(${index * 3}px) translateY(${index * 2}px)`,
                      transition: 'all 0.8s cubic-bezier(0.8, 0, 0.2, 1)',
                  }
                : {}),
        };

        return (
            <div key={`box-${index}-${box.value}-${mode === 'animated' ? demoStep : ''}`} className='absolute' style={style}>
                {/* Base shadow layer */}

                {/* Main gradient layer */}
                <div
                    className='absolute inset-0'
                    style={{
                        borderRadius: boxStyles.borderRadius,
                        background: `linear-gradient(to bottom right, ${boxStyles.baseColor.replace(')', `, ${boxStyles.opacity}`)} 100%, transparent 100%)`,
                        opacity: boxStyles.opacity,
                        transition: 'all 0.15s ease-out',
                    }}
                />

                {/* First different highlight with extra glow */}
                {isFirstDifferent && (
                    <div
                        className='absolute inset-0'
                        style={{
                            borderRadius: boxStyles.borderRadius,
                            backgroundColor: boxStyles.baseColor,
                            opacity: boxStyles.opacity * 1,
                            boxShadow: `inset 0 2px 15px ${boxStyles.shadowColor(0.5)}`,
                            transition: 'all 0.15s ease-out',
                        }}
                    />
                )}

                {/* Labels */}
                {showLabels && (
                    <div className={`absolute -right-20 flex items-center ${box.value > 0 ? '-bottom-[5px]' : '-top-[5px]'}`}>
                        <div className='h-[1px] w-8' style={{ backgroundColor: boxStyles.baseColor }}></div>
                        <div className='ml-2 font-mono text-[12px]' style={{ color: boxStyles.baseColor }}>
                            {Math.abs(box.value)}
                        </div>
                    </div>
                )}

                {index < boxes.length - 1 && renderBox(boxes[index + 1], index + 1, box)}
            </div>
        );
    };

    return <div className={`min-h-[200px] w-full ${containerClassName}`}>{renderBox(boxes[0], 0)}</div>;
};
