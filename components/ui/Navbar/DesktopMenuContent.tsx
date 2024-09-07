import type React from "react";
import Link from "next/link";
import { allLinks } from "./AllLinks";

interface MenuModalProps {
	activeDropdown: string | null;
}

const DropdownLink: React.FC<{
	href: string;
	className: string;
	children: React.ReactNode;
}> = ({ href, className, children }) => (
	<Link href={href} className={className} role="menuitem">
		{children}
	</Link>
);

export const DesktopMenuContent: React.FC<MenuModalProps> = ({
	activeDropdown,
}) => {
	const renderDropdownContent = () => {
		const group = allLinks.find(
			(g) => g.title.toLowerCase() === activeDropdown,
		);
		if (!group) return null;

		switch (activeDropdown) {
			case "resources":
				return (
					<div
						className="grid grid-cols-2 gap-4 p-4"
						role="menu"
						aria-orientation="vertical"
					>
						{group.links.map((item) => (
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
			case "pricing":
				return (
					<div
						className="grid grid-cols-2 gap-4 p-4"
						role="menu"
						aria-orientation="vertical"
					>
						{group.links.map((item) => (
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
			case "account":
				return (
					<div
						className="grid grid-cols-2 gap-4 p-4"
						role="menu"
						aria-orientation="vertical"
					>
						{group.links.map((item) => (
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
				null;
		}
	};

	if (!activeDropdown) return null;

	return (
		<div
			className={
				"absolute left-0 top-full mt-0 rounded-md shadow-lg bg-black bg-opacity-90 ring-1 ring-white ring-opacity-20 hidden group-hover:block "
			}
		>
			<div className="h-2" />
			{renderDropdownContent()}
		</div>
	);
};
