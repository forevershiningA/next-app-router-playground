'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import { getAllSavedDesigns } from '#/lib/saved-designs-data';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { calculatePrice, computeQuantity } from '#/lib/xml-parser';
import { data } from '#/app/_internal/_data';

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

/**
 * Format slug for display - convert kebab-case to Title Case
 * e.g., "your-life-was-a-blessing-your-memory-a-treasure" → "Your Life Was a Blessing Your Memory a Treasure"
 */
function formatSlugForDisplay(slug: string): string {
  if (!slug) return 'Memorial Design';
  
  return slug
    .split('-')
    .map(word => {
      // Don't capitalize very short words (articles, prepositions) unless they're the first word
      if (word.length <= 2 && word !== slug.split('-')[0]) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Format shape name for display - Title Case
 * e.g., "curved gable" → "Curved Gable"
 */
function formatShapeName(shapeName: string): string {
  if (!shapeName) return '';
  
  return shapeName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Build display title with shape name prefix
 * e.g., "Curved Gable - Gods Garden Memorial"
 * Removes the shape name from the slug to avoid duplication
 */
function buildDesignTitle(shapeName: string | undefined, slug: string): string {
  let processedSlug = slug;
  
  // Remove shape name from the beginning of slug if it exists
  if (shapeName) {
    const shapeKebab = shapeName.toLowerCase().replace(/\s+/g, '-');
    if (processedSlug.startsWith(shapeKebab + '-')) {
      processedSlug = processedSlug.substring(shapeKebab.length + 1);
    } else if (processedSlug === shapeKebab) {
      // If slug is just the shape name, use a generic title
      processedSlug = 'memorial';
    }
  }
  
  const slugTitle = formatSlugForDisplay(processedSlug);
  
  if (shapeName) {
    const formattedShape = formatShapeName(shapeName);
    return `${formattedShape} - ${slugTitle}`;
  }
  
  return slugTitle;
}

export default function DesignsTreeNav() {
  const pathname = usePathname();
  const [treeData, setTreeData] = useState<DesignTreeNode[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  
  // Get catalog info
  const catalog = useHeadstoneStore((s) => s.catalog);
  const productId = useHeadstoneStore((s) => s.productId);
  const widthMm = useHeadstoneStore((s) => s.widthMm);
  const heightMm = useHeadstoneStore((s) => s.heightMm);
  const baseWidthMm = useHeadstoneStore((s) => s.baseWidthMm);
  const baseHeightMm = useHeadstoneStore((s) => s.baseHeightMm);
  const baseThickness = useHeadstoneStore((s) => s.baseThickness);
  const uprightThickness = useHeadstoneStore((s) => s.uprightThickness);
  const showBase = useHeadstoneStore((s) => s.showBase);

  let quantity = widthMm * heightMm;
  if (catalog) {
    quantity = computeQuantity(catalog.product.priceModel, { width: widthMm, height: heightMm, depth: uprightThickness });
  }
  
  let baseQuantity = 0;
  if (showBase && catalog?.product?.basePriceModel) {
    baseQuantity = computeQuantity(catalog.product.basePriceModel, { width: baseWidthMm, height: baseHeightMm, depth: baseThickness });
  }
  
  const headstonePrice = catalog ? calculatePrice(catalog.product.priceModel, quantity) : 0;
  const basePrice = showBase && catalog?.product?.basePriceModel
    ? calculatePrice(catalog.product.basePriceModel, baseQuantity)
    : 0;
  const price = headstonePrice + basePrice;
  
  // Safe product name with ID check
  const displayProductName = catalog?.product?.name && catalog.product.id === productId
    ? catalog.product.name
    : (productId ? data.products.find((p) => p.id === productId)?.name : undefined) ?? 'Design Your Own Headstone';

  useEffect(() => {
    // Load all designs and organize into tree structure
    const allDesigns = getAllSavedDesigns();
    
    // Group by productSlug and category
    const tree: { [productSlug: string]: DesignTreeNode } = {};
    
    allDesigns.forEach((design) => {
      const productSlug = design.productSlug || 'uncategorized';
      const productType = design.productType || 'uncategorized';
      const category = design.category || 'uncategorized';
      
      if (!tree[productSlug]) {
        tree[productSlug] = {
          productType,
          productSlug,
          categories: {},
        };
      }
      
      if (!tree[productSlug].categories[category]) {
        tree[productSlug].categories[category] = {
          name: category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          designs: [],
        };
      }
      
      tree[productSlug].categories[category].designs.push({
        id: design.id,
        slug: design.slug,
        shapeName: design.shapeName,
        // Build title with shape name prefix
        title: buildDesignTitle(design.shapeName, design.slug),
      });
    });
    
    // Sort designs alphabetically by title within each category
    Object.values(tree).forEach(productNode => {
      Object.values(productNode.categories).forEach(categoryData => {
        categoryData.designs.sort((a, b) => a.title.localeCompare(b.title));
      });
    });
    
    setTreeData(Object.values(tree));
    
    // Auto-expand the current path
    if (pathname) {
      const parts = pathname.split('/').filter(Boolean);
      if (parts[0] === 'designs' && parts.length >= 2) {
        const newExpanded = new Set<string>();
        newExpanded.add(parts[1]); // productSlug
        if (parts.length >= 3) {
          newExpanded.add(`${parts[1]}/${parts[2]}`); // productSlug/category
        }
        setExpandedNodes(newExpanded);
      }
    }
    
    setLoading(false);
  }, [pathname]);

  const toggleNode = (nodeKey: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeKey)) {
        newSet.delete(nodeKey);
      } else {
        newSet.add(nodeKey);
      }
      return newSet;
    });
  };

  const isActive = (path: string) => {
    return pathname?.startsWith(path);
  };

  if (loading) {
    return (
      <div className="bg-white h-full p-6 text-sm text-slate-400 font-light">
        Loading memorial designs...
      </div>
    );
  }

  if (treeData.length === 0) {
    return (
      <div className="bg-white h-full p-6 text-sm text-slate-400 font-light">
        No designs found.
      </div>
    );
  }

  return (
    <nav className="overflow-y-auto h-full bg-white [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-track]:bg-transparent">
      {/* Product Header - shown when catalog is loaded AND not on design gallery pages */}
      {catalog && !pathname?.startsWith('/designs') && (
        <div className="border-b border-slate-200 bg-slate-50 p-4">
          <h1 className="text-lg font-semibold text-slate-900">
            {displayProductName}
            <br />
            <span className="text-slate-500 font-normal">{widthMm} x {heightMm} mm (${price.toFixed(2)})</span>
          </h1>
        </div>
      )}

      {/* Header */}
      <div className="px-6 border-b border-slate-200">
        <Link href="/designs" className="transition-opacity hover:opacity-80 block">
          <Image
            src="/ico/forever-transparent-logo-bw.png"
            alt="Forever Shining"
            width={400}
            height={246}
            className="w-full h-auto"
            priority
          />
        </Link>
        <div className="h-px bg-slate-200 rounded-full mb-4" />
        <div className="flex items-center justify-between pb-4">
          <h2 className="text-sm font-semibold text-stone-800 uppercase tracking-widest">
            Memorial Designs
          </h2>
          <Link
            href="/"
            className="rounded-lg border border-stone-950 bg-stone-950 px-3 py-2 text-xs font-medium uppercase tracking-[0.14em] text-white transition-colors hover:border-[#8a6b1f] hover:bg-[#8a6b1f]"
          >
            3D Designer
          </Link>
        </div>
      </div>
      
      <div className="px-3 pb-6 pt-4 space-y-1">
        {treeData.map((productNode) => {
          const productKey = productNode.productSlug;
          const isProductExpanded = expandedNodes.has(productKey);
          const productPath = `/designs/${productNode.productSlug}`;
          const productLabel = productNode.productSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          
          return (
            <div key={productKey}>
              {/* Product Type Level */}
              <button
                onClick={() => toggleNode(productKey)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[15px] transition-all ${
                  isActive(productPath) 
                    ? 'bg-stone-100 text-stone-950 font-semibold' 
                    : 'text-stone-800 hover:bg-stone-100 font-normal'
                }`}
                aria-expanded={isProductExpanded}
              >
                {isProductExpanded ? (
                  <ChevronDownIcon className="w-4 h-4 flex-shrink-0 text-stone-600" />
                ) : (
                  <ChevronRightIcon className="w-4 h-4 flex-shrink-0 text-stone-600" />
                )}
                <span className="flex-1 text-left">{productLabel}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  isActive(productPath) ? 'bg-stone-200 text-stone-700' : 'bg-stone-100 text-stone-600'
                }`}>
                  {Object.values(productNode.categories).reduce((sum, cat) => sum + cat.designs.length, 0)}
                </span>
              </button>
              
              {/* Categories */}
              {isProductExpanded && (
                <div className="ml-4 mt-1 mb-2 border-l border-slate-200 pl-3 space-y-0.5">
                  {Object.entries(productNode.categories).map(([categoryKey, categoryData]) => {
                    const categoryNodeKey = `${productKey}/${categoryKey}`;
                    const isCategoryExpanded = expandedNodes.has(categoryNodeKey);
                    const categoryPath = `/designs/${productNode.productSlug}/${categoryKey}`;
                    
                    return (
                      <div key={categoryNodeKey}>
                        {/* Category Level */}
                        <button
                          onClick={() => toggleNode(categoryNodeKey)}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-[14px] transition-all ${
                            isActive(categoryPath) && !pathname?.includes(categoryPath + '/') 
                              ? 'bg-stone-100 text-stone-950 font-semibold' 
                              : 'text-stone-700 hover:bg-stone-50 hover:text-stone-950 font-normal'
                          }`}
                          aria-expanded={isCategoryExpanded}
                        >
                          {isCategoryExpanded ? (
                            <ChevronDownIcon className="w-3.5 h-3.5 flex-shrink-0 text-stone-500" />
                          ) : (
                            <ChevronRightIcon className="w-3.5 h-3.5 flex-shrink-0 text-stone-500" />
                          )}
                          <span className="flex-1 text-left">{categoryData.name}</span>
                          <span className="text-[11px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 font-medium">
                            {categoryData.designs.length}
                          </span>
                        </button>
                        
                        {/* Designs */}
                        {isCategoryExpanded && (
                          <div className="ml-3 mt-0.5 mb-1 border-l border-slate-100 pl-3 space-y-0.5">
                            {categoryData.designs.map((design, index) => {
                              const designPath = `/designs/${productNode.productSlug}/${categoryKey}/${design.slug}`;
                              const isDesignActive = pathname === designPath;

                              return (
                                <Link
                                  key={`${productNode.productSlug}-${categoryKey}-${design.id}-${index}`}
                                  href={designPath}
                                  className={`block px-3 py-1.5 rounded-md text-sm leading-relaxed transition-all ${
                                    isDesignActive 
                                      ? 'border-l-2 border-[#8a6b1f] bg-stone-50 text-stone-950 font-semibold pl-[10px]' 
                                      : 'text-stone-700 hover:bg-stone-50 hover:text-stone-950 font-normal'
                                  }`}
                                >
                                  <span className="line-clamp-2">{design.title}</span>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
