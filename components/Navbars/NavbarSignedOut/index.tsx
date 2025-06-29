"use client";
import { LogoIcon } from "@/components/Icons/icons";
import { StartButton } from "@/components/Sections/StartNowButton";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/SupabaseProvider";
import type { User } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import { AnimatePresence } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type FC, useEffect, useRef, useState } from "react";
import { FaGithub, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";
import { HiChevronRight } from "react-icons/hi";
import { type LinkItem, allLinks } from "./allLinks";
import styles from "./styles.module.css";

interface NavbarSignedOutProps {
	user: User | null;
}

const SOCIAL_LINKS = [
	{ name: "Twitter", icon: FaTwitter, href: "https://x.com/rthmnapp" },
	{
		name: "Instagram",
		icon: FaInstagram,
		href: "https://www.instagram.com/rthmnapp/",
	},
	{ name: "GitHub", icon: FaGithub, href: "https://github.com/realitydesigners" },
	{
		name: "Youtube",
		icon: FaYoutube,
		href: "https://www.youtube.com/@rthmnco",
	},
];

const Links = () => {
	if (process.env.NODE_ENV === "production") {
		return null;
	}

	const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

	const handleMouseEnter = (dropdown: string) => {
		setActiveDropdown(dropdown);
	};

	const handleMouseLeave = () => {
		setActiveDropdown(null);
	};

	const handleLinkClick = () => {
		setActiveDropdown(null);
	};

	return (
		<div className="group relative" onMouseLeave={handleMouseLeave}>
			<div className="font-russo flex">
				<NavButton
					href="/pricing"
					onMouseEnter={() => handleMouseEnter("pricing")}
					onClick={handleLinkClick}
					custom={0}
				>
					Pricing
				</NavButton>
				<NavButton
					href="/"
					onMouseEnter={() => handleMouseEnter("company")}
					onClick={handleLinkClick}
					custom={1}
				>
					Company
				</NavButton>
				<NavButton
					href="/"
					onMouseEnter={() => handleMouseEnter("resources")}
					onClick={handleLinkClick}
					custom={3}
				>
					Resources
				</NavButton>
			</div>
			<DesktopMenuContent
				activeDropdown={activeDropdown}
				onMouseEnter={() => {}}
				onMouseLeave={handleMouseLeave}
				onLinkClick={handleLinkClick}
			/>
		</div>
	);
};

const DropdownLink: React.FC<LinkItem & { className?: string }> = ({
	title,
	desc,
	href,
	className,
}) => {
	if (process.env.NODE_ENV === "production") {
		return null;
	}

	return (
		<Link href={href} className={`${styles.dropdownLink} ${className || ""}`}>
			<div className={styles.dropdownLinkContent}>
				<div className={styles.dropdownLinkTitle}>{title}</div>
				<div className={styles.dropdownLinkDesc}>{desc}</div>
			</div>
		</Link>
	);
};

export function NavbarSignedOut({ user }: NavbarSignedOutProps) {
	// All hooks must be declared first
	const pathname = usePathname();
	const [isNavOpen, setIsNavOpen] = useState(false);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const { session, signOut } = useAuth();
	const isproduction = process.env.NODE_ENV === "production";

	useEffect(() => {
		const fetchUserDetails = async () => {
			if (!user) return;

			const supabase = createClient();
			const { data: userDetails } = await supabase
				.from("users")
				.select("avatar_url")
				.eq("id", user.id)
				.single();

			if (userDetails?.avatar_url) {
				setAvatarUrl(userDetails.avatar_url);
			}
		};

		fetchUserDetails();
	}, [user]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsDropdownOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	useEffect(() => {
		if (isNavOpen) {
			document.body.classList.add("no-scroll");
		} else {
			document.body.classList.remove("no-scroll");
		}
		return () => {
			document.body.classList.remove("no-scroll");
		};
	}, [isNavOpen]);

	// Check routes after all hooks are declared
	const protectedRoutes = [
		"/dashboard",
		"/onboarding",
		"/admin",
		"/account",
		"/studio",
		"/signals",
		"/support",
	];
	const isUserRoute =
		pathname.startsWith("/(user)") ||
		pathname.startsWith("/pair/") ||
		pathname.startsWith("/studio/") ||
		pathname.startsWith("/admin") ||
		protectedRoutes.includes(pathname);
	if (isUserRoute) {
		return null;
	}

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
			transition: { duration: 0.5, ease: "easeOut" },
		},
	};

	const linkVariants = {
		hidden: { opacity: 0, y: -20 },
		visible: (custom: number) => ({
			opacity: 1,
			y: 0,
			transition: { delay: custom * 0.1, duration: 0.3 },
		}),
	};

	const handleSignOut = async () => {
		await signOut();
	};

	const userInitial =
		user?.user_metadata?.full_name?.[0].toUpperCase() ||
		user?.email?.[0].toUpperCase() ||
		"?";

	return (
		<>
			{isNavOpen && !isproduction && (
				<div
					className="fixed inset-0 z-1000 bg-black/75 backdrop-blur-sm lg:hidden"
					onClick={handleBackdropClick}
					onKeyDown={(e) => e.key === "Escape" && handleBackdropClick()}
					role="button"
					tabIndex={0}
				/>
			)}

			<motion.div
				className={`fixed top-0 right-0 left-0 z-50 z-1001 h-16 bg-linear-to-b from-black via-black/50 to-transparent font-mono lg:h-20`}
				initial="hidden"
				animate="visible"
				variants={navVariants}
			>
				<div className="relative mx-auto h-full w-full px-8">
					<div className="grid h-full grid-cols-3 items-center">
						<Link
							href="/"
							className="z-50 flex items-center gap-2 justify-self-start pl-4 xl:pl-0"
						>
							<div className="flex h-8 w-8 items-center">
								<LogoIcon />
							</div>
							<div className={`font-russo text-xl lg:text-2xl`}>RTHMN</div>
						</Link>

						{!isproduction && (
							<nav className="hidden justify-self-center lg:flex">
								<Links />
							</nav>
						)}

						<div className="absolute top-1/2 right-0 flex -translate-y-1/2 items-center space-x-4 pr-2">
							<div className="hidden items-center space-x-4 sm:flex">
								{SOCIAL_LINKS.map((item) => (
									<a
										key={item.name}
										href={item.href}
										target="_blank"
										rel="noopener noreferrer"
										className="text-gray-400 transition-colors duration-200 hover:text-white"
										aria-label={item.name}
									>
										<item.icon className="h-5 w-5" />
									</a>
								))}
							</div>
							<motion.div
								className="mr-4 flex"
								variants={linkVariants}
								custom={3}
							>
								{user ? (
									<div className="flex items-center gap-3">
										<Link
											href="/dashboard"
											className="font-russo flex items-center justify-center space-x-3 rounded-md bg-linear-to-b from-[#32353C] to-[#1C1E23] p-[1px] text-white transition-all duration-200 hover:scale-[1.02] hover:from-[#32353C] hover:to-[#282828]"
										>
											<span className="flex w-full items-center justify-center rounded-md bg-linear-to-b from-[#0A0A0A] to-[#1C1E23] px-6 py-3 text-sm font-medium">
												Dashboard
											</span>
										</Link>
										<div className="relative" ref={dropdownRef}>
											<button
												onClick={() => setIsDropdownOpen(!isDropdownOpen)}
												className="group flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-b from-[#32353C] to-[#1C1E23] p-[1px] transition-all duration-200 hover:from-[#32353C] hover:to-[#282828]"
											>
												<div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-b from-[#0A0A0A] to-[#1C1E23] transition-all group-hover:from-[#141414] group-hover:to-[#1c1c1c]">
													<div className="relative flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-black">
														{avatarUrl ? (
															<Image
																src={avatarUrl}
																alt="Profile"
																className="object-cover"
																width={80}
																height={80}
															/>
														) : (
															<span className="text-xs font-bold">
																{userInitial}
															</span>
														)}
													</div>
												</div>
											</button>
											{isDropdownOpen && (
												<div className="animate-in fade-in slide-in-from-top-1 absolute right-0 mt-2 w-64 rounded-lg border border-[#0A0B0D] bg-black/95 shadow-xl backdrop-blur-xl">
													<div
														className="py-1"
														role="menu"
														aria-orientation="vertical"
														aria-labelledby="options-menu"
													>
														<Link
															href="/account"
															className="flex items-center gap-2 px-4 py-2 text-sm primary-text transition-colors hover:bg-[#1C1E23]"
															role="menuitem"
														>
															Account
														</Link>
														<button
															onClick={handleSignOut}
															className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm primary-text transition-colors hover:bg-[#1C1E23]"
															role="menuitem"
														>
															Sign out
														</button>
													</div>
												</div>
											)}
										</div>
									</div>
								) : pathname !== "/signin" ? (
									<StartButton href="/signin" variant="shimmer-sm">
										Login
									</StartButton>
								) : null}
							</motion.div>
						</div>
					</div>
				</div>
			</motion.div>

			{!isproduction && (
				<AnimatePresence>
					{isNavOpen && (
						<motion.div
							className={`bg-opacity-95 fixed inset-0 z-1000 bg-black pt-16 font-mono backdrop-blur-sm lg:hidden`}
							initial={{ opacity: 0, y: -100 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -100 }}
							transition={{ duration: 0.3 }}
						>
							<div className="flex h-full flex-col overflow-y-auto px-6">
								<MobileMenuContent />
								<div className="mt-8">
									{user ? (
										<div className="flex items-center gap-3">
											<Link
												href="/dashboard"
												className="font-russo flex w-full items-center justify-center space-x-3 rounded-md bg-linear-to-b from-[#32353C] to-[#1C1E23] p-[1px] text-white transition-all duration-200 hover:scale-[1.02] hover:from-[#32353C] hover:to-[#282828]"
											>
												<span className="flex w-full items-center justify-center rounded-md bg-linear-to-b from-[#0A0A0A] to-[#1C1E23] px-4 py-3 text-sm font-medium">
													Dashboard
												</span>
											</Link>
											<div className="relative" ref={dropdownRef}>
												<button
													onClick={() => setIsDropdownOpen(!isDropdownOpen)}
													className="group flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-b from-[#32353C] to-[#1C1E23] p-[1px] transition-all duration-200 hover:from-[#32353C] hover:to-[#282828]"
												>
													<div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-b from-[#0A0A0A] to-[#1C1E23] transition-all group-hover:from-[#141414] group-hover:to-[#1c1c1c]">
														<div className="relative flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-black">
															{avatarUrl ? (
																<Image
																	src={avatarUrl}
																	alt="Profile"
																	className="object-cover"
																	width={80}
																	height={80}
																/>
															) : (
																<span className="text-xs font-bold">
																	{userInitial}
																</span>
															)}
														</div>
													</div>
												</button>
												{isDropdownOpen && (
													<div className="animate-in fade-in slide-in-from-top-1 absolute right-0 mt-2 w-64 rounded-lg border border-[#0A0B0D] bg-black/95 shadow-xl backdrop-blur-xl">
														<div
															className="py-1"
															role="menu"
															aria-orientation="vertical"
															aria-labelledby="options-menu"
														>
															<Link
																href="/account"
																className="flex items-center gap-2 px-4 py-2 text-sm primary-text transition-colors hover:bg-[#1C1E23]"
																role="menuitem"
															>
																Account
															</Link>
															<button
																onClick={handleSignOut}
																className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm primary-text transition-colors hover:bg-[#1C1E23]"
																role="menuitem"
															>
																Sign out
															</button>
														</div>
													</div>
												)}
											</div>
										</div>
									) : (
										<div className="flex w-full items-center justify-center">
											<StartButton href="/signin" variant="shimmer-sm">
												Start now
											</StartButton>
										</div>
									)}
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			)}

			{!isproduction && (
				<button
					onClick={toggleNav}
					className="menu-icon-button z-50 flex h-14 w-14 items-center justify-center lg:hidden"
					aria-label="Toggle navigation"
				>
					{/* ... burger icon ... */}
				</button>
			)}
		</>
	);
}

interface NavButtonProps {
	href: string;
	children: React.ReactNode;
	onMouseEnter?: () => void;
	onClick?: () => void;
	custom?: number;
}

const buttonVariants = {
	hidden: { opacity: 0, y: -20 },
	visible: (custom: number) => ({
		opacity: 1,
		y: 0,
		transition: { delay: custom * 0.1, duration: 0.3 },
	}),
};

export const NavButton: FC<NavButtonProps> = ({
	href,
	children,
	onMouseEnter,
	onClick,
	custom = 0,
}) => {
	return (
		<div
			className="relative flex h-20 items-center px-2 transition-colors duration-200 hover:text-neutral-600"
			onMouseEnter={onMouseEnter}
		>
			<motion.div
				variants={buttonVariants}
				initial="hidden"
				animate="visible"
				custom={custom}
			>
				<Link
					href={href}
					className="flex items-center rounded-full bg-linear-to-b from-[#32353C] to-[#1C1E23] p-[1px] text-white transition-all duration-200 hover:from-[#32353C] hover:to-[#282828]"
					onClick={onClick}
				>
					<span className="flex w-full items-center space-x-3 rounded-full bg-linear-to-b from-[#0A0A0A] to-[#1C1E23] px-4 py-2 text-sm">
						{children}
					</span>
				</Link>
			</motion.div>
		</div>
	);
};

interface MenuModalProps {
	activeDropdown: string | null;
	onMouseEnter: () => void;
	onMouseLeave: () => void;
	onLinkClick: () => void;
}

export const DesktopMenuContent = ({
	activeDropdown,
	onMouseEnter,
	onMouseLeave,
	onLinkClick,
}: MenuModalProps) => {
	if (process.env.NODE_ENV === "production") {
		return null;
	}

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
		exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
	};

	const contentVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: { staggerChildren: 0.1, delayChildren: 0.2 },
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 10 },
		visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
	};

	const renderDropdownContent = () => {
		const group = allLinks.find(
			(g) => g.title.toLowerCase() === activeDropdown,
		);
		if (!group) return null;

		switch (activeDropdown) {
			case "pricing":
				return (
					<div
						className={`${styles.dropdownContent} font-russo w-[750px]`}
						onMouseEnter={onMouseEnter}
						onMouseLeave={onMouseLeave}
						onClick={onLinkClick}
					>
						<motion.div
							className="flex w-1/2 flex-col gap-2"
							variants={contentVariants}
							initial="hidden"
							animate="visible"
						>
							{group.links.map((item, index) => (
								<motion.div key={item.title} variants={itemVariants}>
									<DropdownLink {...item} />
								</motion.div>
							))}
						</motion.div>
						<div className="flex w-1/2 flex-row gap-2">
							<div className="h-full w-1/2 bg-[#1C1E23]" />
							<div className="h-full w-1/2 bg-[#1C1E23]" />
						</div>
					</div>
				);
			case "company":
				return (
					<div
						className={`${styles.dropdownContent} font-russo w-[600px]`}
						onMouseEnter={onMouseEnter}
						onMouseLeave={onMouseLeave}
						onClick={onLinkClick}
					>
						<div className="w-1/3 bg-[#1C1E23]" />
						<motion.div
							className="flex w-2/3 flex-col gap-2"
							variants={contentVariants}
							initial="hidden"
							animate="visible"
						>
							{group.links.map((item, index) => (
								<motion.div key={item.title} variants={itemVariants}>
									<DropdownLink {...item} />
								</motion.div>
							))}
						</motion.div>
					</div>
				);

			case "resources":
				return (
					<div
						className={`${styles.dropdownContent} font-russo w-[700px]`}
						onMouseEnter={onMouseEnter}
						onMouseLeave={onMouseLeave}
						onClick={onLinkClick}
					>
						<motion.div
							className="flex w-1/2 flex-col gap-2"
							variants={contentVariants}
							initial="hidden"
							animate="visible"
						>
							{group.links.map((item, index) => (
								<motion.div key={item.title} variants={itemVariants}>
									<DropdownLink {...item} />
								</motion.div>
							))}
						</motion.div>
						<div className="flex w-1/2 flex-col gap-2">
							<div className="h-full w-full bg-[#1C1E23]" />
							<div className="h-full w-full bg-[#1C1E23]" />
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
				<motion.div
					className={`fixed right-0 left-0 z-50 flex justify-center ${activeDropdown ? styles.active : styles.inactive}`}
					onMouseEnter={onMouseEnter}
					onMouseLeave={onMouseLeave}
					variants={dropdownVariants}
					initial="hidden"
					animate="visible"
					exit="exit"
				>
					{renderDropdownContent()}
				</motion.div>
			)}
		</AnimatePresence>
	);
};

export const MobileMenuContent = () => {
	if (process.env.NODE_ENV === "production") {
		return null;
	}

	return (
		<div className="flex h-full flex-col items-center justify-center">
			{allLinks.map((item) => (
				<div key={item.title} className="flex flex-col">
					<h2 className={`mb-2 text-lg text-[#555]`}>{item.title}</h2>
					{item.links.map((link) => (
						<Link
							key={link.title}
							href="/"
							className={`text-neutral-gradient py-2 font-mono text-xl font-bold`}
						>
							{link.title}
						</Link>
					))}
				</div>
			))}

			<div className="mt-12 flex justify-center space-x-6">
				{SOCIAL_LINKS.map((item) => (
					<a
						key={item.name}
						href={item.href}
						target="_blank"
						rel="noopener noreferrer"
						className="primary-text transition-colors duration-200 hover:text-white"
						aria-label={item.name}
					>
						<item.icon className="h-6 w-6" />
					</a>
				))}
			</div>
		</div>
	);
};
