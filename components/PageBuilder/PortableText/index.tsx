import { AboutTemplate } from "@/components/PageBuilder/templates/AboutTemplate";
import { ChangelogTemplate } from "@/components/PageBuilder/templates/ChangelogTemplate";
import { PortableText as SanityPortableText } from "@portabletext/react";
import type { PortableTextComponents } from "@portabletext/react";

interface PortableTextProps {
	value: any;
	template?: "about" | "changelog" | "default";
	components?: Partial<PortableTextComponents>;
}

export function PortableText({
	value,
	template = "default",
	components,
}: PortableTextProps) {
	const getTemplate = () => {
		switch (template) {
			case "about":
				return AboutTemplate;
			case "changelog":
				return ChangelogTemplate;
			default:
				return components || {};
		}
	};

	return <SanityPortableText value={value} components={getTemplate()} />;
}
