import { useSearchParams, useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import debounce from 'lodash/debounce';

export const useUrlParams = (pair: string) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [boxOffset, setBoxOffset] = useState(() => {
    const offsetParam = searchParams.get('offset');
    return offsetParam ? parseInt(offsetParam, 10) : 0;
  });

  const updateURL = useCallback(
    (newOffset: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('offset', newOffset.toString());
      router.push(`/${pair}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pair]
  );

  const debouncedUpdateURL = useMemo(
    () => debounce(updateURL, 300),
    [updateURL]
  );

  const handleOffsetChange = useCallback(
    (newOffset: number) => {
      setBoxOffset(newOffset);
      updateURL(newOffset);
      debouncedUpdateURL(newOffset);
    },
    [updateURL, debouncedUpdateURL]
  );

  return { boxOffset, handleOffsetChange };
};
