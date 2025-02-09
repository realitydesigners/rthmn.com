import { client } from '@/utils/sanity/lib/client';
import AboutClient from './client';

async function getPrivacyPage() {
    return client.fetch(`
    *[_type == "page" && slug.current == "privacy"][0] {
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

export default async function PrivacyPage() {
    const page = await getPrivacyPage();
    return <AboutClient page={page} />;
}
