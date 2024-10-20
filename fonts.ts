import { Oxanium, Russo_One, Outfit } from 'next/font/google';

export const oxanium = Oxanium({
  subsets: ['latin'],
  display: 'swap'
});

export const russo = Russo_One({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400']
});

export const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700']
});
