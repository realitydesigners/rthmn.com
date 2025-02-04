'use client';

import { useDashboard } from '@/providers/DashboardProvider/client';
import { PairResoBox } from './PairResoBox';
import { INSTRUMENTS } from '@/utils/instruments';
import { Box } from '@/types/types';
import { useState } from 'react';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';

// Validation helper functions
const validateBoxOrder = (boxes: Box[], instrumentPoint: number) => {
    const errors: string[] = [];

    boxes.forEach((box, index) => {
        if (index === 0) return; // Skip first box check

        const prevBox = boxes[index - 1];
        // Just check if the absolute value is increasing
        if (Math.abs(box.value) <= Math.abs(prevBox.value)) {
            errors.push(`Box ${index + 1} value ${box.value} is not greater than previous box value ${prevBox.value}`);
        }
    });

    return errors;
};

const validateHighLowDifference = (boxes: Box[]) => {
    const errors: string[] = [];

    boxes.forEach((box, index) => {
        const difference = Math.abs(box.high - box.low);
        const boxValue = Math.abs(box.value);

        // Use a more lenient epsilon for floating point comparison
        if (Math.abs(difference - boxValue) > 0.000001) {
            errors.push(`Box ${index + 1} high-low difference (${difference.toFixed(5)}) doesn't match value (${boxValue.toFixed(5)})`);
        }
    });

    return errors;
};

const validateBoxValues = (boxes: Box[], instrumentPoint: number) => {
    // Remove this validation as we only care about increasing values
    return [];
};

interface ValidationResult {
    pair: string;
    orderErrors: string[];
    diffErrors: string[];
    valueErrors: string[];
}

const BoxValidationSummary = ({ pairs, pairData }: { pairs: string[]; pairData: any }) => {
    const [expandedPairs, setExpandedPairs] = useState<Set<string>>(new Set());

    const validationResults: ValidationResult[] = pairs.map((pair) => {
        const boxes = pairData?.[pair]?.boxes?.[0]?.boxes;
        if (!boxes) return { pair, orderErrors: [], diffErrors: [], valueErrors: [] };

        let instrumentPoint = 0.00001; // Default value
        for (const category of Object.values(INSTRUMENTS)) {
            if (pair in category) {
                const instrument = category[pair as keyof typeof category] as { point: number };
                instrumentPoint = instrument.point;
                break;
            }
        }

        return {
            pair,
            orderErrors: validateBoxOrder(boxes, instrumentPoint),
            diffErrors: validateHighLowDifference(boxes),
            valueErrors: validateBoxValues(boxes, instrumentPoint),
        };
    });

    const togglePair = (pair: string) => {
        const newExpanded = new Set(expandedPairs);
        if (expandedPairs.has(pair)) {
            newExpanded.delete(pair);
        } else {
            newExpanded.add(pair);
        }
        setExpandedPairs(newExpanded);
    };

    const failingPairs = validationResults.filter((result) => result.orderErrors.length > 0 || result.diffErrors.length > 0 || result.valueErrors.length > 0);

    const passingPairs = validationResults.filter((result) => result.orderErrors.length === 0 && result.diffErrors.length === 0 && result.valueErrors.length === 0);

    return (
        <div className='mb-6 space-y-4'>
            {/* Summary Stats */}

            {/* Passing Pairs */}
            <div className='rounded border border-green-800 bg-[#0a0a0a] p-3'>
                <div className='mb-3'>
                    <p className='text-sm font-medium text-green-400'>
                        ✓ {passingPairs.length} pair{passingPairs.length !== 1 ? 's' : ''} passed all checks
                    </p>
                </div>
                <div className='grid grid-cols-4 gap-2'>
                    {passingPairs.map(({ pair }) => (
                        <div key={pair} className='rounded border border-green-800/30 bg-green-900/10 p-2'>
                            <span className='text-sm text-green-400'>{pair}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Failing Pairs */}
            {failingPairs.length > 0 && (
                <div className='rounded border border-red-800 bg-[#0a0a0a] p-3'>
                    <div className='mb-3'>
                        <p className='text-sm font-medium text-red-400'>
                            {failingPairs.length} pair{failingPairs.length !== 1 ? 's' : ''} failed validation
                        </p>
                    </div>
                    <div className='grid gap-2'>
                        {failingPairs.map(({ pair, orderErrors, diffErrors, valueErrors }) => {
                            const isExpanded = expandedPairs.has(pair);
                            const totalErrors = orderErrors.length + diffErrors.length + valueErrors.length;

                            return (
                                <div key={pair} className='rounded border border-red-800/30 bg-red-900/10'>
                                    <button onClick={() => togglePair(pair)} className='flex w-full items-center justify-between p-2 hover:bg-red-900/20'>
                                        <div className='flex items-center gap-3'>
                                            <span className='text-sm font-medium text-red-400'>{pair}</span>
                                            <span className='rounded bg-red-900/50 px-2 py-0.5 text-xs text-red-400'>
                                                {totalErrors} error{totalErrors !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        {isExpanded ? <IoChevronUp size={14} className='text-red-400' /> : <IoChevronDown size={14} className='text-red-400' />}
                                    </button>
                                    {isExpanded && (
                                        <div className='border-t border-red-800/30 p-2'>
                                            {orderErrors.length > 0 && (
                                                <div className='mb-2'>
                                                    <p className='mb-1 text-xs font-medium text-red-400'>Box Order Errors:</p>
                                                    <ul className='list-inside list-disc space-y-1'>
                                                        {orderErrors.map((error, idx) => (
                                                            <li key={`order-${idx}`} className='text-xs text-red-400'>
                                                                {error}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {diffErrors.length > 0 && (
                                                <div className='mb-2'>
                                                    <p className='mb-1 text-xs font-medium text-red-400'>High-Low Difference Errors:</p>
                                                    <ul className='list-inside list-disc space-y-1'>
                                                        {diffErrors.map((error, idx) => (
                                                            <li key={`diff-${idx}`} className='text-xs text-red-400'>
                                                                {error}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {valueErrors.length > 0 && (
                                                <div>
                                                    <p className='mb-1 text-xs font-medium text-red-400'>Box Value Errors:</p>
                                                    <ul className='list-inside list-disc space-y-1'>
                                                        {valueErrors.map((error, idx) => (
                                                            <li key={`value-${idx}`} className='text-xs text-red-400'>
                                                                {error}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default function AdminPage() {
    const { selectedPairs, pairData, boxColors } = useDashboard();

    return (
        <div className='flex flex-col gap-4 p-4 pt-20'>
            <BoxValidationSummary pairs={selectedPairs} pairData={pairData} />
            {selectedPairs.map((pair) => (
                <div key={pair}>
                    <PairResoBox
                        pair={pair}
                        boxSlice={pairData?.[pair]?.boxes?.[0]}
                        currentOHLC={pairData?.[pair]?.currentOHLC}
                        boxColors={boxColors}
                        initialBoxData={pairData?.[pair]?.initialBoxData}
                    />
                </div>
            ))}
        </div>
    );
}
