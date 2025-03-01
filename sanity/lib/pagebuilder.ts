import { defineArrayMember, defineType } from 'sanity';

import { PageBuilderBlocks } from '@/sanity/blocks';

export const pagebuilderBlockTypes = PageBuilderBlocks.map(({ name }) => ({
    type: name,
}));

export const blocks = PageBuilderBlocks;

export const pageBuilder = defineType({
    name: 'pageBuilder',
    type: 'array',
    of: pagebuilderBlockTypes.map((block) => defineArrayMember(block)),
});
