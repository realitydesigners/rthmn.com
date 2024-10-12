"use client";
import React, { useState } from "react";
import styles from "./styles.module.css";

interface ChartSwitcherProps {
	timeInterval: string;
	setTimeInterval: (interval: string) => void;
}

const TimeFrameSwitcher: React.FC<ChartSwitcherProps> = ({ timeInterval, setTimeInterval }) => {
	const [isOpen, setIsOpen] = useState(false);

	const handleToggleDropdown = () => {
		setIsOpen((prev) => !prev);
	};

	const handleSelectInterval = (interval: string) => {
		setTimeInterval(interval);
		setIsOpen(false);
	};

	const intervals = [
		{ label: "SEC", value: "S5" },
		{ label: "1M", value: "M1" },
		{ label: "5M", value: "M5" },
		{ label: "15M", value: "M15" },
		{ label: "M30", value: "M30" },
		{ label: "H1", value: "H1" },
	];

	const currentIntervalLabel = intervals.find((interval) => interval.value === timeInterval)?.label || "Select Interval";

	return (
		<>
			<button type="button" onClick={handleToggleDropdown} className={`${styles.button} ${styles.buttonActive}`}>
				{currentIntervalLabel}
			</button>
			{isOpen && (
				<div className={styles.dropdown}>
					{intervals.map((interval) => (
						<button
							key={interval.value}
							type="button"
							onClick={() => handleSelectInterval(interval.value)}
							className={`${styles.button} ${interval.value === timeInterval ? styles.buttonActive : styles.buttonInactive}`}
						>
							{interval.label}
						</button>
					))}
				</div>
			)}
		</>
	);
};

export default TimeFrameSwitcher;
