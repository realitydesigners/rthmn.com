'use client';

import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { contentBlock, courseBlock, headingBlock, headingSplineBlock, sceneBlock, teamBlock, teamGrid } from '@/utils/sanity/blocks/index';
import { dataset, projectId, studioUrl } from '@/utils/sanity/lib/api';
import { audio, category, changelog, chapter, course, faq, glossary, img, lesson, marketData, pairSnapshot, posts, team, video } from '@/utils/sanity/schemas';
import page from '@/utils/sanity/schemas/page';
import { CustomField } from '@/utils/sanity/ui/CustomField';
import { CustomItem } from '@/utils/sanity/ui/CustomItem';
import { StudioStructure } from '@/utils/sanity/ui/deskStructure';
import { myTheme } from '@/utils/sanity/ui/theme';

const title = process.env.NEXT_PUBLIC_SANITY_PROJECT_TITLE || 'RTHMN';

export default defineConfig({
    basePath: studioUrl,
    projectId: projectId || '',
    dataset: dataset || '',
    title,
    schema: {
        types: [
            posts,
            img,
            audio,
            video,
            team,
            category,
            glossary,
            headingBlock,
            headingSplineBlock,
            courseBlock,
            contentBlock,
            teamBlock,
            chapter,
            lesson,
            course,
            changelog,
            marketData,
            faq,
            page,
            pairSnapshot,
            teamGrid,
            sceneBlock,
        ],
    },
    form: {
        components: {
            field: CustomField,
            item: CustomItem,
        },
    },
    plugins: [
        structureTool({
            structure: StudioStructure,
        }),
    ],
    theme: myTheme,
});
