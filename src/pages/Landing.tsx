import { useCallback, useState } from 'react';
import { ModelModal } from '../components/ModelModal';
import { AccessSection, AgentSection, CompareSection, CtaSection, DemoSection, FaqSection, Hero, ModelsSection } from '../components/sections';
import type { ModelSpec } from '../data/models';

export function Landing() {
  const [selected, setSelected] = useState<ModelSpec | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const showModel = useCallback((model: ModelSpec) => {
    setSelected(model);
    setModalOpen(true);
  }, []);
  const closeModel = useCallback(() => setModalOpen(false), []);

  return (
    <main>
      <Hero />
      <DemoSection />
      <ModelsSection onSelect={showModel} />
      <CompareSection />
      <AgentSection />
      <AccessSection />
      <FaqSection />
      <CtaSection />
      <ModelModal model={selected} open={modalOpen} onClose={closeModel} />
    </main>
  );
}
