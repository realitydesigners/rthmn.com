import { defineArrayMember, defineType } from 'sanity';
import { richText } from '@/lib/sanity/lib/rich-text';

// Documents
import page from '@/lib/sanity/schemas/page';
import team from '@/lib/sanity/schemas/team';
import category from '@/lib/sanity/schemas/category';
import video from '@/lib/sanity/schemas/video';
import glossary from '@/lib/sanity/schemas/glossary';
import lesson from '@/lib/sanity/schemas/lesson';
import course from '@/lib/sanity/schemas/course';
import marketData from '@/lib/sanity/schemas/marketData';
import posts from '@/lib/sanity/schemas/posts';
import changelog from '@/lib/sanity/schemas/changelog';
import faq from '@/lib/sanity/schemas/faq';
import img from '@/lib/sanity/schemas/img';
import audio from '@/lib/sanity/schemas/audio';
import chapter from '@/lib/sanity/schemas/chapter';

// Page Builder Blocks
import heroBlock from '@/lib/sanity/blocks/heroBlock';
import headingBlock from '@/lib/sanity/blocks/headingBlock';
import contentBlock from '@/lib/sanity/blocks/contentBlock';
import teamBlock from '@/lib/sanity/blocks/teamBlock';
import headingSplineBlock from '@/lib/sanity/blocks/headingSplineBlock';
import teamGrid from '@/lib/sanity/blocks/teamGrid';
import sceneBlock from '@/lib/sanity/blocks/sceneBlock';
import courseBlock from '@/lib/sanity/blocks/courseBlock';
import faqBlock from '@/lib/sanity/blocks/faqBlock';
import legalContentBlock from '@/lib/sanity/blocks/legalContentBlock';
import changelogBlock from '@/lib/sanity/blocks/changelogBlock';
import githubBlock from '@/lib/sanity/blocks/githubBlock';

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
