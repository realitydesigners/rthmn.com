import { BlockElementIcon, ComposeIcon, InlineElementIcon, InsertAboveIcon, SearchIcon } from '@sanity/icons';
import { defineField, type FieldGroupDefinition } from 'sanity';

export const GROUP = {
    SEO: 'seo',
    MAIN_CONTENT: 'main-content',
    CARD: 'card',
    RELATED: 'related',
    OG: 'og',
};

export const GROUPS: FieldGroupDefinition[] = [
    // { name: CONST.MAIN_CONTENT, default: true },
    {
        name: GROUP.MAIN_CONTENT,
        icon: ComposeIcon,
        title: 'Content',
        default: true,
    },
    { name: GROUP.SEO, icon: SearchIcon, title: 'SEO' },
    {
        name: GROUP.OG,
        icon: InsertAboveIcon,
        title: 'Open Graph',
    },
    {
        name: GROUP.CARD,
        icon: BlockElementIcon,
        title: 'Card',
    },
    {
        name: GROUP.RELATED,
        icon: InlineElementIcon,
        title: 'Related',
    },
];

export const richTextField = defineField({
    name: 'richText',
    type: 'richText',
});

export const buttonsField = defineField({
    name: 'buttons',
    type: 'array',
    of: [{ type: 'button' }],
});

export const pageBuilderField = defineField({
    name: 'pageBuilder',
    group: GROUP.MAIN_CONTENT,
    type: 'pageBuilder',
});

export const iconField = defineField({
    name: 'icon',
    title: 'Icon',
    type: 'iconPicker',
});
