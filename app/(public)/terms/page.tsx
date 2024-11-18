import { client } from '@/utils/sanity/lib/client';
import AboutClient from './client';

async function getTermsPage() {
  return client.fetch(`
    *[_type == "page" && slug.current == "terms"][0] {
      title,
      sections[] {
        sectionTitle,
        layout,
        content,
        backgroundColor
      }
    }
  `);
}

export default async function TermsPage() {
  const page = await getTermsPage();
  return <AboutClient page={page} />;
}
