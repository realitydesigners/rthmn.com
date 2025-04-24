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
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="relative my-12 overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-900/10 to-indigo-800/5 p-0.5 backdrop-blur-lg before:absolute before:inset-0 before:-z-10 before:translate-y-[60%] before:transform before:rounded-full before:bg-indigo-500/20 before:opacity-20 before:blur-3xl before:content-['']"
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
                            className='flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 backdrop-blur-md'
                        >
                            <FaCheck className='h-10 w-10 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className='relative rounded-[14px] bg-black/30 p-8 backdrop-blur-sm'>
                {/* Decorative elements */}
                <div className='absolute -top-12 -right-12 h-24 w-24 rounded-full bg-gradient-to-br from-white/5 to-transparent opacity-20 blur-2xl'></div>
                <div className='absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400 opacity-10 blur-2xl'></div>

                {/* Question */}
                <div className='mb-8'>
                    <div className='mb-4 flex items-center gap-4'>
                        <div className='relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-400 p-0.5'>
                            <div className='absolute inset-0 bg-black/30 backdrop-blur-sm'></div>
                            <div className='relative z-10 flex h-full w-full items-center justify-center rounded-[10px] bg-black/60'>
                                <FaQuestionCircle className='h-5 w-5 text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]' />
                            </div>
                        </div>
                        <h3 className='bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-xl font-bold tracking-tight text-transparent'>
                            {question}
                        </h3>
                    </div>
                </div>

                {/* Options */}
                <div className='mb-8 space-y-3'>
                    {options.map((option, index) => (
                        <motion.button
                            key={index}
                            whileHover={!hasSubmitted ? { scale: 1.01, y: -2 } : {}}
                            whileTap={!hasSubmitted ? { scale: 0.99 } : {}}
                            onClick={() => !hasSubmitted && setSelectedAnswer(index)}
                            className={`group relative w-full overflow-hidden rounded-xl border p-0.5 transition-all duration-300 ${
                                hasSubmitted
                                    ? index === correctAnswer
                                        ? 'border-emerald-500/30 bg-gradient-to-r from-emerald-500/20 to-emerald-400/10'
                                        : index === selectedAnswer
                                          ? 'border-rose-500/30 bg-gradient-to-r from-rose-500/20 to-rose-400/10'
                                          : 'border-white/5 bg-white/5'
                                    : selectedAnswer === index
                                      ? 'border-indigo-500/50 bg-gradient-to-r from-indigo-500/20 to-indigo-400/10'
                                      : 'border-white/5 bg-black/20 hover:border-indigo-400/30 hover:bg-indigo-500/10'
                            }`}
                            disabled={hasSubmitted}
                        >
                            {/* Option inner content */}
                            <div className='relative rounded-[10px] bg-black/40 p-4 backdrop-blur-sm'>
                                <div className='flex items-center justify-between'>
                                    <span
                                        className={`text-base ${
                                            hasSubmitted
                                                ? index === correctAnswer
                                                    ? 'text-emerald-300'
                                                    : index === selectedAnswer
                                                      ? 'text-rose-300'
                                                      : 'text-neutral-400'
                                                : selectedAnswer === index
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
                                                ? index === correctAnswer
                                                    ? 'border border-emerald-500/30 bg-emerald-500/20'
                                                    : index === selectedAnswer
                                                      ? 'border border-rose-500/30 bg-rose-500/20'
                                                      : 'border border-white/10 bg-black/30'
                                                : selectedAnswer === index
                                                  ? 'border border-indigo-500/30 bg-indigo-500/20'
                                                  : 'border border-white/10 bg-black/30 opacity-0 group-hover:opacity-100'
                                        }`}
                                    >
                                        {hasSubmitted && index === correctAnswer && (
                                            <FaCheck className='h-3.5 w-3.5 text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]' />
                                        )}
                                        {hasSubmitted && index === selectedAnswer && index !== correctAnswer && (
                                            <FaTimes className='h-3.5 w-3.5 text-rose-400 drop-shadow-[0_0_5px_rgba(251,113,133,0.5)]' />
                                        )}
                                        {selectedAnswer === index && !hasSubmitted && (
                                            <div className='h-2.5 w-2.5 rounded-full bg-indigo-400 drop-shadow-[0_0_5px_rgba(129,140,248,0.5)]'></div>
                                        )}
                                    </div>
                                </div>

                                {/* Highlight bar for correct/selected answers */}
                                {(hasSubmitted && (index === correctAnswer || index === selectedAnswer)) ||
                                (!hasSubmitted && selectedAnswer === index) ? (
                                    <div
                                        className={`absolute bottom-0 left-0 h-[2px] w-full ${
                                            hasSubmitted
                                                ? index === correctAnswer
                                                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                                                    : 'bg-gradient-to-r from-rose-500 to-rose-400'
                                                : 'bg-gradient-to-r from-indigo-500 to-indigo-400'
                                        }`}
                                    ></div>
                                ) : null}
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
                            className='relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 p-0.5 font-medium text-white shadow-lg transition-all disabled:opacity-50'
                        >
                            <div className='relative rounded-[10px] bg-black/20 px-6 py-3 backdrop-blur-sm'>
                                <span className='relative z-10 flex items-center gap-2'>
                                    Check Answer
                                    <FaChevronRight className='h-3 w-3' />
                                </span>
                            </div>
                            <div className='absolute inset-0 -z-10 bg-gradient-to-r from-indigo-600 to-indigo-500 opacity-0 transition-opacity duration-300 hover:opacity-100'></div>
                        </motion.button>
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.03, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={handleReset}
                            className='relative overflow-hidden rounded-xl border border-indigo-400/20 p-0.5 font-medium text-white transition-all'
                        >
                            <div className='relative rounded-[10px] bg-black/20 px-6 py-3 backdrop-blur-sm'>
                                <span className='relative z-10'>Try Again</span>
                            </div>
                            <div className='absolute inset-0 -z-10 bg-gradient-to-r from-indigo-500/20 to-indigo-400/10 opacity-0 transition-opacity duration-300 hover:opacity-100'></div>
                        </motion.button>
                    )}
                </div>

                {/* Result Message */}
                <AnimatePresence>
                    {hasSubmitted && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className={`mt-8 overflow-hidden rounded-xl border p-0.5 ${
                                isCorrect
                                    ? 'border-emerald-500/20 bg-gradient-to-r from-emerald-500/20 to-emerald-400/10'
                                    : 'border-rose-500/20 bg-gradient-to-r from-rose-500/20 to-rose-400/10'
                            }`}
                        >
                            <div className='rounded-[10px] bg-black/40 p-5 backdrop-blur-sm'>
                                <div className='mb-3 flex items-center gap-3'>
                                    <div
                                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                            isCorrect
                                                ? 'border border-emerald-500/30 bg-emerald-500/20'
                                                : 'border border-rose-500/30 bg-rose-500/20'
                                        }`}
                                    >
                                        {isCorrect ? (
                                            <FaCheck className='h-4 w-4 text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]' />
                                        ) : (
                                            <FaTimes className='h-4 w-4 text-rose-400 drop-shadow-[0_0_5px_rgba(251,113,133,0.5)]' />
                                        )}
                                    </div>
                                    <p className='text-lg font-medium'>{isCorrect ? 'Correct!' : 'Not quite right.'}</p>
                                </div>

                                {explanation && showExplanation && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        transition={{ duration: 0.3, delay: 0.2 }}
                                        className='mt-4 flex items-start gap-3 rounded-lg border border-white/5 bg-black/30 p-4 backdrop-blur-sm'
                                    >
                                        <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/20'>
                                            <FaLightbulb className='h-3.5 w-3.5 text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]' />
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
    );
}
