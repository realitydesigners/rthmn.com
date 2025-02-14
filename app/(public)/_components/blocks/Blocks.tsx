import React from 'react';
import type { PortableTextBlock } from '@portabletext/types';
import ContentBlock from '@/app/(public)/_components/blocks/section/ContentBlock';
import HeadingBlock from '@/app/(public)/_components/blocks/section/HeadingBlock';
import HeadingSplineBlock from '@/app/(public)/_components/blocks/section/HeadingSplineBlock';
import TeamBlock from '@/app/(public)/_components/blocks/section/TeamBlock';
import CourseBlock from '@/app/(public)/_components/blocks/section/CourseBlock';

export interface BlockProps {
    _type: {
        headingBlock: 'headingBlock';
        headingSplineBlock: 'headingSplineBlock';
        contentBlock: 'contentBlock';
        teamBlock: 'teamBlock';
        courseBlock: 'courseBlock';
    };
    layout?: {
        dark: string;
        light: string;
        video: string;
        course: string;
        transparent: string;
    };
    content?: PortableTextBlock[];
    className?: string;
    template?: 'course' | 'dark' | 'light' | 'video';
}

export interface ContentBlockProps {
    block: {
        content: PortableTextBlock[];
        className?: string;
        layout?: {
            dark: string;
            light: string;
            video: string;
            course: string;
            transparent: string;
        };
    };
    layout?: string | undefined;
    theme?: string | undefined;
}

const blockComponents = {
    headingBlock: HeadingBlock,
    headingSplineBlock: HeadingSplineBlock,
    contentBlock: ContentBlock,
    teamBlock: TeamBlock,
    courseBlock: CourseBlock,
};

const Blocks = ({ block }) => {
    const BlockComponent = blockComponents[block._type];
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
