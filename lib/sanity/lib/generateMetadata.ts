import { sanityFetch } from "@/lib/sanity/lib/client";
import { urlForOpenGraphImage } from "@/lib/sanity/lib/utils";

export async function generateMetadata({ query, params, extractor }, parent) {
	const metadataBaseUrl =
		process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
	const data = await sanityFetch({
		query,
		qParams: { slug: params.slug },
		tags: [params.tag],
	});

	const { title, description, image } = extractor(data);

	const ogImage = urlForOpenGraphImage(image);
	const metadataBase = new URL(metadataBaseUrl);

	return {
		title,
		description: description || parent.description,
		openGraph: ogImage
			? {
					images: [ogImage, ...(parent.openGraph?.images || [])],
				}
			: {},
		metadataBase,
	};
}
