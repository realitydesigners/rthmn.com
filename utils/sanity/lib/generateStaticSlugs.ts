import { createClient } from '@sanity/client/stega';
import { groq } from 'next-sanity';
import { apiVersion, dataset, projectId, studioUrl } from '@/utils/sanity/lib/api';
import { token } from '@/utils/sanity/lib/token';
import 'server-only';

export const client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: process.env.NODE_ENV === 'development' ? true : false,
    perspective: 'published',
    stega: {
        studioUrl,
    },
});

// Used in `generateStaticParams`
export function generateStaticSlugs(type: string) {
    // Not using loadQuery as it's optimized for fetching in the RSC lifecycle
    return client
        .withConfig({
            token,
            perspective: 'published',
            useCdn: true,
            stega: false,
        })
        .fetch<string[]>(groq`*[_type == $type && defined(slug.current)]{"slug": slug.current}`, { type });
}
