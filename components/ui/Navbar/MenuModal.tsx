import type React from "react";
import Link from "next/link";

interface MenuModalProps {
	activeDropdown: string | null;
}

const pricingLinks = ["Signal Service", "Premium Signals", "Elite Membership"];
const accountLinks = ["Profile", "Settings", "Billing"];
const resourceLinks = ["Blog", "Documentation", "API", "Support"];

const DropdownLink: React.FC<{
	href: string;
	className: string;
	children: React.ReactNode;
}> = ({ href, className, children }) => (
	<Link href={href} className={className} role="menuitem">
		{children}
	</Link>
);

export const MenuModal: React.FC<MenuModalProps> = ({ activeDropdown }) => {
	const renderDropdownContent = () => {
		switch (activeDropdown) {
			case "pricing":
				return (
					<div className="py-1" role="menu" aria-orientation="vertical">
						{pricingLinks.map((item) => (
							<DropdownLink
								key={item}
								href="#"
								className="block px-4 py-2 text-sm text-white hover:bg-gray-800"
							>
								{item}
							</DropdownLink>
						))}
					</div>
				);
			case "account":
				return (
					<div className="py-1" role="menu" aria-orientation="vertical">
						{accountLinks.map((item) => (
							<DropdownLink
								key={item}
								href="#"
								className="block px-4 py-2 text-sm text-white hover:bg-gray-800"
							>
								{item}
							</DropdownLink>
						))}
					</div>
				);
			case "resources":
				return (
					<div
						className="grid grid-cols-2 gap-4 p-4"
						role="menu"
						aria-orientation="vertical"
					>
						{resourceLinks.map((item) => (
							<DropdownLink
								key={item}
								href="#"
								className="block px-3 py-2 text-sm text-white hover:bg-gray-800 rounded"
							>
								{item}
							</DropdownLink>
						))}
					</div>
				);
			default:
				return null;
		}
	};

	const getDropdownWidth = () => {
		switch (activeDropdown) {
			case "resources":
				return "w-80";
			case "pricing":
				return "w-64";
			default:
				return "w-40";
		}
	};

	if (!activeDropdown) return null;

	return (
		<div
			className={`absolute left-0 top-full mt-0 rounded-md shadow-lg bg-black bg-opacity-90 ring-1 ring-white ring-opacity-20 hidden group-hover:block ${getDropdownWidth()}`}
		>
			<div className="h-2" /> {/* Spacer */}
			{renderDropdownContent()}
		</div>
	);
};

export default MenuModal;
