'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useOnboardingStore } from '@/utils/tourStore';

export function OnboardingCheck() {
    const router = useRouter();
    const pathname = usePathname();
    const { getCurrentStep, hasCompletedInitialOnboarding } = useOnboardingStore();
    const currentStep = getCurrentStep();

    useEffect(() => {
        // Skip check if we're already on onboarding page
        if (!pathname || pathname.includes('/onboarding')) {
            return;
        }

        // Skip check if we're on public pages
        if (pathname === '/signin' || pathname === '/signup' || pathname === '/pricing') {
            return;
        }

        // If we haven't completed initial onboarding and we're not on a public page,
        // redirect to onboarding
        if (!hasCompletedInitialOnboarding()) {
            router.replace('/onboarding');
        }
    }, [pathname, router, hasCompletedInitialOnboarding]);

    return null;
}
