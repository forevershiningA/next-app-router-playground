import type { StateCreator } from 'zustand';
import type { HeadstoneState } from '#/lib/headstone-store.types';

type ProjectSlice = Pick<
  HeadstoneState,
  | 'currentProjectId'
  | 'currentProjectTitle'
  | 'setProjectMeta'
  | 'layoutRevision'
  | 'markLayoutReplacement'
>;

export const createProjectSlice: StateCreator<
  HeadstoneState,
  [],
  [],
  ProjectSlice
> = (set) => ({
  currentProjectId: null,
  layoutRevision: 0,
  markLayoutReplacement: () =>
    set((state) => ({ layoutRevision: state.layoutRevision + 1 })),
  currentProjectTitle: null,
  setProjectMeta: (meta) =>
    set({
      currentProjectId: meta.projectId ?? null,
      currentProjectTitle: meta.title ?? null,
    }),
});
