'use client';
import { useState } from 'react';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';
import { INSTRUMENTS, roundToDigits } from '@/utils/instruments';
import { Box } from '@/types/types';

export interface ValidationResult {
    pair: string;
    diffErrors: string[];
}

export const validateHighLowDifference = (pair: string, boxes: Box[]) => {
    const getInstrumentDigits = (pair: string): number => {
        for (const category of Object.values(INSTRUMENTS)) {
            if (pair in category) {
                const instrument = category[pair as keyof typeof category] as { point: number; digits: number };
                return instrument.digits;
            }
        }
        return 5; // Default to 5 digits if not found
    };

    const errors: string[] = [];
    const digits = getInstrumentDigits(pair);

    boxes.forEach((box, index) => {
        // Round using the instrument's specific decimal precision
        const difference = roundToDigits(Math.abs(box.high - box.low), digits);
        const boxValue = roundToDigits(Math.abs(box.value), digits);

        if (difference !== boxValue) {
            errors.push(`Box ${index + 1} high-low difference (${difference.toFixed(digits)}) doesn't match value (${boxValue.toFixed(digits)})`);
        }
    });

    return errors;
};

interface BoxValidationSummaryProps {
    pairs: string[];
    pairData: any;
}

export const BoxValidationSummary = ({ pairs, pairData }: BoxValidationSummaryProps) => {
    const [expandedPairs, setExpandedPairs] = useState<Set<string>>(new Set());

    const validationResults: ValidationResult[] = pairs.map((pair) => {
        const boxes = pairData?.[pair]?.boxes?.[0]?.boxes;
        if (!boxes) return { pair, diffErrors: [] };

        return {
            pair,
            diffErrors: validateHighLowDifference(pair, boxes),
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

    const failingPairs = validationResults.filter((result) => result.diffErrors.length > 0);
    const passingPairs = validationResults.filter((result) => result.diffErrors.length === 0);

    return (
        <div className='mb-6 rounded-lg border border-zinc-800 bg-[#0a0a0a] p-4'>
            <div className='mb-4 flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                    <div className='flex h-6 w-6 items-center justify-center rounded-full bg-green-500/10 text-xs font-medium text-green-400'>{passingPairs.length}</div>
                    <span className='text-sm text-zinc-400'>tests passed</span>
                </div>
                {failingPairs.length > 0 && (
                    <div className='flex items-center gap-3'>
                        <div className='flex h-6 w-6 items-center justify-center rounded-full bg-red-500/10 text-xs font-medium text-red-400'>{failingPairs.length}</div>
                        <span className='text-sm text-zinc-400'>tests failed</span>
                    </div>
                )}
            </div>

            <div className='space-y-2'>
                {validationResults.map(({ pair, diffErrors }) => {
                    const isExpanded = expandedPairs.has(pair);
                    const hasFailed = diffErrors.length > 0;

                    return (
                        <div key={pair} className={`rounded-md border ${hasFailed ? 'border-red-800/30 bg-red-500/5' : 'border-green-800/30 bg-green-500/5'} overflow-hidden`}>
                            <button
                                onClick={() => hasFailed && togglePair(pair)}
                                className={`flex w-full items-center justify-between p-2 ${hasFailed ? 'hover:bg-red-500/10' : ''}`}>
                                <div className='flex items-center gap-3'>
                                    <span className={`text-sm ${hasFailed ? 'text-red-400' : 'text-green-400'}`}>
                                        {hasFailed ? '✕' : '✓'} {pair}
                                    </span>
                                </div>
                                {hasFailed && (
                                    <div className='flex items-center gap-2'>
                                        <span className='text-xs text-zinc-500'>
                                            {diffErrors.length} error{diffErrors.length !== 1 ? 's' : ''}
                                        </span>
                                        {isExpanded ? <IoChevronUp size={14} className='text-zinc-500' /> : <IoChevronDown size={14} className='text-zinc-500' />}
                                    </div>
                                )}
                            </button>
                            {isExpanded && hasFailed && (
                                <div className='border-t border-red-800/30 bg-red-950/20 p-3'>
                                    <ul className='space-y-1 text-xs text-red-400'>
                                        {diffErrors.map((error, idx) => (
                                            <li key={`${pair}-error-${idx}`} className='font-mono'>
                                                {error}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
