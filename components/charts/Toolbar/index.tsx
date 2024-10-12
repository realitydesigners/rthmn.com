"use client";
import ChartTypeSwitcher from "../ChartTypeSwitcher";
import TimeFrameSwitcher from "../TimeFrameSwitcher";
import React, { useEffect, useState } from "react";

interface RthmnVisionToolbarProps {
	timeInterval: string;
	setTimeInterval: (interval: string) => void;
	chartType: string;
	setChartType: (type: string) => void;
}

const RthmnVisionToolbar: React.FC<RthmnVisionToolbarProps> = ({ timeInterval, setTimeInterval, chartType, setChartType }) => {
	return (
		<div className="w-full absolute ml-40  bg-black h-12 z-[1000] flex  items-center">
			<TimeFrameSwitcher timeInterval={timeInterval} setTimeInterval={setTimeInterval} />
			<ChartTypeSwitcher chartType={chartType} setChartType={setChartType} />
		</div>
	);
};

export default RthmnVisionToolbar;
