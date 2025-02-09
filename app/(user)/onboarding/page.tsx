'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import ExperienceStep from './_components/Steps/ExperienceStep';
import IntroSequence from './_components/Steps/IntroSequence';
import PairsStep from './_components/Steps/PairsStep';
import ProfileUpload from './_components/Steps/ProfileUpload';
import { ONBOARDING_STEPS, useOnboardingStore } from '../../../stores/onboardingStore';

const COMPONENTS: {
    ProfileUpload: any;
    ExperienceStep: any;
    PairsStep: any;
} = {
    ProfileUpload,
    ExperienceStep,
    PairsStep,
};

export default function OnboardingPage() {
    const router = useRouter();
    const { currentStepId, completeStep, goToNextStep, userData, updateUserData, setCurrentStep } = useOnboardingStore();
    const [showIntro, setShowIntro] = useState(true);

    const currentStep = ONBOARDING_STEPS.find((step) => step.id === currentStepId);

    useEffect(() => {
        if (!currentStep || currentStep.type !== 'page') {
            router.replace('/dashboard');
        }
    }, [currentStep, router]);

    if (!currentStep || currentStep.type !== 'page') {
        return null;
    }

    const handleNext = () => {
        // Prepare the completion data
        const completionData = {
            ...(currentStep.id === 'profile' && { photoUrl: userData.photoUrl }),
            ...(currentStep.id === 'experience' && { experience: userData.experience }),
            ...(currentStep.id === 'pairs' && { selectedPairs: userData.selectedPairs }),
        };

        // Find next step before completing current
        const currentIndex = ONBOARDING_STEPS.findIndex((step) => step.id === currentStepId);
        const nextStep = ONBOARDING_STEPS[currentIndex + 1];

        if (nextStep?.type === 'feature-tour') {
            // For feature tours:
            // 1. Complete current step
            completeStep(currentStep.id, completionData);
            // 2. Set next step (feature tour)
            setCurrentStep(nextStep.id);
            // 3. Use router for smooth navigation
            setTimeout(() => {
                router.push('/dashboard');
            }, 0);
        } else {
            // For regular steps:
            // 1. Complete current step
            completeStep(currentStep.id, completionData);
            // 2. Go to next step
            goToNextStep();
        }
    };

    const handleBack = () => {
        const currentIndex = ONBOARDING_STEPS.findIndex((step) => step.id === currentStepId);
        if (currentIndex > 0) {
            const previousStep = ONBOARDING_STEPS[currentIndex - 1];
            useOnboardingStore.setState({ currentStepId: previousStep.id });
        }
    };

    const renderStep = () => {
        if (!currentStep?.component || !(currentStep.component in COMPONENTS)) {
            return null;
        }

        switch (currentStep.component) {
            case 'ProfileUpload':
                return <ProfileUpload onPhotoUpload={(url: string) => updateUserData({ photoUrl: url })} />;
            case 'ExperienceStep':
                return <ExperienceStep experience={userData.experience} setExperience={(exp: string) => updateUserData({ experience: exp })} />;
            case 'PairsStep':
                return <PairsStep selectedPairs={userData.selectedPairs} setSelectedPairs={(pairs: string[]) => updateUserData({ selectedPairs: pairs })} />;
            default:
                return null;
        }
    };

    const stepNumber = ONBOARDING_STEPS.findIndex((step) => step.id === currentStepId) + 1;
    const totalSteps = ONBOARDING_STEPS.filter((step) => step.type === 'page').length;

    return (
        <div className='relative min-h-screen bg-black'>
            {/* Main onboarding content */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: showIntro ? 0 : 1 }}
                transition={{ duration: 0.3 }}
                className='flex min-h-screen items-center justify-center p-4'>
                <motion.div
                    initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
                    animate={{
                        opacity: showIntro ? 0 : 1,
                        scale: showIntro ? 0.98 : 1,
                        filter: showIntro ? 'blur(10px)' : 'blur(0px)',
                        maxWidth: currentStep?.id === 'pairs' ? '48rem' : '28rem',
                    }}
                    transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                    className={`relative w-full rounded-2xl border border-[#222] bg-gradient-to-b from-[#141414] via-[#111] to-[#0A0A0A] p-8 shadow-2xl before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:bg-[radial-gradient(circle_at_50%_-20%,rgba(255,255,255,0.05),rgba(255,255,255,0))]`}>
                    {/* Progress indicator */}
                    <div className='no-select absolute -top-3 left-1/2 -translate-x-1/2'>
                        <div className='flex items-center gap-2 rounded-full border border-[#333] bg-gradient-to-b from-[#1A1A1A] to-[#111] px-4 py-1.5 text-xs font-medium shadow-xl'>
                            <div className='flex h-1.5 w-12 items-center rounded-full bg-[#222]'>
                                <motion.div
                                    className='h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400'
                                    initial={false}
                                    animate={{ width: `${(stepNumber / totalSteps) * 100}%` }}
                                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                                />
                            </div>
                            <span className='bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent'>
                                Step {stepNumber} of {totalSteps}
                            </span>
                        </div>
                    </div>

                    {/* Step content */}
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={currentStepId}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className='no-select relative py-4'>
                            {renderStep()}
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className='flex justify-end space-x-3'>
                        {stepNumber > 1 && (
                            <button
                                onClick={handleBack}
                                className='group relative rounded-lg border border-[#333] bg-gradient-to-b from-[#1A1A1A] to-[#0F0F0F] px-4 py-2 text-sm font-medium text-gray-400 transition-all duration-200 hover:border-[#444] hover:from-[#222] hover:to-[#141414] hover:text-white hover:shadow-lg hover:shadow-black/20'>
                                <div className='absolute inset-0 rounded-lg bg-gradient-to-b from-white/[0.03] to-transparent opacity-0 transition-opacity group-hover:opacity-100' />
                                Back
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            disabled={(currentStep.id === 'experience' && !userData.experience) || (currentStep.id === 'pairs' && userData.selectedPairs.length < 4)}
                            className='no-select group relative rounded-lg bg-gradient-to-b from-blue-500 to-blue-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg hover:shadow-blue-500/20 disabled:opacity-50 disabled:hover:shadow-none'>
                            <div className='absolute inset-0 rounded-lg bg-gradient-to-b from-white/[0.07] to-transparent opacity-0 transition-opacity group-hover:opacity-100' />
                            {ONBOARDING_STEPS[ONBOARDING_STEPS.findIndex((step) => step.id === currentStepId) + 1]?.type === 'feature-tour' ? 'Complete' : 'Next'}
                        </button>
                    </div>

                    {/* Bottom pattern */}
                    <div className='pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#333] to-transparent opacity-50' />
                </motion.div>
            </motion.div>

            {/* Step title with enhanced styling */}
            <div className='absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-4'>
                <div className='group no-select relative flex items-center gap-2 rounded-full border border-[#333] bg-gradient-to-b from-[#1A1A1A] to-[#111] px-4 py-1.5 shadow-xl transition-all duration-300 hover:border-blue-500/20 hover:shadow-blue-500/10'>
                    <div className='flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-b from-blue-500/20 to-blue-600/10'>
                        <div className='h-1.5 w-1.5 rounded-full bg-blue-400' />
                    </div>
                    <span className='no-select text-sm font-medium text-white/70 transition-colors group-hover:text-white'>
                        {currentStep?.id === 'profile'
                            ? 'Upload Profile Photo'
                            : currentStep?.id === 'experience'
                              ? 'Trading Experience'
                              : currentStep?.id === 'pairs'
                                ? 'Select Trading Pairs'
                                : ''}
                    </span>
                    <div className='absolute inset-0 -z-10 rounded-full bg-blue-400 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-10' />
                </div>
            </div>
            {showIntro && <IntroSequence onComplete={() => setShowIntro(false)} />}
        </div>
    );
}
