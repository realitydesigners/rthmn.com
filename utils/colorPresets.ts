export interface ColorPreset {
  name: string;
  positive: string;
  negative: string;
}

export const colorPresets: ColorPreset[] = [
  {
    name: 'RTHMN',
    positive: 'rgba(88, 255, 160, 1)',
    negative: 'rgba(214, 29, 97, 1)'
  },
  {
    name: 'Ocean',
    positive: 'rgba(0, 206, 209, 1)',
    negative: 'rgba(25, 25, 112, 1)'
  },
  {
    name: 'Forest',
    positive: 'rgba(34, 139, 34, 1)',
    negative: 'rgba(139, 69, 19, 1)'
  },
  {
    name: 'Sunset',
    positive: 'rgba(255, 140, 0, 1)',
    negative: 'rgba(138, 43, 226, 1)'
  },
  {
    name: 'Neon',
    positive: 'rgba(0, 255, 255, 1)',
    negative: 'rgba(255, 0, 255, 1)'
  },
  {
    name: 'Monochrome',
    positive: 'rgba(255, 255, 255, 1)',
    negative: 'rgba(64, 64, 64, 1)'
  },
  {
    name: 'Fire',
    positive: 'rgba(255, 165, 0, 1)',
    negative: 'rgba(178, 34, 34, 1)'
  },
  {
    name: 'Arctic',
    positive: 'rgba(135, 206, 235, 1)',
    negative: 'rgba(25, 25, 112, 1)'
  },
  {
    name: 'Candy',
    positive: 'rgba(255, 182, 193, 1)',
    negative: 'rgba(147, 112, 219, 1)'
  },
  {
    name: 'Matrix',
    positive: 'rgba(0, 255, 0, 1)',
    negative: 'rgba(0, 100, 0, 1)'
  }
];
