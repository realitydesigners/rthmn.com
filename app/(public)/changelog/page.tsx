import { getChangeLog } from '@/utils/sanity/queries';
import ClientPage from './client';

export default async function ChangelogPage() {
    const changelog = await getChangeLog();

    return <ClientPage changelog={changelog} />;
}
