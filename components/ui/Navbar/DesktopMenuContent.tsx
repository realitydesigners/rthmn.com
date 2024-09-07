import type React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { allLinks, type LinkItem } from "./AllLinks";
import styles from "./styles.module.css";

interface MenuModalProps {
	activeDropdown: string | null;
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
}) => {
	const [animate, setAnimate] = useState(false);

	useEffect(() => {
		setAnimate(true);
		const timer = setTimeout(() => setAnimate(false), 500);
		return () => clearTimeout(timer);
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
						className={`${styles.dropdownContent} ${styles.dropdownResources} ${
							animate ? styles.animateDropdown : ""
						}`}
						role="menu"
						aria-orientation="vertical"
					>
						{group.links.map((item, index) => (
							<DropdownLink
								key={item.title}
								{...item}
								className={`${styles.dropdownItemResources} ${
									styles[`animateItem${index % 4}`]
								}`}
							/>
						))}
					</div>
				);
			case "pricing":
				return (
					<div
						className={`${styles.dropdownContent} ${styles.dropdownPricing} ${
							animate ? styles.animateDropdown : ""
						}`}
						role="menu"
						aria-orientation="vertical"
					>
						{group.links.map((item, index) => (
							<DropdownLink
								key={item.title}
								{...item}
								className={`${styles.dropdownItemPricing} ${
									styles[`animateItem${index % 4}`]
								}`}
							/>
						))}
					</div>
				);
			case "account":
				return (
					<div
						className={`${styles.dropdownContent} ${styles.dropdownAccount} ${
							animate ? styles.animateDropdown : ""
						}`}
						role="menu"
						aria-orientation="vertical"
					>
						{group.links.map((item, index) => (
							<DropdownLink
								key={item.title}
								{...item}
								className={`${styles.dropdownItemAccount} ${
									styles[`animateItem${index % 4}`]
								}`}
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
		<div className={styles.dropdownContainer}>
			<div
				className={`${styles.dropdownWrapper} ${animate ? styles.animateDropdown : ""}`}
			>
				{renderDropdownContent()}
			</div>
		</div>
	);
};

export default DesktopMenuContent;
