'use client';
import { NavbarSignedOut } from './NavbarSignedOut';
import { usePathname } from 'next/navigation';

export const Navbar = () => {
    const pathname = usePathname();

    // Don't render navbar for user routes
    if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/test') || pathname?.startsWith('/pair')) {
        return null;
    }

    return <NavbarSignedOut user={null} />;
};

export { NavbarSignedOut };
