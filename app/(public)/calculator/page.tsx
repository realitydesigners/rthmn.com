import { SectionCalculator } from '@/app/_components/SectionCalculator';
import { SectionFooter } from '@/app/_components/SectionFooter';
import { BackgroundGrid } from '@/components/BackgroundGrid';

export default function CalculatorPage() {
    return (
        <BackgroundGrid>
            <SectionCalculator />
            <SectionFooter />
        </BackgroundGrid>
    );
}
