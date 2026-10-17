/** Configuration facts only. No inscription text, customer names or image payloads. */
export type DesignSourceSummary = {
  path: string | null;
  productId: string | null;
  shape: string | null;
  materialTexture: string | null;
  materialName: string | null;
  status: 'source-ready' | 'requires-review' | 'unavailable';
  reasons: string[];
  version: string | null;
  dimensionsMm: {
    width: number | null;
    height: number | null;
    thickness: number | null;
  };
  elementCounts: {
    inscriptions: number;
    motifs: number;
    photos: number;
    logos: number;
    additions: number;
  };
  evidence: {
    legacyProductId: string | null;
    legacyAgreesWithSource: boolean | null;
    sourceProductExists: boolean;
    decision: 'consistent' | 'metadata-review' | 'source-review' | 'unresolved';
  };
};

export function unavailableDesignSource(): DesignSourceSummary {
  return {
    path: null,
    productId: null,
    shape: null,
    materialTexture: null,
    materialName: null,
    status: 'unavailable',
    reasons: ['missing-or-invalid-source'],
    version: null,
    dimensionsMm: { width: null, height: null, thickness: null },
    elementCounts: {
      inscriptions: 0,
      motifs: 0,
      photos: 0,
      logos: 0,
      additions: 0,
    },
    evidence: {
      legacyProductId: null,
      legacyAgreesWithSource: null,
      sourceProductExists: false,
      decision: 'unresolved',
    },
  };
}
