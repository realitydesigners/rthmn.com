import { AnimatePresence, motion } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import { FaCheck, FaChevronRight, FaLightbulb, FaQuestionCircle, FaTimes } from 'react-icons/fa';

interface QuizProps {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
}

export default function Quiz({ question, options, correctAnswer, explanation }: QuizProps) {
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);
    const [animateSuccess, setAnimateSuccess] = useState(false);

    const isCorrect = selectedAnswer === correctAnswer;

    useEffect(() => {
        if (hasSubmitted && isCorrect) {
            setAnimateSuccess(true);
        }
    }, [hasSubmitted, isCorrect]);

    const handleSubmit = () => {
        if (selectedAnswer !== null) {
            setHasSubmitted(true);
            setShowExplanation(true);
        }
    };

    const handleReset = () => {
        setSelectedAnswer(null);
        setHasSubmitted(false);
        setShowExplanation(false);
        setAnimateSuccess(false);
    };

    return (
        <div className='flex w-full flex-col items-center justify-center'>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className='relative my-12 overflow-hidden rounded-2xl max-w-2xl bg-black p-0.5 before:absolute before:inset-0 before:rounded-2xl before:bg-[linear-gradient(120deg,transparent_0%,rgba(0,115,230,0)_10%,rgba(0,115,230,0.1)_45%,rgba(0,115,230,0.05)_55%,rgba(0,115,230,0.1)_80%,rgba(0,115,230,0)_90%,transparent_100%)] before:bg-[length:400%_100%] before:animate-[shimmer_12s_linear_infinite] shadow-[0_0_30px_rgba(0,115,230,0.1)] ring-1 ring-white/5'
            >
                {/* Success animation overlay */}
                <AnimatePresence>
                    {animateSuccess && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className='absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm'
                            onAnimationComplete={() => setTimeout(() => setAnimateSuccess(false), 1000)}
                        >
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 1.5, opacity: 0 }}
                                transition={{ duration: 0.5, type: 'spring' }}
                                className='flex h-20 w-20 items-center justify-center rounded-full bg-[#0073E6]/20 backdrop-blur-md'
                            >
                                <FaCheck className='h-10 w-10 text-[#0073E6] drop-shadow-[0_0_8px_rgba(0,115,230,0.5)]' />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className='relative rounded-2xl bg-black p-8'>
                    {/* Decorative elements */}
                    <div className='absolute inset-0 opacity-5'>
                        <svg
                            width='100%'
                            height='100%'
                            className='absolute inset-0'
                            aria-label='Decorative diagonal lines pattern'
                            role='img'
                        >
                            <pattern
                                id='diagonalLines'
                                x='0'
                                y='0'
                                width='12'
                                height='12'
                                patternUnits='userSpaceOnUse'
                            >
                                <path
                                    d='M-1,1 l2,-2 M0,12 l12,-12 M11,13 l2,-2'
                                    stroke='white'
                                    strokeWidth='1'
                                    strokeOpacity='0.2'
                                />
                            </pattern>
                            <rect x='0' y='0' width='100%' height='100%' fill='url(#diagonalLines)' />
                        </svg>
                    </div>
                    <div className='absolute -top-12 -right-12 h-24 w-24 rounded-full bg-gradient-to-br from-white/5 to-transparent opacity-20 blur-2xl' />
                    <div className='absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400 opacity-10 blur-2xl' />

                    {/* Question */}
                    <div className='mb-8'>
                        <div className='mb-4 flex items-center gap-4'>
                            <div className='flex min-h-12 min-w-12 items-center justify-center rounded-xl bg-[#0073E6]/20 text-[#0073E6] shadow-[inset_0_1px_0px_rgba(255,255,255,0.1)]'>
                                <FaQuestionCircle className='h-5 w-5 drop-shadow-[0_0_8px_rgba(0,115,230,0.5)]' />
                            </div>
                            <h3 className='text-xl font-medium text-white'>{question}</h3>
                        </div>
                    </div>

                    {/* Options */}
                    <div className='mb-8 space-y-3'>
                        {options.map((option) => (
                            <motion.button
                                key={`quiz-option-${option}`}
                                whileHover={!hasSubmitted ? { scale: 1.01, y: -2 } : {}}
                                whileTap={!hasSubmitted ? { scale: 0.99 } : {}}
                                onClick={() => !hasSubmitted && setSelectedAnswer(options.indexOf(option))}
                                className={`group relative w-full overflow-hidden rounded-xl transition-all duration-300 ${
                                    hasSubmitted
                                        ? options.indexOf(option) === correctAnswer
                                            ? 'bg-[#0073E6]/10 ring-1 ring-[#0073E6]/20'
                                            : options.indexOf(option) === selectedAnswer
                                              ? 'bg-neutral-800/50 ring-1 ring-neutral-700'
                                              : 'bg-black ring-1 ring-white/5'
                                        : selectedAnswer === options.indexOf(option)
                                          ? 'bg-[#0073E6]/10 ring-1 ring-[#0073E6]/20'
                                          : 'bg-black hover:bg-[#0073E6]/5 ring-1 ring-white/5'
                                }`}
                                disabled={hasSubmitted}
                            >
                                <div className='relative p-4'>
                                    <div className='flex items-center justify-between'>
                                        <span
                                            className={`text-base ${
                                                hasSubmitted
                                                    ? options.indexOf(option) === correctAnswer
                                                        ? 'text-[#0073E6]'
                                                        : options.indexOf(option) === selectedAnswer
                                                          ? 'text-neutral-400'
                                                          : 'text-neutral-400'
                                                    : selectedAnswer === options.indexOf(option)
                                                      ? 'text-white'
                                                      : 'text-neutral-300 group-hover:text-white'
                                            }`}
                                        >
                                            {option}
                                        </span>

                                        {/* Status indicator */}
                                        <div
                                            className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                                                hasSubmitted
                                                    ? options.indexOf(option) === correctAnswer
                                                        ? 'bg-[#0073E6]/20 ring-1 ring-[#0073E6]/20'
                                                        : options.indexOf(option) === selectedAnswer
                                                          ? 'bg-neutral-800 ring-1 ring-neutral-700'
                                                          : 'bg-black/30 ring-1 ring-white/10'
                                                    : selectedAnswer === options.indexOf(option)
                                                      ? 'bg-[#0073E6]/20 ring-1 ring-[#0073E6]/20'
                                                      : 'bg-black/30 ring-1 ring-white/10 opacity-0 group-hover:opacity-100'
                                            }`}
                                        >
                                            {hasSubmitted && options.indexOf(option) === correctAnswer && (
                                                <FaCheck className='h-3.5 w-3.5 text-[#0073E6] drop-shadow-[0_0_5px_rgba(0,115,230,0.5)]' />
                                            )}
                                            {hasSubmitted &&
                                                options.indexOf(option) === selectedAnswer &&
                                                options.indexOf(option) !== correctAnswer && (
                                                    <FaTimes className='h-3.5 w-3.5 text-neutral-400' />
                                                )}
                                            {selectedAnswer === options.indexOf(option) && !hasSubmitted && (
                                                <div className='h-2.5 w-2.5 rounded-full bg-[#0073E6] drop-shadow-[0_0_5px_rgba(0,115,230,0.5)]' />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.button>
                        ))}
                    </div>

                    {/* Submit/Reset Button */}
                    <div className='flex justify-end'>
                        {!hasSubmitted ? (
                            <motion.button
                                whileHover={{ scale: 1.03, y: -2 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={handleSubmit}
                                disabled={selectedAnswer === null}
                                className='group relative flex min-w-[180px] items-center justify-center gap-2.5 rounded-full bg-[#0073E6] px-6 py-3 text-[13px] font-medium text-white transition-all duration-300 hover:bg-[#0066CC] disabled:opacity-50 shadow-[0_0_20px_rgba(0,115,230,0.15)]'
                            >
                                <span className='flex items-center gap-2'>
                                    Check Answer
                                    <FaChevronRight className='h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5' />
                                </span>
                            </motion.button>
                        ) : !isCorrect ? (
                            <motion.button
                                whileHover={{ scale: 1.03, y: -2 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={handleReset}
                                className='group relative flex min-w-[180px] items-center justify-center gap-2.5 rounded-full bg-[#0073E6]/10 px-6 py-3 text-[13px] font-medium text-white transition-all duration-300 hover:bg-[#0073E6]/20 ring-1 ring-[#0073E6]/20'
                            >
                                <span>Try Again</span>
                            </motion.button>
                        ) : null}
                    </div>

                    {/* Result Message */}
                    <AnimatePresence>
                        {hasSubmitted && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3, delay: 0.1 }}
                                className={`mt-4 overflow-hidden rounded-xl ${
                                    isCorrect
                                        ? 'bg-[#0073E6]/10 ring-1 ring-[#0073E6]/20'
                                        : 'bg-neutral-800/50 ring-1 ring-neutral-700'
                                }`}
                            >
                                <div className='p-5'>
                                    <div className='mb-3 flex items-center gap-3'>
                                        <div
                                            className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                                isCorrect
                                                    ? 'bg-[#0073E6]/20 ring-1 ring-[#0073E6]/20'
                                                    : 'bg-neutral-800 ring-1 ring-neutral-700'
                                            }`}
                                        >
                                            {isCorrect ? (
                                                <FaCheck className='h-4 w-4 text-[#0073E6] drop-shadow-[0_0_5px_rgba(0,115,230,0.5)]' />
                                            ) : (
                                                <FaTimes className='h-4 w-4 text-neutral-400' />
                                            )}
                                        </div>
                                        <div>
                                            <p className='text-lg font-medium text-white'>
                                                {isCorrect ? 'Correct!' : 'Not quite right.'}
                                            </p>
                                            {isCorrect && (
                                                <p className='text-sm text-[#0073E6]/70'>
                                                    Great job! You can move on to the next question.
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {explanation && showExplanation && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            transition={{ duration: 0.3, delay: 0.2 }}
                                            className='mt-4 flex items-start gap-3 rounded-lg bg-black/30 p-4 ring-1 ring-white/5'
                                        >
                                            <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#0073E6]/20 ring-1 ring-[#0073E6]/20'>
                                                <FaLightbulb className='h-3.5 w-3.5 text-[#0073E6] drop-shadow-[0_0_5px_rgba(0,115,230,0.5)]' />
                                            </div>
                                            <div>
                                                <p className='mb-1 font-medium text-white'>Explanation</p>
                                                <p className='text-sm text-neutral-300'>{explanation}</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
