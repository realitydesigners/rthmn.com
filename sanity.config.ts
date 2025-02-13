'use client';

import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { contentBlock, headingBlock, headingSplineBlock, sceneBlock, teamBlock, teamGrid } from '@/utils/sanity/blocks/index';
import { dataset, projectId, studioUrl } from '@/utils/sanity/lib/api';
import { audio, category, changelog, course, faq, glossary, img, lesson, marketData, module, pairSnapshot, posts, team, video } from '@/utils/sanity/schemas';
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
            contentBlock,
            teamBlock,
            module,
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
