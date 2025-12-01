'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import { getAllSavedDesigns } from '#/lib/saved-designs-data';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { calculatePrice } from '#/lib/xml-parser';

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
  const widthMm = useHeadstoneStore((s) => s.widthMm);
  const heightMm = useHeadstoneStore((s) => s.heightMm);

  let quantity = widthMm * heightMm;
  if (catalog) {
    const qt = catalog.product.priceModel.quantityType;
    if (qt === 'Width + Height') {
      quantity = widthMm + heightMm;
    }
  }
  const price = catalog ? calculatePrice(catalog.product.priceModel, quantity) : 0;

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
    <nav className="overflow-y-auto h-full">
      {/* Product Header - shown when catalog is loaded */}
      {catalog && (
        <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm p-4">
          <h1 className="text-lg font-semibold text-slate-800">
            {catalog.product.name}
            <br />
            <span className="text-slate-600">{widthMm} x {heightMm} mm (${price.toFixed(2)})</span>
          </h1>
        </div>
      )}

      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <Link href="/designs" className="hover:opacity-80 transition-opacity">
          <img src="/ico/forever-transparent-logo.png" alt="Forever Logo" className="mb-4" />
        </Link>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-serif font-light text-slate-800 tracking-tight">
            Memorial Designs
          </h2>
          <Link
            href="/"
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all text-sm font-medium shadow-md hover:shadow-lg"
          >
            3D Designer
          </Link>
        </div>
        <p className="text-sm text-slate-600 font-light">
          {totalDesigns.toLocaleString()} saved designs
        </p>
      </div>
      
      <div className="px-4 pb-4 pt-4 space-y-3">
        {treeData.map((productNode) => {
          const productKey = productNode.productSlug;
          const isProductExpanded = expandedNodes.has(productKey);
          const productPath = `/designs/${productNode.productSlug}`;
          const productLabel = productNode.productSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          
          return (
            <div key={productKey} className="mb-3">
              {/* Product Type Level */}
              <button
                onClick={() => toggleNode(productKey)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive(productPath) 
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200' 
                    : 'text-slate-700 hover:bg-white/50 hover:text-slate-900'
                }`}
                aria-expanded={isProductExpanded}
              >
                {isProductExpanded ? (
                  <ChevronDownIcon className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <ChevronRightIcon className="w-4 h-4 flex-shrink-0" />
                )}
                <span className="flex-1 text-left">{productLabel}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  isActive(productPath) ? 'bg-slate-200 text-slate-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {Object.keys(productNode.categories).length}
                </span>
              </button>
              
              {/* Categories */}
              {isProductExpanded && (
                <div className="ml-4 mt-2 space-y-1">
                  {Object.entries(productNode.categories).map(([categoryKey, categoryData]) => {
                    const categoryNodeKey = `${productKey}/${categoryKey}`;
                    const isCategoryExpanded = expandedNodes.has(categoryNodeKey);
                    const categoryPath = `/designs/${productNode.productSlug}/${categoryKey}`;
                    
                    return (
                      <div key={categoryNodeKey}>
                        {/* Category Level */}
                        <button
                          onClick={() => toggleNode(categoryNodeKey)}
                          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all ${
                            isActive(categoryPath) && !pathname?.includes(categoryPath + '/') 
                              ? 'bg-white text-slate-900 shadow-sm border border-slate-200' 
                              : 'text-slate-600 hover:bg-white/50 hover:text-slate-900'
                          }`}
                          aria-expanded={isCategoryExpanded}
                        >
                          {isCategoryExpanded ? (
                            <ChevronDownIcon className="w-3 h-3 flex-shrink-0" />
                          ) : (
                            <ChevronRightIcon className="w-3 h-3 flex-shrink-0" />
                          )}
                          <span className="flex-1 text-left">{categoryData.name}</span>
                          <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {categoryData.designs.length}
                          </span>
                        </button>
                        
                        {/* Designs */}
                        {isCategoryExpanded && (
                          <div className="ml-4 mt-1 space-y-0.5">
                            {categoryData.designs.map((design, index) => {
                              const designPath = `/designs/${productNode.productSlug}/${categoryKey}/${design.slug}`;
                              const isDesignActive = pathname === designPath;

                              return (
                                <Link
                                  key={`${productNode.productSlug}-${categoryKey}-${design.id}-${index}`}
                                  href={designPath}
                                  className={`block px-3 py-2.5 rounded-lg text-sm transition-all ${
                                    isDesignActive 
                                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200 font-medium' 
                                      : 'text-slate-600 hover:bg-white/50 hover:text-slate-900'
                                  }`}
                                >
                                  {design.title}
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
