export interface LinkItem {
	title: string;
	desc?: string;
	href: string;
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
				href: "/pricing",
			},
			{
				title: "Premium Signals",
				desc: "Advanced signals with higher accuracy and frequency",
				href: "/pricing",
			},
			{
				title: "Elite Membership",
				desc: "Exclusive access to all features and personalized support",
				href: "/pricing",
			},
		],
	},
	{
		title: "Company",
		links: [
			{
				title: "About",
				desc: "Learn about our mission and values",
				href: "/about",
			},
			{
				title: "Team",
				desc: "Meet the minds behind our signals",
				href: "/about",
			},
			{
				title: "Contact",
				desc: "Get in touch with our support team",
				href: "/contact",
			},
		],
	},
	{
		title: "Resources",
		links: [
			{
				title: "Blog",
				desc: "Latest insights and trading strategies",
				href: "/blog",
			},
			{
				title: "Learn",
				desc: "Comprehensive guides for using our platform",
				href: "/",
			},
			{
				title: "Changelog",
				desc: "Latest updates and improvements",
				href: "/changelog",
			},
		],
	},
];
