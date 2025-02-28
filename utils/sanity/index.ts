import { PageBuilderBlocks } from './blocks';
//documents

import page from './schemas/page';

import { pageBuilder } from './pagebuilder';
import { richText } from './rich-text';
import { audio, img, team, category, posts, faq, course, glossary, video, pairSnapshot, marketData, chapter, changelog, lesson } from './schemas';

export const blocks = [];

export const singletons = [audio, img, team, category, posts, faq, course, glossary, video, pairSnapshot, marketData, chapter, changelog, lesson];
export const documents = [page, ...singletons];
export const schemaTypes = [...documents, ...PageBuilderBlocks, pageBuilder, richText];

export default schemaTypes;
