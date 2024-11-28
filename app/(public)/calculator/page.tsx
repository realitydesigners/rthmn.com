import { BackgroundGrid } from '@/components/BackgroundGrid';
import { SectionCalculator } from '@/components/sections/SectionCalculator';
import { SectionFooter } from '@/components/sections/SectionFooter';

export default function CalculatorPage() {
  return (
    <BackgroundGrid>
      <SectionCalculator />
      <SectionFooter />
    </BackgroundGrid>
  );
}
