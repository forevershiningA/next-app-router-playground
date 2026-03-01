'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { UserCircleIcon } from '@heroicons/react/24/outline';

import { getAllSavedDesigns, SavedDesignMetadata } from '#/lib/saved-designs-data';
import { generateDesignPDF } from '#/lib/pdf-generator';
import { data } from '#/app/_internal/_data';

type DesignStatus = 'awaiting-approval' | 'ready-to-order' | 'in-production' | 'completed' | 'draft';

const statusMeta: Record<DesignStatus, { primaryAction: string }> = {
  'awaiting-approval': {
    primaryAction: 'Review proof',
  },
  'ready-to-order': {
    primaryAction: 'Place order',
  },
  'in-production': {
    primaryAction: 'Track order',
  },
  completed: {
    primaryAction: 'Reorder design',
  },
  draft: {
    primaryAction: 'Edit design',
  },
};

const commentInstructions = 'Add engraving notes or approval comments before submitting your order.';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

type AccountDesignCard = {
  id: string;
  title: string;
  priceLabel: string;
  createdLabel: string;
  relativeUpdated: string;
  preview: string;
  fullScreenshot: string;
  description: string;
  productName: string;
  status: DesignStatus;
  primaryActionLabel: string;
  destinationUrl: string;
  htmlQuotePath?: string;
};

