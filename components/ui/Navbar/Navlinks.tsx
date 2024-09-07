"use client";
import { handleRequest } from "@/utils/auth-helpers/client";
import { SignOut } from "@/utils/auth-helpers/server";
import { getRedirectMethod } from "@/utils/auth-helpers/settings";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { oxanium } from "@/app/fonts";

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
		library: (
			<svg
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				aria-labelledby="libraryTitle"
			>
				<title id="libraryTitle">Library</title>
				<path
					d="M4 3H20V21H4V3ZM6 5V19H18V5H6Z"
					stroke="currentColor"
					strokeWidth="2"
				/>
				<path d="M9 7H15" stroke="currentColor" strokeWidth="2" />
				<path d="M9 11H15" stroke="currentColor" strokeWidth="2" />
				<path d="M9 15H15" stroke="currentColor" strokeWidth="2" />
			</svg>
		),

		lock: (
			<svg
				width="20"
				height="20"
				viewBox="0 0 18 20"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				aria-labelledby="lockTitle"
			>
				<title id="lockTitle">Lock</title>
				<path
					d="M1 11C1 9.11438 1 8.17157 1.58579 7.58579C2.17157 7 3.11438 7 5 7H13C14.8856 7 15.8284 7 16.4142 7.58579C17 8.17157 17 9.11438 17 11V13C17 15.8284 17 17.2426 16.1213 18.1213C15.2426 19 13.8284 19 11 19H7C4.17157 19 2.75736 19 1.87868 18.1213C1 17.2426 1 15.8284 1 13V11Z"
					stroke="#444"
					strokeWidth="2"
				/>
				<path
					d="M13 6V5C13 2.79086 11.2091 1 9 1V1C6.79086 1 5 2.79086 5 5V6"
					stroke="#444"
					strokeWidth="2"
					strokeLinecap="round"
				/>
				<circle cx="9" cy="13" r="2" fill="#444" />
			</svg>
		),
		story: (
			<svg
				width="20"
				height="16"
				viewBox="0 0 20 16"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				aria-labelledby="storyTitle"
			>
				<title id="storyTitle">Story</title>
				<path
					d="M19 12.6953V1.66466C19 1.34631 18.6785 1.12861 18.3829 1.24685L14.1351 2.94596C14.0473 2.98109 13.9506 2.98765 13.8588 2.96471L6.14116 1.03529C6.04939 1.01235 5.95273 1.01891 5.8649 1.05404L1.28287 2.88685C1.11203 2.95519 1 3.12066 1 3.30466V14.3353C1 14.6537 1.32154 14.8714 1.61713 14.7531L5.8649 13.054C5.95273 13.0189 6.04939 13.0123 6.14117 13.0353L13.8588 14.9647C13.9506 14.9877 14.0473 14.9811 14.1351 14.946L18.7171 13.1131C18.888 13.0448 19 12.8793 19 12.6953Z"
					stroke="#999"
					strokeWidth="2"
					strokeLinejoin="round"
				/>
				<path d="M14 15V3" stroke="#999" strokeWidth="2" />
				<path d="M6 13L6 1" stroke="#999" strokeWidth="2" />
			</svg>
		),
		video: (
			<svg
				width="20"
				height="16"
				viewBox="0 0 20 16"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				aria-labelledby="videoTitle"
			>
				<title id="videoTitle">Video</title>
				<path
					d="M19 12.6953V1.66466C19 1.34631 18.6785 1.12861 18.3829 1.24685L14.1351 2.94596C14.0473 2.98109 13.9506 2.98765 13.8588 2.96471L6.14116 1.03529C6.04939 1.01235 5.95273 1.01891 5.8649 1.05404L1.28287 2.88685C1.11203 2.95519 1 3.12066 1 3.30466V14.3353C1 14.6537 1.32154 14.8714 1.61713 14.7531L5.8649 13.054C5.95273 13.0189 6.04939 13.0123 6.14117 13.0353L13.8588 14.9647C13.9506 14.9877 14.0473 14.9811 14.1351 14.946L18.7171 13.1131C18.888 13.0448 19 12.8793 19 12.6953Z"
					stroke="#999"
					strokeWidth="2"
					strokeLinejoin="round"
				/>
				<path d="M14 15V3" stroke="#999" strokeWidth="2" />
				<path d="M6 13L6 1" stroke="#999" strokeWidth="2" />
			</svg>
		),
	};
	return icons[name] || <path />;
};

const Links = ({ user }: { user: NavlinksProps["user"] }) => (
	<>
		<Link href="/" className={`font-bold heading-text ${oxanium.className}`}>
			Pricing
		</Link>
		{user && (
			<Link
				href="/account"
				className={`font-bold heading-text ${oxanium.className}`}
			>
				Account
			</Link>
		)}
	</>
);

export function Navlinks({ user }: NavlinksProps) {
	const router = getRedirectMethod() === "client" ? useRouter() : null;
	const [isNavOpen, setIsNavOpen] = useState(false);

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
				<div className="max-w-6xl mx-auto px-4 h-full">
					<div className="flex items-center justify-between h-full">
						<Link href="/" className="flex items-center gap-2 z-50">
							<div className="flex h-8 w-8 items-center">{getIcon("logo")}</div>
							<div className="heading-text text-xl lg:block hidden font-bold">
								RTHMN
							</div>
						</Link>

						<nav className="hidden lg:flex space-x-4">
							<Links user={user} />
						</nav>

						{/* Mobile sign-in/sign-out button */}
						<div className="absolute left-1/2 transform -translate-x-1/2 lg:hidden z-50">
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
							className="lg:hidden z-50"
							type="button"
							aria-label="Toggle navigation"
						>
							<svg
								width="24"
								height="24"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-labelledby="menuTitle"
							>
								<title id="menuTitle">
									{isNavOpen ? "Close Menu" : "Open Menu"}
								</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d={
										isNavOpen
											? "M6 18L18 6M6 6l12 12"
											: "M4 6h16M4 12h16M4 18h16"
									}
								/>
							</svg>
						</button>
					</div>
				</div>
			</div>

			{/* Mobile Navigation Menu */}
			{isNavOpen && (
				<div
					className={`fixed inset-0 z-40 bg-black bg-opacity-95 backdrop-blur-sm pt-16 lg:hidden ${oxanium.className}`}
				>
					<div className="h-full flex flex-col justify-center items-center">
						<nav className="flex flex-col space-y-8 text-center">
							<Links user={user} />
						</nav>
					</div>
				</div>
			)}
		</>
	);
}
