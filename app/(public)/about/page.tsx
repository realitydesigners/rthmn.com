import { client } from '@/utils/sanity/lib/client';
import AboutClient from './client';

async function getAboutPage() {
    return client.fetch(`
    *[_type == "page" && slug.current == "about"][0] {
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

export default async function AboutPage() {
    const page = await getAboutPage();
    return <AboutClient page={page} />;
}
