import { BackgroundGrid } from '@/components/BackgroundGrid';
import { SectionFAQ } from '@/components/Sections/SectionFAQ';
import { SectionFooter } from '@/components/Sections/SectionFooter';

export default function FAQ() {
  return (
    <BackgroundGrid>
      <SectionFAQ />
      <SectionFooter />
    </BackgroundGrid>
  );
}
