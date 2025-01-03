'use client';
import { useEffect, useState } from 'react';
import { getSidebarState } from '@/utils/localStorage';
import { NavbarSignedIn } from '@/components/NavbarSignedIn';
import { SidebarLeft } from '@/components/SidebarLeft';
import { SidebarRight } from '@/components/SidebarRight';
import { BottomSidebar } from '@/components/BottomSidebar';
import { DashboardNavigation } from '@/components/DashboardNavigation';
import { User } from '@supabase/supabase-js';

interface AppContainerProps {
    children: React.ReactNode;
    user: User;
}

export default function AppContainer({ children, user }: AppContainerProps) {
    const [padding, setPadding] = useState('px-16');

    useEffect(() => {
        const updatePadding = () => {
            const state = getSidebarState();
            const leftOpen = state.left.locked;
            const rightOpen = state.right.locked;

            if (leftOpen && rightOpen) {
                setPadding('px-0');
            } else if (leftOpen) {
                setPadding('pr-16');
            } else if (rightOpen) {
                setPadding('pl-16');
            } else {
                setPadding('px-16');
            }
        };

        // Initial update
        updatePadding();

        // Listen for storage changes
        window.addEventListener('storage', updatePadding);
        return () => window.removeEventListener('storage', updatePadding);
    }, []);

    return (
        <div id='app-container' className='relative min-h-screen overflow-y-auto'>
            <NavbarSignedIn user={user} />
            <main className={`w-full transition-all duration-300 ease-in-out ${padding}`}>{children}</main>
            <SidebarLeft />
            <SidebarRight />
            <BottomSidebar />
            <DashboardNavigation />
        </div>
    );
}
