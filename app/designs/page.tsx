// app/designs/page.tsx
// Index page showing all available design categories

import Link from 'next/link';
import { DESIGN_CATEGORIES, SAVED_DESIGNS } from '#/lib/saved-designs-data';

export const metadata = {
  title: 'Browse Design Templates | DYO',
  description: 'Explore thousands of saved design templates. Find inspiration for headstones, bronze plaques, and memorial products.',
};

export default function DesignsIndexPage() {
  const totalDesigns = Object.keys(SAVED_DESIGNS).length;
  
  // Count designs by category
  const categoryCounts = Object.values(SAVED_DESIGNS).reduce((acc, design) => {
    acc[design.category] = (acc[design.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-100">
          Browse {totalDesigns.toLocaleString()} Design Templates
        </h1>
        <p className="mt-2 text-lg text-gray-400">
          Explore design templates organized by category. Each design can be customized to match your needs.
        </p>
      </header>

      {/* Category Navigation */}
      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold text-gray-200">Browse by Category</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.values(DESIGN_CATEGORIES).map((category) => {
            const count = categoryCounts[category.slug] || 0;
            
            return (
              <Link
                key={category.slug}
                href={`/designs/${category.slug}`}
                className="rounded-lg border border-gray-700 bg-gray-800/50 p-6 transition-all hover:border-gray-600 hover:bg-gray-800"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-100">
                    {category.name}
                  </h3>
                  <span className="bg-blue-500/20 text-blue-400 text-xs font-medium px-2.5 py-1 rounded-full">
                    {count}
                  </span>
                </div>
                <p className="text-sm text-gray-400">
                  {category.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Stats */}
      <section className="mt-12 rounded-lg border border-gray-700 bg-gray-800/30 p-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-200">Template Statistics</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <div className="text-3xl font-bold text-blue-400">{totalDesigns.toLocaleString()}</div>
            <div className="text-sm text-gray-400">Total Templates</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-400">{Object.keys(DESIGN_CATEGORIES).length}</div>
            <div className="text-sm text-gray-400">Categories</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-400">
              {categoryCounts['headstone'] || 0}
            </div>
            <div className="text-sm text-gray-400">Headstones</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-400">
              {categoryCounts['dedication'] || 0}
            </div>
            <div className="text-sm text-gray-400">Dedication Plaques</div>
          </div>
        </div>
      </section>
    </div>
  );
}
