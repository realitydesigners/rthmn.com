import { useState, useCallback } from 'react';
import { BoxSlice } from '@/types/types';

export const useSelectedFrame = () => {
    const [selectedFrame, setSelectedFrame] = useState<BoxSlice | null>(null);
    const [selectedFrameIndex, setSelectedFrameIndex] = useState<number | null>(null);

    const handleFrameSelect = useCallback((frame: BoxSlice | null, index: number | null) => {
        setSelectedFrame(frame);
        setSelectedFrameIndex(index);
    }, []);

    return { selectedFrame, selectedFrameIndex, handleFrameSelect };
};
