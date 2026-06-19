import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { db } from '#/lib/db/index';
import { projects } from '#/lib/db/schema';
import { eq } from 'drizzle-orm';
import { buildPdfQuoteFromProject } from '#/lib/design-quote';
import { PriceQuoteDisplay } from '#/components/PriceQuoteDisplay';
import { getServerSession } from '#/lib/auth/session';
import { OpenInDesignerButton } from './_open-button';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await params;
  return {
    title: 'Memorial Design | Forever Shining',
    description: 'A personalised memorial design created with Forever Shining Design Online.',
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function DesignSharePage({ params }: Props) {
  const { id } = await params;

  const session = await getServerSession();
  if (!session) notFound();

  const project = await db?.query.projects.findFirst({ where: eq(projects.id, id) });
  if (!project) notFound();
  if (project.accountId !== session.accountId && session.role !== 'admin') notFound();

  const fullImage = project.screenshotPath || project.thumbnailPath || null;
  const priceQuote = buildPdfQuoteFromProject(
    project as Parameters<typeof buildPdfQuoteFromProject>[0],
  );
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
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(244,160,80,0.15),_transparent_45%),radial-gradient(circle_at_bottom,_rgba(88,144,255,0.12),_transparent_40%)]"
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-4xl px-6 py-4">
        {/* Brand header */}
        <div className="mb-4 flex items-center justify-between">
          <Link href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/ico/forever-transparent-logo.png" alt="Forever Shining" className="h-20 w-auto" />
          </Link>
          <Link
            href="/select-product"
            className="rounded-lg px-4 py-2 text-sm font-medium text-black transition cursor-pointer"
            style={{ backgroundColor: '#D4A84F' }}
          >
            Create Your Own
          </Link>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-[#0c0805]/85 px-8 py-6 shadow-[0_25px_65px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
          {/* Compact header: title left, price right */}
          <div className="mb-5 flex items-center justify-between gap-4 border-b border-white/5 pb-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/40">Memorial Design</p>
              <h1 className="mt-0.5 text-xl font-semibold tracking-tight leading-tight">{project.title}</h1>
            </div>
            {priceLabel && <p className="shrink-0 text-lg font-bold text-[#D4A84F]">{priceLabel}</p>}
          </div>

          {/* Image + Open in Designer centred at 50% width */}
          <div className="flex flex-col items-center gap-0">
            <div className="w-1/2">
              <OpenInDesignerButton
                projectId={project.id}
                imageSrc={fullImage ?? undefined}
                imageAlt={project.title ?? 'Design preview'}
              />
            </div>
          </div>

          {/* Price Quote */}
          <div className="mt-8">
            <p className="mb-2 text-xs font-medium uppercase tracking-widest text-white/40">
              Price Quote
            </p>
            <PriceQuoteDisplay quote={priceQuote} />
          </div>
        </div>
      </div>
    </div>
  );
}
