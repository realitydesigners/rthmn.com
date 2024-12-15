import { ModalContent } from './ModalContent';

interface PageProps {
    params: Promise<{
        pair: string;
    }>;
}

export default async function ModalPairPage(props: PageProps) {
    const params = await props.params;
    const { pair } = params;

    return <ModalContent pair={pair} />;
}
