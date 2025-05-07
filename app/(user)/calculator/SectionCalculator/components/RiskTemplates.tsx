export interface RiskTemplate {
	label: string;
	value: number;
	description: string;
	riskLevel: "low" | "medium" | "high";
}

export const RISK_TEMPLATES: RiskTemplate[] = [
	{
		label: "Conservative",
		value: 0.5,
		description: "Safer approach, lower risk per trade",
		riskLevel: "low",
	},
	{
		label: "Balanced",
		value: 1.0,
		description: "Standard risk management",
		riskLevel: "medium",
	},
	{
		label: "Aggressive",
		value: 2.0,
		description: "Higher risk, higher potential return",
		riskLevel: "high",
	},
];

export const getRiskLevelColor = (level: RiskTemplate["riskLevel"]) => {
	switch (level) {
		case "low":
			return "text-blue-400 bg-blue-400/10";
		case "medium":
			return "text-blue-400 bg-blue-400/10";
		case "high":
			return "text-amber-400 bg-amber-400/10";
		default:
			return "text-neutral-400 bg-neutral-400/10";
	}
};
