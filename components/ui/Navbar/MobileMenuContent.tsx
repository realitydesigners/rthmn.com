import Link from "next/link";
import { oxanium } from "@/app/fonts";
import { allLinks } from "./AllLinks";

export const MobileMenuContent = () => {
	return (
		<div className="grid grid-cols-2 gap-8 pt-8">
			{allLinks.map((item) => (
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
