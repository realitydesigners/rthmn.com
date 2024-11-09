'use client';
import { russo } from '@/fonts';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect, type JSX } from 'react';
import { useAuth } from '@/providers/SupabaseProvider';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';

interface NavbarSignedInProps {
  user: User | null;
}

const getIcon = (name: string): JSX.Element => {
  const icons: { [key: string]: JSX.Element } = {
    logo: (
      <svg
        width="40"
        height="40"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-labelledby="logoTitle"
      >
        <title id="logoTitle">Logo</title>
        <g clipPath="url(#clip0_1208_27417)">
          <path
            d="M27.512 73.5372L27.512 28.512C27.512 27.9597 27.9597 27.512 28.512 27.512L70.4597 27.512C71.0229 27.512 71.475 27.9769 71.4593 28.54L70.8613 49.9176C70.8462 50.4588 70.4031 50.8896 69.8617 50.8896L50.7968 50.8896C49.891 50.8896 49.4519 51.9975 50.1117 52.618L92.25 92.25M92.25 92.25L48.2739 92.25L7.75002 92.25C7.19773 92.25 6.75002 91.8023 6.75002 91.25L6.75 7.75C6.75 7.19771 7.19772 6.75 7.75 6.75L91.25 6.75003C91.8023 6.75003 92.25 7.19775 92.25 7.75003L92.25 92.25Z"
            stroke="white"
            strokeWidth="8"
          />
        </g>
        <defs>
          <clipPath id="clip0_1208_27417">
            <rect width="100" height="100" fill="white" />
          </clipPath>
        </defs>
      </svg>
    ),
    bell: (
      <svg
        width="17"
        height="19"
        viewBox="0 0 17 19"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10.7059 14.4211V15.3158C10.7059 16.7982 9.52075 18 8.05882 18C6.59689 18 5.41176 16.7982 5.41176 15.3158V14.4211M10.7059 14.4211L5.41176 14.4211M10.7059 14.4211H14.2353C14.7226 14.4211 15.1176 14.0205 15.1176 13.5263V13.0021C15.1176 12.7648 15.0246 12.5373 14.8591 12.3694L14.4085 11.9125C14.2976 11.8 14.2353 11.6473 14.2353 11.4883V8.15789C14.2353 8.00003 14.2297 7.84344 14.2181 7.68914M5.41176 14.4211L1.88235 14.4212C1.39505 14.4212 1 14.0203 1 13.5261V13.0021C1 12.7648 1.09303 12.5376 1.2585 12.3697L1.70916 11.9121C1.82005 11.7996 1.88235 11.6476 1.88235 11.4885V8.15788C1.88235 4.69885 4.64765 1.89474 8.05882 1.89474C8.68671 1.89474 9.29271 1.98974 9.86362 2.16635M14.2181 7.68914C15.2825 7.07285 16 5.91086 16 4.57895C16 2.60235 14.4198 1 12.4706 1C11.438 1 10.509 1.44963 9.86362 2.16635M14.2181 7.68914C13.7028 7.98744 13.1063 8.15789 12.4706 8.15789C10.5213 8.15789 8.94118 6.55555 8.94118 4.57895C8.94118 3.6494 9.29064 2.80263 9.86362 2.16635M14.2181 7.68914C14.2181 7.68913 14.2181 7.68914 14.2181 7.68914ZM9.86362 2.16635C9.86403 2.16648 9.86444 2.16661 9.86486 2.16673"
          stroke="white"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  };
  return icons[name] || <path />;
};

export const NavbarSignedIn: React.FC<NavbarSignedInProps> = ({ user }) => {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { signOut } = useAuth();

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user) return;

      const supabase = createClient();
      const { data: userDetails } = await supabase
        .from('users')
        .select('avatar_url')
        .eq('id', user.id)
        .single();

      if (userDetails?.avatar_url) {
        setAvatarUrl(userDetails.avatar_url);
      }
    };

    fetchUserDetails();
  }, [user]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      console.log('Starting sign out process');
      await signOut();
      console.log('Sign out successful');
    } catch (error) {
      console.error('Error during sign out:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const userInitial =
    user?.user_metadata?.full_name?.[0].toUpperCase() ||
    user?.email?.[0].toUpperCase() ||
    '?';

  return (
    <nav className="fixed left-0 right-0 top-0 z-[1001] h-16 lg:h-20">
      <div className="h-full w-full px-6">
        <div className="flex h-full items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center">{getIcon('logo')}</div>
            <span className={`text-russo text-2xl font-bold tracking-wide`}>
              RTHMN
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-white hover:underline"
            >
              Dashboard
            </Link>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b from-[#333333] to-[#181818] p-[2px] text-white transition-all duration-200 hover:from-[#444444] hover:to-[#282828]">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-b from-[#0A0A0A] to-[#181818]">
                {getIcon('bell')}
              </div>
            </button>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-3 rounded-full bg-gradient-to-b from-[#333333] to-[#181818] p-[2px] text-white transition-all duration-200 hover:from-[#444444] hover:to-[#282828]"
              >
                <div className="flex items-center space-x-3 rounded-full bg-gradient-to-b from-[#0A0A0A] to-[#181818] py-1 pl-4 pr-1">
                  <div className="text-left">
                    <p className="text-[12px] font-semibold">
                      {user?.user_metadata?.full_name || 'User'}
                    </p>
                    <p className="text-[10px] text-gray-300">{user?.email}</p>
                  </div>
                  <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-black">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt="Profile"
                        className="object-cover"
                        width={80}
                        height={80}
                      />
                    ) : (
                      <span className="text-lg font-bold">{userInitial}</span>
                    )}
                  </div>
                </div>
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-md border border-[#181818] bg-black shadow-lg ring-1 ring-black ring-opacity-5">
                  <div
                    className="py-1"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="options-menu"
                  >
                    <Link
                      href="/account"
                      className="block px-4 py-2 text-sm text-gray-100 hover:bg-[#181818]"
                      role="menuitem"
                    >
                      Account
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-100 hover:bg-[#181818]"
                      role="menuitem"
                    >
                      Settings
                    </Link>
                    <button
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      className="block w-full px-4 py-2 text-left text-sm text-gray-100 hover:bg-[#181818]"
                      role="menuitem"
                    >
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
