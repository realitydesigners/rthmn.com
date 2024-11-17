import { getChangeLog } from '@/utils/sanity/lib/queries';
import ClientPage from './client';

export default async function ChangelogPage() {
  const changelog = await getChangeLog();

  return <ClientPage changelog={changelog} />;
}
