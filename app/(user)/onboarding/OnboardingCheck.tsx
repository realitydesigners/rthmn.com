'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function OnboardingCheck() {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Skip check if we're already on onboarding page
        if (!pathname || pathname.includes('/onboarding')) {
            return;
        }

        // Skip check if we're on public pages
        if (pathname === '/signin' || pathname === '/signup' || pathname === '/pricing') {
            return;
        }

        try {
            // Check if onboarding is completed
            const hasCompletedOnboarding = localStorage.getItem('has_completed_onboarding') === 'true';

            if (!hasCompletedOnboarding) {
                // Use replace to avoid adding to history stack
                router.replace('/onboarding');
            }
        } catch (error) {
            console.error('Error checking onboarding status:', error);
        }
    }, [pathname, router]);

    return null;
}
