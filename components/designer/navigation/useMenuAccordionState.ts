import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  expandableMenuSectionSlugs,
  menuGroups,
} from '#/components/designer/navigation/designer-navigation-config';

export function useMenuAccordionState(designerStepSlug: string | null) {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >(() =>
    Object.fromEntries(
      Array.from(expandableMenuSectionSlugs, (slug) => [slug, false]),
    ),
  );
  const activeGroupIndex = useMemo(() => {
    const slug = designerStepSlug ?? '';
    const index = menuGroups.findIndex((group) =>
      group.items.some((item) => item.slug === slug),
    );
    return index >= 0 ? index : -1;
  }, [designerStepSlug]);

  const [openGroup, setOpenGroup] = useState(0);

  useEffect(() => {
    if (activeGroupIndex >= 0) setOpenGroup(activeGroupIndex);
  }, [activeGroupIndex]);

  useEffect(() => {
    const activeSection = designerStepSlug ?? '';
    if (activeSection) {
      setExpandedSections((previous) => {
        if (!Object.hasOwn(previous, activeSection)) return previous;
        return Object.fromEntries(
          Object.keys(previous).map((key) => [key, key === activeSection]),
        );
      });
    }
  }, [designerStepSlug]);

  const toggleGroup = useCallback((groupIndex: number) => {
    setOpenGroup((previous) => (previous === groupIndex ? -1 : groupIndex));
  }, []);

  return { activeGroupIndex, openGroup, toggleGroup, expandedSections };
}
