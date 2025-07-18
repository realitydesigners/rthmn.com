import type { PortableTextComponents } from "@portabletext/react";
import type React from "react";

const NormalText: React.FC<{ children: React.ReactNode }> = ({ children }) => (
	<div className="flex w-full justify-center p-3">
		<p className="font-russo w-full text-lg leading-relaxed text-white/70 md:w-3/4 lg:w-3/4 2xl:w-1/2">
			{children}
		</p>
	</div>
);

const Heading: React.FC<{ children: React.ReactNode; level: number }> = ({
	children,
	level,
}) => {
	const baseStyle =
		"font-russo text-neutral-gradient font-bold tracking-wide lg:w-3/4 2xl:w-1/2";
	const sizes = {
		1: "pt-12 text-4xl lg:text-7xl",
		2: "pt-12 text-4xl lg:text-6xl",
		3: "pt-12 text-2xl lg:text-3xl",
		4: "pt-12 text-xl lg:text-2xl",
	};

	return (
		<div className="flex w-full justify-center p-3">
			<div
				className={`w-full md:w-3/4 lg:w-1/2 ${baseStyle} ${sizes[level as keyof typeof sizes]}`}
			>
				{children}
			</div>
		</div>
	);
};

export const AboutTemplate: PortableTextComponents = {
	block: {
		normal: ({ children }) => <NormalText>{children}</NormalText>,
		h1: ({ children }) => <Heading level={1}>{children}</Heading>,
		h2: ({ children }) => <Heading level={2}>{children}</Heading>,
		h3: ({ children }) => <Heading level={3}>{children}</Heading>,
		h4: ({ children }) => <Heading level={4}>{children}</Heading>,
	},
	list: {
		bullet: ({ children }) => (
			<div className="flex w-full justify-center p-3">
				<ul className="font-russo w-full list-disc space-y-2 pl-4 text-white/70 md:w-3/4 lg:w-1/2">
					{children}
				</ul>
			</div>
		),
		number: ({ children }) => (
			<div className="flex w-full justify-center p-3">
				<ol className="font-russo w-full list-decimal space-y-2 pl-4 text-white/70 md:w-3/4 lg:w-1/2">
					{children}
				</ol>
			</div>
		),
	},
	marks: {
		link: ({ children, value }) => (
			<a
				href={value?.href}
				className="font-russo text-cyan-400 transition-colors duration-200 hover:text-cyan-300"
				target="_blank"
				rel="noopener noreferrer"
			>
				{children}
			</a>
		),
		strong: ({ children }) => (
			<strong className="font-russo font-semibold text-white/90">
				{children}
			</strong>
		),
	},
	types: {
		image: ({ value }) => (
			<div className="flex w-full justify-center p-3">
				<div className="w-full overflow-hidden rounded-xl md:w-3/4 lg:w-1/2">
					<img
						src={value?.asset?.url}
						alt={value?.alt || ""}
						className="h-auto w-full"
					/>
				</div>
			</div>
		),
	},
};
