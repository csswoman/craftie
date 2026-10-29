import { LandingCaseStudy } from '@/components/layout/LandingCaseStudy';
import { SelectColorsWorkspace } from '@/components/color/SelectColorsWorkspace';

export default function HomePage() {
  return (
    <main className="min-h-dvh bg-bg">
      <LandingCaseStudy />
      <SelectColorsWorkspace />
    </main>
  );
}
