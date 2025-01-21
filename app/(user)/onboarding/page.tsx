'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ProfileUpload from './ProfileUpload';
import ExperienceStep from './ExperienceStep';
import PairsStep from './PairsStep';

export default function OnboardingPage() {
    const [step, setStep] = useState(1);
    const [experience, setExperience] = useState('');
    const [selectedPairs, setSelectedPairs] = useState<string[]>([]);
    const router = useRouter();

    const handleNext = async () => {
        if (step === 3) {
            try {
                // Save to localStorage
                localStorage.setItem('trading_experience', experience);
                localStorage.setItem('selected_pairs', JSON.stringify(selectedPairs));
                localStorage.setItem('has_completed_onboarding', 'true');

                router.push('/dashboard');
            } catch (error) {
                console.error('Error saving preferences:', error);
                alert('Failed to save your preferences. Please try again.');
            }
        } else {
            setStep(step + 1);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return <ProfileUpload />;
            case 2:
                return <ExperienceStep experience={experience} setExperience={setExperience} />;
            case 3:
                return <PairsStep selectedPairs={selectedPairs} setSelectedPairs={setSelectedPairs} />;
            default:
                return null;
        }
    };

    return (
        <div className='flex min-h-screen items-center justify-center bg-black p-4'>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`relative w-full ${step === 3 ? 'max-w-4xl' : 'max-w-md'} rounded-2xl border border-[#222] bg-gradient-to-b from-[#141414] via-[#111] to-[#0A0A0A] p-8 shadow-2xl before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:bg-[radial-gradient(circle_at_50%_-20%,rgba(255,255,255,0.05),rgba(255,255,255,0))]`}>
                {/* Progress indicator */}
                <div className='absolute -top-3 left-1/2 -translate-x-1/2'>
                    <div className='flex items-center gap-2 rounded-full border border-[#333] bg-gradient-to-b from-[#1A1A1A] to-[#111] px-4 py-1.5 text-xs font-medium shadow-xl'>
                        <div className='flex h-1.5 w-12 items-center rounded-full bg-[#222]'>
                            <motion.div
                                className='h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400'
                                initial={{ width: '0%' }}
                                animate={{ width: `${(step / 3) * 100}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                        <span className='bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent'>Step {step} of 3</span>
                    </div>
                </div>

                {/* Step content */}
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className='relative py-4'>
                    {renderStep()}
                </motion.div>

                {/* Navigation */}
                <div className='flex justify-end space-x-3'>
                    {step > 1 && (
                        <button
                            onClick={() => setStep(step - 1)}
                            className='group relative rounded-lg border border-[#333] bg-gradient-to-b from-[#1A1A1A] to-[#0F0F0F] px-4 py-2 text-sm font-medium text-gray-400 transition-all duration-200 hover:border-[#444] hover:from-[#222] hover:to-[#141414] hover:text-white hover:shadow-lg hover:shadow-black/20'>
                            <div className='absolute inset-0 rounded-lg bg-gradient-to-b from-white/[0.03] to-transparent opacity-0 transition-opacity group-hover:opacity-100' />
                            Back
                        </button>
                    )}
                    <button
                        onClick={handleNext}
                        disabled={(step === 2 && !experience) || (step === 3 && selectedPairs.length === 0)}
                        className='group relative rounded-lg bg-gradient-to-b from-blue-500 to-blue-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg hover:shadow-blue-500/20 disabled:opacity-50 disabled:hover:shadow-none'>
                        <div className='absolute inset-0 rounded-lg bg-gradient-to-b from-white/[0.07] to-transparent opacity-0 transition-opacity group-hover:opacity-100' />
                        {step === 3 ? 'Complete' : 'Next'}
                    </button>
                </div>

                {/* Bottom pattern */}
                <div className='pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#333] to-transparent opacity-50' />
            </motion.div>
        </div>
    );
}
