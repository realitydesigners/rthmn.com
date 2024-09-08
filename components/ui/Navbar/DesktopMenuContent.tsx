import { useState, useEffect } from "react";
import Link from "next/link";
import { allLinks, type LinkItem } from "./AllLinks";
import styles from "./styles.module.css";

interface MenuModalProps {
	activeDropdown: string | null;
	onClose: () => void;
}

const DropdownLink: React.FC<LinkItem & { className?: string }> = ({
	title,
	desc,
	icon: Icon,
	className,
}) => (
	<Link
		href="#"
		className={`${styles.dropdownLink} ${className || ""}`}
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
	onClose,
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

	const renderDropdownContent = () => {
		const group = allLinks.find(
			(g) => g.title.toLowerCase() === activeDropdown,
		);
		if (!group) return null;

		switch (activeDropdown) {
			case "resources":
				return (
					<div
						className={`${styles.dropdownContent} ${styles.dropdownResources}`}
						role="menu"
						aria-orientation="vertical"
					>
						<div className="flex flex-col gap-2 w-1/2 ">
							{group.links.map((item, index) => (
								<DropdownLink
									key={item.title}
									{...item}
									className={`${styles.dropdownItem} ${styles[`animateItem${index % 4}`]}`}
								/>
							))}
						</div>
						<div className="w-1/2 flex flex-col gap-2">
							<div className="w-full bg-[#181818] h-full" />
							<div className="w-full bg-[#181818] h-full" />
						</div>
					</div>
				);
			case "pricing":
				return (
					<div
						className={`${styles.dropdownContent} ${styles.dropdownPricing}`}
					>
						<div className="flex flex-col gap-2 w-1/2 ">
							{group.links.map((item, index) => (
								<DropdownLink
									key={item.title}
									{...item}
									className={`${styles.dropdownItem} ${styles[`animateItem${index % 4}`]}`}
								/>
							))}
						</div>
						<div className="w-1/2 flex flex-row gap-2">
							<div className="w-1/2 bg-[#181818] h-full" />
							<div className="w-1/2 bg-[#181818] h-full" />
						</div>
					</div>
				);
			case "account":
				return (
					<div
						className={`${styles.dropdownContent} ${styles.dropdownAccount}`}
						role="menu"
						aria-orientation="vertical"
					>
						<div className="w-1/3 bg-[#181818]" />

						<div className="flex flex-col gap-2 w-2/3 ">
							{group.links.map((item, index) => (
								<DropdownLink
									key={item.title}
									{...item}
									className={`${styles.dropdownItem} ${styles[`animateItem${index % 4}`]}`}
								/>
							))}
						</div>
					</div>
				);
			default:
				return null;
		}
	};

	if (!isVisible) return null;

	return (
		<div
			className={`${styles.dropdownContainer} ${activeDropdown ? styles.active : styles.inactive}`}
			onMouseLeave={onClose}
		>
			<div className={styles.dropdownWrapper}>{renderDropdownContent()}</div>
		</div>
	);
};

export default DesktopMenuContent;
