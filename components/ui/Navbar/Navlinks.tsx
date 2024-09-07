"use client";
import { handleRequest } from "@/utils/auth-helpers/client";
import { SignOut } from "@/utils/auth-helpers/server";
import { getRedirectMethod } from "@/utils/auth-helpers/settings";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { oxanium } from "@/app/fonts";
import { DesktopMenuContent } from "./DesktopMenuContent";
import { MobileMenuContent } from "./MobileMenuContent";

interface NavlinksProps {
	user?: {
		id: string;
		email?: string;
	} | null;
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
						stroke="url(#paint0_linear_1208_27417)"
						strokeWidth="8"
					/>
				</g>
				<defs>
					<linearGradient
						id="paint0_linear_1208_27417"
						x1="6.74999"
						y1="6.75001"
						x2="92.25"
						y2="92.25"
						gradientUnits="userSpaceOnUse"
					>
						<stop stopColor="#ffffff" offset="0.5" />
						<stop offset="1" stopColor="#787c80" />
					</linearGradient>
					<clipPath id="clip0_1208_27417">
						<rect width="100" height="100" fill="white" />
					</clipPath>
				</defs>
			</svg>
		),
	};
	return icons[name] || <path />;
};

const Links = () => {
	const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

	return (
		<div className="relative group">
			<div className="flex space-x-0">
				<div
					className="px-4 py-6"
					onMouseEnter={() => setActiveDropdown("pricing")}
				>
					<Link
						href="/"
						className={`font-bold heading-text ${oxanium.className}`}
					>
						Pricing
					</Link>
				</div>
				<div
					className="px-4 py-6"
					onMouseEnter={() => setActiveDropdown("resources")}
				>
					<Link
						href="/resources"
						className={`font-bold heading-text ${oxanium.className}`}
					>
						Resources
					</Link>
				</div>

				<div
					className="px-4 py-6"
					onMouseEnter={() => setActiveDropdown("account")}
				>
					<Link
						href="/account"
						className={`font-bold heading-text ${oxanium.className}`}
					>
						Account
					</Link>
				</div>
			</div>
			<DesktopMenuContent activeDropdown={activeDropdown} />
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
		<title id="menuIconTitle">{isOpen ? "Close Menu" : "Open Menu"}</title>
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

export function Navlinks({ user }: NavlinksProps) {
	const router = getRedirectMethod() === "client" ? useRouter() : null;
	const [isNavOpen, setIsNavOpen] = useState(false);

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

	const handleBackdropClick = () => {
		setIsNavOpen(false);
	};

	const toggleNav = () => {
		setIsNavOpen(!isNavOpen);
	};

	const buttonClasses = `
        px-6 py-2
        gradient-border-button
        text-white font-medium
        ${oxanium.className}
        transition-all duration-300
        hover:shadow-lg
    `;

	return (
		<>
			{isNavOpen && (
				<div
					className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
					onClick={handleBackdropClick}
					onKeyDown={(e) => e.key === "Escape" && handleBackdropClick()}
					role="button"
					tabIndex={0}
				/>
			)}

			<div
				className={`fixed top-0 left-0 right-0 z-50 h-16 lg:h-20 bg-gradient-to-b from-black via-black to-transparent ${oxanium.className}`}
			>
				<div className="max-w-6xl mx-auto  h-full">
					<div className="flex items-center justify-between h-full">
						<Link
							href="/"
							className="flex pl-4 xl:pl-0 items-center gap-2 z-50"
						>
							<div className="flex h-8 w-8 items-center">{getIcon("logo")}</div>
							<div className="heading-text text-xl lg:block hidden font-bold">
								RTHMN
							</div>
						</Link>

						<nav className="hidden lg:flex space-x-4">
							<Links />
						</nav>

						{/* Desktop sign-in/sign-out button */}
						<div className="hidden lg:block">
							{user ? (
								<form onSubmit={(e) => handleRequest(e, SignOut, router)}>
									<input type="hidden" name="pathName" value={usePathname()} />
									<button type="submit" className={buttonClasses}>
										Sign out
									</button>
								</form>
							) : (
								<Link href="/signin" className={buttonClasses}>
									Sign In
								</Link>
							)}
						</div>

						<button
							onClick={toggleNav}
							className="lg:hidden w-14 h-14 items-center justify-center flex z-50 menu-icon-button"
							type="button"
							aria-label="Toggle navigation"
						>
							<MenuIcon isOpen={isNavOpen} />
						</button>
					</div>
				</div>
			</div>

			{/* Mobile Navigation Menu */}
			{isNavOpen && (
				<div
					className={`fixed inset-0 z-40 bg-black bg-opacity-95 backdrop-blur-sm pt-16 lg:hidden ${oxanium.className}`}
				>
					<div className="h-full flex flex-col px-6 overflow-y-auto">
						<MobileMenuContent />
						<div className="mt-8">
							{user ? (
								<form onSubmit={(e) => handleRequest(e, SignOut, router)}>
									<input type="hidden" name="pathName" value={usePathname()} />
									<button type="submit" className={`${buttonClasses} w-full`}>
										Sign out
									</button>
								</form>
							) : (
								<Link
									href="/signin"
									className={`${buttonClasses} w-full block text-center`}
									// onClick={() => setIsNavOpen(false)}
								>
									Sign In
								</Link>
							)}
						</div>
					</div>
				</div>
			)}
		</>
	);
}
