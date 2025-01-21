'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function OnboardingCheck() {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Skip check if we're already on onboarding page
        if (pathname?.includes('/onboarding')) {
            return;
        }

        // Check if onboarding is completed
        const hasCompletedOnboarding = localStorage.getItem('has_completed_onboarding') === 'true';

        if (!hasCompletedOnboarding) {
            router.push('/onboarding');
        }
    }, [pathname, router]);

    return null;
}
