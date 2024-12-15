import { client } from '@/utils/sanity/lib/client';
import ClientPage from './client';

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

export default async function Page() {
    const page = await getAboutPage();
    return <ClientPage page={page} />;
}
