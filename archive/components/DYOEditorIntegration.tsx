/**
 * Example integration of saved designs with the DYO tool
 * 
 * This shows how to load a saved design and populate the DYO editor
 */

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSavedDesign, convertSavedDesignToDYO, SavedDesignData } from '#/components/SavedDesignLoader';

// Example DYO Editor integration
export function DYOEditorWithSavedDesigns() {
  const searchParams = useSearchParams();
  const designId = searchParams.get('design'); // e.g., ?design=1577938315050
  
  const { design, loading, error } = useSavedDesign(designId);
  const [editorReady, setEditorReady] = useState(false);

  useEffect(() => {
    if (design && editorReady) {
      loadDesignIntoEditor(design);
    }
  }, [design, editorReady]);

  async function loadDesignIntoEditor(savedDesign: SavedDesignData) {
    const dyoFormat = convertSavedDesignToDYO(savedDesign);
    
    // 1. Set base product
    if (dyoFormat.product) {
      await setProduct({
        type: dyoFormat.product.type,
        shape: dyoFormat.product.shape,
        color: dyoFormat.product.color,
        texture: dyoFormat.product.texture,
        dimensions: {
          width: dyoFormat.product.width,
          height: dyoFormat.product.height
        }
      });
    }

    // 2. Add inscriptions
    for (const inscription of dyoFormat.inscriptions) {
      await addInscription({
        text: inscription.text,
        fontFamily: inscription.fontFamily,
        fontSize: inscription.fontSize,
        color: inscription.color,
        position: {
          x: inscription.x,
          y: inscription.y
        },
        rotation: inscription.rotation,
        part: inscription.part, // 'Headstone', 'Base', etc.
        side: inscription.side  // 'Front', 'Back', etc.
      });
    }

    // 3. Add photos (if any)
    for (const photo of dyoFormat.photos) {
      await addPhoto({
        position: { x: photo.x, y: photo.y },
        dimensions: { width: photo.width, height: photo.height },
        rotation: photo.rotation
      });
    }

    // 4. Add logos (if any)
    for (const logo of dyoFormat.logos) {
      await addLogo({
        position: { x: logo.x, y: logo.y },
        dimensions: { width: logo.width, height: logo.height },
        rotation: logo.rotation
      });
    }
  }

  // Mock functions - replace with your actual DYO API
  async function setProduct(config: any) {
    // Your product selection logic
  }

  async function addInscription(config: any) {
    // Your inscription add logic
  }

  async function addPhoto(config: any) {
    // Your photo add logic
  }

  async function addLogo(config: any) {
    // Your logo add logic
  }

  return (
    <div className="dyo-editor">
      {loading && (
        <div className="loading-overlay">
          <p>Loading saved design...</p>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <p>Error loading design: {error}</p>
        </div>
      )}

      {/* Your existing DYO editor components */}
      <div className="editor-canvas" ref={() => setEditorReady(true)}>
        {/* Canvas, tools, etc. */}
      </div>
    </div>
  );
}

// Alternative: Direct function to load design
export async function loadSavedDesignById(designId: string) {
  try {
    const response = await fetch(`/ml/forevershining/saved-designs/json/${designId}.json`);
    if (!response.ok) throw new Error('Design not found');
    
    const design = await response.json();
    const dyoFormat = convertSavedDesignToDYO(design);
    
    return dyoFormat;
  } catch (error) {
    console.error('Failed to load design:', error);
    throw error;
  }
}

// Example: Create a "Start from Template" button
export function StartFromTemplateButton({ designId, designTitle }: { designId: string; designTitle: string }) {
  const handleClick = async () => {
    try {
      const design = await loadSavedDesignById(designId);
      
      // Redirect to editor with design ID
      window.location.href = `/design?product=headstone&design=${designId}`;
      
      // Or load directly if already on editor page
      // await loadDesignIntoEditor(design);
    } catch (error) {
      alert('Failed to load design template');
    }
  };

  return (
    <button 
      onClick={handleClick}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    >
      Start from: {designTitle}
    </button>
  );
}

// Example: Design Gallery Component
export function SavedDesignGallery() {
  const [designs, setDesigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In production, this would come from your categorized data
    import('#/lib/saved-designs-data').then(({ SAVED_DESIGNS }) => {
      const designList = Object.values(SAVED_DESIGNS).slice(0, 20); // First 20
      setDesigns(designList);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading designs...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {designs.map(design => (
        <div key={design.id} className="border rounded-lg p-4 hover:shadow-lg transition">
          <div className="aspect-square bg-gray-100 rounded mb-3">
            {/* Thumbnail would go here */}
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              Preview
            </div>
          </div>
          
          <h3 className="font-semibold mb-2 line-clamp-2">{design.title}</h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{design.description}</p>
          
          <div className="flex gap-2">
            <StartFromTemplateButton 
              designId={design.id} 
              designTitle={design.title}
            />
            <a 
              href={`/select-product/headstone/headstone/${design.slug}`}
              className="text-blue-600 hover:underline text-sm"
            >
              View Details
            </a>
          </div>
          
          <div className="mt-3 flex flex-wrap gap-1">
            {design.keywords.slice(0, 3).map((keyword: string) => (
              <span 
                key={keyword}
                className="text-xs bg-gray-100 px-2 py-1 rounded"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Example: Related Designs Component
export function RelatedDesigns({ currentDesignId, category }: { currentDesignId: string; category: string }) {
  const [related, setRelated] = useState<any[]>([]);

  useEffect(() => {
    import('#/lib/saved-designs-data').then(({ getDesignsByCategory }) => {
      const categoryDesigns = getDesignsByCategory(category as any);
      const filtered = categoryDesigns
        .filter(d => d.id !== currentDesignId)
        .slice(0, 4);
      setRelated(filtered);
    });
  }, [currentDesignId, category]);

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Related Designs</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {related.map(design => (
          <a 
            key={design.id}
            href={`/select-product/headstone/headstone/${design.slug}`}
            className="block border rounded-lg p-3 hover:shadow-md transition"
          >
            <div className="aspect-square bg-gray-100 rounded mb-2" />
            <h3 className="font-medium text-sm line-clamp-2">{design.title}</h3>
          </a>
        ))}
      </div>
    </div>
  );
}

// Example: Search and Filter
export function DesignSearchAndFilter() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [category, setCategory] = useState<string>('all');

  const handleSearch = async () => {
    const { searchDesigns, getDesignsByCategory, DESIGN_CATEGORIES } = await import('#/lib/saved-designs-data');
    
    let designs = query ? searchDesigns(query) : Object.values(await import('#/lib/saved-designs-data').then(m => m.SAVED_DESIGNS));
    
    if (category !== 'all') {
      designs = designs.filter(d => d.category === category);
    }
    
    setResults(designs.slice(0, 20));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSearch()}
          placeholder="Search designs..."
          className="flex-1 px-4 py-2 border rounded"
        />
        
        <select 
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="px-4 py-2 border rounded"
        >
          <option value="all">All Categories</option>
          <option value="headstone">Headstones</option>
          <option value="dedication">Dedication</option>
          <option value="pet-plaque">Pet Plaques</option>
          {/* Add more categories */}
        </select>
        
        <button 
          onClick={handleSearch}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Search
        </button>
      </div>

      <div className="text-sm text-gray-600">
        Found {results.length} designs
      </div>

      <SavedDesignGallery />
    </div>
  );
}

export default DYOEditorWithSavedDesigns;
