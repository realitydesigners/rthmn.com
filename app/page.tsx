import { sanityFetch } from '@/sanity/lib/client';
import { queryHomePageData } from '@/sanity/lib/query';
import { getMetaData } from '@/sanity/lib/seo';
import { PageBuilder } from '@/app/(public)/_components/PageBuilder';

// The response from sanityFetch directly matches the query result
interface HomePageData {
    _id: string;
    _type: string;
    pageBuilder?: any[];
    title?: string;
    description?: string;
    slug?: string;
}

async function fetchHomePageData(): Promise<HomePageData> {
    return await sanityFetch({
        query: queryHomePageData,
        tags: ['home'],
    });
}

export async function generateMetadata() {
    const homePageData = await fetchHomePageData();
    if (!homePageData) {
        return getMetaData({});
    }
    return getMetaData(homePageData);
}

export default async function Page() {
    const homePageData = await fetchHomePageData();
    const { _id, _type, pageBuilder } = homePageData ?? {};

    // Ensure we have an id to pass to PageBuilder
    if (!_id) {
        return <div>Loading...</div>;
    }

    return <PageBuilder blocks={pageBuilder ?? []} id={_id} type={_type ?? 'page'} />;
}
