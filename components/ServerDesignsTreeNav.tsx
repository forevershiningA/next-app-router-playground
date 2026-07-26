import Image from 'next/image';
import Link from 'next/link';
import { getAllSavedDesigns } from '#/lib/saved-designs-data';

interface DesignTreeNode {
  productType: string;
  productSlug: string;
  categories: {
    [category: string]: {
      name: string;
      designs: Array<{
        id: string;
        slug: string;
        title: string;
        shapeName?: string;
      }>;
    };
  };
}

function formatSlugForDisplay(slug: string): string {
  if (!slug) return 'Memorial Design';

  const words = slug.split('-');
  return words
    .map((word, index) => {
      if (index !== 0 && word.length <= 2) return word;
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
  return shapeName ? `${formatShapeName(shapeName)} - ${slugTitle}` : slugTitle;
}

function buildTreeData(): DesignTreeNode[] {
  const tree: Record<string, DesignTreeNode> = {};

  for (const design of getAllSavedDesigns()) {
    const productSlug = design.productSlug || 'uncategorized';
    const productType = design.productType || 'uncategorized';
    const category = design.category || 'uncategorized';

    tree[productSlug] ??= {
      productType,
      productSlug,
      categories: {},
    };

    tree[productSlug].categories[category] ??= {
      name: formatSlugForDisplay(category),
      designs: [],
    };

    tree[productSlug].categories[category].designs.push({
      id: design.id,
      slug: design.slug,
      shapeName: design.shapeName,
      title: buildDesignTitle(design.shapeName, design.slug),
    });
  }

  for (const productNode of Object.values(tree)) {
    for (const categoryData of Object.values(productNode.categories)) {
      categoryData.designs.sort((a, b) => a.title.localeCompare(b.title));
    }
  }

  return Object.values(tree).sort((a, b) => {
    const aCount = Object.values(a.categories).reduce((sum, cat) => sum + cat.designs.length, 0);
    const bCount = Object.values(b.categories).reduce((sum, cat) => sum + cat.designs.length, 0);
    return bCount - aCount;
  });
}

export default function ServerDesignsTreeNav() {
  const treeData = buildTreeData();

  return (
    <nav className="h-full overflow-y-auto bg-white [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1">
      <div className="border-b border-slate-200 px-6">
        <Link href="/designs" className="block transition-opacity hover:opacity-80">
          <Image
            src="/ico/forever-transparent-logo-bw.png"
            alt="Forever Shining"
            width={400}
            height={246}
            className="h-auto w-full"
            priority
          />
        </Link>
        <div className="mb-4 h-px rounded-full bg-slate-200" />
        <div className="flex items-center justify-between pb-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-stone-800">
            Memorial Designs
          </h2>
          <Link
            href="/select-product"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-stone-950 bg-stone-950 px-3 py-2 text-xs font-medium uppercase tracking-[0.14em] text-white transition-colors hover:border-[#8a6b1f] hover:bg-[#8a6b1f]"
          >
            Start Design
          </Link>
        </div>
      </div>

      <div className="space-y-1 px-3 pb-6 pt-4">
        {treeData.map((productNode) => {
          const productPath = `/designs/${productNode.productSlug}`;
          const productLabel = formatSlugForDisplay(productNode.productSlug);
          const productCount = Object.values(productNode.categories).reduce(
            (sum, cat) => sum + cat.designs.length,
            0,
          );

          return (
            <details key={productNode.productSlug} className="group">
              <summary className="flex w-full cursor-pointer list-none items-center gap-2.5 rounded-lg px-3 py-2.5 text-[15px] font-normal text-stone-800 transition-all hover:bg-stone-100 marker:hidden">
                <span className="text-stone-600 transition-transform group-open:rotate-90">›</span>
                <Link href={productPath} className="flex-1 text-left hover:text-stone-950">
                  {productLabel}
                </Link>
                <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600">
                  {productCount}
                </span>
              </summary>

              <div className="mb-2 ml-4 mt-1 space-y-0.5 border-l border-slate-200 pl-3">
                {Object.entries(productNode.categories).map(([categoryKey, categoryData]) => {
                  const categoryPath = `/designs/${productNode.productSlug}/${categoryKey}`;
                  return (
                    <details key={categoryKey} className="group/category">
                      <summary className="flex w-full cursor-pointer list-none items-center gap-2 rounded-md px-3 py-2 text-[14px] font-normal text-stone-700 transition-all hover:bg-stone-50 hover:text-stone-950 marker:hidden">
                        <span className="text-stone-500 transition-transform group-open/category:rotate-90">
                          ›
                        </span>
                        <Link href={categoryPath} className="flex-1 text-left">
                          {categoryData.name}
                        </Link>
                        <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[11px] font-medium text-stone-600">
                          {categoryData.designs.length}
                        </span>
                      </summary>

                      <div className="mb-1 ml-3 mt-0.5 space-y-0.5 border-l border-slate-100 pl-3">
                        {categoryData.designs.slice(0, 40).map((design) => (
                          <Link
                            key={`${productNode.productSlug}-${categoryKey}-${design.id}`}
                            href={`/designs/${productNode.productSlug}/${categoryKey}/${design.slug}`}
                            className="block rounded-md px-3 py-1.5 text-sm font-normal leading-relaxed text-stone-700 transition-all hover:bg-stone-50 hover:text-stone-950"
                          >
                            <span className="line-clamp-2">{design.title}</span>
                          </Link>
                        ))}
                        {categoryData.designs.length > 40 ? (
                          <Link
                            href={categoryPath}
                            className="block rounded-md px-3 py-1.5 text-xs font-medium uppercase tracking-[0.12em] text-[#8a6b1f]"
                          >
                            View all {categoryData.designs.length} designs
                          </Link>
                        ) : null}
                      </div>
                    </details>
                  );
                })}
              </div>
            </details>
          );
        })}
      </div>
    </nav>
  );
}
