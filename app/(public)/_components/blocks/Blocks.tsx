import React from 'react';
import type { PortableTextBlock } from '@portabletext/types';
import ContentBlock from '@/app/(public)/_components/blocks/section/ContentBlock';
import HeadingBlock from '@/app/(public)/_components/blocks/section/HeadingBlock';
import HeadingSplineBlock from '@/app/(public)/_components/blocks/section/HeadingSplineBlock';
import TeamBlock from '@/app/(public)/_components/blocks/section/TeamBlock';

export type BlockType = 'headingBlock' | 'headingSplineBlock' | 'contentBlock' | 'teamBlock';

export interface BlockProps {
    _type: BlockType;
    layout?: LayoutTheme;
    content?: PortableTextBlock[];
    className?: string;
}

export interface ContentBlockProps {
    block: {
        content: PortableTextBlock[];
        className?: string;
        layout?: LayoutTheme;
    };
    layout?: string | undefined;
    theme?: string | undefined;
}

export type LayoutTheme = 'dark' | 'light' | 'video';

export type TemplateTheme = 'dark' | 'light';
export interface ThemeProps {
    textColor?: string;
    isInset?: boolean;
    containerBg?: string;
    tagBg?: string;
    tagText?: string;
    backgroundColor?: string;
    topBackgroundColor?: string;
    buttonTextColor?: string;
    buttonBackgroundColor?: string;
    containerBorder?: string;
}

const blockTypeComponents: Record<BlockType, React.ElementType> = {
    headingBlock: HeadingBlock,
    headingSplineBlock: HeadingSplineBlock,
    contentBlock: ContentBlock,
    teamBlock: TeamBlock,
};

const Blocks: React.FC<{ block: BlockProps }> = ({ block }) => {
    const BlockComponent = blockTypeComponents[block._type];
    if (!BlockComponent) return null;

    const BlockProps = {
        ...block,
        block: { ...block, layout: block.layout, className: block.layout },
    };

    return (
        <div className='relative w-full'>
            <BlockComponent {...BlockProps} />
        </div>
    );
};

export default Blocks;
