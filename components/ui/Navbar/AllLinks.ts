export interface LinkGroup {
	title: string;
	links: string[];
}

export const allLinks: LinkGroup[] = [
	{
		title: "Pricing",
		links: ["Signal Service", "Premium Signals", "Elite Membership"],
	},
	{
		title: "Resources",
		links: ["Blog", "Documentation", "API", "Support"],
	},
	{
		title: "Account",
		links: ["Profile", "Settings", "Billing"],
	},
];
