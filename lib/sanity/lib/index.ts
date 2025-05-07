import { richText } from "@/lib/sanity/lib/rich-text";
import { defineArrayMember, defineType } from "sanity";

import audio from "@/lib/sanity/schemas/audio";
import category from "@/lib/sanity/schemas/category";
import changelog from "@/lib/sanity/schemas/changelog";
import chapter from "@/lib/sanity/schemas/chapter";
import course from "@/lib/sanity/schemas/course";
import faq from "@/lib/sanity/schemas/faq";
import glossary from "@/lib/sanity/schemas/glossary";
import img from "@/lib/sanity/schemas/img";
import lesson from "@/lib/sanity/schemas/lesson";
import marketData from "@/lib/sanity/schemas/marketData";
// Documents
import page from "@/lib/sanity/schemas/page";
import posts from "@/lib/sanity/schemas/posts";
import team from "@/lib/sanity/schemas/team";
import video from "@/lib/sanity/schemas/video";

// Page Builder Blocks

import changelogBlock from "@/lib/sanity/blocks/changelogBlock";
import contentBlock from "@/lib/sanity/blocks/contentBlock";
import courseBlock from "@/lib/sanity/blocks/courseBlock";
import faqBlock from "@/lib/sanity/blocks/faqBlock";
import githubBlock from "@/lib/sanity/blocks/githubBlock";
import headingBlock from "@/lib/sanity/blocks/headingBlock";
import legalContentBlock from "@/lib/sanity/blocks/legalContentBlock";
import teamBlock from "@/lib/sanity/blocks/teamBlock";
import teamGrid from "@/lib/sanity/blocks/teamGrid";

// All page builder blocks in one array
const PageBuilderBlocks = [
	headingBlock,
	contentBlock,
	teamBlock,
	teamGrid,
	courseBlock,
	faqBlock,
	legalContentBlock,
	changelogBlock,
	githubBlock,
];

// Page builder block types
export const pagebuilderBlockTypes = PageBuilderBlocks.map(({ name }) => ({
	type: name,
}));

// Page builder definition
export const pageBuilder = defineType({
	name: "pageBuilder",
	type: "array",
	of: pagebuilderBlockTypes.map((block) => defineArrayMember(block)),
});

export const schemaTypes = [
	// Rich text
	richText,
	// Page builder
	pageBuilder,

	// Documents
	page,
	audio,
	img,
	team,
	category,
	posts,
	faq,
	course,
	glossary,
	video,
	marketData,
	chapter,
	changelog,
	lesson,

	// Page builder blocks
	...PageBuilderBlocks,
];

export default schemaTypes;
