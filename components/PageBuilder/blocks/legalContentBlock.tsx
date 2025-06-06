"use client";

import { PortableText } from "@/components/PageBuilder/PortableText";

export interface LegalContentBlockProps {
	_type: "legalContentBlock";
	_key: string;
	title?: string;
	content?: any;
	layout?: "contained" | "wide" | "fullWidth";
}

export function LegalContentBlock({
	title,
	content,
	layout = "contained",
}: LegalContentBlockProps) {
	console.log("Legal content block with layout:", layout);

	return (
		<div
			className={`legal-content-block ${layout === "contained" ? "container mx-auto px-4" : layout === "wide" ? "container-wide mx-auto px-4" : "w-full px-6"}`}
		>
			<div className="py-16">
				{title && (
					<h1 className="mb-8 text-center text-4xl font-bold">{title}</h1>
				)}

				{content ? (
					<div className="prose prose-lg dark:prose-invert mx-auto max-w-4xl">
						<PortableText value={content} template="changelog" />
					</div>
				) : (
					<div className="flex min-h-[30vh] items-center justify-center">
						<p className="text-xl">
							No content found. Add content to this block in Sanity Studio.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
