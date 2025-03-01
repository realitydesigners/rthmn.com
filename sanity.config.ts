'use client';

import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import schemaTypes from './sanity/lib/index';
import { dataset, projectId, studioUrl } from '@/sanity/lib/api';
import { createPageTemplate } from '@/sanity/lib/helper';
import { CustomField, CustomItem, StudioStructure, myTheme } from '@/sanity/ui';

const title = process.env.NEXT_PUBLIC_SANITY_PROJECT_TITLE || 'RTHMN';

export default defineConfig({
    basePath: studioUrl,
    projectId: projectId || '',
    dataset: dataset || '',
    title,
    schema: {
        types: schemaTypes,
        templates: createPageTemplate(),
    },
    form: {
        components: {
            field: CustomField,
            item: CustomItem,
        },
    },
    plugins: [
        structureTool(),
        //     {
        //     structure: StudioStructure,
        // }
    ],
    theme: myTheme,
});
