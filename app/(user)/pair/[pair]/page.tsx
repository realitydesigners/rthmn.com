import Client from './client';

interface PageProps {
    params: Promise<{
        pair: string;
    }>;
}

export default async function PairPage(props: PageProps) {
    const params = await props.params;
    const { pair } = params;

    return (
        <div className='w-full'>
            <Client pair={pair} />
        </div>
    );
}
