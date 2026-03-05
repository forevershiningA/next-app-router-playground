import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { db } from '#/lib/db/index';
import { sharedDesigns, projects } from '#/lib/db/schema';
import { eq } from 'drizzle-orm';

type Props = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  try {
    const share = await db?.query.sharedDesigns.findFirst({
      where: eq(sharedDesigns.shareToken, token),
    });
    if (!share) return { title: 'Shared Design | Forever Shining' };
    const project = await db?.query.projects.findFirst({
      where: eq(projects.id, share.projectId),
    });
    const title = project?.title ?? 'Memorial Design';
    return {
      title: `${title} | Forever Shining`,
      description: 'A personalised memorial design created with Forever Shining.',
      openGraph: {
        title,
        description: 'A personalised memorial design created with Forever Shining.',
        images: project?.screenshotPath ? [{ url: project.screenshotPath }] : [],
      },
    };
  } catch {
    return { title: 'Shared Design | Forever Shining' };
  }
}

export default async function SharedDesignPage({ params }: Props) {
  const { token } = await params;

  let share;
  let project;

  try {
    share = await db?.query.sharedDesigns.findFirst({
      where: eq(sharedDesigns.shareToken, token),
    });
  } catch {
    notFound();
  }

  if (!share) notFound();
  if (share.expiresAt && share.expiresAt < new Date()) notFound();

  try {
    project = await db?.query.projects.findFirst({
      where: eq(projects.id, share.projectId),
    });
  } catch {
    notFound();
  }

  if (!project) notFound();

  // Increment view count (fire-and-forget)
  db?.update(sharedDesigns)
    .set({ viewCount: (share.viewCount ?? 0) + 1 })
    .where(eq(sharedDesigns.id, share.id))
    .catch(() => {});

  const thumbnail = project.thumbnailPath || project.screenshotPath || '/screen.png';
  const createdDate = new Date(project.createdAt);
  const year = createdDate.getFullYear();
  const month = String(createdDate.getMonth() + 1).padStart(2, '0');
  const htmlQuotePath = `/saved-designs/html/${year}/${month}/design_${project.id}.html`;

  const currencyFormatter = new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: project.currency ?? 'AUD',
    maximumFractionDigits: 2,
  });
  const priceLabel = project.totalPriceCents
    ? `From ${currencyFormatter.format(project.totalPriceCents / 100)}`
    : null;

  return (
    <div className="relative min-h-screen bg-[#050301] text-white">
      {/* Background gradient */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(244,160,80,0.15),_transparent_45%),radial-gradient(circle_at_bottom,_rgba(88,144,255,0.12),_transparent_40%)]"
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-4xl px-6 py-12">
        {/* Brand header */}
        <div className="mb-10 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight text-[#D4A84F]">
            Forever Shining
          </Link>
          <Link
            href="/select-product"
            className="rounded-lg px-4 py-2 text-sm font-medium text-black transition cursor-pointer"
            style={{ backgroundColor: '#D4A84F' }}
          >
            Create Your Own
          </Link>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-[#0c0805]/85 px-8 py-8 shadow-[0_25px_65px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
          {/* Title */}
          <div className="mb-6 border-b border-white/5 pb-6">
            <p className="text-xs uppercase tracking-[0.4em] text-white/40">Shared Memorial Design</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">{project.title}</h1>
            {priceLabel && (
              <p className="mt-1 text-sm text-[#D4A84F]">{priceLabel}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Thumbnail */}
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-widest text-white/40">
                Design Preview
              </p>
              <div className="overflow-hidden rounded-xl bg-black/40">
                <img
                  src={thumbnail}
                  alt={project.title}
                  className="h-auto w-full object-cover"
                />
              </div>
            </div>

            {/* Quote */}
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium uppercase tracking-widest text-white/40">
                Price Quote
              </p>
              <iframe
                src={htmlQuotePath}
                className="w-full flex-1 min-h-[460px] rounded-xl border border-white/20 bg-white"
                title="Design Price Quote"
              />
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8 rounded-xl border border-[#D4A84F]/20 bg-[#D4A84F]/5 p-6 text-center">
            <p className="mb-1 text-sm font-medium text-white">
              Inspired by this design?
            </p>
            <p className="mb-4 text-xs text-white/60">
              Create and customise your own memorial with our 3D designer — free, no account required to start.
            </p>
            <Link
              href="/select-product"
              className="inline-block rounded-lg px-6 py-2.5 text-sm font-medium text-black transition cursor-pointer"
              style={{ backgroundColor: '#D4A84F' }}
            >
              Start Designing →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
