import React, { useState } from 'react';
import { FaCheck, FaTimes, FaQuestionCircle } from 'react-icons/fa';

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

    const isCorrect = selectedAnswer === correctAnswer;

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
    };

    return (
        <div className='my-8 rounded-xl border border-white/10 bg-white/5 p-6'>
            {/* Question */}
            <div className='mb-6'>
                <div className='mb-2 flex items-center gap-3'>
                    <FaQuestionCircle className='h-5 w-5 text-emerald-400' />
                    <h3 className='text-lg font-semibold text-white'>{question}</h3>
                </div>
            </div>

            {/* Options */}
            <div className='mb-6 space-y-3'>
                {options.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => !hasSubmitted && setSelectedAnswer(index)}
                        className={`w-full rounded-lg border p-4 text-left transition-all ${
                            hasSubmitted
                                ? index === correctAnswer
                                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                                    : index === selectedAnswer
                                      ? 'border-red-500 bg-red-500/10 text-red-400'
                                      : 'border-white/10 bg-white/5 text-gray-400'
                                : selectedAnswer === index
                                  ? 'border-emerald-500/50 bg-emerald-500/5 text-white'
                                  : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:bg-white/10 hover:text-white'
                        }`}
                        disabled={hasSubmitted}>
                        <div className='flex items-center justify-between'>
                            <span>{option}</span>
                            {hasSubmitted && index === correctAnswer && <FaCheck className='h-4 w-4 text-emerald-400' />}
                            {hasSubmitted && index === selectedAnswer && index !== correctAnswer && <FaTimes className='h-4 w-4 text-red-400' />}
                        </div>
                    </button>
                ))}
            </div>

            {/* Submit/Reset Button */}
            <div className='flex justify-end'>
                {!hasSubmitted ? (
                    <button
                        onClick={handleSubmit}
                        disabled={selectedAnswer === null}
                        className='rounded-lg bg-emerald-500 px-4 py-2 font-medium text-white transition-all hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500'>
                        Check Answer
                    </button>
                ) : (
                    <button onClick={handleReset} className='rounded-lg border border-white/10 bg-white/5 px-4 py-2 font-medium text-white transition-all hover:bg-white/10'>
                        Try Again
                    </button>
                )}
            </div>

            {/* Result Message */}
            {hasSubmitted && (
                <div
                    className={`mt-6 rounded-lg border p-4 ${
                        isCorrect ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' : 'border-red-500/20 bg-red-500/5 text-red-400'
                    }`}>
                    <p className='font-medium'>{isCorrect ? '🎉 Correct!' : '❌ Not quite right.'}</p>
                    {explanation && showExplanation && <p className='mt-2 text-sm text-gray-400'>{explanation}</p>}
                </div>
            )}
        </div>
    );
}
