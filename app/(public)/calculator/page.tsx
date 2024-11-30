import { BackgroundGrid } from '@/components/BackgroundGrid';
import { SectionCalculator } from '@/components/Sections/SectionCalculator';
import { SectionFooter } from '@/components/Sections/SectionFooter';

export default function CalculatorPage() {
  return (
    <BackgroundGrid>
      <SectionCalculator />
      <SectionFooter />
    </BackgroundGrid>
  );
}
