import type { StateCreator } from 'zustand';
import type { HeadstoneState } from '#/lib/headstone-store.types';

type ProjectSlice = Pick<
  HeadstoneState,
  'currentProjectId' | 'currentProjectTitle' | 'setProjectMeta'
>;

export const createProjectSlice: StateCreator<
  HeadstoneState,
  [],
  [],
  ProjectSlice
> = (set) => ({
  currentProjectId: null,
  currentProjectTitle: null,
  setProjectMeta: (meta) =>
    set({
      currentProjectId: meta.projectId ?? null,
      currentProjectTitle: meta.title ?? null,
    }),
});
