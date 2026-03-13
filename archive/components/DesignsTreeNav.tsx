'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import { getAllSavedDesigns } from '#/lib/saved-designs-data';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { calculatePrice } from '#/lib/xml-parser';
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
  const showBase = useHeadstoneStore((s) => s.showBase);

  let quantity = widthMm * heightMm;
  if (catalog) {
    const qt = catalog.product.priceModel.quantityType;
    if (qt === 'Width + Height') {
      quantity = widthMm + heightMm;
    }
  }
  
  let baseQuantity = 0;
  if (showBase && catalog?.product?.basePriceModel) {
    const qt = catalog.product.basePriceModel.quantityType;
    if (qt === 'Width + Height') {
      baseQuantity = baseWidthMm + baseHeightMm;
    } else if (qt === 'Width') {
      baseQuantity = baseWidthMm + baseThickness; // Width + Thickness (depth)
    } else {
      baseQuantity = baseWidthMm * baseHeightMm;
    }
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
      <div className="p-6 text-lg text-slate-600 font-light">
        Loading memorial designs...
      </div>
    );
  }

  if (treeData.length === 0) {
    return (
      <div className="p-6 text-lg text-slate-600 font-light">
        No designs found.
      </div>
    );
  }

  // Calculate total number of designs
  const totalDesigns = treeData.reduce((total, productNode) => {
    return total + Object.values(productNode.categories).reduce((sum, cat) => sum + cat.designs.length, 0);
  }, 0);

  return (
    <nav className="overflow-y-auto h-full bg-gradient-to-tr from-sky-900 to-yellow-900">
      {/* Product Header - shown when catalog is loaded AND not on design gallery pages */}
      {catalog && !pathname?.startsWith('/designs') && (
        <div className="border-b border-slate-700/50 bg-black/20 backdrop-blur-sm p-4">
          <h1 className="text-lg font-semibold text-white">
            {displayProductName}
            <br />
            <span className="text-slate-300">{widthMm} x {heightMm} mm (${price.toFixed(2)})</span>
          </h1>
        </div>
      )}

      {/* Header */}
      <div className="p-4 pb-6 border-b border-slate-700/50">
        <Link href="/designs" className="hover:opacity-80 transition-opacity">
          <img src="/ico/forever-transparent-logo.png" alt="Forever Logo" className="mb-4" />
        </Link>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-serif font-light text-white tracking-tight">
            Memorial Designs
          </h2>
          <Link
            href="/"
            className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all text-sm font-medium backdrop-blur-sm border border-white/20"
          >
            3D Designer
          </Link>
        </div>
        <p className="text-sm text-slate-300 font-light">
          {totalDesigns.toLocaleString()} thoughtfully crafted designs
        </p>
      </div>
      
      <div className="px-4 pb-4 pt-6 space-y-3">
        {treeData.map((productNode) => {
          const productKey = productNode.productSlug;
          const isProductExpanded = expandedNodes.has(productKey);
          const productPath = `/designs/${productNode.productSlug}`;
          const productLabel = productNode.productSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          
          return (
            <div key={productKey} className="mb-4">
              {/* Product Type Level */}
              <button
                onClick={() => toggleNode(productKey)}
                className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-lg text-base font-light transition-all ${
                  isActive(productPath) 
                    ? 'bg-white/15 text-white shadow-lg border border-white/30 backdrop-blur-sm' 
                    : 'bg-white/5 text-slate-200 hover:bg-white/10 border border-white/10 hover:border-white/20'
                }`}
                aria-expanded={isProductExpanded}
              >
                {isProductExpanded ? (
                  <ChevronDownIcon className="w-5 h-5 flex-shrink-0 text-slate-300" />
                ) : (
                  <ChevronRightIcon className="w-5 h-5 flex-shrink-0 text-slate-300" />
                )}
                <span className="flex-1 text-left tracking-wide">{productLabel}</span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-light tracking-wider ${
                  isActive(productPath) ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-300'
                }`}>
                  {Object.keys(productNode.categories).length}
                </span>
              </button>
              
              {/* Categories */}
              {isProductExpanded && (
                <div className="ml-4 mt-2 space-y-2">
                  {Object.entries(productNode.categories).map(([categoryKey, categoryData]) => {
                    const categoryNodeKey = `${productKey}/${categoryKey}`;
                    const isCategoryExpanded = expandedNodes.has(categoryNodeKey);
                    const categoryPath = `/designs/${productNode.productSlug}/${categoryKey}`;
                    
                    return (
                      <div key={categoryNodeKey}>
                        {/* Category Level */}
                        <button
                          onClick={() => toggleNode(categoryNodeKey)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${
                            isActive(categoryPath) && !pathname?.includes(categoryPath + '/') 
                              ? 'bg-white/10 text-white font-normal border border-white/20 backdrop-blur-sm' 
                              : 'bg-white/5 text-slate-300 hover:bg-white/8 border border-white/5 font-light'
                          }`}
                          aria-expanded={isCategoryExpanded}
                        >
                          {isCategoryExpanded ? (
                            <ChevronDownIcon className="w-4 h-4 flex-shrink-0 text-slate-400" />
                          ) : (
                            <ChevronRightIcon className="w-4 h-4 flex-shrink-0 text-slate-400" />
                          )}
                          <span className="flex-1 text-left tracking-wide">{categoryData.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-light">
                            {categoryData.designs.length}
                          </span>
                        </button>
                        
                        {/* Designs */}
                        {isCategoryExpanded && (
                          <div className="ml-4 mt-2 space-y-1.5">
                            {categoryData.designs.map((design, index) => {
                              const designPath = `/designs/${productNode.productSlug}/${categoryKey}/${design.slug}`;
                              const isDesignActive = pathname === designPath;

                              return (
                                <Link
                                  key={`${productNode.productSlug}-${categoryKey}-${design.id}-${index}`}
                                  href={designPath}
                                  className={`block px-4 py-2.5 rounded-lg text-sm transition-all ${
                                    isDesignActive 
                                      ? 'bg-white/15 text-white font-normal shadow-md border border-white/30' 
                                      : 'bg-white/5 text-slate-300 hover:bg-white/8 border border-transparent hover:border-white/10 font-light'
                                  }`}
                                >
                                  <span className="leading-relaxed tracking-wide">{design.title}</span>
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
