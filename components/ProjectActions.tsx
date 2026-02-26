'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { captureDesignSnapshot, applyDesignSnapshot } from '#/lib/project-serializer';
import type { PricingBreakdown, ProjectSummary, ProjectRecordWithState } from '#/lib/project-schemas';
import { useHeadstoneStore } from '#/lib/headstone-store';

const currencyFormatter = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
});

const formatCurrency = (value: number) => currencyFormatter.format(value);

const formatTimestamp = (value: string) => {
  const date = new Date(value);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const mapPricingBreakdown = (pricing: ProjectActionsProps['pricing']): PricingBreakdown => ({
  headstonePrice: pricing.headstonePrice,
  basePrice: pricing.basePrice,
  additionsPrice: pricing.additionsPrice,
  motifsPrice: pricing.motifsPrice,
  inscriptionPrice: pricing.inscriptionPrice,
  imagePrice: pricing.imagePriceTotal,
  subtotal: pricing.subtotal,
  tax: pricing.tax,
  total: pricing.total,
});

type ProjectActionsProps = {
  pricing: {
    headstonePrice: number;
    basePrice: number;
    additionsPrice: number;
    motifsPrice: number;
    inscriptionPrice: number;
    imagePriceTotal: number;
    subtotal: number;
    tax: number;
    total: number;
  };
};

export default function ProjectActions({ pricing }: ProjectActionsProps) {
  const router = useRouter();
  const currentProjectId = useHeadstoneStore((s) => s.currentProjectId);
  const currentProjectTitle = useHeadstoneStore((s) => s.currentProjectTitle);
  const setProjectMeta = useHeadstoneStore((s) => s.setProjectMeta);

  const [title, setTitle] = useState(currentProjectTitle ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [loadingProjectId, setLoadingProjectId] = useState<string | null>(null);

  useEffect(() => {
    setTitle(currentProjectTitle ?? '');
  }, [currentProjectTitle]);

  const refreshProjects = useCallback(async () => {
    setIsLoadingList(true);
    setListError(null);
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) {
        throw new Error('Failed to load projects');
      }
      const data = (await response.json()) as { projects: ProjectSummary[] };
      setProjects(data.projects);
    } catch (error) {
      console.error('[ProjectActions] Unable to load project list', error);
      setListError('Unable to load saved designs');
    } finally {
      setIsLoadingList(false);
    }
  }, []);

  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

  const handleSave = useCallback(async () => {
    try {
      setIsSaving(true);
      setStatusMessage(null);

      const snapshot = captureDesignSnapshot();
      const resolvedTitle = title.trim() || 'Untitled Design';

      snapshot.metadata = {
        ...snapshot.metadata,
        currentProjectTitle: resolvedTitle,
      };

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: snapshot.metadata?.currentProjectId ?? currentProjectId ?? undefined,
          title: resolvedTitle,
          totalPriceCents: Math.round(pricing.total * 100),
          currency: 'AUD',
          designState: snapshot,
          pricingBreakdown: mapPricingBreakdown(pricing),
        }),
      });

      if (!response.ok) {
        throw new Error('Unable to save project');
      }

      const data = (await response.json()) as { project: ProjectSummary };
      setProjectMeta({ projectId: data.project.id, title: data.project.title });
      setStatusMessage('Design saved');
      refreshProjects();
    } catch (error) {
      console.error('[ProjectActions] Failed to save project', error);
      setStatusMessage('Save failed. Please try again.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  }, [currentProjectId, pricing, refreshProjects, setProjectMeta, title]);

  const handleLoad = useCallback(async (projectId: string) => {
    try {
      setLoadingProjectId(projectId);
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) {
        throw new Error('Unable to load project');
      }
      const data = (await response.json()) as { project: ProjectRecordWithState };

      const snapshot = {
        ...data.project.designState,
        metadata: {
          ...data.project.designState.metadata,
          currentProjectId: data.project.id,
          currentProjectTitle: data.project.title,
        },
      };

      await applyDesignSnapshot(snapshot);
      setProjectMeta({ projectId: data.project.id, title: data.project.title });
      setStatusMessage(`Loaded "${data.project.title}"`);
      router.push('/select-size');
    } catch (error) {
      console.error('[ProjectActions] Failed to load project', error);
      setStatusMessage('Unable to load that design.');
    } finally {
      setLoadingProjectId(null);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  }, [router, setProjectMeta]);

  const isSaveDisabled = isSaving || pricing.total <= 0;

  const currentId = currentProjectId;

  const projectList = useMemo(() => projects.slice(0, 5), [projects]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="mb-3">
          <label className="text-xs uppercase tracking-wide text-gray-400">Project Title</label>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Oak Tree Memorial"
            className="mt-1 w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:border-amber-400 focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaveDisabled}
          className={`w-full rounded-full px-6 py-3 text-sm font-semibold transition-all ${
            isSaveDisabled
              ? 'bg-white/10 text-white/60 cursor-not-allowed'
              : 'bg-white text-slate-900 hover:scale-[1.01]'
          }`}
        >
          {isSaving ? 'Saving…' : currentId ? 'Save Changes' : 'Save Design'}
        </button>
        {statusMessage && (
          <p className="mt-3 text-center text-xs text-amber-200" role="status">
            {statusMessage}
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Saved Designs</p>
            <p className="text-xs text-gray-400">Load a previous design to continue editing</p>
          </div>
          <button
            type="button"
            onClick={refreshProjects}
            disabled={isLoadingList}
            className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/80 hover:border-white/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoadingList ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        {listError && (
          <p className="text-xs text-red-300">{listError}</p>
        )}

        {projectList.length === 0 && !listError && !isLoadingList && (
          <p className="text-sm text-gray-400">No saved designs yet.</p>
        )}

        <ul className="space-y-3">
          {projectList.map((project) => {
            const isCurrent = project.id === currentId;
            const projectTotal = typeof project.totalPriceCents === 'number'
              ? formatCurrency(project.totalPriceCents / 100)
              : '—';

            return (
              <li
                key={project.id}
                className={`rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white ${
                  isCurrent ? 'ring-1 ring-amber-400/60' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{project.title}</p>
                    <p className="text-xs text-gray-400">
                      {projectTotal} · Updated {formatTimestamp(project.updatedAt)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleLoad(project.id)}
                    disabled={loadingProjectId === project.id}
                    className="rounded-full border border-white/30 px-3 py-1 text-xs text-white/80 hover:border-white disabled:cursor-not-allowed"
                  >
                    {loadingProjectId === project.id ? 'Loading…' : 'Load'}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
