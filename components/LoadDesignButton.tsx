'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowTopRightOnSquareIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  DocumentArrowDownIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PhotoIcon,
  SparklesIcon,
  StarIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { getAllSavedDesigns, type SavedDesignMetadata } from '#/lib/saved-designs-data';
import { loadDesignById } from '#/components/DefaultDesignLoader';
import { loadMLData, getMLCategories, type MLDesignEntry } from '#/lib/ml-search-service';
import { useHiddenDesigns } from '#/lib/useHiddenDesigns';

interface LoadDesignButtonProps {
  label?: string;
}

/** Tree grouped by category first (used in popup) */
interface CategoryTree {
  [categorySlug: string]: {
    categoryLabel: string;
    designs: Array<{
      id: string;
      displayTitle: string;
      metadata: SavedDesignMetadata;
    }>;
  };
}

function formatSlugForDisplay(slug: string): string {
  if (!slug) return 'Memorial Design';

  const words = slug.split('-');
  return words
    .map((word, index) => {
      if (index !== 0 && word.length <= 2) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

function formatShapeName(shapeName: string): string {
  if (!shapeName) return '';

  return shapeName
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function buildDesignTitle(shapeName: string | undefined, slug: string): string {
  let processedSlug = slug;

  if (shapeName) {
    const shapeKebab = shapeName.toLowerCase().replace(/\s+/g, '-');
    if (processedSlug.startsWith(`${shapeKebab}-`)) {
      processedSlug = processedSlug.substring(shapeKebab.length + 1);
    } else if (processedSlug === shapeKebab) {
      processedSlug = 'memorial';
    }
  }

  const slugTitle = formatSlugForDisplay(processedSlug);
  if (shapeName) {
    return `${formatShapeName(shapeName)} - ${slugTitle}`;
  }
  return slugTitle;
}

function toLabel(slug: string): string {
  return slug
    .split('-')
    .map((part, index) => {
      if (index !== 0 && part.length <= 2) {
        return part;
      }
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(' ');
}

/** Design IDs that have 3D screenshots in /screenshots/v2026-3d/ */
const V2026_3D_IDS = new Set([
  '1578016189116','1593953642523','1597391120606','1599567914112','1600603072791',
  '1609829216777','1610531526906','1611192404076','1611460424814','1612437656041',
  '1614475180886','1614579816424','1614656318865','1615903477262','1620015829734',
  '1635732996964','1635734851837','1639912469680','1639914219938','1648074537944',
  '1648732590525','1649205269447','1652253561774','1654574227754','1654579835425',
  '1654580110812','1656207300157','1656299613915','1656368060739','1662465269387',
  '1664032749634','1665471249465','1665473699612','1665722173918','1665723350734',
  '1665908327407','1666840855535','1667730587385','1671094754340','1671243299788',
  '1672745066094','1672798383274','1674644744699','1677474410099','1678437076976',
  '1679044149041','1679044964291','1679054715523','1679082412506','1679277674127',
  '1679319722160','1679560074932','1679560476054','1679647872440','1680098086726',
  '1680266135598','1680456686045','1680802441075','1682509472979','1682511620120',
  '1683569134161','1683625180618','1684240424248','1685212403074','1685272822309',
  '1685465149157','1685468367736','1686324025011','1686555243015','1686596641083',
  '1686640754749','1687980532355','1688957735638','1690076432958','1690462173223',
  '1690545173877','1690553081843','1692210041603','1693668939061','1693735069032',
  '1693960366084','1694014295666','1695819495298','1695820185294','1695825317718',
  '1695825668633','1695826249266','1695832232637','1696243169205','1696844775564',
  '1697403225482','1697997293578','1698236658345','1698296187154','1698884967992',
  '1699112754574','1699670134869','1699740117702','1700567726528','1701228817969',
  '1705455243849','1705489798602','1706404745805','1707954976852','1707962474202',
  '1708379403072','1708723212727','1708790342849','1708994697310','1709193320013',
  '1709614951196','1712205965903','1712843604404','1713537649107','1713916252399',
  '1714537943445','1717029189438','1717567903283','1719622311289','1719948619521',
  '1719952121473','1720563323379','1721181794898','1721182015642','1721183987255',
  '1721188367239','1724501347537','1724667960753','1724932128793','1725041061648',
  '1725082714979','1725669542865','1725769905504','1725935725686','1725939980006',
  '1725940170219','1726182269646','1726656261690','1727396115446','1727951154323',
  '1728443901949','1728445371546','1728856915251','1728932309052','1730109481009',
  '1730223976633','1730270385046','1730285511435','1730916540854','1730961395029',
  '1731003563117','1733012214456','1733228554651','1733362944477','1736128067320',
  '1736613301131','1736614253020','1736668337231','1736671982328','1737339946484',
  '1737750492453','1737888768739','1738631749624','1739814876717','1739846701263',
  '1739928149882','1740021447299','1740310348943','1742260123415','1742728346982',
  '1743152781040','1743481914181','1743490235956','1743572308451','1743996021408',
  '1744134685375','1744457181421','1745722201796','1745730240655','1746192025545',
  '1746539901574','1746540096581','1747150840368','1747247908885','1747248749900',
  '1747249049669','1747249540595','1747502806912','1747809177601','1747810701895',
  '1747889661821','1747977350191','1747991048421','1748143620961','1748336050237',
  '1748336434074','1748703038067','1748853166313','1749833740845','1750620858095',
  '1752608698736','1752754510601','1752934586581','1753657519219','1753848708662',
  '1754176789014','1754245166175','1754752263779','1754911517897','1756314058415',
  '1756743214818','1756795446075','1757479665737','1757481836420','1758523657407',
  '1758526346232','1758686765293','1759825732924','1759830915276','1760709364425',
  '1761176645500','1761200615487',
]);

/** Return best available thumbnail src — 3D screenshot if available, else legacy _small. */
function getPopupPreviewSrc(designId: string, preview?: string): string {
  if (V2026_3D_IDS.has(designId)) {
    return `/screenshots/v2026-3d/${designId}_small.jpg`;
  }
  if (preview) {
    return preview.replace(/\.(jpg|jpeg|png)$/i, '_small.jpg');
  }
  return '';
}

/** Legacy ML _small variant (used as fallback). */
function getLegacySmallSrc(preview?: string): string | null {
  if (!preview) return null;
  return preview.replace(/\.(jpg|jpeg|png)$/i, '_small.jpg');
}

/** Preferred display order for categories (unlisted ones sort alphabetically at the end) */
const CATEGORY_ORDER: string[] = [
  'pets',
  'mother-memorial',
  'father-memorial',
  'wife-memorial',
  'husband-memorial',
  'son-memorial',
  'daughter-memorial',
  'baby-memorial',
  'memorial',
  'in-loving-memory',
  'rest-in-peace',
  'biblical-memorial',
  'religious-memorial',
  'dove-memorial',
  'butterfly-memorial',
  'military-veteran',
];

function buildCategoryTree(designs: SavedDesignMetadata[]): CategoryTree {
  return designs.reduce<CategoryTree>((acc, design) => {
    const categorySlug = design.category || 'uncategorized';

    if (!acc[categorySlug]) {
      acc[categorySlug] = {
        categoryLabel: toLabel(categorySlug),
        designs: [],
      };
    }

    acc[categorySlug].designs.push({
      id: design.id,
      displayTitle: buildDesignTitle(design.shapeName, design.slug),
      metadata: design,
    });
    return acc;
  }, {});
}

/** Sort category entries by CATEGORY_ORDER then alphabetically */
function sortCategoryEntries(entries: [string, CategoryTree[string]][]): [string, CategoryTree[string]][] {
  return entries.sort(([a], [b]) => {
    const ai = CATEGORY_ORDER.indexOf(a);
    const bi = CATEGORY_ORDER.indexOf(b);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.localeCompare(b);
  });
}

export default function LoadDesignButton({ label = 'Load Design' }: LoadDesignButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // ML filter state
  const [showFilters, setShowFilters] = useState(false);
  const [mlType, setMlType] = useState('');
  const [mlStyle, setMlStyle] = useState('');
  const [mlMotif, setMlMotif] = useState('');
  const [mlIndex, setMlIndex] = useState<Map<string, MLDesignEntry>>(new Map());
  const [mlCategories, setMlCategories] = useState<{ types: string[]; styles: string[]; motifs: string[] }>({ types: [], styles: [], motifs: [] });

  const { isLocalhost, hiddenIds, hideDesign, favoriteIds, toggleFavorite } = useHiddenDesigns();

  const allDesigns = useMemo(() => {
    const designs = getAllSavedDesigns();
    if (hiddenIds.size === 0) return designs;
    return designs.filter((d) => !hiddenIds.has(d.id));
  }, [hiddenIds]);

  // Load ML data when modal opens
  useEffect(() => {
    if (isOpen && mlIndex.size === 0) {
      loadMLData().then(setMlIndex);
      getMLCategories().then(setMlCategories);
    }
  }, [isOpen, mlIndex.size]);

  const hasMLFilters = mlType !== '' || mlStyle !== '' || mlMotif !== '';

  const filteredDesigns = useMemo(() => {
    let result = allDesigns;

    // Text search
    const needle = search.trim().toLowerCase();
    if (needle) {
      result = result.filter((design) => {
        const ml = mlIndex.get(design.id);
        return (
          design.slug.toLowerCase().includes(needle) ||
          design.title.toLowerCase().includes(needle) ||
          buildDesignTitle(design.shapeName, design.slug).toLowerCase().includes(needle) ||
          design.productName.toLowerCase().includes(needle) ||
          design.category.toLowerCase().includes(needle) ||
          design.id.includes(needle) ||
          (ml?.ml_tags || '').toLowerCase().includes(needle) ||
          (ml?.ml_motif || '').toLowerCase().includes(needle)
        );
      });
    }

    // ML category filters
    if (mlType) {
      result = result.filter((d) => mlIndex.get(d.id)?.ml_type === mlType);
    }
    if (mlStyle) {
      result = result.filter((d) => mlIndex.get(d.id)?.ml_style === mlStyle);
    }
    if (mlMotif) {
      result = result.filter((d) => mlIndex.get(d.id)?.ml_motif === mlMotif);
    }

    return result;
  }, [allDesigns, search, mlType, mlStyle, mlMotif, mlIndex]);

  const tree = useMemo(() => buildCategoryTree(filteredDesigns), [filteredDesigns]);
  const categoryEntries = useMemo(() => sortCategoryEntries(Object.entries(tree)), [tree]);
  const totalCount = filteredDesigns.length;

  const favoriteDesigns = useMemo(() => {
    if (favoriteIds.size === 0) return [];
    return allDesigns
      .filter((d) => favoriteIds.has(d.id))
      .map((d) => ({
        id: d.id,
        displayTitle: buildDesignTitle(d.shapeName, d.slug),
        metadata: d,
      }));
  }, [allDesigns, favoriteIds]);

  const toggleNode = (nodeKey: string) => {
    setExpandedNodes((current) => {
      const next = new Set(current);
      if (next.has(nodeKey)) {
        next.delete(nodeKey);
      } else {
        next.add(nodeKey);
      }
      return next;
    });
  };

  const handleLoadDesign = async (designId: string) => {
    setError(null);
    setIsOpen(false);
    setLoading(true);
    try {
      const result = await loadDesignById(designId);
      if (!result.success) {
        setError(result.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setIsOpen(true);
    setError(null);
  };

  const closeModal = () => {
    if (loading) {
      return;
    }
    setIsOpen(false);
  };

  const modalContent = !isOpen
    ? null
    : createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4 py-6">
          <div className="flex h-[80vh] w-full max-w-4xl flex-col rounded-2xl border border-white/20 bg-[#15100d]/95 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <h2 className="text-xl font-semibold text-white">Load Design</h2>
                <p className="text-sm text-white/70">{totalCount.toLocaleString()} designs available</p>
              </div>
              <button
                onClick={closeModal}
                disabled={loading}
                className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
                aria-label="Close load design dialog"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="border-b border-white/10 px-5 py-4">
              <div className="relative flex items-center gap-2">
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by title, category, product, tags, or ID..."
                    className="w-full rounded-xl border border-white/15 bg-black/30 py-3.5 pl-10 pr-3 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`shrink-0 rounded-lg border p-2.5 transition ${
                    showFilters || hasMLFilters
                      ? 'border-amber-500/50 bg-amber-500/20 text-amber-300'
                      : 'border-white/15 bg-black/30 text-white/50 hover:text-white/80'
                  }`}
                  title="ML Filters"
                >
                  <FunnelIcon className="h-4 w-4" />
                </button>
              </div>

              {/* ML Filter dropdowns */}
              {showFilters && (
                <div className="mt-3 space-y-3 rounded-lg border border-white/10 bg-black/30 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <SparklesIcon className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs text-primary/80 uppercase tracking-wider font-medium">ML Category Filters</span>
                    {hasMLFilters && (
                      <button
                        onClick={() => { setMlType(''); setMlStyle(''); setMlMotif(''); }}
                        className="ml-auto text-xs text-white/50 hover:text-white/80 underline underline-offset-2"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={mlType}
                      onChange={(e) => setMlType(e.target.value)}
                      className={`rounded-md border px-2 py-2 text-xs focus:border-primary/60 focus:outline-none [&>option]:bg-neutral-900 [&>option]:text-white ${mlType ? 'border-primary/50 bg-primary/10 text-primary' : 'border-white/15 bg-black/40 text-white'}`}
                    >
                      <option value="">All Types</option>
                      {mlCategories.types.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <select
                      value={mlStyle}
                      onChange={(e) => setMlStyle(e.target.value)}
                      className={`rounded-md border px-2 py-2 text-xs focus:border-primary/60 focus:outline-none [&>option]:bg-neutral-900 [&>option]:text-white ${mlStyle ? 'border-primary/50 bg-primary/10 text-primary' : 'border-white/15 bg-black/40 text-white'}`}
                    >
                      <option value="">All Styles</option>
                      {mlCategories.styles.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <select
                      value={mlMotif}
                      onChange={(e) => setMlMotif(e.target.value)}
                      className={`rounded-md border px-2 py-2 text-xs focus:border-primary/60 focus:outline-none [&>option]:bg-neutral-900 [&>option]:text-white ${mlMotif ? 'border-primary/50 bg-primary/10 text-primary' : 'border-white/15 bg-black/40 text-white'}`}
                    >
                      <option value="">All Motifs</option>
                      {mlCategories.motifs.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {error ? <p className="mb-3 text-sm text-red-300">{error}</p> : null}

              {/* Popular / Favorites drawer */}
              {favoriteDesigns.length > 0 && !search.trim() && (
                <div className="mb-3 rounded-xl border border-primary/30 bg-primary/5">
                  <button
                    onClick={() => toggleNode('popular')}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-primary"
                  >
                    {expandedNodes.has('popular') ? (
                      <ChevronDownIcon className="h-4 w-4 text-primary/70" />
                    ) : (
                      <ChevronRightIcon className="h-4 w-4 text-primary/70" />
                    )}
                    <StarIconSolid className="h-4 w-4 text-primary" />
                    <span className="flex-1 text-sm font-medium">Popular</span>
                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary/80">
                      {favoriteDesigns.length}
                    </span>
                  </button>
                  {expandedNodes.has('popular') && (
                    <div className="space-y-1 border-t border-primary/20 p-2">
                      {favoriteDesigns.map((design) => (
                        <div key={design.id} className="flex items-center gap-1">
                          <button
                            onClick={() => handleLoadDesign(design.id)}
                            disabled={loading}
                            className="min-w-0 flex-1 rounded-md border border-transparent bg-white/5 px-3 py-2 text-left text-sm text-white/90 transition hover:border-primary/30 hover:bg-white/10 disabled:opacity-50"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-primary/20 bg-black/30">
                                {design.metadata.preview ? (
                                  <img
                                    src={getPopupPreviewSrc(design.id, design.metadata.preview)}
                                    alt={`${design.displayTitle} thumbnail`}
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                    onError={(e) => {
                                      const img = e.currentTarget;
                                      const stage = parseInt(img.dataset.fallbackStage || '0', 10);
                                      if (stage === 0 && V2026_3D_IDS.has(design.id)) {
                                        img.dataset.fallbackStage = '1';
                                        const legacySmall = getLegacySmallSrc(design.metadata.preview);
                                        if (legacySmall) { img.src = legacySmall; return; }
                                      }
                                      if (stage <= 1 && design.metadata.preview) {
                                        img.dataset.fallbackStage = '2';
                                        img.src = design.metadata.preview;
                                        return;
                                      }
                                      img.style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <PhotoIcon className="h-5 w-5 text-white/40" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="truncate font-medium">{design.displayTitle}</div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-white/60">{design.id}</span>
                                </div>
                              </div>
                            </div>
                          </button>
                          {isLocalhost && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(design.id);
                              }}
                              title="Remove from favorites"
                              className="shrink-0 rounded p-1.5 text-primary transition hover:bg-primary/20"
                            >
                              <StarIconSolid className="h-4 w-4" />
                            </button>
                          )}
                          {isLocalhost && design.metadata.preview && (
                            <a
                              href={design.metadata.preview}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              title="Open full image"
                              className="shrink-0 rounded p-1.5 text-white/30 transition hover:bg-white/10 hover:text-white/70"
                            >
                              <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {categoryEntries.length === 0 ? (
                <p className="text-sm text-white/70">No matching designs found.</p>
              ) : (
                <div className="space-y-3">
                  {categoryEntries.map(([categorySlug, categoryNode]) => {
                    const catKey = `cat:${categorySlug}`;
                    const isCatExpanded = expandedNodes.has(catKey) || !!search.trim();
                    const designs = [...categoryNode.designs].sort((a, b) =>
                      a.displayTitle.localeCompare(b.displayTitle),
                    );

                    /** Derive a readable date from the 13-digit timestamp ID */
                    const formatDate = (id: string) => {
                      const ts = Number(id);
                      if (!ts || ts < 1e12) return '';
                      return new Date(ts).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
                    };

                    return (
                      <div key={categorySlug} className="rounded-xl border border-white/10 bg-white/5">
                        {/* Category header */}
                        <button
                          onClick={() => toggleNode(catKey)}
                          className="flex w-full items-center gap-2 px-4 py-3 text-left text-white"
                        >
                          {isCatExpanded ? (
                            <ChevronDownIcon className="h-4 w-4 text-white/70" />
                          ) : (
                            <ChevronRightIcon className="h-4 w-4 text-white/70" />
                          )}
                          <span className="flex-1 text-sm font-medium">{categoryNode.categoryLabel}</span>
                          <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/80">
                            {designs.length}
                          </span>
                        </button>

                        {/* Expanded: thumbnail grid */}
                        {isCatExpanded && (
                          <div className="border-t border-white/10 p-4">
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                              {designs.map((design) => (
                                <div
                                  key={design.id}
                                  className="group relative flex flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-black/25 transition-all duration-300 hover:border-white/25 hover:shadow-lg hover:shadow-black/40"
                                >
                                  {/* Thumbnail */}
                                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-black">
                                    {design.metadata.preview ? (
                                      <img
                                        src={getPopupPreviewSrc(design.id, design.metadata.preview)}
                                        alt={design.displayTitle}
                                        className="h-full w-full object-contain opacity-80 transition-all duration-500 group-hover:scale-[1.03] group-hover:opacity-100"
                                        loading="lazy"
                                        onError={(e) => {
                                          const img = e.currentTarget;
                                          const stage = parseInt(img.dataset.fallbackStage || '0', 10);
                                          if (stage === 0 && V2026_3D_IDS.has(design.id)) {
                                            img.dataset.fallbackStage = '1';
                                            const legacySmall = getLegacySmallSrc(design.metadata.preview);
                                            if (legacySmall) { img.src = legacySmall; return; }
                                          }
                                          if (stage <= 1 && design.metadata.preview) {
                                            img.dataset.fallbackStage = '2';
                                            img.src = design.metadata.preview;
                                            return;
                                          }
                                          img.style.display = 'none';
                                        }}
                                      />
                                    ) : (
                                      <div className="flex h-full items-center justify-center">
                                        <PhotoIcon className="h-8 w-8 text-white/15" />
                                      </div>
                                    )}

                                    {/* Hover: "Open Design" button */}
                                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:pointer-events-auto group-hover:opacity-100">
                                      <button
                                        onClick={() => handleLoadDesign(design.id)}
                                        disabled={loading}
                                        className="pointer-events-auto rounded-lg bg-white/90 px-4 py-2 text-xs font-semibold tracking-wide text-slate-900 shadow-lg transition hover:bg-white disabled:opacity-50"
                                      >
                                        Open Design
                                      </button>
                                    </div>

                                    {/* Localhost: favorite + open-in-new-tab (top-right) */}
                                    {isLocalhost && (
                                      <div className="absolute right-1 top-1 flex gap-1 rounded-lg bg-black/70 p-0.5 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
                                        <span
                                          role="button"
                                          onClick={(e) => { e.stopPropagation(); toggleFavorite(design.id); }}
                                          className={`rounded p-1 transition ${favoriteIds.has(design.id) ? 'text-primary' : 'text-white/50 hover:text-primary/70'}`}
                                        >
                                          {favoriteIds.has(design.id) ? <StarIconSolid className="h-3.5 w-3.5" /> : <StarIcon className="h-3.5 w-3.5" />}
                                        </span>
                                        {design.metadata.preview && (
                                          <a
                                            href={design.metadata.preview}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            title="Open full image"
                                            className="rounded p-1 text-white/50 transition hover:text-white/80"
                                          >
                                            <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                                          </a>
                                        )}
                                      </div>
                                    )}

                                    {/* Localhost: trash (bottom-left) */}
                                    {isLocalhost && (
                                      <div className="absolute bottom-1 left-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                        <span
                                          role="button"
                                          onClick={(e) => { e.stopPropagation(); hideDesign(design.id); }}
                                          title="Hide this design"
                                          className="flex rounded-md bg-black/70 p-1 text-white/40 backdrop-blur-sm transition hover:text-red-400"
                                        >
                                          <TrashIcon className="h-3.5 w-3.5" />
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Card footer */}
                                  <div className="px-3 py-2">
                                    <span className="block truncate text-xs font-medium text-white/90">
                                      {design.displayTitle}
                                    </span>
                                    <span className="mt-0.5 block text-[10px] text-white/35">
                                      {formatDate(design.id)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body,
      );

  const buttonLabel = loading ? 'Loading...' : label;

  return (
    <>
      <button
        onClick={openModal}
        disabled={loading}
        className="
          fixed right-4 top-4 z-[100]
          flex items-center gap-2 px-4 py-2.5
          rounded-lg border-2
          font-medium text-sm
          transition-all duration-200
          bg-black/50 border-amber-500/70 text-amber-100 hover:bg-amber-900/30 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/20 cursor-pointer backdrop-blur-sm
          disabled:cursor-wait disabled:border-amber-500/40 disabled:text-amber-200/70
        "
        aria-label={buttonLabel}
      >
        <DocumentArrowDownIcon className={`h-5 w-5 ${loading ? 'animate-bounce' : ''}`} aria-hidden="true" />
        <span>{buttonLabel}</span>
      </button>
      {modalContent}
    </>
  );
}
