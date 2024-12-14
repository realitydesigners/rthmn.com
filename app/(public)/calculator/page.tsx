import { BackgroundGrid } from '@/components/BackgroundGrid';
import { SectionCalculator } from '@/app/_components/SectionCalculator';
import { SectionFooter } from '@/app/_components/SectionFooter';

export default function CalculatorPage() {
  return (
    <BackgroundGrid>
      <SectionCalculator />
      <SectionFooter />
    </BackgroundGrid>
  );
}