// Share functions
const shareToFacebook = (url: string, title: string) => {
  const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title)}`;
  window.open(shareUrl, '_blank', 'width=600,height=400');
};

const shareToTwitter = (url: string, title: string) => {
  const text = `Check out my memorial design: ${title}`;
  const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
  window.open(shareUrl, '_blank', 'width=600,height=400');
};

const shareToLinkedIn = (url: string) => {
  const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  window.open(shareUrl, '_blank', 'width=600,height=400');
};

export default function MyAccountPage() {
  const [savedProjects, setSavedProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [moreModalOpen, setMoreModalOpen] = useState(false);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState<AccountDesignCard | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [quoteHtml, setQuoteHtml] = useState<string>('');

  // Lock body scroll when modal is open
  useEffect(() => {
    if (moreModalOpen || imagePreviewOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [moreModalOpen, imagePreviewOpen]);

  useEffect(() => {
    async function fetchSavedProjects() {
      try {
        const response = await fetch('/api/projects?limit=20');
        if (response.ok) {
          const data = await response.json();
          setSavedProjects(data.projects || []);
        }
      } catch (error) {
        console.error('Failed to fetch saved projects:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSavedProjects();
  }, []);

  const handleShareToFacebook = async () => {
    if (!selectedDesign) return;
    
    try {
      // Create share link
      const response = await fetch('/api/share/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: selectedDesign.id }),
      });
      
      const data = await response.json();
      if (data.success && data.shareUrl) {
        shareToFacebook(data.shareUrl, selectedDesign.title);
      } else {
        // Fallback to current URL
        const fallbackUrl = window.location.origin + selectedDesign.destinationUrl;
        shareToFacebook(fallbackUrl, selectedDesign.title);
      }
    } catch (error) {
      console.error('Error sharing to Facebook:', error);
      // Fallback to current URL
      const fallbackUrl = window.location.origin + selectedDesign.destinationUrl;
      shareToFacebook(fallbackUrl, selectedDesign.title);
    }
  };
  
  const handleShareToTwitter = async () => {
    if (!selectedDesign) return;
    
    try {
      const response = await fetch('/api/share/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: selectedDesign.id }),
      });
      
      const data = await response.json();
      if (data.success && data.shareUrl) {
        shareToTwitter(data.shareUrl, selectedDesign.title);
      } else {
        const fallbackUrl = window.location.origin + selectedDesign.destinationUrl;
        shareToTwitter(fallbackUrl, selectedDesign.title);
      }
    } catch (error) {
      console.error('Error sharing to Twitter:', error);
      const fallbackUrl = window.location.origin + selectedDesign.destinationUrl;
      shareToTwitter(fallbackUrl, selectedDesign.title);
    }
  };
  
  const handleShareToLinkedIn = async () => {
    if (!selectedDesign) return;
    
    try {
      const response = await fetch('/api/share/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: selectedDesign.id }),
      });
      
      const data = await response.json();
      if (data.success && data.shareUrl) {
        shareToLinkedIn(data.shareUrl);
      } else {
        const fallbackUrl = window.location.origin + selectedDesign.destinationUrl;
        shareToLinkedIn(fallbackUrl);
      }
    } catch (error) {
      console.error('Error sharing to LinkedIn:', error);
      const fallbackUrl = window.location.origin + selectedDesign.destinationUrl;
      shareToLinkedIn(fallbackUrl);
    }
  };

  const handleCopyUrl = async () => {
    if (!selectedDesign) return;
    
    try {
      const response = await fetch('/api/share/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: selectedDesign.id }),
      });
      
      const data = await response.json();
      const urlToCopy = data.success && data.shareUrl 
        ? data.shareUrl 
        : window.location.origin + selectedDesign.destinationUrl;
      
      await navigator.clipboard.writeText(urlToCopy);
      alert('Share link copied to clipboard!');
    } catch (error) {
      console.error('Error copying URL:', error);
      alert('Failed to copy URL');
    }
  };

  const handleExportPDF = async () => {
    if (!selectedDesign) return;
    
    try {
      await generateDesignPDF({
        title: selectedDesign.title,
        screenshot: selectedDesign.preview,
        priceLabel: selectedDesign.priceLabel,
        createdLabel: selectedDesign.createdLabel,
        description: selectedDesign.description,
        productName: selectedDesign.productName,
      });
      alert('PDF generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleDeleteDesign = async (designId: string) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/projects?id=${designId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete design');
      }

      // Remove the deleted project from the list
      setSavedProjects(prev => prev.filter(p => p.id !== designId));
      setMoreModalOpen(false);
    } catch (error) {
      console.error('Error deleting design:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const allDesigns = getAllSavedDesigns();
  
  // Convert API projects to design cards
  const projectCards = savedProjects.map((project) => buildProjectCard(project));
  
  // Merge with static designs
  const designCards = buildDesignCards(allDesigns);
  const allCards = [...projectCards, ...designCards];
  const cards = allCards.length ? allCards : getFallbackCards();
  const visibleCards = cards.filter((card) => card.status !== 'awaiting-approval');

  return (
    <div className="relative min-h-screen bg-[#050301] text-white">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(244,160,80,0.18),_transparent_45%),radial-gradient(circle_at_bottom,_rgba(88,144,255,0.18),_transparent_40%)]"
        aria-hidden
      />
      <div className="relative mx-auto w-full max-w-7xl px-10 py-10">
        <section
          className="rounded-[32px] border border-white/10 bg-[#0c0805]/85 px-10 py-6 shadow-[0_25px_65px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
          aria-labelledby="saved-designs-heading"
        >
          <header className="mb-6 border-b border-white/5 pb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/45">Current Section</p>
              <h2 id="saved-designs-heading" className="mt-2 text-3xl font-semibold tracking-tight">
                Saved Designs
              </h2>
              <p className="mt-3 inline-flex items-center gap-2 text-sm text-white/70">
                <UserCircleIcon className="h-5 w-5 text-white/60" aria-hidden />
                admin@forevershining.com
              </p>
            </div>
          </header>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visibleCards.map((card) => {
              return (
                <article
                  key={card.id}
                  className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.55)] backdrop-blur-sm"
                >
                  {/* Preview Image */}
                  <div className="mb-4">
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-black/40">
                      <img
                        src={card.preview}
                        alt={card.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  {/* Card Header */}
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                    <div className="mt-1 flex items-center justify-between text-sm text-white/60">
                      <span>{card.priceLabel}</span>
                      <span>{card.relativeUpdated}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="mb-4 flex-1 text-sm text-white/70 line-clamp-2">
                    {card.description}
                  </p>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-4 gap-2">
                    <Link
                      href={card.destinationUrl}
                      className="rounded-lg px-3 py-2.5 text-center text-xs font-medium text-black transition border border-white/10 cursor-pointer"
                      style={{ backgroundColor: '#D4A84F' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#C49940')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#D4A84F')}
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      className="rounded-lg px-3 py-2.5 text-xs font-medium text-black transition border border-white/10 cursor-pointer"
                      style={{ backgroundColor: '#D4A84F' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#C49940')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#D4A84F')}
                      onClick={() => alert('Buy functionality coming soon')}
                    >
                      Buy
                    </button>
                    <button
                      type="button"
                      className="rounded-lg bg-white/10 px-3 py-2.5 text-xs font-medium text-white transition hover:bg-white/20 border border-white/10 cursor-pointer"
                      onClick={() => alert('Email functionality coming soon')}
                    >
                      Email
                    </button>
                    <button
                      type="button"
                      className="rounded-lg bg-white/10 px-3 py-2.5 text-xs font-medium text-white transition hover:bg-white/20 border border-white/10 cursor-pointer"
                      onClick={() => {
                        setSelectedDesign(card);
                        setMoreModalOpen(true);
                      }}
                    >
                      More
                    </button>
                  </div>
                </article>
              );
            })}
            {!visibleCards.length && !isLoading && (
              <div className="col-span-full rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-white/70">
                No saved designs available yet. Start a new design to see it here.
              </div>
            )}
            {isLoading && (
              <div className="col-span-full rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-white/70">
                Loading your saved designs...
              </div>
            )}
          </div>

          {/* More Options Modal - Redesigned */}
          {moreModalOpen && selectedDesign && (
            <div className="fixed inset-0 z-[9999] bg-black/90 overflow-y-auto">
              <div className="min-h-screen flex items-center justify-center p-4">
                <div className="relative w-full max-w-4xl rounded-2xl border border-white/20 bg-gradient-to-br from-[#1a1410] to-[#0f0a07] p-4 shadow-2xl">
                  {/* Header */}
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold text-white">{selectedDesign.title}</h2>
                    <p className="mt-1 text-xs text-white/60">Created: {selectedDesign.createdLabel}</p>
                  </div>

                  {/* Share Options - Single row at top */}
                  <div className="mb-4 flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                    <span className="text-xs font-medium text-white/80">Share:</span>
                    <div className="flex flex-wrap gap-2">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="share-method" className="h-3 w-3 cursor-pointer" onChange={() => alert('Email share coming soon')} />
                        <span className="text-xs text-white">Email</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="share-method" className="h-3 w-3 cursor-pointer" onChange={handleCopyUrl} />
                        <span className="text-xs text-white">URL</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="share-method" className="h-3 w-3 cursor-pointer" onChange={handleShareToFacebook} />
                        <span className="text-xs text-white">Facebook</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="share-method" className="h-3 w-3 cursor-pointer" onChange={handleShareToTwitter} />
                        <span className="text-xs text-white">Twitter/X</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="share-method" className="h-3 w-3 cursor-pointer" onChange={handleShareToLinkedIn} />
                        <span className="text-xs text-white">LinkedIn</span>
                      </label>
                    </div>
                  </div>

                  {/* Clickable Thumbnail Preview */}
                  <div className="mb-4 flex justify-center">
                    <button
                      onClick={() => setImagePreviewOpen(true)}
                      className="relative overflow-hidden rounded-lg bg-black/40 transition hover:opacity-90 cursor-pointer"
                    >
                      <img
                        src={selectedDesign.preview}
                        alt={selectedDesign.title}
                        className="max-w-full h-auto"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition bg-black/50">
                        <span className="text-white text-sm font-medium">Click to view full resolution</span>
                      </div>
                    </button>
                  </div>

                  {/* Quote HTML Iframe */}
                  {selectedDesign.htmlQuotePath && (
                    <div className="mb-3">
                      <iframe
                        src={selectedDesign.htmlQuotePath}
                        className="w-full h-[380px] rounded-lg border border-white/20 bg-white"
                        title="Design Quote"
                      />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    <button
                      className="rounded-lg px-4 py-2 text-xs font-medium text-black transition disabled:opacity-50 cursor-pointer"
                      style={{ backgroundColor: '#D4A84F' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#C49940')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#D4A84F')}
                      onClick={handleExportPDF}
                    >
                      Export PDF
                    </button>
                    
                    <Link
                      href={selectedDesign.destinationUrl}
                      className="rounded-lg px-4 py-2 text-center text-xs font-medium text-black transition cursor-pointer"
                      style={{ backgroundColor: '#D4A84F' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#C49940')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#D4A84F')}
                      onClick={() => setMoreModalOpen(false)}
                    >
                      Edit Design
                    </Link>
                    
                    <button
                      className="rounded-lg px-4 py-2 text-xs font-medium text-black transition cursor-pointer"
                      style={{ backgroundColor: '#D4A84F' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#C49940')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#D4A84F')}
                      onClick={() => alert('Buy functionality coming soon')}
                    >
                      Buy Now
                    </button>
                    
                    <button
                      className="rounded-lg bg-red-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-red-500 disabled:opacity-50 cursor-pointer"
                      onClick={() => handleDeleteDesign(selectedDesign.id)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                    
                    <button
                      onClick={() => setMoreModalOpen(false)}
                      className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-xs font-medium text-white transition hover:bg-white/10 cursor-pointer ml-auto"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Full Resolution Image Preview Modal */}
          {imagePreviewOpen && selectedDesign && (
            <div className="fixed inset-0 z-[10000] bg-black/95 overflow-y-auto" onClick={() => setImagePreviewOpen(false)}>
              <div className="min-h-screen flex items-center justify-center p-4">
                <div className="relative max-w-7xl w-full">
                  <button
                    onClick={() => setImagePreviewOpen(false)}
                    className="absolute top-4 right-4 z-10 rounded-lg bg-black/80 p-3 text-white hover:bg-black transition"
                  >
                    ✕ Close
                  </button>
                  <img
                    src={selectedDesign.fullScreenshot}
                    alt={selectedDesign.title}
                    className="w-full h-auto rounded-lg shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function buildProjectCard(project: any): AccountDesignCard {
  const createdDate = new Date(project.createdAt);
  const updatedDate = new Date(project.updatedAt);
  
  // Get screenshot and thumbnail paths
  const thumbnail = project.thumbnailPath || project.screenshotPath || '/screen.png';
  const fullScreenshot = project.screenshotPath || '/screen.png';
  
  // Get product name from productId
  const productId = project.designState?.productId;
  console.log('Full designState:', project.designState);
  console.log('Product lookup:', { productId, hasProducts: !!data.products, productsCount: data.products?.length });
  const product = productId ? data.products.find(p => p.id === productId) : null;
  console.log('Found product:', product);
  const productName = product?.name || 'Custom memorial design';
  console.log('Final productName:', productName);
  
  return {
    id: project.id,
    title: project.title || 'Untitled Design',
    productName: productName,
    priceLabel: project.totalPriceCents 
      ? currencyFormatter.format(project.totalPriceCents / 100)
      : 'Price TBD',
    createdLabel: formatDate(createdDate),
    relativeUpdated: formatRelativeTime(updatedDate),
    preview: thumbnail,
    fullScreenshot: fullScreenshot,
    htmlQuotePath: `/saved-designs/html/${new Date(project.createdAt).getFullYear()}/${String(new Date(project.createdAt).getMonth() + 1).padStart(2, '0')}/design_${project.id}.html`,
    description: buildProjectDescription(project),
    status: (project.status || 'draft') as DesignStatus,
    primaryActionLabel: statusMeta[(project.status || 'draft') as DesignStatus].primaryAction,
    destinationUrl: `/select-product?projectId=${project.id}`, // Load design back into editor
  };
}

function buildProjectDescription(project: any): string {
  const inscriptions = project.designState?.inscriptions || [];
  if (inscriptions.length > 0) {
    const texts = inscriptions.map((i: any) => i.text).filter(Boolean);
    if (texts.length > 0) {
      return truncateText(texts.join(' • '), 140);
    }
  }
  return 'Custom memorial design';
}

function formatDate(date: Date): string {
  const pad = (value: number) => value.toString().padStart(2, '0');
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatRelativeTime(date: Date): string {
  const diffMs = date.getTime() - Date.now();
  const divisions: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 1000 * 60 * 60 * 24 * 365],
    ['month', 1000 * 60 * 60 * 24 * 30],
    ['week', 1000 * 60 * 60 * 24 * 7],
    ['day', 1000 * 60 * 60 * 24],
    ['hour', 1000 * 60 * 60],
    ['minute', 1000 * 60],
  ];
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  for (const [unit, ms] of divisions) {
    if (Math.abs(diffMs) >= ms || unit === 'minute') {
      return rtf.format(Math.round(diffMs / ms), unit);
    }
  }

  return 'just now';
}

function buildDesignCards(designs: SavedDesignMetadata[]): AccountDesignCard[] {
  return designs
    .slice()
    .sort((a, b) => Number(b.id ?? 0) - Number(a.id ?? 0))
    .slice(0, 9)
    .map((design, index) => {
      const status = deriveDesignStatus(design);
      const statusInfo = statusMeta[status];
      return {
        id: design.id,
        title: design.title || design.productName,
        productName: design.productName,
        priceLabel: computePriceLabel(design, index),
        createdLabel: formatCreatedLabel(design.id),
        relativeUpdated: formatRelativeUpdated(design.id),
        preview: normalizePreview(design.preview),
        description: composeDescription(design),
        status,
        primaryActionLabel: statusInfo.primaryAction,
        destinationUrl: buildDesignDestination(design),
      };
    });
}

function deriveDesignStatus(design: SavedDesignMetadata): DesignStatus {
  const tailDigits = Number(design.id.slice(-2));

  if ((design.hasMotifs || design.hasAdditions) && design.inscriptionCount >= 1) {
    return 'awaiting-approval';
  }

  if (design.inscriptionCount >= 6) {
    return 'ready-to-order';
  }

  if (design.hasPhoto) {
    return 'in-production';
  }

  if (Number.isFinite(tailDigits)) {
    if (tailDigits % 4 === 0) return 'awaiting-approval';
    if (tailDigits % 4 === 1) return 'ready-to-order';
    if (tailDigits % 4 === 2) return 'in-production';
  }

  return 'completed';
}

function formatRelativeUpdated(id: string): string {
  const timestamp = Number(id);
  if (!Number.isFinite(timestamp)) {
    return 'recently updated';
  }

  const diffMs = timestamp - Date.now();
  const divisions: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 1000 * 60 * 60 * 24 * 365],
    ['month', 1000 * 60 * 60 * 24 * 30],
    ['week', 1000 * 60 * 60 * 24 * 7],
    ['day', 1000 * 60 * 60 * 24],
    ['hour', 1000 * 60 * 60],
    ['minute', 1000 * 60],
  ];
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  for (const [unit, ms] of divisions) {
    if (Math.abs(diffMs) >= ms || unit === 'minute') {
      return rtf.format(Math.round(diffMs / ms), unit);
    }
  }

  return 'just now';
}

function buildDesignDestination(design: SavedDesignMetadata): string {
  if (design.productSlug && design.slug) {
    return `/designs/${design.productSlug}/${design.slug}?designId=${design.id}`;
  }
  return `/designs?designId=${design.id}`;
}

function composeDescription(design: SavedDesignMetadata): string {
  if (design.inscriptions && design.inscriptions.trim().length > 0) {
    return truncateText(design.inscriptions.trim(), 140);
  }

  return commentInstructions;
}

function formatCreatedLabel(id: string): string {
  const timestamp = Number(id);

  if (!Number.isFinite(timestamp)) {
    return '—';
  }

  const date = new Date(timestamp);
  const pad = (value: number) => value.toString().padStart(2, '0');

  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function computePriceLabel(design: SavedDesignMetadata, index: number): string {
  const baseMap: Record<SavedDesignMetadata['productType'], number> = {
    headstone: 3200,
    plaque: 780,
    monument: 5200,
  };

  const base = baseMap[design.productType] ?? 1200;
  const variationSeed = Number(design.id.slice(-3));
  const variation = Number.isFinite(variationSeed) ? variationSeed * 3 : (index + 1) * 150;
  const total = Math.round(base + variation);

  return currencyFormatter.format(total);
}

function normalizePreview(preview?: string): string {
  if (!preview) {
    return '/screen.png';
  }

  if (preview.startsWith('http') || preview.startsWith('/')) {
    return preview;
  }

  return `/ml/${preview}`;
}

function truncateText(value: string, limit: number): string {
  if (value.length <= limit) {
    return value.trim();
  }

  return `${value.slice(0, limit).trim()}…`;
}


function getFallbackCards(): AccountDesignCard[] {
  const fallbackStatuses: DesignStatus[] = ['ready-to-order', 'in-production', 'completed'];
  return [1, 2, 3].map((index) => {
    const status = fallbackStatuses[index % fallbackStatuses.length];
    const statusInfo = statusMeta[status];
    return {
      id: `placeholder-${index}`,
      title: `Sample Design ${index}`,
      productName: 'Laser-etched Black Granite Headstone',
      priceLabel: currencyFormatter.format(2800 + index * 150),
      createdLabel: '15-09-2025 09:15',
      relativeUpdated: '2 days ago',
      preview: '/screen.png',
      description: commentInstructions,
      status,
      primaryActionLabel: statusInfo.primaryAction,
      destinationUrl: '/designs',
    };
  });
}

