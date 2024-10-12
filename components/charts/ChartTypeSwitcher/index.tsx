"use client";
import React, { useEffect, useState } from "react";
import styles from "./styles.module.css";

interface ChartTypeSwitcherProps {
	chartType: string;
	setChartType: (type: string) => void;
}

const ChartTypeSwitcher: React.FC<ChartTypeSwitcherProps> = ({ chartType, setChartType }) => {
	const [isOpen, setIsOpen] = useState(false);

	const handleToggleDropdown = () => {
		setIsOpen((prev) => !prev);
	};

	const handleChartTypeChange = (type: string) => {
		setChartType(type);
		localStorage.setItem("selectedChartType", type);
		setIsOpen(false);
	};

	useEffect(() => {
		const savedChartType = localStorage.getItem("selectedChartType");
		if (savedChartType) {
			setChartType(savedChartType);
		}
	}, [setChartType]);

	const chartTypes = [
		{ label: "Line", value: "line" },
		{ label: "Candle", value: "candle" },
	];

	const currentChartTypeLabel = chartTypes.find((type) => type.value === chartType)?.label || "Select Chart Type";

	return (
		<div className="relative">
			<button type="button" onClick={handleToggleDropdown} className={`${styles.button} ${styles.buttonActive}`}>
				{currentChartTypeLabel}
			</button>
			{isOpen && (
				<div className={styles.dropdown}>
					{chartTypes.map((type) => (
						<button
							key={type.value}
							type="button"
							onClick={() => handleChartTypeChange(type.value)}
							className={`${styles.button} ${type.value === chartType ? styles.buttonActive : styles.buttonInactive}`}
						>
							{type.label}
						</button>
					))}
				</div>
			)}
		</div>
	);
};

export default ChartTypeSwitcher;
