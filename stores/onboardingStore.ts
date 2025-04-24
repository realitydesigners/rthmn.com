'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type StepType = 'page' | 'feature-tour';

export interface OnboardingStep {
    id: string;
    title: string;
    description: string;
    type: StepType;
    order: number;
    component?: string; // Path to the component to render for 'page' type
}

// Define all onboarding steps in one place
export const ONBOARDING_STEPS: OnboardingStep[] = [
    {
        id: 'profile',
        title: 'Profile Setup',
        description: 'Set up your trading profile',
        type: 'page',
        order: 1,
        component: 'ProfileUpload',
    },
    {
        id: 'experience',
        title: 'Trading Experience',
        description: 'Tell us about your trading experience',
        type: 'page',
        order: 2,
        component: 'ExperienceStep',
    },
    {
        id: 'pairs',
        title: 'Select Instruments',
        description: 'Choose your preferred trading pairs',
        type: 'page',
        order: 3,
        component: 'PairsStep',
    },
    {
        id: 'instruments',
        title: 'Instruments',
        description: 'Manage your currency pairs and view performance',
        type: 'feature-tour',
        order: 4,
    },
    {
        id: 'visualizer',
        title: 'Visualizer',
        description: 'Customize your chart visualization settings',
        type: 'feature-tour',
        order: 5,
    },
    {
        id: 'onboarding',
        title: 'Learning Center',
        description: 'Access your selected trading pairs and available markets',
        type: 'feature-tour',
        order: 6,
    },
    {
        id: 'settings',
        title: 'Settings',
        description: 'View detailed market analysis and trading insights',
        type: 'feature-tour',
        order: 7,
    },
];

interface OnboardingState {
    currentStepId: string;
    completedSteps: string[];
    userData: {
        photoUrl: string | null;
        experience: string;
        selectedPairs: string[];
    };
    // Actions
    completeStep: (stepId: string, data?: Partial<OnboardingState['userData']>) => void;
    goToNextStep: () => void;
    updateUserData: (data: Partial<OnboardingState['userData']>) => void;
    reset: () => void;
    // Helper functions
    getCurrentStep: () => OnboardingStep | null;
    setCurrentStep: (stepId: string) => void;
    isStepCompleted: (stepId: string) => boolean;
    hasCompletedInitialOnboarding: () => boolean;
    hasCompletedPageSteps: () => boolean;
    hasCompletedAllSteps: () => boolean;
    getNextIncompleteStep: () => OnboardingStep | null;
}

export const useOnboardingStore = create<OnboardingState>()(
    persist(
        (set, get) => ({
            currentStepId: ONBOARDING_STEPS[0].id,
            completedSteps: [],
            userData: {
                photoUrl: null,
                experience: '',
                selectedPairs: [],
            },

            completeStep: (stepId, data) => {
                set((state) => {
                    if (state.completedSteps.includes(stepId)) {
                        console.log('Step already completed:', stepId);
                        return state;
                    }

                    const newCompletedSteps = [...state.completedSteps, stepId];

                    // Find next step based on current phase
                    const nextIncompleteStep = null;

                    const newState = {
                        completedSteps: newCompletedSteps,
                        userData: data ? { ...state.userData, ...data } : state.userData,
                        currentStepId: nextIncompleteStep ? nextIncompleteStep.id : '',
                    };

                    return newState;
                });
            },

            goToNextStep: () => {
                const state = get();
                const currentStep = ONBOARDING_STEPS.find((step) => step.id === state.currentStepId);

                let nextIncompleteStep = null;
                if (currentStep?.type === 'page' || !get().hasCompletedPageSteps()) {
                    // If in page steps, stay in page steps
                    nextIncompleteStep = ONBOARDING_STEPS.filter(
                        (step) => step.type === 'page' && !state.completedSteps.includes(step.id)
                    ).sort((a, b) => a.order - b.order)[0];
                } else {
                    // If in feature tours, find next by order
                    nextIncompleteStep = ONBOARDING_STEPS.filter(
                        (step) => step.type === 'feature-tour' && !state.completedSteps.includes(step.id)
                    ).sort((a, b) => a.order - b.order)[0];
                }

                if (nextIncompleteStep) {
                    set({ currentStepId: nextIncompleteStep.id });
                } else {
                    set({ currentStepId: '' });
                }
            },

            updateUserData: (data) => {
                set((state) => ({
                    userData: { ...state.userData, ...data },
                }));
            },

            reset: () => {
                localStorage.removeItem('onboarding-storage');
                set({
                    currentStepId: ONBOARDING_STEPS[0].id,
                    completedSteps: [],
                    userData: {
                        photoUrl: null,
                        experience: '',
                        selectedPairs: [],
                    },
                });
            },

            // Helper functions
            getCurrentStep: () => {
                const state = get();
                return ONBOARDING_STEPS.find((step) => step.id === state.currentStepId) || null;
            },

            setCurrentStep: (stepId) => {
                set({ currentStepId: stepId });
            },

            isStepCompleted: (stepId) => {
                const state = get();
                const isCompleted = state.completedSteps.includes(stepId);
                return isCompleted;
            },

            hasCompletedPageSteps: () => {
                const state = get();
                const pageSteps = ONBOARDING_STEPS.filter((step) => step.type === 'page');
                return pageSteps.every((step) => state.completedSteps.includes(step.id));
            },

            hasCompletedInitialOnboarding: () => {
                // Only check page steps for routing to dashboard
                return get().hasCompletedPageSteps();
            },

            hasCompletedAllSteps: () => {
                const state = get();
                // Check if all steps (both page and feature-tour) are completed
                return ONBOARDING_STEPS.every((step) => state.completedSteps.includes(step.id));
            },

            getNextIncompleteStep: () => {
                const state = get();
                const currentStep = ONBOARDING_STEPS.find((step) => step.id === state.currentStepId);

                console.log('Current Onboarding State:', {
                    currentStepId: state.currentStepId,
                    completedSteps: state.completedSteps,
                    currentStep,
                    hasCompletedPages: get().hasCompletedPageSteps(),
                });

                // If we're in page-based onboarding, only look at page steps
                if (currentStep?.type === 'page' || !get().hasCompletedPageSteps()) {
                    const pageSteps = ONBOARDING_STEPS.filter((step) => step.type === 'page');
                    const nextPageStep = pageSteps.find((step) => !state.completedSteps.includes(step.id));
                    console.log('Next Page Step:', nextPageStep);
                    return nextPageStep || null;
                }

                // If page steps are done, find the first incomplete feature tour by order
                const nextFeatureTour = ONBOARDING_STEPS.filter(
                    (step) => step.type === 'feature-tour' && !state.completedSteps.includes(step.id)
                ).sort((a, b) => a.order - b.order)[0];
                console.log('Next Feature Tour Step:', nextFeatureTour);
                return nextFeatureTour || null;
            },
        }),
        {
            name: 'onboarding-storage',
        }
    )
);
