import { useCallback, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import debounce from 'lodash/debounce';

export const useUrlParams = (pair: string) => {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [boxOffset, setBoxOffset] = useState(() => {
        const offsetParam = searchParams.get('offset');
        return offsetParam ? parseInt(offsetParam, 10) : 0;
    });

    const updateURL = useCallback(
        (newOffset: number) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set('offset', newOffset.toString());
            window.history.replaceState({}, '', `${pathname}?${params.toString()}`);
        },
        [searchParams, pathname]
    );

    const debouncedUpdateURL = useMemo(() => debounce(updateURL, 300), [updateURL]);

    const handleOffsetChange = useCallback(
        (newOffset: number) => {
            setBoxOffset(newOffset);
            debouncedUpdateURL(newOffset);
        },
        [debouncedUpdateURL]
    );

    return { boxOffset, handleOffsetChange };
};
