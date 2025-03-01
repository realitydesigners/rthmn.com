'use client';
import { useOptimistic } from '@sanity/visual-editing/react';
import { createDataAttribute, type SanityDocument } from 'next-sanity';
import { dataset, projectId, studioUrl } from '@/utils/sanity/api';
import { HeroBlock, type HeroBlockProps } from './blocks/hero';
import { TeamGridBlock, type TeamGridBlockProps } from './blocks/teamGrid';
import { FAQBlock, type FAQBlockProps } from './blocks/faqBlock';
import { ContentBlock, type ContentBlockProps } from './blocks/contentBlock';
import { LegalContentBlock, type LegalContentBlockProps } from './blocks/legalContentBlock';
import { ChangelogBlock, type ChangelogBlockProps } from './blocks/changelogBlock';

export type PageBuilderBlock = HeroBlockProps | TeamGridBlockProps | FAQBlockProps | ContentBlockProps | LegalContentBlockProps | ChangelogBlockProps;

export interface PageBuilderProps {
    blocks: PageBuilderBlock[];
    id: string;
    type: string;
}

type PageData = {
    _id: string;
    _type: string;
    pageBuilder?: PageBuilderBlock[];
};

const BLOCK_COMPONENTS = {
    hero: HeroBlock,
    teamGrid: TeamGridBlock,
    faqBlock: FAQBlock,
    contentBlock: ContentBlock,
    legalContentBlock: LegalContentBlock,
    changelogBlock: ChangelogBlock,
} as const;

type BlockType = keyof typeof BLOCK_COMPONENTS;

export function PageBuilder({ blocks, id, type }: PageBuilderProps) {
    const pageBuilder = useOptimistic<PageBuilderBlock[], SanityDocument<PageData>>(blocks, (currentPageBuilder, action) => {
        if (action.id === id && action.document.pageBuilder) {
            return action.document.pageBuilder;
        }
        return currentPageBuilder;
    });

    return (
        <main
            className='min-h-screen'
            data-sanity={createDataAttribute({
                id: id,
                baseUrl: studioUrl,
                projectId: projectId,
                dataset: dataset,
                type: type,
                path: 'pageBuilder',
            }).toString()}>
            {pageBuilder.length === 0 && (
                <div className='flex h-screen items-center justify-center'>
                    <p className='text-xl'>No content blocks found. Add some blocks in the Sanity Studio.</p>
                </div>
            )}
            <div className='flex w-full flex-col'>
                {pageBuilder.map((block) => {
                    const Component = BLOCK_COMPONENTS[block._type as BlockType];

                    if (!Component) {
                        return (
                            <div key={`${block._type}-${block._key}`} className='text-muted-foreground bg-muted flex items-center justify-center rounded-lg p-8 text-center'>
                                Component not found for block type: <code>{block._type}</code>
                            </div>
                        );
                    }

                    return (
                        <div
                            key={`${block._type}-${block._key}`}
                            data-sanity={createDataAttribute({
                                id: id,
                                baseUrl: studioUrl,
                                projectId: projectId,
                                dataset: dataset,
                                type: type,
                                path: `pageBuilder[_key=="${block._key}"]`,
                            }).toString()}>
                            <Component {...(block as any)} />
                        </div>
                    );
                })}
            </div>
        </main>
    );
}
