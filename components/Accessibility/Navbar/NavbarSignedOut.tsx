'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import styles from './styles.module.css';
import { AnimatePresence } from 'framer-motion';
import { User } from '@supabase/supabase-js';
import { useAuth } from '@/providers/SupabaseProvider';
import { MotionDiv } from '@/components/MotionDiv';
import { NavButton } from '@/components/Buttons/NavButton';
import { LogoIcon, MenuIcon } from '@/components/Accessibility/Icons/icons';
import { allLinks, LinkItem } from './allLinks';

interface NavbarSignedOutProps {
  user: User | null;
}

const Links = () => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const handleMouseEnter = (dropdown: string) => {
    setActiveDropdown(dropdown);
  };

  const handleMouseLeave = () => {
    setActiveDropdown(null);
  };

  return (
    <div className="group relative">
      <div className="flex font-outfit">
        <NavButton href="/" onMouseEnter={() => handleMouseEnter('pricing')}>
          Pricing
        </NavButton>
        <NavButton href="/" onMouseEnter={() => handleMouseEnter('company')}>
          Company
        </NavButton>
        <NavButton href="/" onMouseEnter={() => handleMouseEnter('features')}>
          Features
        </NavButton>
        <NavButton href="/" onMouseEnter={() => handleMouseEnter('resources')}>
          Resources
        </NavButton>
      </div>
      <DesktopMenuContent
        activeDropdown={activeDropdown}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  );
};

export function NavbarSignedOut({ user }: NavbarSignedOutProps) {
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
        className={`fixed left-0 right-0 top-0 z-50 z-[1001] h-16 bg-gradient-to-b from-black via-black to-transparent font-mono lg:h-20`}
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
              <div className="flex h-8 w-8 items-center">
                <LogoIcon />
              </div>
              <div className={`font-russo text-2xl font-bold`}>RTHMN</div>
            </Link>

            <div className="flex items-center space-x-4">
              <nav className="hidden space-x-4 lg:flex">
                <Links />
              </nav>
            </div>
            <div className="hidden items-center space-x-4 pr-2 lg:flex">
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
                    <button
                      type="submit"
                      className="flex items-center justify-center space-x-3 rounded-md bg-gradient-to-b from-[#333333] to-[#181818] p-[1px] text-white transition-all duration-200 hover:scale-[1.02] hover:from-[#444444] hover:to-[#282828]"
                    >
                      <span className="flex w-full items-center justify-center rounded-md bg-gradient-to-b from-[#0A0A0A] to-[#181818] px-6 py-3 text-sm font-medium">
                        Sign out
                      </span>
                    </button>
                  </form>
                ) : (
                  <Link
                    href="/signin"
                    className="flex items-center justify-center space-x-3 rounded-md bg-gradient-to-b from-[#333333] to-[#181818] p-[1px] text-white transition-all duration-200 hover:scale-[1.02] hover:from-[#444444] hover:to-[#282828]"
                  >
                    <span className="flex w-full items-center justify-center rounded-md bg-gradient-to-b from-[#0A0A0A] to-[#181818] px-4 py-2 text-sm font-medium">
                      Sign in
                    </span>
                  </Link>
                )}
              </MotionDiv>
            </div>

            <button
              onClick={toggleNav}
              className="menu-icon-button z-50 flex h-14 w-14 items-center justify-center lg:hidden"
              aria-label="Toggle navigation"
            >
              <MenuIcon isOpen={isNavOpen} />
            </button>
          </div>
        </div>
      </MotionDiv>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isNavOpen && (
          <MotionDiv
            className={`fixed inset-0 z-[1000] bg-black bg-opacity-95 pt-16 font-mono backdrop-blur-sm lg:hidden`}
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
                    <button
                      type="submit"
                      className="flex w-full items-center justify-center space-x-3 rounded-md bg-gradient-to-b from-[#333333] to-[#181818] p-[1px] text-white transition-all duration-200 hover:scale-[1.02] hover:from-[#444444] hover:to-[#282828]"
                    >
                      <span className="flex w-full items-center justify-center rounded-md bg-gradient-to-b from-[#0A0A0A] to-[#181818] px-6 py-3 text-sm font-medium">
                        Sign out
                      </span>
                    </button>
                  </form>
                ) : (
                  <Link
                    href="/signin"
                    className="flex w-full items-center justify-center space-x-3 rounded-md bg-gradient-to-b from-[#333333] to-[#181818] p-[1px] text-white transition-all duration-200 hover:scale-[1.02] hover:from-[#444444] hover:to-[#282828]"
                  >
                    <span className="flex w-full items-center justify-center rounded-md bg-gradient-to-b from-[#0A0A0A] to-[#181818] px-6 py-3 text-sm font-medium">
                      Sign in
                    </span>
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
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const DropdownLink: React.FC<LinkItem & { className?: string }> = ({
  title,
  desc,
  href,
  icon: Icon,
  className
}) => (
  <Link
    href={href}
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
  onMouseEnter,
  onMouseLeave
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
      case 'pricing':
        return (
          <div
            className={`${styles.dropdownContent} ${styles.dropdownPricing} font-outfit`}
            onMouseEnter={() => {}}
            onMouseLeave={onMouseLeave}
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
      case 'company':
        return (
          <div
            className={`${styles.dropdownContent} ${styles.dropdownAccount} font-outfit`}
            onMouseEnter={() => {}}
            onMouseLeave={onMouseLeave}
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
      case 'features':
        return (
          <div
            className={`${styles.dropdownContent} ${styles.dropdownResources} font-outfit`}
            onMouseEnter={() => {}}
            onMouseLeave={onMouseLeave}
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
      case 'resources':
        return (
          <div
            className={`${styles.dropdownContent} ${styles.dropdownResources} font-outfit`}
            onMouseEnter={() => {}}
            onMouseLeave={onMouseLeave}
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
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <MotionDiv
          className={`${styles.dropdownContainer} ${activeDropdown ? styles.active : styles.inactive}`}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
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
          <h2 className={`mb-2 font-mono text-lg font-bold text-[#555]`}>
            {item.title}
          </h2>
          {item.links.map((link) => (
            <Link
              key={link.title}
              href="/"
              className={`heading-text py-2 font-mono text-base font-bold`}
            >
              {link.title}
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
};
