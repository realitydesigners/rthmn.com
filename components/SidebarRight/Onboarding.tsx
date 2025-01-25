'use client';
import { useOnboardingStore, ONBOARDING_STEPS } from '@/app/(user)/onboarding/onboarding';

export const Onboarding = () => {
    const { currentStepId, completedSteps } = useOnboardingStore();
    const handleClearOnboarding = () => {
        localStorage.removeItem('avatar_url');
        useOnboardingStore.getState().reset();
    };

    return (
        <div className='space-y-6 p-4'>
            <div className='mb-6 flex items-center justify-between'>
                <h2 className='bg-gradient-to-r from-white to-white/60 bg-clip-text text-xl font-bold text-transparent'>Onboarding Progress</h2>
                <button
                    onClick={handleClearOnboarding}
                    className='group relative rounded-lg bg-gradient-to-b from-blue-500 to-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-all duration-200 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg hover:shadow-blue-500/20'>
                    <div className='absolute inset-0 rounded-lg bg-gradient-to-b from-white/[0.07] to-transparent opacity-0 transition-opacity group-hover:opacity-100' />
                    Clear Progress
                </button>
            </div>
            <div className='space-y-3'>
                {ONBOARDING_STEPS.map((step) => {
                    const isCompleted = completedSteps.includes(step.id);
                    const isCurrent = currentStepId === step.id;

                    return (
                        <div
                            key={step.id}
                            className={`relative w-full overflow-hidden rounded-xl border bg-gradient-to-b p-0.5 transition-all duration-300 hover:scale-[1.02] ${
                                isCompleted
                                    ? 'border-emerald-500/50 from-emerald-500/20 to-emerald-500/0'
                                    : isCurrent
                                      ? 'border-blue-500/50 from-blue-500/20 to-blue-500/0'
                                      : 'border-[#333] from-[#1A1A1A] to-[#0D0D0D] hover:border-blue-500/30 hover:from-[#1A1A1A] hover:to-[#111]'
                            }`}>
                            {/* Highlight Effect */}
                            <div
                                className={`absolute inset-0 bg-gradient-to-b transition-opacity duration-300 ${
                                    isCompleted
                                        ? 'from-emerald-500/10 to-transparent opacity-100'
                                        : isCurrent
                                          ? 'from-blue-500/10 to-transparent opacity-100'
                                          : 'from-white/5 to-transparent opacity-0 group-hover:opacity-100'
                                }`}
                            />

                            {/* Content */}
                            <div className='relative flex items-center justify-between rounded-xl bg-black/40 p-4'>
                                <div className='space-y-1'>
                                    <h3 className='text-sm font-medium text-gray-300 transition-colors duration-300 group-hover:text-white'>{step.title}</h3>
                                    <p className='text-xs text-gray-500 transition-colors duration-300 group-hover:text-gray-400'>{step.description}</p>
                                </div>
                                <div className='ml-4 shrink-0'>
                                    {isCompleted ? (
                                        <span className='flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400'>
                                            Completed
                                        </span>
                                    ) : isCurrent ? (
                                        <span className='flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400'>
                                            In Progress
                                        </span>
                                    ) : (
                                        <span className='flex items-center gap-1.5 rounded-full border border-[#333] bg-[#111] px-3 py-1 text-xs font-medium text-gray-500'>
                                            Not Started
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
