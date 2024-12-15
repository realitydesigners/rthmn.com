import { useState, useEffect } from 'react';

export function useScrollDirection() {
    const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
    const [lastScroll, setLastScroll] = useState(0);
    const upThreshold = 20; // Threshold for scrolling up
    const downThreshold = 80; // Threshold for scrolling down

    useEffect(() => {
        let scrollTimeout: NodeJS.Timeout;

        const updateScrollDirection = () => {
            const currentScroll = window.scrollY;
            const scrollDifference = currentScroll - lastScroll;

            // Different thresholds for up and down scrolling
            if (scrollDifference > downThreshold) {
                // Scrolling down
                setScrollDirection('down');
                setLastScroll(currentScroll);
            } else if (scrollDifference < -upThreshold) {
                // Scrolling up
                setScrollDirection('up');
                setLastScroll(currentScroll);
            }
        };

        const onScroll = () => {
            // Clear existing timeout
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }

            // Set new timeout to debounce scroll events
            scrollTimeout = setTimeout(updateScrollDirection, 10);
        };

        window.addEventListener('scroll', onScroll);

        return () => {
            window.removeEventListener('scroll', onScroll);
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
        };
    }, [lastScroll]);

    return scrollDirection;
}
