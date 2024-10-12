"use client";
import { oxanium } from "@/fonts";
import Link from "next/link";
import { SignOut } from "@/utils/auth-helpers/server";
import { handleRequest } from "@/utils/auth-helpers/client";
import { usePathname, useRouter } from "next/navigation";
import { getRedirectMethod } from "@/utils/auth-helpers/settings";

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

export const NavbarSignedIn = ({ user }: { user: any }) => {
	const router = getRedirectMethod() === "client" ? useRouter() : null;
	const buttonClasses = `
    px-6 py-2
    gradient-border-button
    text-white font-medium
    ${oxanium.className}
    transition-all duration-300
    hover:shadow-lg
  `;

	return (
		<nav className="fixed left-0 right-0 top-0 z-[1001] h-16 lg:h-20">
			<div className="h-full w-full px-6">
				<div className="flex h-full items-center justify-between">
					<Link href="/dashboard" className="flex items-center gap-2">
						<div className="flex h-8 w-8 items-center">{getIcon("logo")}</div>
						<span className={`text-2xl heading-text font-bold ${oxanium.className}`}>
							RTHMN
						</span>
					</Link>

					<div className="flex items-center space-x-4">
						<Link href="/account" className={`${oxanium.className} text-white`}>
							Account
						</Link>

						<form onSubmit={(e) => handleRequest(e, SignOut, router)}>
							<input type="hidden" name="pathName" value={usePathname()} />
							<button
								type="submit"
								className={`${oxanium.className} text-white`}
							>
								Sign out
							</button>
						</form>
					</div>
				</div>
			</div>
		</nav>
	);
};
