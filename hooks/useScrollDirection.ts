import { useState, useEffect } from 'react';

export const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
  const [prevScrollY, setPrevScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > prevScrollY && scrollDirection !== 'down') {
        // Scrolling down
        setScrollDirection('down');
      } else if (currentScrollY < prevScrollY - 1 && scrollDirection !== 'up') {
        // Scrolling up (with 10px threshold)
        setScrollDirection('up');
      }

      setPrevScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollY, scrollDirection]);

  return scrollDirection;
};
