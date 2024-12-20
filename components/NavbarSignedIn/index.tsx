'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect, type JSX } from 'react';
import { useAuth } from '@/providers/SupabaseProvider';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { LogoIcon, BellIcon } from '@/components/Icons/icons';
import { FOREX_PAIRS, CRYPTO_PAIRS } from '@/components/Constants/instruments';
import { useDashboard } from '@/providers/DashboardProvider';
import { SearchBar } from '../SearchBar';

interface NavbarSignedInProps {
    user: User | null;
}

export const NavbarSignedIn: React.FC<NavbarSignedInProps> = ({ user }) => {
    const [isSigningOut, setIsSigningOut] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { signOut } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchResults, setShowSearchResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const { togglePair, selectedPairs } = useDashboard();

    useEffect(() => {
        const fetchUserDetails = async () => {
            if (!user) return;

            const supabase = createClient();
            const { data: userDetails } = await supabase.from('users').select('avatar_url').eq('id', user.id).single();

            if (userDetails?.avatar_url) {
                setAvatarUrl(userDetails.avatar_url);
            }
        };

        fetchUserDetails();
    }, [user]);

    const handleSignOut = async () => {
        setIsSigningOut(true);
        try {
            await signOut();
            //   console.log('Sign out successful');
        } catch (error) {
            //   console.error('Error during sign out:', error);
        } finally {
            setIsSigningOut(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const userInitial = user?.user_metadata?.full_name?.[0].toUpperCase() || user?.email?.[0].toUpperCase() || '?';

    // Combine all pairs for search
    const allPairs = [...FOREX_PAIRS, ...CRYPTO_PAIRS];

    // Filter pairs based on search query
    const filteredPairs = allPairs.filter((pair) => pair.toLowerCase().includes(searchQuery.toLowerCase()));

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSearchResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <nav className='top-0 right-0 left-0 z-[100] hidden h-16 lg:fixed lg:flex lg:h-14'>
            <div className='relative z-[110] h-full w-full px-4'>
                <div className='flex h-full items-center justify-between'>
                    <Link href='/dashboard' className='relative z-[110] flex items-center gap-2'>
                        <div className='flex h-8 w-8 items-center'>
                            <LogoIcon />
                        </div>
                    </Link>

                    <SearchBar selectedPairs={selectedPairs} />

                    <div className='relative z-[110] flex items-center space-x-4'>
                        <div className='relative' ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className='group flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-b from-[#333333] to-[#181818] p-[1px] transition-all duration-200 hover:from-[#444444] hover:to-[#282828]'>
                                <div className='flex h-full w-full items-center justify-center rounded-full bg-gradient-to-b from-[#0A0A0A] to-[#181818]'>
                                    <div className='relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-black'>
                                        {avatarUrl ? (
                                            <Image src={avatarUrl} alt='Profile' className='object-cover' width={80} height={80} />
                                        ) : (
                                            <span className='text-sm font-bold'>{userInitial}</span>
                                        )}
                                    </div>
                                </div>
                            </button>
                            {isDropdownOpen && (
                                <div className='absolute right-0 mt-2 w-64 rounded-md border border-[#222] bg-black/95 shadow-lg backdrop-blur-lg'>
                                    <div className='py-1' role='menu' aria-orientation='vertical' aria-labelledby='options-menu'>
                                        <Link href='/account' className='block px-4 py-2 text-sm text-gray-100 transition-colors hover:bg-white/5' role='menuitem'>
                                            Account
                                        </Link>
                                        <button
                                            onClick={handleSignOut}
                                            disabled={isSigningOut}
                                            className='block w-full px-4 py-2 text-left text-sm text-gray-100 transition-colors hover:bg-white/5'
                                            role='menuitem'>
                                            {isSigningOut ? 'Signing out...' : 'Sign out'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};
