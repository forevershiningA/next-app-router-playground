'use client';

import { useState } from 'react';
import { loadCanonicalDesignIntoEditor, DEFAULT_CANONICAL_DESIGN_VERSION, type CanonicalDesignData } from '#/lib/saved-design-loader-utils';

const DEFAULT_DESIGN_ID = '1725769905504';

export default function TestCanonicalLoader() {
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const handleLoadDesign = async () => {
    setStatus('Loading...');
    setError('');
    
    const canonicalDesignUrl = `/canonical-designs/${DEFAULT_CANONICAL_DESIGN_VERSION}/${DEFAULT_DESIGN_ID}.json`;
    
    try {
      console.log('Fetching:', canonicalDesignUrl);
      const response = await fetch(canonicalDesignUrl, { cache: 'no-cache' });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const canonicalData: CanonicalDesignData = await response.json();
      console.log('Canonical data:', canonicalData);
      
      setStatus('Data fetched, loading into editor...');
      
      await loadCanonicalDesignIntoEditor(canonicalData, { clearExisting: true });
      
      setStatus('✅ Successfully loaded canonical design!');
      console.log('Design loaded successfully');
    } catch (err: any) {
      const errorMsg = err.message || String(err);
      setError(errorMsg);
      setStatus('❌ Failed to load');
      console.error('Load error:', err);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 bg-white border-2 border-blue-500 rounded-lg p-4 shadow-lg max-w-md">
      <h3 className="font-bold text-lg mb-2">Canonical Design Loader Test</h3>
      
      <button
        onClick={handleLoadDesign}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2"
      >
        Load Design: {DEFAULT_DESIGN_ID}
      </button>
      
      {status && (
        <div className="text-sm mt-2 p-2 bg-gray-100 rounded">
          <strong>Status:</strong> {status}
        </div>
      )}
      
      {error && (
        <div className="text-sm mt-2 p-2 bg-red-100 text-red-800 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <div className="text-xs mt-2 text-gray-600">
        Check browser console for detailed logs
      </div>
    </div>
  );
}
