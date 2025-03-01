import type { Metadata } from 'next';

interface OgImageOptions {
    type?: string;
    id?: string;
}

function getOgImage({ type, id }: OgImageOptions = {}): string {
    const params = new URLSearchParams();
    if (id) params.set('id', id);
    if (type) params.set('type', type);
    const baseUrl = getBaseUrl();
    const logoUrl = `${baseUrl}/api/og?${params.toString()}`;
    return logoUrl;
}

type Maybe<T> = T | null | undefined;

interface MetaDataInput {
    _type?: Maybe<string>;
    seoDescription?: Maybe<string>;
    seoTitle?: Maybe<string>;
    slug?: Maybe<{ current: string | null }> | string | null;
    title?: Maybe<string>;
    description?: Maybe<string>;
    _id?: Maybe<string>;
}
// get the base url from the environment variables
export const getBaseUrl = () => {
    if (process.env.VERCEL_ENV === 'production') {
        return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
    }
    if (process.env.VERCEL_ENV === 'preview') {
        return `https://${process.env.VERCEL_URL}`;
    }

    return 'http://localhost:3000';
};

export function getMetaData(data: MetaDataInput): Metadata {
    const { _type, seoDescription, seoTitle, slug, title, description, _id } = data ?? {};

    const baseUrl = getBaseUrl();
    const pageSlug = typeof slug === 'string' ? slug : (slug?.current ?? '');
    const pageUrl = `${baseUrl}${pageSlug}`;

    const meta = {
        title: seoTitle ?? title ?? '',
        description: seoDescription ?? description ?? '',
    };

    const ogImage = getOgImage({
        type: _type ?? undefined,
        id: _id ?? undefined,
    });

    return {
        title: `${meta.title} | RTHMN`,
        description: meta.description,
        metadataBase: new URL(baseUrl),
        creator: 'RTHMN',
        authors: [{ name: 'RTHMN' }],
        icons: {
            icon: `${baseUrl}/favicon.ico`,
        },
        keywords: ['rthmn', 'forex', 'stocks', 'trading', 'signals', 'automation', 'ai', 'trading platform'],
        twitter: {
            card: 'summary_large_image',
            images: [ogImage],
            creator: '@rthmn',
            title: meta.title,
            description: meta.description,
        },
        openGraph: {
            type: 'website',
            countryName: 'US',
            description: meta.description,
            title: meta.title,
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: meta.title,
                    secureUrl: ogImage,
                },
            ],
            url: pageUrl,
        },
    };
}
