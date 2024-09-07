import type React from "react";
import Link from "next/link";
import { allLinks, type LinkItem } from "./AllLinks";

interface MenuModalProps {
	activeDropdown: string | null;
}

const DropdownLink: React.FC<LinkItem & { className: string }> = ({
	title,
	desc,
	icon,
	className,
}) => (
	<Link href="#" className={`${className} flex items-start`} role="menuitem">
		<div className="flex-shrink-0 mr-3">
			{/* Replace this with your actual icon component or SVG */}
			<div className="w-6 h-6 bg-gray-600">{icon}</div>
		</div>
		<div>
			<div className="font-bold">{title}</div>
			<div className="text-xs text-gray-400">{desc}</div>
		</div>
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
						className="grid grid-cols-2 gap-4 p-4 w-[600px]"
						role="menu"
						aria-orientation="vertical"
					>
						{group.links.map((item) => (
							<DropdownLink
								key={item.title}
								{...item}
								className="block px-3 py-2 text-sm text-white hover:bg-gray-800 rounded"
							/>
						))}
					</div>
				);
			case "pricing":
				return (
					<div
						className="grid grid-cols-2 gap-4 p-4 w-[800px]"
						role="menu"
						aria-orientation="vertical"
					>
						{group.links.map((item) => (
							<DropdownLink
								key={item.title}
								{...item}
								className="block px-3 py-2 text-sm text-white hover:bg-gray-800 rounded"
							/>
						))}
					</div>
				);
			case "account":
				return (
					<div
						className="grid grid-cols-2 gap-4 p-4 w-[500px]"
						role="menu"
						aria-orientation="vertical"
					>
						{group.links.map((item) => (
							<DropdownLink
								key={item.title}
								{...item}
								className="block px-3 py-2 text-sm text-white hover:bg-gray-800 rounded"
							/>
						))}
					</div>
				);
			default:
				return null;
		}
	};

	if (!activeDropdown) return null;

	return (
		<div className="fixed left-0 right-0 flex justify-center">
			<div className="mt-0 rounded-md shadow-lg bg-black bg-opacity-90 ring-1 ring-white ring-opacity-20 hidden group-hover:block">
				<div className="h-2" />
				{renderDropdownContent()}
			</div>
		</div>
	);
};
