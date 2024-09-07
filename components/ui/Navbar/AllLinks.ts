import type { IconType } from "react-icons";
import {
	FaSignal,
	FaChartLine,
	FaCrown,
	FaBlog,
	FaBook,
	FaCode,
	FaCompass,
	FaUser,
	FaCog,
	FaCreditCard,
} from "react-icons/fa";

export interface LinkItem {
	title: string;
	desc?: string;
	icon: IconType;
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
				icon: FaSignal,
			},
			{
				title: "Premium Signals",
				desc: "Advanced signals with higher accuracy and frequency",
				icon: FaChartLine,
			},
			{
				title: "Elite Membership",
				desc: "Exclusive access to all features and personalized support",
				icon: FaCrown,
			},
		],
	},
	{
		title: "Resources",
		links: [
			{
				title: "Blog",
				desc: "Latest insights and trading strategies",
				icon: FaBlog,
			},
			{
				title: "Documentation",
				desc: "Comprehensive guides for using our platform",
				icon: FaBook,
			},
			{
				title: "API",
				desc: "Integrate our services into your applications",
				icon: FaCode,
			},
			{
				title: "Support",
				desc: "Support for all your needs",
				icon: FaCompass,
			},
		],
	},
	{
		title: "Account",
		links: [
			{
				title: "Profile",
				desc: "Manage your personal information",
				icon: FaUser,
			},
			{
				title: "Settings",
				desc: "Customize your trading environment",
				icon: FaCog,
			},
			{
				title: "Billing",
				desc: "View and manage your subscription",
				icon: FaCreditCard,
			},
		],
	},
];
