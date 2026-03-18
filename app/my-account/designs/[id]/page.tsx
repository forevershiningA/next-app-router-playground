'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { generateDesignPDF } from '#/lib/pdf-generator';
import { data } from '#/app/_internal/_data';
import { applyDesignSnapshot } from '#/lib/project-serializer';
import { buildPdfQuoteFromProject } from '#/lib/design-quote';

const currencyFormatter = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  maximumFractionDigits: 2,
});

const shareToFacebook = (url: string, title: string) => {
  window.open(
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title)}`,
    '_blank',
    'width=600,height=400',
  );
};
const shareToTwitter = (url: string, title: string) => {
  window.open(
    `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent('Check out my memorial design: ' + title)}`,
    '_blank',
    'width=600,height=400',
  );
};
const shareToLinkedIn = (url: string) => {
  window.open(
    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    '_blank',
    'width=600,height=400',
  );
};

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function buildDescription(project: any): string {
  const inscriptions = project.designState?.inscriptions || [];
  const texts = inscriptions.map((i: any) => i.text).filter(Boolean);
  return texts.length > 0 ? texts.join(' • ').slice(0, 140) : 'Custom memorial design';
}

export default function DesignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState('');
  const [shareDropdownOpen, setShareDropdownOpen] = useState(false);
  const [iframeHeight, setIframeHeight] = useState(600);
  const shareDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then((res) => res.json())
      .then((body) => setProject(body.project ?? null))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [id]);

  // Lock body scroll for full-image overlay
  useEffect(() => {
    document.body.style.overflow = imagePreviewOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [imagePreviewOpen]);

  // Close share dropdown on outside click
  useEffect(() => {
    if (!shareDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (shareDropdownRef.current && !shareDropdownRef.current.contains(e.target as Node)) {
        setShareDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [shareDropdownOpen]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050301] text-white/60">
        Loading design…
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#050301] text-white">
        <p className="text-white/60">Design not found.</p>
        <Link href="/my-account" className="text-[#D4A84F] underline hover:text-[#C49940]">
          ← Back to Saved Designs
        </Link>
      </div>
    );
  }

  const createdDate = new Date(project.createdAt);
  const year = createdDate.getFullYear();
  const month = String(createdDate.getMonth() + 1).padStart(2, '0');
  const thumbnail = project.thumbnailPath || project.screenshotPath || '/screen.png';
  const fullScreenshot = project.screenshotPath || '/screen.png';
  const htmlQuotePath = `/saved-designs/html/${year}/${month}/design_${project.id}.html`;
  const priceLabel = project.totalPriceCents
    ? currencyFormatter.format(project.totalPriceCents / 100)
    : 'Price TBD';
  const productId = project.designState?.productId;
  const product = productId ? data.products.find((p: any) => p.id === productId) : null;
  const productName = (product as any)?.name || 'Custom memorial design';

  const getShareUrl = async (): Promise<string> => {
    try {
      const res = await fetch('/api/share/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: id }),
      });
      const body = await res.json();
      if (body.success && body.shareUrl) return body.shareUrl;
    } catch { /* fall through */ }
    return window.location.origin + `/my-account/designs/${id}`;
  };

  const handleCopyShareLink = async () => {
    const url = await getShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopyFeedback('Copied!');
    } catch {
      setCopyFeedback('Failed to copy');
    }
    setTimeout(() => setCopyFeedback(''), 2000);
    setShareDropdownOpen(false);
  };

  const handleShareSocial = async (platform: 'facebook' | 'twitter' | 'linkedin') => {
    const url = await getShareUrl();
    if (platform === 'facebook') shareToFacebook(url, project.title);
    else if (platform === 'twitter') shareToTwitter(url, project.title);
    else shareToLinkedIn(url);
    setShareDropdownOpen(false);
  };

  const handleExportPDF = async () => {
    try {
      await generateDesignPDF({
        title: project.title,
        screenshot: thumbnail,
        priceLabel,
        createdLabel: formatDate(createdDate),
        description: buildDescription(project),
        productName,
        quote: buildPdfQuoteFromProject(project),
      });
    } catch (err) {
      console.error('PDF export failed', err);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${project.title}"? This cannot be undone.`)) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/projects?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/my-account');
      } else {
        throw new Error('Delete failed');
      }
    } catch {
      alert('Failed to delete. Please try again.');
      setIsDeleting(false);
    }
  };

  const handleEditDesign = async () => {
    setIsLoadingEdit(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`);
      if (!res.ok) throw new Error('Failed to load project');
      const body = await res.json();
      const snapshot = {
        ...body.project.designState,
        metadata: {
          ...body.project.designState?.metadata,
          currentProjectId: body.project.id,
          currentProjectTitle: body.project.title,
        },
      };
      await applyDesignSnapshot(snapshot);
      router.push('/select-size');
    } catch {
      alert('Failed to load design. Please try again.');
      setIsLoadingEdit(false);
    }
  };

  const handleIframeLoad = (e: React.SyntheticEvent<HTMLIFrameElement>) => {
    try {
      const doc = e.currentTarget.contentDocument;
      if (doc) setIframeHeight(doc.documentElement.scrollHeight + 24);
    } catch { /* cross-origin — keep default */ }
  };

  return (
    <div className="relative min-h-screen bg-[#050301] text-white">
      {/* Background gradient */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(244,160,80,0.18),_transparent_45%),radial-gradient(circle_at_bottom,_rgba(88,144,255,0.18),_transparent_40%)]"
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-5xl px-6 py-10">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-white/50">
          <Link href="/my-account" className="hover:text-[#D4A84F] transition">
            My Account
          </Link>
          <span>/</span>
          <Link href="/my-account" className="hover:text-[#D4A84F] transition">
            Saved Designs
          </Link>
          <span>/</span>
          <span className="text-white/80 truncate max-w-[200px]">{project.title}</span>
        </nav>

        <div className="mb-4">
          <Link
            href="/my-account"
            className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-[#D4A84F] transition"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Design List
          </Link>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-[#0c0805]/85 px-8 pt-0 pb-8 shadow-[0_25px_65px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
          {/* Header — title left, price right */}
          <div className="mb-[10px] border-b border-white/5 pb-[10px]">
            <div className="flex items-start justify-between gap-4 pb-[10px]">
              <h1 className="text-2xl font-semibold tracking-tight leading-none">{project.title}</h1>
              <div className="text-right flex-shrink-0 pt-[30px]">
                <p className="text-2xl font-bold text-[#D4A84F]">{priceLabel}</p>
                <p className="mt-0.5 text-xs text-white/40">Created {formatDate(createdDate)}</p>
              </div>
            </div>

            {/* Image left, actions right */}
            <div className="flex items-start gap-6">
              {/* Thumbnail */}
              <button
                onClick={() => setImagePreviewOpen(true)}
                className="group relative inline-block rounded-xl bg-black/40 cursor-zoom-in overflow-visible flex-shrink-0"
              >
                <img
                  src={thumbnail}
                  alt={project.title}
                  className="h-auto w-auto max-w-[220px] rounded-xl object-contain transition group-hover:opacity-80"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
                  <span className="rounded-full bg-black/70 px-3 py-1.5 text-xs text-white">
                    View full resolution
                  </span>
                </div>
              </button>

              {/* Right side: share top-right, action buttons bottom */}
              <div className="flex flex-col justify-between flex-1 self-stretch">
                {/* Share — collapsed into single button with dropdown */}
                <div className="flex justify-end">
                  <div className="relative" ref={shareDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setShareDropdownOpen((o) => !o)}
                      className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/20 cursor-pointer"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Share
                    </button>
                    {shareDropdownOpen && (
                      <div className="absolute right-0 top-full mt-1 z-50 w-44 rounded-xl border border-white/10 bg-[#1a1208] shadow-2xl overflow-hidden">
                        <button
                          type="button"
                          onClick={handleCopyShareLink}
                          className="w-full px-4 py-2.5 text-left text-xs text-white hover:bg-white/10 transition flex items-center gap-2"
                        >
                          🔗 {copyFeedback || 'Copy Link'}
                        </button>
                        <button
                          type="button"
                          onClick={() => { alert('Email share coming soon'); setShareDropdownOpen(false); }}
                          className="w-full px-4 py-2.5 text-left text-xs text-white hover:bg-white/10 transition flex items-center gap-2"
                        >
                          ✉️ Email
                        </button>
                        <div className="border-t border-white/10" />
                        <button type="button" onClick={() => handleShareSocial('facebook')} className="w-full px-4 py-2.5 text-left text-xs text-white/60 hover:bg-white/10 transition">Facebook</button>
                        <button type="button" onClick={() => handleShareSocial('twitter')} className="w-full px-4 py-2.5 text-left text-xs text-white/60 hover:bg-white/10 transition">Twitter / X</button>
                        <button type="button" onClick={() => handleShareSocial('linkedin')} className="w-full px-4 py-2.5 text-left text-xs text-white/60 hover:bg-white/10 transition">LinkedIn</button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action buttons — bottom: Edit+Buy left, PDF+Delete right */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleEditDesign}
                      disabled={isLoadingEdit}
                      className="rounded-lg px-4 py-2 text-sm font-medium text-black transition cursor-pointer text-center disabled:opacity-50"
                      style={{ backgroundColor: '#D4A84F' }}
                      onMouseEnter={(e) => { if (!isLoadingEdit) (e.currentTarget as HTMLElement).style.backgroundColor = '#C49940'; }}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#D4A84F')}
                    >
                      {isLoadingEdit ? 'Loading…' : 'Edit Design'}
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-[#D4A84F]/60 px-4 py-2 text-sm font-medium text-[#D4A84F] transition hover:bg-[#D4A84F]/10 cursor-pointer"
                      onClick={() => router.push(`/my-account/designs/${project.id}/buy`)}
                    >
                      Buy Now
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 cursor-pointer"
                      onClick={handleExportPDF}
                    >
                      Export PDF
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/20 disabled:opacity-50 cursor-pointer"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Price quote — auto-height iframe, no nested scroll */}
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-widest text-white/40">Price Quote</p>
            <iframe
              src={htmlQuotePath}
              style={{ height: iframeHeight }}
              className="w-full rounded-xl border-0 bg-transparent [color-scheme:dark] block"
              title="Design Price Quote"
              onLoad={handleIframeLoad}
            />
          </div>
        </div>
      </div>

      {/* Full-resolution image overlay */}
      {imagePreviewOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 p-4"
          onClick={() => setImagePreviewOpen(false)}
        >
          <button
            className="absolute right-4 top-4 rounded-lg bg-black/80 px-4 py-2 text-sm text-white hover:bg-black transition"
            onClick={() => setImagePreviewOpen(false)}
          >
            ✕ Close
          </button>
          <img
            src={fullScreenshot}
            alt={project.title}
            className="max-h-full max-w-full rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
