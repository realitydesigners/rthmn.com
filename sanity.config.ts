'use client';
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import {
  contentBlock,
  headingBlock,
  headingSplineBlock,
  teamBlock
} from '@/utils/sanity/blocks/index';
import { dataset, projectId, studioUrl } from '@/utils/sanity/lib/api';
import {
  audio,
  category,
  glossary,
  img,
  posts,
  team,
  video,
  changelog,
  module,
  lesson,
  marketData,
  faq
} from '@/utils/sanity/schemas';
import CustomItem from '@/utils/sanity/ui/CustomItem';
import CustomField from '@/utils/sanity/ui/CustomField';
import { StudioStructure } from '@/utils/sanity/deskStructure';

const title =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_TITLE || 'Reality Designers';

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
      changelog,
      marketData,
      faq
    ]
  },
  form: {
    components: {
      item: CustomItem,
      field: CustomField
    }
  },
  plugins: [
    structureTool({
      structure: StudioStructure
    })
  ]
});
