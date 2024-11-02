'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, RefObject, type JSX } from 'react';
import { kodeMono, russo } from '@/fonts';
import styles from './styles.module.css';
import {
  motion,
  AnimatePresence,
  HTMLMotionProps,
  useScroll,
  useTransform
} from 'framer-motion';
import { User } from '@supabase/supabase-js';
import { useAuth } from '@/providers/SupabaseProvider';
import { FaArrowRight } from 'react-icons/fa';
import { MotionDiv } from '@/components/MotionDiv';
import { MotionButton } from '@/components/MotionButtton';

interface NavbarSignedOutProps {
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
    )
  };
  return icons[name] || <path />;
};

const Links = () => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const handleCloseDropdown = () => {
    setActiveDropdown(null);
  };

  const linkStyle = `
    flex items-center space-x-3 text-white rounded-full p-[2px] transition-all duration-200 
    bg-gradient-to-b from-[#333333] to-[#181818] hover:from-[#444444] hover:to-[#282828]
  `;

  const innerLinkStyle = `
    flex items-center space-x-3 bg-gradient-to-b from-[#0A0A0A] to-[#181818] rounded-full 
    py-2 px-4 w-full
  `;

  return (
    <div className="group relative">
      <div className="flex space-x-4">
        <div
          className={linkStyle}
          onMouseEnter={() => setActiveDropdown('plans')}
        >
          <Link href="/" className={`${innerLinkStyle} text-kodemono`}>
            <span className="text-sm font-semibold">Plans</span>
          </Link>
        </div>
        <div
          className={linkStyle}
          onMouseEnter={() => setActiveDropdown('how-it-works')}
        >
          <Link href="/" className={`${innerLinkStyle} text-kodemono`}>
            <span className="text-sm font-semibold">How it works</span>
          </Link>
        </div>

        <div
          className={linkStyle}
          onMouseEnter={() => setActiveDropdown('features')}
        >
          <Link href="/" className={`${innerLinkStyle} text-kodemono`}>
            <span className="text-sm font-semibold">Features</span>
          </Link>
        </div>
        <div
          className={linkStyle}
          onMouseEnter={() => setActiveDropdown('community')}
        >
          <Link href="/" className={`${innerLinkStyle} text-kodemono`}>
            <span className="text-sm font-semibold">Community</span>
          </Link>
        </div>
      </div>

      <DesktopMenuContent
        activeDropdown={activeDropdown}
        onClose={handleCloseDropdown}
      />
    </div>
  );
};

const MenuIcon = ({ isOpen }: { isOpen: boolean }) => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-labelledby="menuIconTitle"
  >
    <title id="menuIconTitle">{isOpen ? 'Close Menu' : 'Open Menu'}</title>
    {isOpen ? (
      // Close icon (X)
      <>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </>
    ) : (
      // Open icon (Three lines with slower expanding animation)
      <>
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6">
          <animate
            attributeName="x1"
            values="3;6;3"
            dur="3s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="x2"
            values="21;18;21"
            dur="3s"
            repeatCount="indefinite"
          />
        </line>
        <line x1="3" y1="18" x2="21" y2="18">
          <animate
            attributeName="x1"
            values="3;6;3"
            dur="3s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="x2"
            values="21;18;21"
            dur="3s"
            repeatCount="indefinite"
          />
        </line>
      </>
    )}
  </svg>
);

