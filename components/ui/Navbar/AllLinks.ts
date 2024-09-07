export interface LinkItem {
	title: string;
	desc?: string;
	icon?: string; // This could be a string reference to an icon or an SVG path
}

export interface LinkGroup {
	title: string;
	links: LinkItem[];
}

export const allLinks: LinkGroup[] = [
	{
		title: "Pricing",
		links: [
			{
				title: "Signal Service",
				desc: "Real-time market signals for informed trading decisions",
				icon: "",
			},
			{
				title: "Premium Signals",
				desc: "Advanced signals with higher accuracy and frequency",
				icon: "",
			},
			{
				title: "Elite Membership",
				desc: "Exclusive access to all features and personalized support",
				icon: "",
			},
		],
	},
	{
		title: "Resources",
		links: [
			{
				title: "Blog",
				desc: "Latest insights and trading strategies",
				icon: "",
			},
			{
				title: "Documentation",
				desc: "Comprehensive guides for using our platform",
				icon: "",
			},
			{
				title: "API",
				desc: "Integrate our services into your applications",
				icon: "",
			},
			{
				title: "Support",
				desc: "24/7 customer support for all your needs",
				icon: "",
			},
		],
	},
	{
		title: "Account",
		links: [
			{
				title: "Profile",
				desc: "Manage your personal information",
				icon: "",
			},
			{
				title: "Settings",
				desc: "Customize your trading environment",
				icon: "",
			},
			{
				title: "Billing",
				desc: "View and manage your subscription",
				icon: "",
			},
		],
	},
];
