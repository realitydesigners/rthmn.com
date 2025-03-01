import { notFound } from 'next/navigation';
import { client, sanityFetch } from '@/sanity/lib/client';
import { queryPortfolioItem, querySlugPageData, querySlugPagePaths } from '@/sanity/lib/query';
import { getMetaData } from '@/sanity/lib/seo';
import { PageBuilder } from '@/app/(public)/_components/PageBuilder';

type PageTypeConfig = {
    query: string;
    createPageData: (slug: string, data: any) => any;
};

const PAGE_TYPE_MAPPING: Record<string, PageTypeConfig> = {
    portfolio: {
        query: queryPortfolioItem,
        createPageData: (slug, data) => ({
            data: {
                _type: 'page',
                _id: `portfolio-${slug}`,
                pageBuilder: [
                    {
                        _type: 'portfolioItem',
                        _key: `portfolioItem-${slug}`,
                        project: data,
                    },
                ],
            },
        }),
    },
};

async function fetchSlugPageData(slug: string) {
    // Extract the page type and specific slug
    const [pageType, ...rest] = slug.split('/');
    const specificSlug = rest.join('/');

    // Check if we have a special page type configuration
    const config = PAGE_TYPE_MAPPING[pageType];
    if (config) {
        const result = await sanityFetch({
            query: config.query,
            qParams: { slug: specificSlug },
            tags: ['slug'],
        });

        if (result && typeof result === 'object' && 'data' in result && result.data) {
            return config.createPageData(specificSlug, result.data);
        }
    }

    return await sanityFetch({
        query: querySlugPageData,
        qParams: { slug: `/${slug}` },
        tags: ['slug'],
    });
}

async function fetchSlugPagePaths() {
    const slugs = await client.fetch(querySlugPagePaths);
    const paths: { slug: string[] }[] = [];
    for (const slug of slugs) {
        if (!slug || slug === '/') continue;
        const parts = slug.split('/').filter(Boolean);
        paths.push({ slug: parts });
    }
    return paths;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }) {
    const { slug } = await params;
    const slugString = slug.join('/');
    const pageData = await fetchSlugPageData(slugString);
    if (!pageData || !pageData.data) {
        return getMetaData({});
    }
    return getMetaData(pageData.data);
}

export async function generateStaticParams() {
    return await fetchSlugPagePaths();
}

export default async function SlugPage({ params }: { params: Promise<{ slug: string[] }> }) {
    const { slug } = await params;
    const slugString = slug.join('/');
    const { data: pageData } = await fetchSlugPageData(slugString);

    if (!pageData) {
        return notFound();
    }

    const { title, pageBuilder, _id, _type } = pageData ?? {};

    return !Array.isArray(pageBuilder) || pageBuilder?.length === 0 ? (
        <div className='flex min-h-[50vh] flex-col items-center justify-center p-4 text-center'>
            <h1 className='mb-4 text-2xl font-semibold capitalize'>{title}</h1>
            <p className='text-muted-foreground mb-6'>This page has no content blocks yet.</p>
        </div>
    ) : (
        <PageBuilder blocks={pageBuilder ?? []} id={_id} type={_type ?? 'page'} />
    );
}
