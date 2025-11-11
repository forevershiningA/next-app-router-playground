'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
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

export default function DesignsTreeNav() {
  const pathname = usePathname();
  const [treeData, setTreeData] = useState<DesignTreeNode[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

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
        // Use the meaningful slug text for display instead of generic "Mother Memorial"
        title: formatSlugForDisplay(design.slug),
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
    <nav className="overflow-y-auto h-full p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Elegant Header */}
      <div className="mb-8 pb-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-serif font-light text-white tracking-tight">
            <Link href="/designs" className="hover:text-slate-300 transition-colors">
              Memorial Designs
            </Link>
          </h1>
          <Link
            href="/"
            className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all text-sm font-light uppercase tracking-wider backdrop-blur-sm border border-white/20"
          >
            DYO
          </Link>
        </div>
        <p className="text-sm text-slate-400 font-light tracking-wide">
          {totalDesigns.toLocaleString()} thoughtfully crafted designs
        </p>
      </div>
      
      <div className="space-y-3">
        {treeData.map((productNode) => {
          const productKey = productNode.productSlug;
          const isProductExpanded = expandedNodes.has(productKey);
          const productPath = `/designs/${productNode.productSlug}`;
          const productLabel = productNode.productSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          
          return (
            <div key={productKey} className="mb-4">
              {/* Product Type Level - Refined */}
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
              
              {/* Categories - Elegant spacing */}
              {isProductExpanded && (
                <div className="ml-4 mt-2 space-y-2">
                  {Object.entries(productNode.categories).map(([categoryKey, categoryData]) => {
                    const categoryNodeKey = `${productKey}/${categoryKey}`;
                    const isCategoryExpanded = expandedNodes.has(categoryNodeKey);
                    const categoryPath = `/designs/${productNode.productSlug}/${categoryKey}`;
                    
                    return (
                      <div key={categoryNodeKey}>
                        {/* Category Level - Refined */}
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
                        
                        {/* Designs - Clean list */}
                        {isCategoryExpanded && (
                          <div className="ml-4 mt-2 space-y-1.5">
                            {categoryData.designs.map((design, index) => {
                              const designPath = `/designs/${productNode.productSlug}/${categoryKey}/${design.id}_${design.slug}`;
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
