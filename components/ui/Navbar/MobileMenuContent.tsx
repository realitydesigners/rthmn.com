import Link from "next/link";
import { oxanium } from "@/app/fonts";

export const MobileMenuContent = () => {
	const menuItems = [
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

	return (
		<div className="grid grid-cols-2 gap-8 pt-8">
			{menuItems.map((item) => (
				<div key={item.title} className="flex flex-col">
					<h2
						className={`text-[#555] font-bold text-lg mb-2 ${oxanium.className}`}
					>
						{item.title}
					</h2>
					{item.links.map((link) => (
						<Link
							key={link}
							href="#"
							className={`heading-text font-bold py-2 text-base ${oxanium.className}`}
						>
							{link}
						</Link>
					))}
				</div>
			))}
		</div>
	);
};
