import ContentBlock from "@/components/PageBuilder/section/ContentBlock";
import CourseBlock from "@/components/PageBuilder/section/CourseBlock";
import HeadingBlock from "@/components/PageBuilder/section/HeadingBlock";
import TeamBlock from "@/components/PageBuilder/section/TeamBlock";
import type { PortableTextBlock } from "@portabletext/types";
import React from "react";

export interface BlockProps {
	_type: {
		headingBlock: "headingBlock";
		contentBlock: "contentBlock";
		teamBlock: "teamBlock";
		courseBlock: "courseBlock";
	};
	layout?: {
		dark: string;
		light: string;
		video: string;
		course: string;
		transparent: string;
	};
	content?: PortableTextBlock[];
	className?: string;
	template?: "course" | "dark" | "light" | "video";
}

export interface ContentBlockProps {
	block: {
		content: PortableTextBlock[];
		className?: string;
		layout?: {
			dark: string;
			light: string;
			video: string;
			course: string;
			transparent: string;
		};
	};
	layout?: string | undefined;
	theme?: string | undefined;
}

const blockComponents = {
	headingBlock: HeadingBlock,
	contentBlock: ContentBlock,
	teamBlock: TeamBlock,
	courseBlock: CourseBlock,
};

const Blocks = ({ block }) => {
	const BlockComponent = blockComponents[block._type];
	if (!BlockComponent) return null;

	const BlockProps = {
		...block,
		block: { ...block, layout: block.layout, className: block.layout },
	};

	return (
		<div className="relative w-full">
			<BlockComponent {...BlockProps} />
		</div>
	);
};

export default Blocks;
