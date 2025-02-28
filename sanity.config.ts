'use client';

import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import schemaTypes from './utils/sanity';
import { dataset, projectId, studioUrl } from '@/utils/sanity/api';
import { createPageTemplate } from '@/utils/sanity/helper';
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
