'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DEFAULT_PAIRS, setSelectedPairs } from '@/utils/localStorage';

export default function OnboardingPage() {
    const [currentStep, setCurrentStep] = useState(0);
    const [tradingExperience, setTradingExperience] = useState('beginner');
    const [selectedPairs, setSelectedPairsState] = useState<string[]>([]);
    const router = useRouter();

    const steps = [
        {
            id: 'welcome',
            title: 'Welcome to Rthmn',
            description: "Let's get you set up with your trading preferences.",
            content: (
                <div className='space-y-4'>
                    <p className='text-gray-300'>Welcome to Rthmn! We'll help you get started with our powerful trading platform. After this quick setup, you'll discover:</p>
                    <ul className='list-inside list-disc space-y-2 text-gray-400'>
                        <li>Real-time currency pair tracking</li>
                        <li>Interactive price visualization</li>
                        <li>Customizable dashboard layout</li>
                        <li>Advanced trading tools</li>
                    </ul>
                    <p className='mt-6 text-sm text-blue-400'>After completing this setup, we'll guide you through each feature with interactive tooltips!</p>
                </div>
            ),
        },
        {
            id: 'trading-preferences',
            title: 'Trading Preferences',
            description: 'Tell us about your trading style and preferences.',
            content: (
                <div className='space-y-4'>
                    <div className='space-y-2'>
                        <label className='block text-sm font-medium text-gray-300'>Trading Experience</label>
                        <select
                            value={tradingExperience}
                            onChange={(e) => setTradingExperience(e.target.value)}
                            className='w-full rounded-md border-gray-700 bg-gray-800 text-white'>
                            <option value='beginner'>Beginner</option>
                            <option value='intermediate'>Intermediate</option>
                            <option value='advanced'>Advanced</option>
                        </select>
                        <p className='mt-4 text-sm text-gray-400'>We'll adjust the interface and tooltips based on your experience level to provide the most relevant guidance.</p>
                    </div>
                </div>
            ),
        },
        {
            id: 'pairs',
            title: 'Currency Pairs',
            description: 'Select the currency pairs you want to track.',
            content: (
                <div className='space-y-4'>
                    <p className='text-gray-300'>Choose the currency pairs you want to monitor. Don't worry, you can always modify this later!</p>
                    <div className='grid grid-cols-2 gap-4'>
                        {DEFAULT_PAIRS.map((pair) => {
                            const formattedPair = pair.slice(0, 3) + '/' + pair.slice(3);
                            return (
                                <label key={pair} className='flex items-center space-x-2'>
                                    <input
                                        type='checkbox'
                                        checked={selectedPairs.includes(formattedPair)}
                                        onChange={() => togglePair(formattedPair)}
                                        className='rounded border-gray-700 bg-gray-800'
                                    />
                                    <span className='text-gray-300'>{formattedPair}</span>
                                </label>
                            );
                        })}
                    </div>
                    <p className='mt-4 text-sm text-blue-400'>Pro tip: You can use the search bar in the dashboard to quickly add more pairs later!</p>
                </div>
            ),
        },
    ];

    const handleComplete = () => {
        try {
            // Save selected pairs to localStorage
            setSelectedPairs(selectedPairs.map((pair) => pair.replace('/', '')));

            // Set onboarding completed in localStorage
            localStorage.setItem('has_completed_onboarding', 'true');

            router.replace('/dashboard');
        } catch (error) {
            console.error('Error saving preferences:', error);
        }
    };

    const handleNext = () => {
        if (currentStep === 1 && !tradingExperience) {
            alert('Please select your trading experience level');
            return;
        }
        if (currentStep === 2 && selectedPairs.length === 0) {
            alert('Please select at least one currency pair');
            return;
        }

        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleComplete();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const togglePair = (pair: string) => {
        setSelectedPairsState((prev) => (prev.includes(pair) ? prev.filter((p) => p !== pair) : [...prev, pair]));
    };

    return (
        <div className='min-h-screen bg-black'>
            <div className='mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8'>
                <div className='mx-auto max-w-3xl'>
                    {/* Progress bar */}
                    <div className='mb-8'>
                        <div className='flex justify-between'>
                            {steps.map((step, index) => (
                                <div key={step.id} className='flex items-center'>
                                    <div className={`h-2 w-2 rounded-full ${index <= currentStep ? 'bg-blue-500' : 'bg-gray-700'}`} />
                                    {index < steps.length - 1 && <div className={`h-0.5 w-16 ${index < currentStep ? 'bg-blue-500' : 'bg-gray-700'}`} />}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className='rounded-lg border border-gray-800 bg-gray-900 p-8'>
                        <h2 className='mb-2 text-2xl font-bold text-white'>{steps[currentStep].title}</h2>
                        <p className='mb-8 text-gray-400'>{steps[currentStep].description}</p>

                        {steps[currentStep].content}

                        {/* Navigation */}
                        <div className='mt-8 flex justify-between'>
                            <button onClick={handleBack} disabled={currentStep === 0} className='rounded-md bg-gray-800 px-4 py-2 text-white disabled:opacity-50'>
                                Back
                            </button>
                            <button onClick={handleNext} className='rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600'>
                                {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