export function NavbarSignedOut({ user }: NavbarSignedOutProps) {
  const router = useRouter(); // Always get the router
  const [isNavOpen, setIsNavOpen] = useState(false);
  const { session, signOut } = useAuth();

  useEffect(() => {
    if (isNavOpen) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [isNavOpen]);

  const handleBackdropClick = () => {
    setIsNavOpen(false);
  };

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const buttonClasses = `
        px-6 py-3
        gradient-border-button
        text-white font-medium
        text-kodemono
        transition-all duration-300
        hover:shadow-lg
    `;

  const navVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  };

  const linkVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: custom * 0.1, duration: 0.3 }
    })
  };

  const handleSignOut = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await signOut();
  };

  return (
    <>
      {isNavOpen && (
        <div
          className="fixed inset-0 z-[1000] bg-black/75 backdrop-blur-sm lg:hidden"
          onClick={handleBackdropClick}
          onKeyDown={(e) => e.key === 'Escape' && handleBackdropClick()}
          role="button"
          tabIndex={0}
        />
      )}

      <MotionDiv
        className={`text-kodemono fixed left-0 right-0 top-0 z-50 z-[1001] h-16 bg-gradient-to-b from-black via-black to-transparent lg:h-20`}
        initial="hidden"
        animate="visible"
        variants={navVariants}
      >
        <div className="mx-auto h-full w-full lg:w-11/12">
          <div className="flex h-full items-center justify-between">
            <Link
              href="/"
              className="z-50 flex items-center gap-2 pl-4 xl:pl-0"
            >
              <div className="flex h-8 w-8 items-center">{getIcon('logo')}</div>
              <div
                className={`pt-1 text-2xl font-bold tracking-wide ${russo.className}`}
              >
                RTHMN
              </div>
            </Link>

            <div className="flex items-center space-x-4">
              <nav className="hidden space-x-4 lg:flex">
                <Links />
              </nav>
            </div>
            <div className="hidden items-center space-x-4 pr-2 lg:flex">
              <Link
                href="/start"
                className="flex items-center space-x-3 rounded-md bg-gradient-to-r from-blue-500/50 to-purple-500/50 p-[1px] font-bold text-black transition-all duration-200 hover:from-[#3CFFBE] hover:to-[#98FFF5]"
              >
                <span className="flex items-center space-x-2 rounded-md bg-gradient-to-r from-blue-500/50 to-purple-500/50 px-3 py-2 text-white">
                  <span>Start Now</span>
                  <FaArrowRight />
                </span>
              </Link>

              {/* Desktop sign-in/sign-out button */}
              <MotionDiv
                className="flex hidden lg:block"
                variants={linkVariants}
                custom={3}
              >
                {user ? (
                  <form onSubmit={handleSignOut}>
                    <input
                      type="hidden"
                      name="pathName"
                      value={usePathname()}
                    />
                    <button type="submit" className={buttonClasses}>
                      Sign out
                    </button>
                  </form>
                ) : (
                  <Link href="/signin" className={buttonClasses}>
                    Sign-in
                  </Link>
                )}
              </MotionDiv>
            </div>

            <MotionButton
              onClick={toggleNav}
              className="menu-icon-button z-50 flex h-14 w-14 items-center justify-center lg:hidden"
              aria-label="Toggle navigation"
              whileTap={{ scale: 0.95 }}
            >
              <MenuIcon isOpen={isNavOpen} />
            </MotionButton>
          </div>
        </div>
      </MotionDiv>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isNavOpen && (
          <MotionDiv
            className={`text-kodemono fixed inset-0 z-[1000] bg-black bg-opacity-95 pt-16 backdrop-blur-sm lg:hidden`}
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex h-full flex-col overflow-y-auto px-6">
              <MobileMenuContent />
              <div className="mt-8">
                {user ? (
                  <form onSubmit={handleSignOut}>
                    <input
                      type="hidden"
                      name="pathName"
                      value={usePathname()}
                    />
                    <button type="submit" className={`${buttonClasses} w-full`}>
                      Sign out
                    </button>
                  </form>
                ) : (
                  <Link
                    href="/signin"
                    className={`${buttonClasses} block w-full text-center`}
                    // onClick={() => setIsNavOpen(false)}
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </>
  );
}

interface MenuModalProps {
  activeDropdown: string | null;
  onClose: () => void;
}

const DropdownLink: React.FC<LinkItem & { className?: string }> = ({
  title,
  desc,
  icon: Icon,
  className
}) => (
  <Link
    href="#"
    className={`${styles.dropdownLink} ${className || ''}`}
    role="menuitem"
  >
    <div className={styles.dropdownLinkIcon}>
      <Icon className={styles.icon} />
    </div>
    <div className={styles.dropdownLinkContent}>
      <div className={styles.dropdownLinkTitle}>{title}</div>
      <div className={styles.dropdownLinkDesc}>{desc}</div>
    </div>
  </Link>
);

export const DesktopMenuContent: React.FC<MenuModalProps> = ({
  activeDropdown,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (activeDropdown) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [activeDropdown]);

  const dropdownVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  };

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  const renderDropdownContent = () => {
    const group = allLinks.find(
      (g) => g.title.toLowerCase() === activeDropdown
    );
    if (!group) return null;

    switch (activeDropdown) {
      case 'resources':
        return (
          <div
            className={`${styles.dropdownContent} ${styles.dropdownResources}`}
          >
            <MotionDiv
              className="flex w-1/2 flex-col gap-2"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
            >
              {group.links.map((item, index) => (
                <MotionDiv key={item.title} variants={itemVariants}>
                  <DropdownLink {...item} className={styles.dropdownItem} />
                </MotionDiv>
              ))}
            </MotionDiv>
            <div className="flex w-1/2 flex-col gap-2">
              <div className="h-full w-full bg-[#181818]" />
              <div className="h-full w-full bg-[#181818]" />
            </div>
          </div>
        );
      case 'plans':
        return (
          <div
            className={`${styles.dropdownContent} ${styles.dropdownPricing}`}
          >
            <MotionDiv
              className="flex w-1/2 flex-col gap-2"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
            >
              {group.links.map((item, index) => (
                <MotionDiv key={item.title} variants={itemVariants}>
                  <DropdownLink {...item} className={styles.dropdownItem} />
                </MotionDiv>
              ))}
            </MotionDiv>
            <div className="flex w-1/2 flex-row gap-2">
              <div className="h-full w-1/2 bg-[#181818]" />
              <div className="h-full w-1/2 bg-[#181818]" />
            </div>
          </div>
        );
      case 'account':
        return (
          <div
            className={`${styles.dropdownContent} ${styles.dropdownAccount}`}
          >
            <div className="w-1/3 bg-[#181818]" />
            <MotionDiv
              className="flex w-2/3 flex-col gap-2"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
            >
              {group.links.map((item, index) => (
                <MotionDiv key={item.title} variants={itemVariants}>
                  <DropdownLink {...item} className={styles.dropdownItem} />
                </MotionDiv>
              ))}
            </MotionDiv>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <MotionDiv
          className={`${styles.dropdownContainer} ${activeDropdown ? styles.active : styles.inactive}`}
          onMouseLeave={onClose}
          variants={dropdownVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className={styles.dropdownWrapper}>
            {renderDropdownContent()}
          </div>
        </MotionDiv>
      )}
    </AnimatePresence>
  );
};

export const MobileMenuContent = () => {
  return (
    <div className="relative z-[100] grid grid-cols-2 gap-8 pt-8">
      {allLinks.map((item) => (
        <div key={item.title} className="flex flex-col">
          <h2 className={`text-kodemono mb-2 text-lg font-bold text-[#555]`}>
            {item.title}
          </h2>
          {item.links.map((link) => (
            <Link
              key={link.title}
              href="/"
              className={`heading-text text-kodemono py-2 text-base font-bold`}
            >
              {link.title}
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
};

import type { IconType } from 'react-icons';
import {
  FaSignal,
  FaChartLine,
  FaCrown,
  FaBlog,
  FaBook,
  FaCode,
  FaCompass,
  FaUser,
  FaCog,
  FaCreditCard
} from 'react-icons/fa';

export interface LinkItem {
  title: string;
  desc?: string;
  icon: IconType;
}

export interface LinkGroup {
  title: string;
  links: LinkItem[];
}

export const allLinks: LinkGroup[] = [
  {
    title: 'Pricing',
    links: [
      {
        title: 'Signal Service',
        desc: 'Real-time market signals for informed trading decisions',
        icon: FaSignal
      },
      {
        title: 'Premium Signals',
        desc: 'Advanced signals with higher accuracy and frequency',
        icon: FaChartLine
      },
      {
        title: 'Elite Membership',
        desc: 'Exclusive access to all features and personalized support',
        icon: FaCrown
      }
    ]
  },
  {
    title: 'Resources',
    links: [
      {
        title: 'Blog',
        desc: 'Latest insights and trading strategies',
        icon: FaBlog
      },
      {
        title: 'Documentation',
        desc: 'Comprehensive guides for using our platform',
        icon: FaBook
      },
      {
        title: 'API',
        desc: 'Integrate our services into your applications',
        icon: FaCode
      },
      {
        title: 'Support',
        desc: 'Support for all your needs',
        icon: FaCompass
      }
    ]
  },
  {
    title: 'Account',
    links: [
      {
        title: 'Profile',
        desc: 'Manage your personal information',
        icon: FaUser
      },
      {
        title: 'Settings',
        desc: 'Customize your trading environment',
        icon: FaCog
      },
      {
        title: 'Billing',
        desc: 'View and manage your subscription',
        icon: FaCreditCard
      }
    ]
  }
];
