import Image from 'next/image';
import Link from 'next/link';
import { getSeoReadyDesigns } from '#/lib/design-seo';

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

  for (const design of getSeoReadyDesigns()) {
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

interface ServerDesignsTreeNavProps {
  maxDesignLinksPerCategory?: number;
}

export default function ServerDesignsTreeNav({
  maxDesignLinksPerCategory = 40,
}: ServerDesignsTreeNavProps) {
  const treeData = buildTreeData();

  return (
    <nav className="day:border-[#e2dad0] day:bg-[#fcfaf6] day:text-[#1d1a17] h-full overflow-y-auto border-r border-white/10 bg-[#121110] text-white [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-stone-300 day:[&::-webkit-scrollbar-thumb]:bg-stone-300 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1">
      <div className="day:border-[#e8e2d7] border-b border-white/10 px-6 pt-5 pb-4">
        <Link href="/" className="block transition-opacity hover:opacity-80">
          <Image
            src="/ico/forever-transparent-logo-bw.png"
            alt="Forever Shining"
            width={400}
            height={246}
            className="h-auto w-full max-w-[200px]"
            priority
          />
        </Link>
        <div className="day:border-[#e8e2d7] mt-4 flex items-center justify-between border-t border-white/10 pt-3">
          <Link
            href="/designs"
            className="day:text-[#8a651f] text-xs font-semibold uppercase tracking-widest text-[#cfac6c]"
          >
            Design Collections
          </Link>
          <Link
            href="/select-product"
            className="day:bg-[#1d1a17] day:text-white day:hover:bg-[#342e26] inline-flex items-center justify-center gap-1.5 rounded-sm bg-[#cfac6c] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#14120e] transition-colors hover:bg-[#e0c48c]"
          >
            Start 3D
          </Link>
        </div>
      </div>

      <div className="space-y-1 px-3 pb-8 pt-4">
        {treeData.map((productNode) => {
          const productPath = `/designs/${productNode.productSlug}`;
          const productLabel = formatSlugForDisplay(productNode.productSlug);
          const productCount = Object.values(productNode.categories).reduce(
            (sum, cat) => sum + cat.designs.length,
            0,
          );

          return (
            <details key={productNode.productSlug} className="group">
              <summary className="day:text-[#1d1a17] day:hover:bg-[#f3eee5] flex w-full cursor-pointer list-none items-center gap-2.5 rounded-sm px-3 py-2.5 text-[14px] font-medium text-white/90 transition-all hover:bg-white/5 marker:hidden">
                <span className="day:text-[#8a651f] text-[#cfac6c] transition-transform group-open:rotate-90">›</span>
                <Link href={productPath} className="day:hover:text-[#8a651f] flex-1 text-left transition-colors hover:text-[#cfac6c]">
                  {productLabel}
                </Link>
                <span className="day:border-[#e0d8cc] day:bg-[#ece4d4] day:text-[#6a5323] rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[11px] font-medium text-white/60">
                  {productCount}
                </span>
              </summary>

              <div className="day:border-[#e5ded2] mb-2 ml-4 mt-1 space-y-0.5 border-l border-white/10 pl-3">
                {Object.entries(productNode.categories).map(([categoryKey, categoryData]) => {
                  const categoryPath = `/designs/${productNode.productSlug}/${categoryKey}`;
                  return (
                    <details key={categoryKey} className="group/category">
                      <summary className="day:text-[#50483f] day:hover:bg-[#f6f2ea] day:hover:text-[#1d1a17] flex w-full cursor-pointer list-none items-center gap-2 rounded-sm px-3 py-2 text-[13px] text-white/70 transition-all hover:bg-white/5 hover:text-white marker:hidden">
                        <span className="day:text-[#a89d8d] text-white/40 transition-transform group-open/category:rotate-90">
                          ›
                        </span>
                        <Link href={categoryPath} className="flex-1 text-left">
                          {categoryData.name}
                        </Link>
                        <span className="day:text-[#756c62] text-[11px] text-white/50">
                          {categoryData.designs.length}
                        </span>
                      </summary>

                      {maxDesignLinksPerCategory > 0 ? (
                        <div className="day:border-[#ece5d8] mb-1 ml-3 mt-0.5 space-y-0.5 border-l border-white/10 pl-3">
                          {categoryData.designs.slice(0, maxDesignLinksPerCategory).map((design) => (
                            <Link
                              key={`${productNode.productSlug}-${categoryKey}-${design.id}`}
                              href={`/designs/${productNode.productSlug}/${categoryKey}/${design.slug}`}
                              className="day:text-[#625a51] day:hover:text-[#1d1a17] block rounded-sm px-3 py-1 text-xs leading-relaxed text-white/60 transition-all hover:text-white"
                            >
                              <span className="line-clamp-2">{design.title}</span>
                            </Link>
                          ))}
                          {categoryData.designs.length > maxDesignLinksPerCategory ? (
                            <Link
                              href={categoryPath}
                              className="day:text-[#8a651f] block rounded-sm px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-[#cfac6c]"
                            >
                              View all {categoryData.designs.length} designs
                            </Link>
                          ) : null}
                        </div>
                      ) : null}
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
