import { createClient } from '@sanity/client';
import { apiVersion, dataset, projectId, token } from '@/utils/sanity/lib/api';

const config = {
    projectId,
    dataset,
    apiVersion,
    token: process.env.SANITY_API_WRITE_TOKEN,
    useCdn: false,
};

export const client = createClient(config);

export async function sanityFetch<QueryResponse>({ query, qParams = {}, tags }: { query: string; qParams?: any; tags: string[] }): Promise<QueryResponse> {
    return client.fetch<QueryResponse>(query, qParams, {
        next: { revalidate: 60, tags },
    });
}
