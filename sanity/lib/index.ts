//documents

import page from '@/sanity/schemas/page';

import { pageBuilder, blocks } from '@/sanity/lib/pagebuilder';
import { richText } from '@/sanity/lib/rich-text';
import { audio, img, team, category, posts, faq, course, glossary, video, pairSnapshot, marketData, chapter, changelog, lesson } from '@/sanity/schemas';

export const singletons = [audio, img, team, category, posts, faq, course, glossary, video, pairSnapshot, marketData, chapter, changelog, lesson];
export const documents = [page, ...singletons];
export const schemaTypes = [...documents, ...blocks, pageBuilder, richText];

export default schemaTypes;
