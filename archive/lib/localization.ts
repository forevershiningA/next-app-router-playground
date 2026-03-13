/**
 * Localization utilities for region-specific content
 */

export type Region = 'AU' | 'US' | 'UK';

export interface LocalizedContent {
  region: Region;
  currency: string;
  currencySymbol: string;
  unitSystem: 'metric' | 'imperial';
  dateFormat: string;
  spellings: {
    color: string;
    customise: string;
    centre: string;
    metre: string;
    honour: string;
    favourite: string;
  };
}

/**
 * Get region from mlDir
 */
export function getRegionFromMlDir(mlDir: string): Region {
  if (mlDir === 'forevershining') return 'AU';
  if (mlDir === 'bronze-plaque') return 'US';
  if (mlDir === 'headstonesdesigner') return 'US';
  return 'AU'; // default
}

/**
 * Localized content by region
 */
export const LOCALIZED_CONTENT: Record<Region, LocalizedContent> = {
  AU: {
    region: 'AU',
    currency: 'AUD',
    currencySymbol: '$',
    unitSystem: 'metric',
    dateFormat: 'DD/MM/YYYY',
    spellings: {
      color: 'colour',
      customise: 'customise',
      centre: 'centre',
      metre: 'metre',
      honour: 'honour',
      favourite: 'favourite',
    }
  },
  US: {
    region: 'US',
    currency: 'USD',
    currencySymbol: '$',
    unitSystem: 'imperial',
    dateFormat: 'MM/DD/YYYY',
    spellings: {
      color: 'color',
      customise: 'customize',
      centre: 'center',
      metre: 'meter',
      honour: 'honor',
      favourite: 'favorite',
    }
  },
  UK: {
    region: 'UK',
    currency: 'GBP',
    currencySymbol: '£',
    unitSystem: 'metric',
    dateFormat: 'DD/MM/YYYY',
    spellings: {
      color: 'colour',
      customise: 'customise',
      centre: 'centre',
      metre: 'metre',
      honour: 'honour',
      favourite: 'favourite',
    }
  }
};

/**
 * Convert mm to inches
 */
export function mmToInches(mm: number): number {
  return Math.round((mm / 25.4) * 10) / 10;
}

/**
 * Format dimension based on region
 */
export function formatDimension(mm: number, region: Region): string {
  const content = LOCALIZED_CONTENT[region];
  if (content.unitSystem === 'metric') {
    return `${mm}mm`;
  } else {
    const inches = mmToInches(mm);
    return `${inches}"`;
  }
}

/**
 * Format dimensions range
 */
export function formatDimensionRange(
  minMm: number, 
  maxMm: number, 
  region: Region
): string {
  const content = LOCALIZED_CONTENT[region];
  if (content.unitSystem === 'metric') {
    return `${minMm}mm to ${maxMm}mm`;
  } else {
    return `${mmToInches(minMm)}" to ${mmToInches(maxMm)}"`;
  }
}

/**
 * Format price
 */
export function formatPrice(amount: number, region: Region): string {
  const content = LOCALIZED_CONTENT[region];
  return `${content.currencySymbol}${amount.toFixed(2)} ${content.currency}`;
}

/**
 * Get shipping information by region
 */
export function getShippingInfo(region: Region, productType: 'headstone' | 'plaque' | 'monument'): string {
  if (region === 'AU') {
    if (productType === 'headstone' || productType === 'monument') {
      return 'Delivery included to mainland Australia. Products over 25kg delivered to shipping depot for collection.';
    }
    return 'Delivery included to mainland Australia.';
  } else if (region === 'US') {
    return 'Delivery included within the continental United States.';
  } else {
    return 'Delivery included to mainland UK addresses.';
  }
}

/**
 * Get cemetery compliance title by region
 */
export function getCemeteryComplianceTitle(region: Region): string {
  if (region === 'AU') return 'Australian Cemetery Compliance';
  if (region === 'US') return 'United States Cemetery Compliance';
  return 'UK Cemetery Compliance';
}

/**
 * Get lead time text by region and material
 */
export function getLeadTime(region: Region, isLaser: boolean, isBronze: boolean): string {
  const weeks = isBronze ? '6-8 weeks' : isLaser ? '2-3 weeks' : '8-15 weeks';
  const express = isLaser ? ', with express 1-week service available' : '';
  return `Standard production time is ${weeks}${express}.`;
}
