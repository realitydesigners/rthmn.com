export const formatNumber = (value: number): string => {
    const absValue = Math.abs(value);

    if (absValue >= 1000000) {
        return `${(value / 1000000).toFixed(2)}M`;
    }
    if (absValue >= 1000) {
        return `${(value / 1000).toFixed(2)}K`;
    }
    return value.toFixed(2);
};
