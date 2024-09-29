import React from "react";

export const MinusIcon: React.FC = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className="h-5 w-5"
	>
		<line x1="5" y1="12" x2="19" y2="12"></line>
	</svg>
);

export const PlusIcon: React.FC = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className="h-5 w-5"
	>
		<line x1="12" y1="5" x2="12" y2="19"></line>
		<line x1="5" y1="12" x2="19" y2="12"></line>
	</svg>
);

export const ScaledIcon: React.FC<{ className: string }> = ({ className }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
	>
		<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
		<line x1="9" y1="3" x2="9" y2="21"></line>
		<line x1="15" y1="3" x2="15" y2="21"></line>
		<line x1="21" y1="9" x2="3" y2="9"></line>
		<line x1="21" y1="15" x2="3" y2="15"></line>
	</svg>
);

export const EvenIcon: React.FC<{ className: string }> = ({ className }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
	>
		<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
		<line x1="9" y1="9" x2="15" y2="15"></line>
		<line x1="15" y1="9" x2="9" y2="15"></line>
	</svg>
);

export const OscillatorIcon: React.FC<{ className: string }> = ({
	className,
}) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
	>
		<path d="M14 3a4 4 0 0 0-4 4v4a4 4 0 0 0-4 4"></path>
		<path d="M20 3a4 4 0 0 0-4 4v4a4 4 0 0 0-4 4"></path>
		<path d="M14 17a4 4 0 0 0 4 4h4"></path>
		<path d="M20 17a4 4 0 0 0 4 4h4"></path>
	</svg>
);

export const ClockIcon: React.FC = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className="h-5 w-5"
	>
		<circle cx="12" cy="12" r="10" />
		<polyline points="12 6 12 12 16 14" />
	</svg>
);

export const TrendIcon: React.FC<{ trend: "up" | "down" }> = ({ trend }) => {
	const color = trend === "up" ? "text-teal-500" : "text-red-500";
	return (
		<svg
			className={`h-4 w-4 ${color}`}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			{trend === "up" ? (
				<polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
			) : (
				<polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
			)}
			<polyline
				points={trend === "up" ? "17 6 23 6 23 12" : "17 18 23 18 23 12"}
			/>
		</svg>
	);
};
