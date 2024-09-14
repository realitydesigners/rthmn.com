import { useState, useEffect } from "react";
import Link from "next/link";
import { allLinks, type LinkItem } from "./AllLinks";
import styles from "./styles.module.css";
import { motion, AnimatePresence } from "framer-motion";

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
			case "resources":
				return (
					<div
						className={`${styles.dropdownContent} ${styles.dropdownResources}`}
					>
						<motion.div
							className="flex flex-col gap-2 w-1/2"
							variants={contentVariants}
							initial="hidden"
							animate="visible"
						>
							{group.links.map((item, index) => (
								<motion.div key={item.title} variants={itemVariants}>
									<DropdownLink {...item} className={styles.dropdownItem} />
								</motion.div>
							))}
						</motion.div>
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
						<motion.div
							className="flex flex-col gap-2 w-1/2"
							variants={contentVariants}
							initial="hidden"
							animate="visible"
						>
							{group.links.map((item, index) => (
								<motion.div key={item.title} variants={itemVariants}>
									<DropdownLink {...item} className={styles.dropdownItem} />
								</motion.div>
							))}
						</motion.div>
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
					>
						<div className="w-1/3 bg-[#181818]" />
						<motion.div
							className="flex flex-col gap-2 w-2/3"
							variants={contentVariants}
							initial="hidden"
							animate="visible"
						>
							{group.links.map((item, index) => (
								<motion.div key={item.title} variants={itemVariants}>
									<DropdownLink {...item} className={styles.dropdownItem} />
								</motion.div>
							))}
						</motion.div>
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
					className={`${styles.dropdownContainer} ${activeDropdown ? styles.active : styles.inactive}`}
					onMouseLeave={onClose}
					variants={dropdownVariants}
					initial="hidden"
					animate="visible"
					exit="exit"
				>
					<div className={styles.dropdownWrapper}>
						{renderDropdownContent()}
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};

export default DesktopMenuContent;
