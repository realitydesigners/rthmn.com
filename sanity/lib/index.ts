import { defineArrayMember, defineType } from 'sanity';
import { richText } from '@/sanity/lib/rich-text';

// Documents
import page from '@/sanity/schemas/page';
import team from '@/sanity/schemas/team';
import category from '@/sanity/schemas/category';
import video from '@/sanity/schemas/video';
import glossary from '@/sanity/schemas/glossary';
import lesson from '@/sanity/schemas/lesson';
import course from '@/sanity/schemas/course';
import marketData from '@/sanity/schemas/marketData';
import posts from '@/sanity/schemas/posts';
import changelog from '@/sanity/schemas/changelog';
import faq from '@/sanity/schemas/faq';
import img from '@/sanity/schemas/img';
import audio from '@/sanity/schemas/audio';
import chapter from '@/sanity/schemas/chapter';

// Page Builder Blocks
import heroBlock from '@/sanity/blocks/heroBlock';
import headingBlock from '@/sanity/blocks/headingBlock';
import contentBlock from '@/sanity/blocks/contentBlock';
import teamBlock from '@/sanity/blocks/teamBlock';
import headingSplineBlock from '@/sanity/blocks/headingSplineBlock';
import teamGrid from '@/sanity/blocks/teamGrid';
import sceneBlock from '@/sanity/blocks/sceneBlock';
import courseBlock from '@/sanity/blocks/courseBlock';
import faqBlock from '@/sanity/blocks/faqBlock';
import legalContentBlock from '@/sanity/blocks/legalContentBlock';
import changelogBlock from '@/sanity/blocks/changelogBlock';
import githubBlock from '@/sanity/blocks/githubBlock';

// All page builder blocks in one array
const PageBuilderBlocks = [
    heroBlock,
    headingBlock,
    contentBlock,
    teamBlock,
    headingSplineBlock,
    teamGrid,
    sceneBlock,
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
    name: 'pageBuilder',
    type: 'array',
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
