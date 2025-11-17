'use client';

import { useEffect, useState, Suspense, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSavedDesign, convertSavedDesignToDYO } from '#/components/SavedDesignLoader';
import { loadSavedDesignIntoEditor } from '#/lib/saved-design-loader-utils';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { calculateMotifPrice } from '#/lib/motif-pricing';
import { data } from '#/app/_internal/_data';
import { ChevronRightIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { getProductFromId } from '#/lib/product-utils';
import type { SavedDesignMetadata, DesignCategory } from '#/lib/saved-designs-data';
import React from 'react';
import { MotifsData } from '#/motifs_data';
import DesignSidebar from '#/components/DesignSidebar';
import DesignContentBlock from '#/components/DesignContentBlock';
import { analyzeImageForCrop, type CropBounds } from '#/lib/screenshot-crop';

// Helper function to detect motif category from motif src
function detectMotifCategory(motifSrc: string): string | null {
  for (const category of MotifsData) {
    const files = category.files.split(',');
    if (files.includes(motifSrc)) {
      return category.name.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '');
    }
  }
  return null;
}

// Helper function to get motif path with fallback for spaces
function getMotifPath(motif: any): string {
  const baseSrc = motif.src || motif.name || motif.label || 'motif';
  // If the src contains spaces, remove them (proactive fix for file naming inconsistencies)
  const cleanSrc = baseSrc.replace(/\s+/g, '');
  return `/shapes/motifs/${cleanSrc}.svg`;
}

// Helper function to get fallback motif path (original with spaces - kept for backwards compatibility)
function getFallbackMotifPath(motif: any): string {
  const baseSrc = motif.src || motif.name || motif.label || 'motif';
  return `/shapes/motifs/${baseSrc}.svg`;
}

// Helper function to get predominant motif category from design
function getPredominantMotifCategory(designData: any[]): string | null {
  if (!designData) return null;
  
  const motifs = designData.filter((item: any) => item.type === 'Motif');
  if (motifs.length === 0) return null;
  
  // Count motifs by category
  const categoryCounts: Record<string, number> = {};
  
  for (const motif of motifs) {
    const src = motif.src;
    if (src) {
      const category = detectMotifCategory(src);
      if (category) {
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      }
    }
  }
  
  // Find the category with most motifs
  let maxCount = 0;
  let predominantCategory: string | null = null;
  
  for (const [category, count] of Object.entries(categoryCounts)) {
    if (count > maxCount) {
      maxCount = count;
      predominantCategory = category;
    }
  }
  
  return predominantCategory;
}

interface DesignPageClientProps {
  productSlug: string;  // e.g., 'bronze-plaque'
  category: string;     // e.g., 'memorial', 'in-loving-memory'
  slug: string;         // e.g., '1724060510093_memorial-with-motifs'
  designId: string;
  design: SavedDesignMetadata;
}

// Draggable component for inscriptions and motifs
function DraggableElement({ 
  children, 
  initialStyle,
  onPositionChange 
}: { 
  children: React.ReactNode; 
  initialStyle: React.CSSProperties;
  onPositionChange?: (x: number, y: number) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    e.preventDefault();
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    setPosition({ x: newX, y: newY });
    onPositionChange?.(newX, newY);
  }, [isDragging, dragStart, onPositionChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={elementRef}
      onMouseDown={handleMouseDown}
      style={{
        ...initialStyle,
        transform: `${initialStyle.transform || ''} translate(${position.x}px, ${position.y}px)`,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
      }}
    >
      {children}
    </div>
  );
}

export default function DesignPageClient({
  productSlug,
  category,
  slug,
  designId,
  design: designMetadata
}: DesignPageClientProps) {
  const router = useRouter();
  const [loadingIntoEditor, setLoadingIntoEditor] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true); // Always show preview, no editor
  const [motifDimensions, setMotifDimensions] = useState<Record<string, { width: number; height: number }>>({}); // Always show preview, no editor
  const loadAttempted = useRef(false);
  const setActivePanel = useHeadstoneStore((s) => s.setActivePanel);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [screenshotDimensions, setScreenshotDimensions] = useState<{ width: number; height: number } | null>(null);
  const [cropBounds, setCropBounds] = useState<CropBounds | null>(null);

  const { design: designData, loading } = useSavedDesign(designId, designMetadata.mlDir);
  
  // Analyze screenshot for white space and calculate crop bounds
  useEffect(() => {
    if (designMetadata.preview) {
      // Increased threshold to 50% to reduce false positives
      analyzeImageForCrop(designMetadata.preview, 50)
        .then(bounds => {
          setCropBounds(bounds);
          console.log('Auto-crop analysis complete:', {
            shouldCrop: bounds.shouldCrop,
            whiteSpace: bounds.whiteSpacePercentage.toFixed(2) + '%',
            original: { width: bounds.width, height: bounds.height },
            cropped: { width: bounds.croppedWidth, height: bounds.croppedHeight }
          });
        })
        .catch(err => {
          console.error('Failed to analyze screenshot for cropping:', err);
        });
    }
  }, [designMetadata.preview]);
  
  // Load screenshot dimensions - divide by DPR to get logical size and apply crop
  useEffect(() => {
    if (designMetadata.preview && designData && cropBounds) {
      const img = new Image();
      img.onload = () => {
        // Get the DPR used when design was created
        const designDPR = designData.find((item: any) => item.type === 'Headstone')?.dpr || 1;
        
        console.log('📸 Screenshot loading (design 1656040658203 check):', {
          designId: designMetadata.id,
          cropBounds: {
            shouldCrop: cropBounds.shouldCrop,
            whiteSpace: cropBounds.whiteSpacePercentage.toFixed(2) + '%',
            original: { width: cropBounds.width, height: cropBounds.height },
            cropped: { width: cropBounds.croppedWidth, height: cropBounds.croppedHeight }
          },
          imageActual: { width: img.width, height: img.height },
          dpr: designDPR
        });
        
        // Screenshot is captured at physical pixels (init_width × DPR, init_height × DPR)
        // But we need to work in LOGICAL canvas coordinates (init_width, init_height)
        // Use cropped dimensions if white space > 50% (threshold increased)
        const physicalWidth = cropBounds.shouldCrop ? cropBounds.croppedWidth : img.width;
        const physicalHeight = cropBounds.shouldCrop ? cropBounds.croppedHeight : img.height;
        
        // Calculate the ACTUAL DPR from the screenshot
        // (the screenshot might not match init_width × dpr due to browser constraints)
        const headstoneData = designData.find((item: any) => item.type === 'Headstone');
        const initWidth = headstoneData?.init_width || 707;
        const initHeight = headstoneData?.init_height || 476;
        
        // Calculate effective DPR from actual screenshot size
        const effectiveDPR = physicalWidth / initWidth;
        
        console.log('Screenshot dimensions (with DPR analysis):', {
          original: { width: img.width, height: img.height },
          cropped: cropBounds.shouldCrop ? { width: cropBounds.croppedWidth, height: cropBounds.croppedHeight } : 'not needed',
          physical: { width: physicalWidth, height: physicalHeight },
          canvas: { width: initWidth, height: initHeight },
          dpr: { 
            fromJSON: designDPR,
            calculated: effectiveDPR.toFixed(4),
            note: 'Using calculated DPR from actual screenshot size'
          }
        });
        
        // Store the canvas dimensions (logical space for coordinate system)
        setScreenshotDimensions({ width: initWidth, height: initHeight });
      };
      img.src = designMetadata.preview;
    }
  }, [designMetadata.preview, designData, cropBounds]);
  
  // Load name databases for accurate name detection
  const [nameDatabase, setNameDatabase] = useState<{
    firstNames: Set<string>;
    surnames: Set<string>;
    femaleNames?: string[];
    maleNames?: string[];
  } | null>(null);

  useEffect(() => {
    // Load name databases
    Promise.all([
      fetch('/json/firstnames_f.json').then(r => r.json()),
      fetch('/json/firstnames_m.json').then(r => r.json()),
      fetch('/json/surnames.json').then(r => r.json()),
    ]).then(([femaleNames, maleNames, surnames]) => {
      // Combine and convert to Sets for fast lookup (case-insensitive)
      const firstNames = new Set([
        ...femaleNames.map((n: string) => n.toUpperCase()),
        ...maleNames.map((n: string) => n.toUpperCase()),
      ]);
      const surnameSet = new Set(surnames.map((n: string) => n.toUpperCase()));
      
      setNameDatabase({ 
        firstNames, 
        surnames: surnameSet,
        // Store separate arrays for gender-specific selection
        femaleNames: femaleNames,
        maleNames: maleNames,
        firstNamesArray: [...femaleNames, ...maleNames],
        surnamesArray: surnames,
      } as any);
    }).catch(err => {
      console.error('Failed to load name databases:', err);
    });
  }, []);
  
  // Determine if category is female, male, or neutral
  const getGenderFromCategory = useCallback((categoryName: string): 'female' | 'male' | 'neutral' => {
    const lower = categoryName.toLowerCase();
    
    // Female categories
    if (lower.includes('mother') || lower.includes('daughter') || lower.includes('wife') || 
        lower.includes('sister') || lower.includes('grandmother') || lower.includes('nanna') ||
        lower.includes('grandma') || lower.includes('aunt') || lower.includes('woman') ||
        lower.includes('lady') || lower.includes('girl')) {
      return 'female';
    }
    
    // Male categories
    if (lower.includes('father') || lower.includes('son') || lower.includes('husband') || 
        lower.includes('brother') || lower.includes('grandfather') || lower.includes('papa') ||
        lower.includes('grandpa') || lower.includes('uncle') || lower.includes('man') ||
        lower.includes('gentleman') || lower.includes('boy') || lower.includes('dad')) {
      return 'male';
    }
    
    return 'neutral';
  }, []);
  
  // Simple hash function to convert string to number for consistent randomization
  const hashString = useCallback((str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }, []);

  // Generate a random name based on a seed and category gender (for consistent results)
  const getRandomName = useCallback((seed?: string): string => {
    if (!nameDatabase || !(nameDatabase as any).firstNamesArray || !(nameDatabase as any).surnamesArray) {
      return 'Name';
    }

    const gender = getGenderFromCategory(category);
    const femaleNames = (nameDatabase as any).femaleNames || [];
    const maleNames = (nameDatabase as any).maleNames || [];
    const surnamesArray = (nameDatabase as any).surnamesArray;
    
    // Choose appropriate name list based on category gender
    let firstNamesArray;
    if (gender === 'female' && femaleNames.length > 0) {
      firstNamesArray = femaleNames;
    } else if (gender === 'male' && maleNames.length > 0) {
      firstNamesArray = maleNames;
    } else {
      // Neutral or fallback - use combined list
      firstNamesArray = (nameDatabase as any).firstNamesArray;
    }
    
    // Use seed to get consistent "random" values
    const seedValue = seed ? hashString(seed) : Math.floor(Math.random() * 10000);
    const randomFirstName = firstNamesArray[seedValue % firstNamesArray.length];
    const randomSurname = surnamesArray[(seedValue + 1) % surnamesArray.length];
    
    return `${randomFirstName} ${randomSurname}`;
  }, [nameDatabase, hashString, category, getGenderFromCategory]);
  
  // Get a random surname based on a seed (for consistent results)
  const getRandomSurname = useCallback((seed?: string): string => {
    if (!nameDatabase || !(nameDatabase as any).surnamesArray) {
      return 'Surname';
    }

    const surnamesArray = (nameDatabase as any).surnamesArray;
    const seedValue = seed ? hashString(seed) : Math.floor(Math.random() * 10000);
    return surnamesArray[seedValue % surnamesArray.length];
  }, [nameDatabase, hashString]);
  
  // Get a random first name based on a seed (for consistent results)
  const getRandomFirstName = useCallback((seed?: string): string => {
    if (!nameDatabase || !(nameDatabase as any).firstNamesArray) {
      return 'Name';
    }

    const firstNamesArray = (nameDatabase as any).firstNamesArray;
    
    // Get gender from category for appropriate name selection
    const gender = getGenderFromCategory(category);
    
    // Filter by gender if available
    let filteredNames = firstNamesArray;
    if (nameDatabase.firstNames && gender !== 'neutral') {
      // Get names for specific gender
      filteredNames = firstNamesArray.filter((name: string) => {
        const nameUpper = name.toUpperCase();
        const nameData = (nameDatabase as any).firstNamesData?.[nameUpper];
        if (!nameData) return true; // Include if no gender data
        return nameData.gender === gender || nameData.gender === 'neutral';
      });
      
      // Fallback to all names if no gender-specific names found
      if (filteredNames.length === 0) {
        filteredNames = firstNamesArray;
      }
    }
    
    const seedValue = seed ? hashString(seed) : Math.floor(Math.random() * 10000);
    return filteredNames[seedValue % filteredNames.length];
  }, [nameDatabase, hashString, category, getGenderFromCategory]);
  
  // Extract generic name from slug (e.g., "1752154675017_son-memorial" -> "Son Memorial")
  const genericName = useMemo(() => {
    if (!slug) return 'Name';
    // Remove timestamp prefix and convert to title case
    const parts = slug.split('_');
    if (parts.length > 1) {
      // Remove the timestamp part (first part)
      const namePart = parts.slice(1).join(' ');
      // Convert to title case
      return namePart.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    }
    return 'Name';
  }, [slug]);

  // Function to sanitize inscription text - replace likely names with generic version
  const sanitizeInscription = useCallback((text: string): string => {
    // Don't sanitize common phrases (exact matches or containing these patterns)
    const commonPhrases = [
      'IN LOVING MEMORY',
      'OF',
      'LOVING',
      'SON',
      'DAUGHTER',
      'BROTHER',
      'SISTER',
      'MOTHER',
      'FATHER',
      'WIFE',
      'HUSBAND',
      'FOREVER',
      'REST IN PEACE',
      'RIP',
      'R.I.P',
      'R.I.P.',
      'BELOVED',
      'CHERISHED',
      'ALWAYS',
      'REMEMBERED',
    ];
    
    // Common memorial phrases that should never be replaced
    const memorialPhrases = [
      'WILL ALWAYS BE IN OUR HEARTS',
      'FOREVER IN OUR HEARTS',
      'ALWAYS IN OUR HEARTS',
      'IN OUR HEARTS FOREVER',
      'GONE BUT NOT FORGOTTEN',
      'FOREVER LOVED',
      'ALWAYS LOVED',
      'DEARLY LOVED',
      'FOREVER MISSED',
      'DEEPLY MISSED',
      'GREATLY MISSED',
      'YOUR LIFE WAS A BLESSING',
      'YOUR MEMORY A TREASURE',
      'SHE MADE BROKEN LOOK BEAUTIFUL',
      'UNIVERSE ON HER SHOULDERS',
      'BELOVED MOTHER',
      'BELOVED FATHER',
      'BELOVED GRANDMOTHER',
      'BELOVED GRANDFATHER',
      'BELOVED WIFE',
      'BELOVED HUSBAND',
      'LOVING MOTHER',
      'LOVING FATHER',
      'DEVOTED MOTHER',
      'DEVOTED FATHER',
      'A LIFE LIVED WITH PASSION',
      'A LOVE THAT NEVER FADED',
      'A LIFE LIVED WITH PASSION, A LOVE THAT NEVER FADED',
    ];
    
    const upperText = text.toUpperCase().trim();
    const upperTextNoPunctuation = upperText.replace(/[.,!?;:'"]/g, '');
    
    // Check if this is an exact match to a memorial phrase
    if (memorialPhrases.some(phrase => upperText === phrase || upperText.includes(phrase))) {
      return text;
    }
    
    // Check if this is an exact match to a common phrase (with or without punctuation)
    if (commonPhrases.includes(upperText) || commonPhrases.includes(upperTextNoPunctuation)) {
      return text;
    }
    
    // Check if this is a quote (surrounded by quotes or has quote marks)
    if ((text.startsWith('"') && text.endsWith('"')) || 
        (text.startsWith("'") && text.endsWith("'")) ||
        text.includes('"FOREVER') || 
        text.includes('"#')) {
      return text;
    }
    
    // Skip relationship descriptions (these should not be replaced)
    const relationshipWords = /\b(beloved|loving|cherished|dear|dearest|devoted|precious|adored|treasured|father|mother|son|daughter|brother|sister|grandfather|grandmother|uncle|aunt|wife|husband|grandson|granddaughter|great-grandfather|great-grandmother|friend)\b/i;
    if (relationshipWords.test(text.toLowerCase())) {
      // But also check if it ends with "to" or "of" (relationship descriptions like "Father to" or "Mother of")
      if (/\b(to|of)\s*$/i.test(text)) {
        return text; // Keep relationship descriptions as-is
      }
    }
    
    // Check if this is a date pattern WITHOUT names
    // First check if text contains dates
    const hasDatePattern = /\d{1,2}[,\/\-\s]+\d{1,4}/.test(text) || 
        /(?:JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)/i.test(text) ||
        /\d{4}\s*-\s*\d{4}/.test(text) ||
        /\d{2}\/\d{2}\/\d{4}/.test(text);
    
    // If it has a date pattern, check if it's ONLY dates (no names)
    if (hasDatePattern) {
      // Remove all date-related content and see if there's anything left that could be a name
      const textWithoutDates = text
        .replace(/\d{4}\s*-\s*\d{4}/g, '') // Remove year ranges like "1916 - 1996"
        .replace(/\d{1,2}[,\/\-\s]+\d{1,4}/g, '') // Remove dates like "23, 1936" or "12/25/2000"
        .replace(/\d{2}\/\d{2}\/\d{4}/g, '') // Remove full dates
        .replace(/(?:JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)/gi, '') // Remove month names
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim();
      
      // If nothing or very little remains, it's just dates
      if (textWithoutDates.length === 0 || textWithoutDates === '-') {
        return text;
      }
    }
    
    // Split into words for analysis
    const words = text.split(/\s+/).filter(w => w.length > 0);
    
    // If we have name database loaded, check for names even if dates are present
    if (nameDatabase && words.length >= 1) {
      const upperWords = words.map(w => w.toUpperCase().replace(/['".,!?]/g, ''));
      
      // Check if it contains known first names or surnames
      const hasFirstName = upperWords.some(w => nameDatabase.firstNames.has(w));
      const hasSurname = upperWords.some(w => nameDatabase.surnames.has(w));
      
      // If it's ONLY a first name (single word that is a first name), replace with just a random first name
      // Even if the name exists in both first and surname databases, treat single words as first names
      if (hasFirstName && words.length === 1 && !hasDatePattern) {
        const randomFirstName = getRandomFirstName(text); // Use original text as seed
        const isAllCaps = text === text.toUpperCase();
        console.log('Single first name detected:', text, '→', randomFirstName, '(all caps:', isAllCaps, ') [hasSurname:', hasSurname, ']');
        return isAllCaps ? randomFirstName.toUpperCase() : randomFirstName;
      }
      
      // If it's ONLY a surname (single word that is a surname but NOT a first name), replace with just a random surname
      if (hasSurname && !hasFirstName && words.length === 1 && !hasDatePattern) {
        const randomSurname = getRandomSurname(text); // Use original text as seed
        const isAllCaps = text === text.toUpperCase();
        console.log('Single surname detected:', text, '→', randomSurname, '(all caps:', isAllCaps, ')');
        return isAllCaps ? randomSurname.toUpperCase() : randomSurname;
      }
      
      // If we find both first name and surname (with or without dates)
      if ((hasFirstName && hasSurname) || (hasFirstName && words.length >= 2)) {
        console.log('Full name or multi-word detected:', text, 'hasFirstName:', hasFirstName, 'hasSurname:', hasSurname, 'words:', words.length);
        // Check it's not a poetic verse with sentence words
        const hasSentenceWords = /\b(the|you|me|my|your|when|feel|know|am|are|is|see|being|part|of|and|or|not|lost)\b/i.test(text);
        if (!hasSentenceWords) {
          // If text contains dates, replace name but keep dates
          if (hasDatePattern) {
            const randomName = getRandomName(text); // Use original text as seed
            const isAllCaps = text === text.toUpperCase();
            const nameToUse = isAllCaps ? randomName.toUpperCase() : randomName;
            
            // Replace the name part while keeping the date part
            // Match pattern: "Name Surname YYYY - YYYY" or similar
            const dateMatch = text.match(/(\d{4}\s*-\s*\d{4}|\d{1,2}[,\/\-\s]+\d{1,4}|\d{2}\/\d{2}\/\d{4})/);
            if (dateMatch) {
              // Keep everything from the date onwards
              const dateAndAfter = text.substring(text.indexOf(dateMatch[0]));
              return `${nameToUse} ${dateAndAfter}`;
            }
          }
          
          // Return random name in same case format as input (no dates)
          const randomName = getRandomName(text); // Use original text as seed
          const isAllCaps = text === text.toUpperCase();
          if (isAllCaps) {
            return randomName.toUpperCase();
          } else {
            return randomName;
          }
        }
      }
    }
    
    // Fallback pattern-based detection (if database not loaded yet)
    // Check for title case names (e.g., "Cameron Anthony Fyfe")
    const isTitleCaseName = words.length >= 2 && 
      words.every(word => /^[A-Z][a-z]+$/.test(word)) &&
      !words.some(word => ['The', 'When', 'You', 'Feel', 'Know', 'See', 'Being', 'Part', 'And', 'Or', 'Am', 'Are', 'Is', 'Not', 'Lost'].includes(word));
    
    if (isTitleCaseName) {
      return getRandomName(text);
    }
    
    // Check if this is a poetic/memorial verse
    const hasLowerCase = /[a-z]/.test(text);
    const isShortPhrase = words.length <= 8;
    const hasSentenceWords = /\b(the|you|me|my|your|when|feel|know|am|are|is|see|being|part|of|and|or|not|lost)\b/i.test(text);
    
    if (hasLowerCase && isShortPhrase && hasSentenceWords) {
      return text;
    }
    
    // Check if text contains ALL CAPS name patterns
    const isAllCapsOrMixedCaps = /^[A-Z\s'-]+$/.test(text) && words.length >= 2;
    const isAllCapsSingleWord = /^[A-Z'-]+$/.test(text) && words.length === 1;
    const hasApostrophe = text.includes("'") || text.includes('&apos;');
    const hasSuffix = /\b(JR\.?|SR\.?|III|II|IV)\b/i.test(text);
    
    // Single word all caps - check if it's a first name or surname
    if (isAllCapsSingleWord && !hasSentenceWords && nameDatabase) {
      const upperWord = text.toUpperCase().replace(/['".,!?]/g, '');
      const isFirstName = nameDatabase.firstNames?.has(upperWord);
      const isSurname = nameDatabase.surnames?.has(upperWord);
      
      console.log('Fallback ALL CAPS single word:', text, 'isFirstName:', isFirstName, 'isSurname:', isSurname);
      
      if (isFirstName && !isSurname) {
        // It's a first name - return just a random first name
        const randomFirstName = getRandomFirstName(text);
        console.log('→ Returning first name only:', randomFirstName.toUpperCase());
        return randomFirstName.toUpperCase();
      } else {
        // It's a surname or unknown - return surname
        const randomSurname = getRandomSurname(text);
        console.log('→ Returning surname only:', randomSurname.toUpperCase());
        return randomSurname.toUpperCase();
      }
    }
    
    if ((isAllCapsOrMixedCaps || hasSuffix) && !hasSentenceWords) {
      return getRandomName(text).toUpperCase();
    }
    
    return text;
  }, [nameDatabase, getRandomName, getRandomSurname, getRandomFirstName]);
  
  // Extract shape name and map to SVG file
  const shapeName = useMemo(() => {
    if (!designData) return null;
    const shapeItem = designData.find((item: any) => item.shape);
    return shapeItem?.shape;
  }, [designData]);

  // Extract shape, texture, and motif data from designData
  const shapeData = useMemo(() => {
    if (!designData) return null;
    const shapeItem = designData.find((item: any) => item.type === 'HeadStone' || item.type === 'Headstone');
    return shapeItem;
  }, [designData]);

  // Pre-process design data to sanitize all inscriptions
  const sanitizedDesignData = useMemo(() => {
    if (!designData || !nameDatabase) return designData;
    
    return designData.map((item: any) => {
      if (item.type === 'Inscription' && item.label) {
        return {
          ...item,
          label: sanitizeInscription(item.label),
        };
      }
      return item;
    });
  }, [designData, nameDatabase, sanitizeInscription]);

  // Map shape name to SVG filename
  const shapeImagePath = useMemo(() => {
    if (!shapeName || !shapeData) return null;
    
    // Check if this is a landscape orientation (width > height)
    const isLandscape = (shapeData.width || 0) > (shapeData.height || 0);
    
    // Map shape names to their SVG files - direct mapping
    const shapeMap: Record<string, string> = {
      'Cropped Peak': 'cropped_peak.svg',
      'Curved Gable': 'curved_gable.svg',
      'Curved Peak': 'curved_peak.svg',
      'Curved Top': 'curved_top.svg',
      'Half Round': 'half_round.svg',
      'Gable': 'gable.svg',
      'Left Wave': 'left_wave.svg',
      'Peak': 'peak.svg',
      'Right Wave': 'right_wave.svg',
      'Serpentine': isLandscape ? 'serpentine_landscape.svg' : 'serpentine.svg',
      'Square': 'square.svg',
      'Rectangle': 'square.svg',  // Use square.svg for Rectangle too (clean coordinates)
      // Guitar shapes
      'Guitar 1': 'headstone_3.svg',
      'Guitar 2': 'headstone_4.svg',
      'Guitar 3': 'headstone_5.svg',
      'Guitar 4': 'headstone_6.svg',
      'Guitar 5': 'headstone_7.svg',
    };
    
    // Check if it's in the map
    if (shapeMap[shapeName]) {
      return `/shapes/headstones/${shapeMap[shapeName]}`;
    }
    
    // For numbered headstones (e.g., "Headstone 27"), extract the number and map directly
    const match = shapeName.match(/^Headstone (\d+)$/);
    if (match) {
      const number = match[1];
      return `/shapes/headstones/headstone_${number}.svg`;
    }
    
    return null;
  }, [shapeName, shapeData]);

  // FIX #2: Helper function to convert legacy saved coordinates back to canvas space
  const toCanvasCoordsLegacy = useCallback((xSaved: number, ySaved: number, legacyScale: number) => {
    // Legacy scale == old ratio_height used for both x and y
    return { x: xSaved / legacyScale, y: ySaved / legacyScale };
  }, []);

  // FIX #7: Auto-detect legacy vs axis-correct coordinates for X
  const inferCanvasX = useCallback((
    savedX: number,
    ratioW: number,
    ratioH: number,
    canvasW: number,
    marginPx = 8
  ) => {
    // Two candidates: old bug (÷ratioH) vs correct (÷ratioW)
    const xBug = savedX / ratioH;   // legacy
    const xFixed = savedX / ratioW; // axis-correct

    const halfW = canvasW / 2;
    const inside = (x: number) => Math.abs(x) <= halfW + marginPx;

    const insideBug = inside(xBug);
    const insideFixed = inside(xFixed);

    // If both are valid, pick the one with more horizontal spread (closer to edges)
    if (insideBug && insideFixed) {
      return Math.abs(xFixed) > Math.abs(xBug) ? xFixed : xBug;
    }
    // If only one is valid, use it
    if (insideFixed) return xFixed;
    if (insideBug) return xBug;

    // Fallback: clamp axis-correct
    return Math.max(-halfW, Math.min(halfW, xFixed));
  }, []);

  // Calculate scaling factors for positioning inscriptions
  const scalingFactors = useMemo(() => {
    if (!shapeData || !cropBounds || !screenshotDimensions) return { 
      scaleX: 1, scaleY: 1, displayWidth: 800, displayHeight: 800, 
      offsetX: 0, offsetY: 0, upscaleFactor: 1, containerScalingMultiplier: 1, 
      ratioWidth: 1, ratioHeight: 1, legacyScale: 1, 
      canvasCropLeft: 0, canvasCropTop: 0, designDpr: 1 
    };
    
    // FIX #1: Canvas logical size (where x,y were authored)
    const initW = screenshotDimensions.width;   // e.g., 707
    const initH = screenshotDimensions.height;  // e.g., 476
    
    const designDevice = shapeData.device || 'desktop';
    const isDesktopDesign = designDevice === 'desktop';
    
    // Actual screenshot physical dimensions
    const physicalWidth = cropBounds.shouldCrop ? cropBounds.croppedWidth : cropBounds.width;
    const physicalHeight = cropBounds.shouldCrop ? cropBounds.croppedHeight : cropBounds.height;
    
    // DPR from design (for normalizing legacy data only)
    const designDpr = shapeData.dpr || 1;
    
    // Calculate effective DPR from screenshot
    const effectiveDpr = cropBounds.width / initW;
    
    // Mobile upscaling: Scale up mobile designs by 2x for better desktop viewing
    const upscaleFactor = (!isDesktopDesign && physicalWidth / initW > 1) ? 2 : 1;
    
    // Display size = physical screenshot size × upscale factor
    let displayWidth = physicalWidth * upscaleFactor;
    let displayHeight = physicalHeight * upscaleFactor;
    
    // FIX #1: Layout ratios - pure CSS-pixel scaling, NO DPR HERE
    let ratio_width = displayWidth / initW;
    let ratio_height = displayHeight / initH;
    
    // Fit control if needed (uniform scaling)
    const fitMode = shapeData.fit || "stretch";
    if (fitMode === 'contain') {
      const s = Math.min(ratio_width, ratio_height);
      ratio_width = ratio_height = s;
    } else if (fitMode === 'cover') {
      const s = Math.max(ratio_width, ratio_height);
      ratio_width = ratio_height = s;
    }
    
    // FIX #2: Legacy scale for old saved coordinates
    // Old logic multiplied both x and y by ratio_height
    const legacyScale = ratio_height;
    
    // FIX #3: Crop offset in canvas units
    const canvasCropLeft = cropBounds.shouldCrop ? (cropBounds.left / effectiveDpr) : 0;
    const canvasCropTop = cropBounds.shouldCrop ? (cropBounds.top / effectiveDpr) : 0;
    
    // Calculate base width if present (in mm, need to scale to display)
    // Find base item from designData
    let baseDisplayWidth = 0;
    if (designData) {
      const baseItem = designData.find((item: any) => item.type === 'Base');
      if (baseItem && baseItem.width && shapeData.width) {
        baseDisplayWidth = (baseItem.width / shapeData.width) * displayWidth;
      }
    }
    
    // Find the maximum width between headstone and base
    const maxWidth = Math.max(displayWidth, baseDisplayWidth);
    
    // Define container width limit (90% of viewport, max 1080px)
    const containerMaxWidth = Math.min(typeof window !== 'undefined' ? window.innerWidth * 0.9 : 1080, 1080);
    
    // If max width exceeds container, scale everything down proportionally
    let containerScalingMultiplier = 1;
    if (maxWidth > containerMaxWidth) {
      containerScalingMultiplier = containerMaxWidth / maxWidth;
      displayWidth *= containerScalingMultiplier;
      displayHeight *= containerScalingMultiplier;
      console.log('🔽 Scaling down to fit container:', {
        originalMax: maxWidth.toFixed(2) + 'px',
        containerMax: containerMaxWidth.toFixed(2) + 'px',
        multiplier: containerScalingMultiplier.toFixed(4),
        newHeadstoneWidth: displayWidth.toFixed(2) + 'px',
        newBaseWidth: baseDisplayWidth ? (baseDisplayWidth * containerScalingMultiplier).toFixed(2) + 'px' : 'N/A'
      });
    }
    
    // Scale factors for display (pure layout ratios with upscaling/container adjustments)
    const scaleX = ratio_width * upscaleFactor * containerScalingMultiplier;
    const scaleY = ratio_height * upscaleFactor * containerScalingMultiplier;
    
    console.log('Clean ratio calculation (DPR-free layout):', {
      canvas: { width: initW, height: initH },
      physical: { width: physicalWidth, height: physicalHeight },
      display: { width: displayWidth, height: displayHeight },
      ratios: { ratio_width, ratio_height },
      scale: { scaleX, scaleY },
      legacy: { legacyScale, designDpr, effectiveDpr },
      crop: { canvasCropLeft, canvasCropTop },
      upscaleFactor,
      containerScalingMultiplier,
      fitMode
    });
    
    return { 
      scaleX, 
      scaleY, 
      displayWidth, 
      displayHeight, 
      upscaleFactor,
      offsetX: 0,  // No longer used - using canvasCropLeft/Top instead
      offsetY: 0,
      containerScalingMultiplier,
      ratioWidth: ratio_width,
      ratioHeight: ratio_height,
      legacyScale,
      canvasCropLeft,
      canvasCropTop,
      designDpr,
      initW,
      initH
    };
  }, [shapeData, screenshotDimensions, cropBounds, designData]);

  const textureData = useMemo(() => {
    if (!designData) return null;
    const textureItem = designData.find((item: any) => item.texture);
    if (!textureItem?.texture) return null;
    
    // Extract texture path from saved design (e.g., "src/granites/forever2/l/17.jpg" or "src/granites/forever2/l/White-Carrara-600-x-600.jpg")
    const savedTexturePath = textureItem.texture;
    
    // Mapping from old texture paths to new material image filenames
    const textureMapping: Record<string, string> = {
      'forever2/l/17.jpg': 'Glory-Black-1.jpg', // Glory Gold Spots
      'forever2/l/18.jpg': 'Glory-Black-2.jpg', // Glory Black
    };
    
    // Try to match the texture path with our mapping
    for (const [oldPath, newImage] of Object.entries(textureMapping)) {
      if (savedTexturePath.includes(oldPath)) {
        return `/textures/forever/l/${newImage}`;
      }
    }
    
    // Extract the granite name from the filename
    // Handles formats like: "White-Carrara-600-x-600.jpg", "G633-TILE-900-X-900.jpg", "G633.jpg"
    const match = savedTexturePath.match(/\/([A-Z][A-Za-z0-9-]+?)(?:-TILE)?-\d+-[xX]-\d+\.jpg$/i);
    if (match && match[1]) {
      const graniteName = match[1];
      // Map to our texture system: /textures/forever/l/White-Carrara.jpg
      return `/textures/forever/l/${graniteName}.jpg`;
    }
    
    // Fallback: try to extract any filename and use it
    const filename = savedTexturePath.split('/').pop();
    if (filename) {
      // Remove -TILE-900-X-900 or -600-x-600 suffix if present
      const cleanFilename = filename.replace(/(-TILE)?-\d+-[xX]-\d+/i, '');
      return `/textures/forever/l/${cleanFilename}`;
    }
    
    return savedTexturePath;
  }, [designData]);

  // Load and process SVG with texture
  useEffect(() => {
    console.log('🔍 SVG useEffect check:', {
      shapeImagePath: !!shapeImagePath,
      textureData: !!textureData,
      shapeData: !!shapeData,
      screenshotDimensions: !!screenshotDimensions,
      cropBounds: !!cropBounds,
      values: {
        shapeImagePath,
        textureData,
        screenshotDimensions,
        cropBounds: cropBounds ? { width: cropBounds.width, height: cropBounds.height, shouldCrop: cropBounds.shouldCrop } : null
      }
    });
    
    if (!shapeImagePath || !textureData || !shapeData || !screenshotDimensions || !cropBounds) {
      console.log('❌ SVG generation skipped - missing dependencies');
      setSvgContent(null);
      return;
    }
    
    console.log('✅ All dependencies available, fetching SVG from:', shapeImagePath);
    
    fetch(shapeImagePath)
      .then(res => {
        console.log('📥 SVG fetch response:', res.status, res.ok);
        return res.text();
      })
      .then(svgText => {
        console.log('📄 SVG text received, length:', svgText.length);
        // Parse SVG and inject texture pattern
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, 'image/svg+xml');
        const svg = doc.querySelector('svg');
        
        console.log('🔍 SVG element found:', !!svg);
        
        if (svg) {
          // Check if this is a fixed-proportion shape (Guitar or Headstone)
          const isFixedProportionShape = shapeName && (
            shapeName.toLowerCase().includes('guitar') || 
            shapeName.toLowerCase().includes('headstone')
          );
          
          const designDPR = shapeData.dpr || 1;
          const designDevice = shapeData.device || 'desktop';
          const isDesktopDesign = designDevice === 'desktop';
          
          // screenshotDimensions now holds canvas size (logical init_width/height)
          // Get physical screenshot size for display
          const canvasWidth = screenshotDimensions.width;
          const canvasHeight = screenshotDimensions.height;
          
          // Calculate physical size from canvas and actual DPR
          const headstoneData = designData?.find((item: any) => item.type === 'Headstone');
          const physicalWidth = cropBounds.shouldCrop ? cropBounds.croppedWidth : cropBounds.width;
          const physicalHeight = cropBounds.shouldCrop ? cropBounds.croppedHeight : cropBounds.height;
          
          // Display dimensions: scale physical by upscale factor
          const upscaleFactor = (!isDesktopDesign && designDPR > 1) ? 2 : 1;
          const displayWidth = physicalWidth * upscaleFactor;
          const displayHeight = physicalHeight * upscaleFactor;
          
          console.log('SVG Processing:', {
            canvas: { width: canvasWidth, height: canvasHeight },
            physical: { width: physicalWidth, height: physicalHeight },
            display: { width: displayWidth, height: displayHeight },
            upscaleFactor,
            dpr: designDPR
          });
          
          // Get original viewBox to calculate scale
          const viewBoxAttr = svg.getAttribute('viewBox');
          let originalWidth = 400;
          let originalHeight = 400;
          
          if (viewBoxAttr) {
            const viewBoxParts = viewBoxAttr.split(' ');
            if (viewBoxParts.length >= 4) {
              originalWidth = parseFloat(viewBoxParts[2]);
              originalHeight = parseFloat(viewBoxParts[3]);
            }
          }
          
          // Calculate scale factors from original SVG to canvas size
          // For fixed-proportion shapes, use uniform scaling
          let scaleX, scaleY;
          if (isFixedProportionShape) {
            // Use the same scale for both X and Y to maintain proportions
            const uniformScale = Math.min(canvasWidth / originalWidth, canvasHeight / originalHeight);
            scaleX = uniformScale;
            scaleY = uniformScale;
          } else {
            // For flexible shapes like Serpentine, allow independent X/Y scaling
            scaleX = canvasWidth / originalWidth;
            scaleY = canvasHeight / originalHeight;
          }
          
          // Update viewBox to canvas dimensions (for coordinate system)
          // Set width/height to 100% to fill parent container
          svg.setAttribute('viewBox', `0 0 ${canvasWidth} ${canvasHeight}`);
          svg.setAttribute('width', '100%');
          svg.setAttribute('height', '100%');
          svg.setAttribute('preserveAspectRatio', 'none'); // Allow SVG to stretch to fill container
          
          // Scale all path data and apply texture
          const paths = svg.querySelectorAll('path');
          paths.forEach(path => {
            const d = path.getAttribute('d');
            if (d) {
              // Scale path coordinates
              const scaledPath = d.replace(/([0-9.]+)/g, (match) => {
                const num = parseFloat(match);
                // Determine if this is an X or Y coordinate based on position
                // This is a simple heuristic - alternate between X and Y
                const index = d.indexOf(match);
                const beforeMatch = d.substring(0, index);
                const numCount = (beforeMatch.match(/[0-9.]+/g) || []).length;
                const isX = numCount % 2 === 0;
                return (num * (isX ? scaleX : scaleY)).toString();
              });
              path.setAttribute('d', scaledPath);
            }
            // Apply texture
            path.setAttribute('fill', 'url(#graniteTexture)');
            path.removeAttribute('filter'); // Remove drop shadows
          });
          
          // Remove any existing filter/drop-shadow
          const filterEls = svg.querySelectorAll('filter');
          filterEls.forEach(el => el.remove());
          svg.removeAttribute('filter');
          
          // Create defs if not exists
          let defs = svg.querySelector('defs');
          if (!defs) {
            defs = doc.createElementNS('http://www.w3.org/2000/svg', 'defs');
            svg.insertBefore(defs, svg.firstChild);
          }
          
          // Create texture pattern
          const pattern = doc.createElementNS('http://www.w3.org/2000/svg', 'pattern');
          pattern.setAttribute('id', 'graniteTexture');
          pattern.setAttribute('patternUnits', 'userSpaceOnUse');
          pattern.setAttribute('width', '520');
          pattern.setAttribute('height', '520');
          
          const image = doc.createElementNS('http://www.w3.org/2000/svg', 'image');
          image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', textureData);
          image.setAttribute('x', '0');
          image.setAttribute('y', '0');
          image.setAttribute('width', '520');
          image.setAttribute('height', '520');
          
          pattern.appendChild(image);
          defs.appendChild(pattern);
          
          // Serialize back to string
          const serializer = new XMLSerializer();
          const processedSvg = serializer.serializeToString(svg);
          console.log('✅ SVG processed successfully, length:', processedSvg.length);
          setSvgContent(processedSvg);
        } else {
          console.log('❌ No SVG element found in parsed document');
        }
      })
      .catch(err => {
        console.error('❌ Failed to load SVG:', err);
        setSvgContent(null);
      });
  }, [shapeImagePath, textureData, shapeData, screenshotDimensions, cropBounds]);

  const motifData = useMemo(() => {
    if (!designData) return [];
    const motifs = designData.filter((item: any) => item.type === 'Motif');
    console.log('Total motifs in design data:', motifs.length, motifs.map(m => ({ src: m.src, name: m.name })));
    return motifs;
  }, [designData]);

  // Adjust motif positions to avoid overlapping with inscriptions
  const adjustedMotifData = useMemo(() => {
    if (!motifData.length || !sanitizedDesignData || !scalingFactors) return motifData;

    const inscriptions = sanitizedDesignData.filter((item: any) => item.type === 'Inscription' && item.label && item.part !== 'Base');
    if (!inscriptions.length) return motifData;

    // Helper function to check if two rectangles overlap
    const checkOverlap = (rect1: any, rect2: any): boolean => {
      return !(
        rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom
      );
    };

    // Helper function to get bounding box
    const getBoundingBox = (item: any, isInscription: boolean = false) => {
      const x = (item.x || 0) * scalingFactors.scaleX;
      const y = (item.y || 0) * scalingFactors.scaleY;
      const width = isInscription 
        ? (item.label ? item.label.length * (item.font_size || 16) * 0.6 * scalingFactors.scaleX : 100)
        : (item.width ? item.width * scalingFactors.scaleX : 80);
      const height = isInscription 
        ? ((item.font_size || 16) * scalingFactors.scaleY * 1.2)
        : (item.height ? item.height * scalingFactors.scaleY : 80);

      return {
        left: x - width / 2,
        right: x + width / 2,
        top: y - height / 2,
        bottom: y + height / 2,
        centerX: x,
        centerY: y,
        width,
        height
      };
    };

    // Process each motif and adjust if overlapping
    return motifData.map((motif: any) => {
      const motifBox = getBoundingBox(motif, false);
      
      // Check against all inscriptions
      for (const inscription of inscriptions) {
        const inscriptionBox = getBoundingBox(inscription, true);
        
        if (checkOverlap(motifBox, inscriptionBox)) {
          // Overlap detected - move motif away from inscription
          const motifCenterX = motifBox.centerX;
          const inscriptionCenterX = inscriptionBox.centerX;
          
          // Determine which direction to move the motif
          const moveLeft = motifCenterX < inscriptionCenterX;
          
          // Calculate how much to move to clear the overlap
          const horizontalOverlap = moveLeft
            ? (motifBox.right - inscriptionBox.left)
            : (inscriptionBox.right - motifBox.left);
          
          // Add extra spacing (20px buffer)
          const moveDistance = horizontalOverlap + 20;
          
          // Adjust motif position
          const newX = moveLeft
            ? (motif.x || 0) - (moveDistance / scalingFactors.scaleX)
            : (motif.x || 0) + (moveDistance / scalingFactors.scaleX);
          
          console.log(`Adjusting motif "${motif.name}" to avoid overlap with inscription "${inscription.label}"`);
          console.log(`Moving ${moveLeft ? 'left' : 'right'} by ${moveDistance}px`);
          
          return {
            ...motif,
            x: newX,
            adjustedForOverlap: true
          };
        }
      }
      
      return motif;
    });
  }, [motifData, sanitizedDesignData, scalingFactors]);


  // Load SVG dimensions for accurate motif sizing
  useEffect(() => {
    if (!motifData || motifData.length === 0) return;

    motifData.forEach((motif: any) => {
      const motifSrc = motif.src || motif.name;
      if (!motifSrc || motifDimensions[motifSrc]) return;

      const img = new Image();
      const motifPath = getMotifPath(motif);
      
      img.onload = () => {
        console.log('SVG dimensions loaded for', motifSrc, ':', img.width, 'x', img.height);
        setMotifDimensions(prev => ({
          ...prev,
          [motifSrc]: { width: img.width, height: img.height }
        }));
      };
      
      img.onerror = () => {
        const fallbackPath = getFallbackMotifPath(motif);
        const img2 = new Image();
        img2.onload = () => {
          console.log('SVG dimensions loaded (fallback) for', motifSrc, ':', img2.width, 'x', img2.height);
          setMotifDimensions(prev => ({
            ...prev,
            [motifSrc]: { width: img2.width, height: img2.height }
          }));
        };
        img2.src = fallbackPath;
      };
      
      img.src = motifPath;
    });
  }, [motifData]);

  // Extract base data if present
  const baseData = useMemo(() => {
    if (!designData) return null;
    const baseItem = designData.find((item: any) => item.type === 'Base');
    console.log('🔍 Base detection:', {
      designId: designMetadata?.id,
      hasDesignData: !!designData,
      designDataLength: designData?.length,
      baseItem: baseItem ? {
        type: baseItem.type,
        width: baseItem.width,
        height: baseItem.height,
        shape: baseItem.shape,
        name: baseItem.name
      } : null,
      allTypes: designData?.map((item: any) => item.type).join(', ')
    });
    return baseItem;
  }, [designData, designMetadata]);
  
  // Get base texture from baseData
  const baseTextureData = useMemo(() => {
    if (!baseData?.texture) return null;
    
    const savedTexturePath = baseData.texture;
    
    // Mapping from old texture paths to new material image filenames
    const textureMapping: Record<string, string> = {
      'forever2/l/17.jpg': 'Glory-Black-1.jpg', // Glory Gold Spots
      'forever2/l/18.jpg': 'Glory-Black-2.jpg', // Glory Black
    };
    
    // Try to match the texture path with our mapping
    for (const [oldPath, newImage] of Object.entries(textureMapping)) {
      if (savedTexturePath.includes(oldPath)) {
        return `/textures/forever/l/${newImage}`;
      }
    }
    
    // Extract the granite name (e.g., "G633") from the filename for direct matches
    const match = savedTexturePath.match(/\/([A-Z0-9]+)(?:-TILE)?-\d+-X-\d+\.jpg/i);
    if (match && match[1]) {
      const graniteName = match[1];
      return `/textures/forever/l/${graniteName}.jpg`;
    }
    
    // Fallback: try to extract any filename and use it
    const filename = savedTexturePath.split('/').pop();
    if (filename) {
      const cleanFilename = filename.replace(/-TILE-\d+-X-\d+/i, '');
      return `/textures/forever/l/${cleanFilename}`;
    }
    
    return savedTexturePath;
  }, [baseData]);
  
  const product = getProductFromId(designMetadata.productId);
  const productName = product?.name || designMetadata.productName;
  
  // Format category title with dash separator between shape name and rest
  const categoryTitle = useMemo(() => {
    const words = category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1));
    
    // List of known shape names (from the shape map)
    const shapeNames = [
      'Cropped Peak',
      'Curved Gable', 
      'Curved Peak',
      'Curved Top',
      'Half Round',
      'Gable',
      'Left Wave',
      'Peak',
      'Right Wave',
      'Serpentine',
      'Square',
      'Rectangle'
    ];
    
    // Check if the category starts with any known shape name
    for (const shapeName of shapeNames) {
      const shapeWords = shapeName.split(' ');
      const categoryStart = words.slice(0, shapeWords.length).join(' ');
      
      if (categoryStart === shapeName && words.length > shapeWords.length) {
        // Found a match - add dash separator
        const shapePartFormatted = shapeWords.join(' ');
        const restPart = words.slice(shapeWords.length).join(' ');
        return `${shapePartFormatted} - ${restPart}`;
      }
    }
    
    // No shape match found, return default formatting
    return words.join(' ');
  }, [category]);
  
  // Get simplified product name for H1
  const getSimplifiedProductName = (name: string): string => {
    const lower = name.toLowerCase();
    if (lower.includes('laser-etched') || lower.includes('laser etched')) {
      if (lower.includes('colour') || lower.includes('color')) {
        return 'Laser-Etched Colour';
      }
      return 'Laser-Etched Black Granite';
    }
    if (lower.includes('bronze')) return 'Bronze';
    if (lower.includes('stainless steel')) return 'Stainless Steel';
    if (lower.includes('traditional')) return 'Traditional Engraved';
    if (lower.includes('full colour') || lower.includes('full color')) return 'Full Colour';
    return name;
  };
  
  const simplifiedProductName = getSimplifiedProductName(productName);

  // Get capitalized product type for H1
  const productTypeDisplay = designMetadata.productType.charAt(0).toUpperCase() + designMetadata.productType.slice(1);

  // Get friendly shape display name from shapeName
  const shapeDisplayName = useMemo(() => {
    if (!shapeName) return null;
    
    // Map common numbered shapes to friendly names
    const shapeMap: Record<string, string> = {
      'headstone_27': 'Heart',
      'Headstone 27': 'Heart',
      'pet_heart': 'Heart',
      'serpentine': 'Serpentine',
      'gable': 'Gable',
      'peak': 'Peak',
      'curved_peak': 'Curved Peak',
      'square': 'Square',
      'landscape': 'Landscape',
      'portrait': 'Portrait',
    };
    
    // Check if we have a direct mapping
    if (shapeMap[shapeName]) {
      return shapeMap[shapeName];
    }
    
    // Extract from numbered patterns like "Headstone 27"
    let extractedShape = shapeName
      .replace(/^(headstone|plaque)\s+\d+$/i, '')
      .replace(/^(headstone|plaque)_\d+$/i, '')
      .trim();
    
    // If we have a named shape, format it
    if (extractedShape && extractedShape.length > 0 && !/^\d+$/.test(extractedShape)) {
      return extractedShape
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    
    return null;
  }, [shapeName]);
  
  
  // Format slug for display
  const slugText = slug.split('_').slice(1).join('_').split('-').map((word, index) => {
    if (word.length <= 2 && index > 0) return word;
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
  
  // Get store state for price calculation
  const catalog = useHeadstoneStore((s) => s.catalog);
  const widthMm = useHeadstoneStore((s) => s.widthMm);
  const heightMm = useHeadstoneStore((s) => s.heightMm);
  const shapeUrl = useHeadstoneStore((s) => s.shapeUrl);
  const headstoneMaterialUrl = useHeadstoneStore((s) => s.headstoneMaterialUrl);
  const baseMaterialUrl = useHeadstoneStore((s) => s.baseMaterialUrl);
  const inscriptions = useHeadstoneStore((s) => s.inscriptions);
  const inscriptionCost = useHeadstoneStore((s) => s.inscriptionCost);
  const selectedMotifs = useHeadstoneStore((s) => s.selectedMotifs);
  const motifOffsets = useHeadstoneStore((s) => s.motifOffsets);
  const motifCost = useHeadstoneStore((s) => s.motifCost);
  const motifPriceModel = useHeadstoneStore((s) => s.motifPriceModel);
  const selectedAdditions = useHeadstoneStore((s) => s.selectedAdditions);
  const showBase = useHeadstoneStore((s) => s.showBase);
  const showInscriptionColor = useHeadstoneStore((s) => s.showInscriptionColor);
  
  // Get shape name from URL (for store-based shapes)
  const shapeNameFromUrl = useMemo(() => {
    if (!shapeUrl) return 'Unknown';
    const parts = shapeUrl.split('/');
    const filename = parts[parts.length - 1];
    return filename.replace('.svg', '').replace(/-/g, ' ');
  }, [shapeUrl]);

  // Get material name from URL
  const getMaterialName = (url: string | null) => {
    if (!url) return 'Unknown';
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    return filename.replace('.jpg', '').replace('.png', '').replace(/-/g, ' ');
  };

  // Calculate headstone price (placeholder - would need actual catalog pricing)
  const headstonePrice = useMemo(() => {
    return 2565.95; // Placeholder
  }, [catalog, widthMm, heightMm]);

  // Calculate base price (placeholder)
  const basePrice = useMemo(() => {
    if (!showBase) return 0;
    return 650.00; // Placeholder
  }, [showBase]);

  // Calculate additions price
  const additionsPrice = useMemo(() => {
    return selectedAdditions.length * 75;
  }, [selectedAdditions]);

  // Get addition details
  const additionItems = useMemo(() => {
    return selectedAdditions.map(addId => {
      const parts = addId.split('_');
      const baseId = parts.length > 1 && !isNaN(Number(parts[parts.length - 1]))
        ? parts.slice(0, -1).join('_')
        : addId;
      
      const addition = data.additions.find(a => a.id === baseId);
      return {
        id: addId,
        baseId: baseId,
        name: addition?.name || 'Addition',
        type: addition?.type || 'application',
      };
    });
  }, [selectedAdditions]);

  // Calculate total
  const totalPrice = useMemo(() => {
    return headstonePrice + basePrice + inscriptionCost + motifCost + additionsPrice;
  }, [headstonePrice, basePrice, inscriptionCost, motifCost, additionsPrice]);
  
  // Extract generic inscriptions (without personal names/dates)
  const genericInscriptions = designData
    ? designData
        .filter((item: any) => item.type === 'Inscription' && item.label)
        .map((item: any) => item.label)
        .filter((text: string) => {
          const lowerText = text.toLowerCase();
          return (
            lowerText.includes('memory') ||
            lowerText.includes('loving') ||
            lowerText.includes('forever') ||
            lowerText.includes('rest in peace') ||
            lowerText.includes('rip') ||
            lowerText.includes('beloved') ||
            lowerText.includes('cherished') ||
            lowerText.includes('mother') ||
            lowerText.includes('father') ||
            lowerText.includes('wife') ||
            lowerText.includes('husband') ||
            lowerText.includes('son') ||
            lowerText.includes('daughter') ||
            lowerText.includes('always') ||
            lowerText.includes('remembered') ||
            lowerText.includes('missed') ||
            lowerText.includes('lord') ||
            lowerText.includes('god') ||
            lowerText.includes('heaven') ||
            lowerText.includes('psalm') ||
            lowerText.includes('prayer') ||
            lowerText.includes('spirit') ||
            lowerText.includes('peace') ||
            lowerText.includes('eternity') ||
            lowerText.includes('blessed') ||
            lowerText.includes('angel') ||
            lowerText.includes('verse') ||
            text.match(/\d+:\d+/) // Bible verse reference (e.g., "34:18")
          );
        })
    : [];

  // Wait for both design data and name database to be loaded before rendering
  if (loading || !nameDatabase) {
    return (
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100 min-h-screen ml-[400px]">
        <div className="container mx-auto px-8 py-16 max-w-7xl">
          <div className="flex items-center gap-4 justify-center">
            <ArrowPathIcon className="w-8 h-8 animate-spin text-slate-800" />
            <p className="text-slate-600 text-lg font-light">
              {!nameDatabase ? 'Preparing memorial design...' : 'Loading memorial design...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Left Sidebar with Related Designs */}
      <DesignSidebar 
        currentDesignId={designId}
        category={category as DesignCategory}
        productSlug={productSlug}
        maxItems={15}
      />
      
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100 ml-[400px] min-h-screen">
      {/* Breadcrumb and Header - positioned at top */}
      <div className="border-b border-slate-200 relative z-10 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-8 py-6 max-w-7xl">
          {/* Elegant Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
            <a href="/designs" className="hover:text-slate-900 transition-colors font-light tracking-wide">Memorial Designs</a>
            <ChevronRightIcon className="w-4 h-4" />
            <a href={`/designs/${designMetadata.productType}`} className="hover:text-slate-900 transition-colors font-light tracking-wide capitalize">{designMetadata.productType}s</a>
            <ChevronRightIcon className="w-4 h-4" />
            <a href={`/designs/${productSlug}`} className="hover:text-slate-900 transition-colors font-light tracking-wide">{productName}</a>
            <ChevronRightIcon className="w-4 h-4" />
            <a href={`/designs/${productSlug}/${category}`} className="hover:text-slate-900 transition-colors font-light tracking-wide">{categoryTitle}</a>
            <ChevronRightIcon className="w-4 h-4" />
            <span className="text-slate-900 font-medium tracking-wide">{designMetadata.title}</span>
          </nav>

          {/* Sophisticated Header with Design Specifications */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-serif font-light text-slate-900 tracking-tight mb-7">
                {categoryTitle} – {simplifiedProductName} {productTypeDisplay}{shapeDisplayName ? ` (${shapeDisplayName})` : ''}
              </h1>
              <p className="text-2xl text-slate-600 font-light italic mb-6">
                {slugText}
              </p>
              
            </div>
            <div>
              <a
                href={(() => {
                  const mlDir = designMetadata.mlDir || '';
                  let domain = 'headstonesdesigner.com';
                  if (mlDir.includes('forevershining')) {
                    domain = 'forevershining.com.au';
                  } else if (mlDir.includes('bronze-plaque')) {
                    domain = 'bronze-plaque.com';
                  }
                  return `https://${domain}/design/html5/#edit${designId}`;
                })()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all text-sm font-light uppercase tracking-wider shadow-md hover:shadow-lg"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Use Template
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Rest of content - appears after canvas */}
      <div className="container mx-auto max-w-7xl px-8">

      {/* Download Links */}
      <div className="flex gap-3 py-6">
        <a
          href={designMetadata.preview}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-light text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors border border-blue-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Screenshot
        </a>
        <a
          href={`/ml/${designMetadata.mlDir}/saved-designs/json/${designId}.json`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-light text-green-700 hover:text-green-900 bg-green-50 hover:bg-green-100 rounded-md transition-colors border border-green-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          JSON Data
        </a>
        <a
          href={`/ml/${designMetadata.mlDir}/saved-designs/xml/${designId}.xml`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-light text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors border border-purple-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          XML Data
        </a>
        <a
          href={(() => {
            const mlDir = designMetadata.mlDir || '';
            let domain = 'headstonesdesigner.com';
            if (mlDir.includes('forevershining')) {
              domain = 'forevershining.com.au';
            } else if (mlDir.includes('bronze-plaque')) {
              domain = 'bronze-plaque.com';
            }
            return `https://${domain}/design/html5/#edit${designId}`;
          })()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-light text-orange-700 hover:text-orange-900 bg-orange-50 hover:bg-orange-100 rounded-md transition-colors border border-orange-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit
        </a>
      </div>

      {/* Design Preview - Enhanced with shape, texture, and motifs */}
      {designData && screenshotDimensions && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 my-8">
          {/* Visual Preview Area */}
          <div className="relative bg-gradient-to-br from-slate-50 to-white min-h-[600px] flex items-center justify-center p-8">
            {/* Container for headstone and base stacked vertically */}
            <div className="flex flex-col items-center gap-0">
              {/* Headstone SVG as the main shape with texture overlay */}
              <div 
                className="relative"
                style={{
                  width: `${scalingFactors.displayWidth}px`,
                  height: `${scalingFactors.displayHeight}px`,
                }}
              >
              {/* SVG Shape as base */}
              {shapeImagePath ? (
                shapeName === 'Serpentine' && shapeData ? (
                  // Dynamically generate Serpentine SVG with correct proportions
                  <div className="absolute inset-0">
                    <svg 
                      width="100%" 
                      height="100%" 
                      viewBox={`0 0 ${scalingFactors.displayWidth} ${scalingFactors.displayHeight}`}
                      xmlns="http://www.w3.org/2000/svg"
                      preserveAspectRatio="none"
                    >
                      <defs>
                        {textureData && (
                          <pattern id="graniteTexture" patternUnits="userSpaceOnUse" width="520" height="520">
                            <image 
                              href={textureData} 
                              x="0" 
                              y="0" 
                              width="520" 
                              height="520" 
                            />
                          </pattern>
                        )}
                      </defs>
                      <path 
                        fill={textureData ? "url(#graniteTexture)" : "#808080"}
                        d={(() => {
                          // Calculate the serpentine curve based on actual dimensions
                          const w = scalingFactors.displayWidth * 0.8; // Reduce width to 80%
                          const h = scalingFactors.displayHeight;
                          const offsetX = scalingFactors.displayWidth * 0.1; // Center the narrower shape
                          // Curve height as percentage of total height (10%)
                          const curveHeight = h * 0.1;
                          
                          return `M${offsetX + w} ${curveHeight} L${offsetX + w} ${h} ${offsetX} ${h} ${offsetX} ${curveHeight} ` +
                            `${offsetX + w * 0.064} ${curveHeight * 0.97} ${offsetX + w * 0.1275} ${curveHeight * 0.87} ` +
                            `${offsetX + w * 0.19} ${curveHeight * 0.71} ${offsetX + w * 0.319} ${curveHeight * 0.25} ` +
                            `${offsetX + w * 0.39} ${curveHeight * 0.08} ${offsetX + w * 0.463} 0 ${offsetX + w * 0.537} 0 ` +
                            `${offsetX + w * 0.61} ${curveHeight * 0.08} ${offsetX + w * 0.681} ${curveHeight * 0.25} ` +
                            `${offsetX + w * 0.81} ${curveHeight * 0.71} ${offsetX + w * 0.8725} ${curveHeight * 0.87} ` +
                            `${offsetX + w * 0.936} ${curveHeight * 0.97} ${offsetX + w} ${curveHeight}`;
                        })()}
                      />
                    </svg>
                  </div>
                ) : (
                  // Other headstone shapes - use pre-processed SVG with texture
                  (() => {
                    console.log('🎨 Rendering headstone shape:', {
                      shapeName,
                      svgContent: !!svgContent,
                      svgLength: svgContent?.length || 0,
                      fallbackToTexture: !svgContent
                    });
                    
                    return svgContent ? (
                      <div 
                        className="absolute inset-0"
                        dangerouslySetInnerHTML={{ __html: svgContent }}
                        style={{
                          width: '100%',
                          height: '100%',
                        }}
                      />
                    ) : (
                      <div 
                        className="absolute inset-0 rounded-lg"
                        style={{
                          backgroundImage: textureData 
                            ? `url(${textureData})`
                            : 'linear-gradient(to bottom, #9ca3af, #6b7280)',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      />
                    );
                  })()
                )
              ) : (
                <div 
                  className="absolute inset-0 rounded-lg shadow-2xl"
                  style={{
                    backgroundImage: textureData 
                      ? `url(${textureData})`
                      : 'linear-gradient(to bottom, #9ca3af, #6b7280)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
              )}

              {/* Inscriptions Layer - Only headstone inscriptions */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {sanitizedDesignData && sanitizedDesignData
                  .filter((item: any) => item.type === 'Inscription' && item.label && item.part !== 'Base')
                  .map((item: any, index: number) => {
                    const upscaleFactor = scalingFactors.upscaleFactor || 1;
                    
                    // Font size - FIX #4: Normalize saved px by DPR, then scale by Y
                    // Extract px from font field
                    let fontSizeInPx = item.font_size || 16;
                    if (item.font && typeof item.font === 'string') {
                      const match = item.font.match(/^([\d.]+)px/);
                      if (match) {
                        fontSizeInPx = parseFloat(match[1]);
                      }
                    }
                    
                    // Normalize to canvas logical pixels (undo DPR scaling from save time)
                    const fontPxCanvas = fontSizeInPx * (1 / scalingFactors.designDpr);
                    // Then scale canvas -> display using Y ratio
                    const fontSize = fontPxCanvas * scalingFactors.ratioHeight;
                    const fontFamily = item.font_family || item.font || 'serif';
                    
                    // FIX #7: Auto-detect legacy vs axis-correct for X coordinate
                    const canvasX = inferCanvasX(
                      item.x,
                      scalingFactors.ratioWidth,
                      scalingFactors.ratioHeight,
                      scalingFactors.initW
                    );
                    const canvasY = item.y / scalingFactors.ratioHeight; // Y stays the same
                    
                    // FIX #3: Apply crop offset and scale axis-correctly
                    const xPos = (canvasX - scalingFactors.canvasCropLeft) * scalingFactors.ratioWidth;
                    const yPos = (canvasY - scalingFactors.canvasCropTop) * scalingFactors.ratioHeight;
                    
                    // Debug first inscription
                    if (index === 0) {
                      console.log('Inscription positioning (auto-detect):', {
                        label: item.label,
                        raw: { x: item.x, y: item.y },
                        ratios: { width: scalingFactors.ratioWidth.toFixed(4), height: scalingFactors.ratioHeight.toFixed(4) },
                        candidates: { 
                          xBug: (item.x / scalingFactors.ratioHeight).toFixed(2),
                          xFixed: (item.x / scalingFactors.ratioWidth).toFixed(2),
                          chosen: canvasX.toFixed(2)
                        },
                        canvas: { cx: canvasX.toFixed(2), cy: canvasY.toFixed(2) },
                        canvasSize: { w: scalingFactors.initW, h: scalingFactors.initH },
                        crop: { left: scalingFactors.canvasCropLeft.toFixed(2), top: scalingFactors.canvasCropTop.toFixed(2) },
                        display: { xPos: xPos.toFixed(2), yPos: yPos.toFixed(2) }
                      });
                    }
                    
                    return (
                      <DraggableElement
                        key={index}
                        initialStyle={{
                          fontSize: `${fontSize}px`,
                          fontFamily: fontFamily,
                          color: item.color || '#000000',
                          fontWeight: fontFamily.toLowerCase().includes('bold') ? 'bold' : 'normal',
                          fontStyle: fontFamily.toLowerCase().includes('italic') ? 'italic' : 'normal',
                          transform: `translate(-50%, -50%) ${item.rotation ? `rotate(${item.rotation}deg)` : ''}`,
                          textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                          left: `calc(50% + ${xPos}px)`,
                          top: `calc(50% + ${yPos}px)`,
                          position: 'absolute',
                          whiteSpace: 'nowrap',
                          pointerEvents: 'auto',
                        }}
                      >
                        {item.label.replace(/&apos;/g, "'")}
                      </DraggableElement>
                    );
                  })}
              </div>

              {/* Motifs Layer - Only headstone motifs */}
              {adjustedMotifData.length > 0 && (
                <div className="absolute inset-0 pointer-events-none">
                  {adjustedMotifData
                    .filter((motif: any) => motif.part !== 'Base')
                    .map((motif: any, index: number) => {
                    const upscaleFactor = scalingFactors.upscaleFactor || 1;
                    
                    // FIX #7: Auto-detect legacy vs axis-correct for X coordinate
                    const canvasX = inferCanvasX(
                      motif.x,
                      scalingFactors.ratioWidth,
                      scalingFactors.ratioHeight,
                      scalingFactors.initW
                    );
                    const canvasY = motif.y / scalingFactors.ratioHeight; // Y stays the same
                    
                    // FIX #3: Apply crop offset and scale axis-correctly
                    const xPos = (canvasX - scalingFactors.canvasCropLeft) * scalingFactors.ratioWidth;
                    const yPos = (canvasY - scalingFactors.canvasCropTop) * scalingFactors.ratioHeight;
                    
                    // FIX #5: Motif height in canvas units, scale to display
                    const motifH_canvas = motif.height || 80;
                    const motifHeight = motifH_canvas * scalingFactors.ratioHeight;
                    
                    // FIX #5: Always use SVG natural aspect ratio
                    const motifSrc = motif.src || motif.name;
                    const svgDims = motifDimensions[motifSrc];
                    let motifWidth = motifHeight * 1.2; // Fallback while loading
                    
                    if (svgDims && svgDims.width && svgDims.height) {
                      const ar = svgDims.width / svgDims.height;
                      const motifW_canvas = motifH_canvas * ar;
                      motifWidth = motifW_canvas * scalingFactors.ratioWidth;
                    }
                    
                    // Calculate flip transform (apply to inner images, not container to avoid drag issues)
                    const flipX = motif.flipx === '-1' || motif.flipx === -1 ? -1 : 1;
                    const flipY = motif.flipy === '-1' || motif.flipy === -1 ? -1 : 1;
                    const flipTransform = `scaleX(${flipX}) scaleY(${flipY})`;
                    
                    // Rotation (in degrees)
                    const rotation = motif.rotation || 0;
                    const rotateTransform = rotation !== 0 ? `rotate(${rotation}deg)` : '';
                    
                    // Combined transform for inner images (flip + rotate)
                    const innerTransform = [flipTransform, rotateTransform].filter(Boolean).join(' ');
                    
                    return (
                      <DraggableElement
                        key={index}
                        initialStyle={{
                          left: `calc(50% + ${xPos}px)`,
                          top: `calc(50% + ${yPos}px)`,
                          transform: 'translate(-50%, -50%)',
                          width: `${motifWidth}px`,
                          height: `${motifHeight}px`,
                          position: 'absolute',
                          zIndex: 10,
                          pointerEvents: 'auto',
                        }}
                      >
                        {(() => {
                          const motifPath = getMotifPath(motif);
                          const fallbackPath = getFallbackMotifPath(motif);
                          
                          if (motif.color) {
                            console.log('🎨 Rendering colored motif with mask:', motifPath, 'color:', motif.color);
                            return (
                              <>
                                {/* Hidden img to detect loading errors */}
                                <img
                                  src={motifPath}
                                  alt=""
                                  style={{ display: 'none' }}
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    console.error('❌ Colored motif failed to load:', target.src);
                                    if (!target.dataset.fallbackAttempted) {
                                      console.log('🔄 Trying fallback path for colored motif:', fallbackPath);
                                      target.dataset.fallbackAttempted = 'true';
                                      target.src = fallbackPath;
                                    }
                                  }}
                                  onLoad={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    console.log('✅ Colored motif loaded:', target.src);
                                  }}
                                />
                                {/* Actual visible colored motif using mask */}
                                <div
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    backgroundColor: motif.color,
                                    WebkitMaskImage: `url(${motifPath}), url(${fallbackPath})`,
                                    maskImage: `url(${motifPath}), url(${fallbackPath})`,
                                    WebkitMaskSize: 'contain',
                                    maskSize: 'contain',
                                    WebkitMaskRepeat: 'no-repeat',
                                    maskRepeat: 'no-repeat',
                                    WebkitMaskPosition: 'center',
                                    maskPosition: 'center',
                                    transform: innerTransform,
                                  }}
                                />
                              </>
                            );
                          } else {
                            console.log('🖼️ Rendering regular motif:', motifPath);
                            return (
                              <img
                                src={motifPath}
                                alt={`Motif ${index + 1}`}
                                className="w-full h-full object-contain"
                                style={{
                                  transform: innerTransform,
                                }}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  console.error('❌ Motif failed to load:', target.src);
                                  
                                  // Check if we've already tried the fallback
                                  if (!target.dataset.fallbackAttempted) {
                                    console.log('🔄 Trying fallback path:', fallbackPath);
                                    target.dataset.fallbackAttempted = 'true';
                                    target.src = fallbackPath;
                                  } else {
                                    console.error('❌ Both attempts failed for motif:', motif.src || motif.name);
                                  }
                                }}
                                onLoad={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  console.log('✅ Motif loaded successfully:', target.src);
                                }}
                              />
                            );
                          }
                        })()}
                      </DraggableElement>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Base (pedestal) if present - positioned directly below headstone */}
            {baseData && (
              <div
                className="relative"
                style={{
                  // Base width/height are in mm (real-world dimensions)
                  // Scale based on ratio to headstone mm dimensions, then subtract 50px for margins
                  width: `${Math.max(100, (baseData.width || 700) / (shapeData?.width || 600) * scalingFactors.displayWidth - 50)}px`,
                  height: `${Math.max(80, Math.min(200, ((baseData.height || 100) / (shapeData?.height || 600)) * scalingFactors.displayHeight))}px`,
                  maxWidth: '100%',
                  backgroundImage: baseTextureData 
                    ? `url(${baseTextureData})`
                    : 'linear-gradient(to bottom, #1a1a1a, #000000)',
                  backgroundSize: '520px 520px', // Seamless texture size
                  backgroundRepeat: 'repeat',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                }}
              >
                {(() => {
                  console.log('Base render:', {
                    hasBase: !!baseData,
                    baseData: baseData ? {
                      width: baseData.width,
                      height: baseData.height,
                      type: baseData.type
                    } : null,
                    headstoneWidth: shapeData?.width,
                    headstoneHeight: shapeData?.height,
                    displayWidth: scalingFactors.displayWidth,
                    calculatedBaseWidth: Math.max(100, (baseData.width || 700) / (shapeData?.width || 600) * scalingFactors.displayWidth - 50),
                    calculatedBaseHeight: Math.max(80, Math.min(200, ((baseData.height || 100) / (shapeData?.height || 600)) * scalingFactors.displayHeight))
                  });
                  return null;
                })()}
                {/* Base Inscriptions Layer */}
                {sanitizedDesignData && sanitizedDesignData
                  .filter((item: any) => item.type === 'Inscription' && item.label && item.part === 'Base')
                  .map((item: any, index: number) => {
                    // FIX #4: Normalize saved px by DPR, then scale by Y
                    let fontSizeInPx = item.font_size || 16;
                    if (item.font && typeof item.font === 'string') {
                      const match = item.font.match(/^([\d.]+)px/);
                      if (match) {
                        fontSizeInPx = parseFloat(match[1]);
                      }
                    }
                    
                    const fontPxCanvas = fontSizeInPx * (1 / scalingFactors.designDpr);
                    const fontSize = fontPxCanvas * scalingFactors.ratioHeight;
                    const fontFamily = item.font_family || item.font || 'serif';
                    
                    return (
                      <div
                        key={`base-${index}`}
                        className="absolute"
                        style={{
                          fontSize: `${fontSize}px`,
                          fontFamily: fontFamily,
                          color: item.color || '#FFFFFF',
                          fontWeight: fontFamily.toLowerCase().includes('bold') ? 'bold' : 'normal',
                          fontStyle: fontFamily.toLowerCase().includes('italic') ? 'italic' : 'normal',
                          textShadow: '2px 2px 4px rgba(0,0,0,0.9)',
                          left: '50%',
                          top: '50%',
                          transform: 'translate(-50%, -50%)',
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
                          padding: '8px',
                        }}
                      >
                        {item.label.replace(/&apos;/g, "'")}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
          </div>

          {/* Design Specifications */}
          <div className="px-6 pt-6">
            <div className="bg-slate-50/50 rounded-lg p-6 border border-slate-200/50 mb-6">
              <h3 className="font-serif font-light text-xl text-slate-900 mb-4 flex items-center gap-3">
                <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Specifications</span>
              </h3>
              <div className="space-y-3 ml-9">
                <div className="flex items-baseline gap-2">
                  <span className="font-light text-slate-500">Product:</span>
                  <span className="text-slate-900">{productName}</span>
                </div>
                {shapeName && shapeData && shapeData.width && shapeData.height && (
                  <div className="flex items-baseline gap-2">
                    <span className="font-light text-slate-500">Shape:</span>
                    <span className="text-slate-900">{shapeName} ({Math.round(shapeData.width)} × {Math.round(shapeData.height)} mm)</span>
                  </div>
                )}
                {textureData && (
                  <div className="flex items-baseline gap-2">
                    <span className="font-light text-slate-500">Material:</span>
                    <span className="text-slate-900">
                      {(() => {
                        const parts = textureData.split('/');
                        const filename = parts[parts.length - 1];
                        return filename.replace('.jpg', '').replace('.png', '');
                      })()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Inscriptions List */}
          <div className="px-6 pb-6">
          {designData.filter((item: any) => item.type === 'Inscription' && item.label).length > 0 && (
            <div className="bg-blue-50/50 rounded-lg p-6 border border-blue-200/50 mb-6">
              <h3 className="font-serif font-light text-xl text-slate-900 mb-4 flex items-center gap-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <span>Inscriptions</span>
              </h3>
              <ul className="space-y-2 ml-9">
                {designData
                  .filter((item: any) => item.type === 'Inscription' && item.label)
                  .map((item: any, index: number) => (
                    <li key={index} className="text-slate-700 font-light">
                      <span className="font-normal">{sanitizeInscription(item.label.replace(/&apos;/g, "'"))}</span>
                      {item.font_family && (
                        <span className="text-sm text-slate-500 ml-2">({item.font_family})</span>
                      )}
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {/* Motifs List */}
          {adjustedMotifData.length > 0 && (
            <div className="bg-amber-50/50 rounded-lg p-6 border border-amber-200/50 mb-6">
              <h3 className="font-serif font-light text-xl text-slate-900 mb-4 flex items-center gap-3">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <span>Decorative Motifs</span>
              </h3>
              <ul className="space-y-2 ml-9">
                {adjustedMotifData.map((motif: any, index: number) => (
                  <li key={index} className="text-slate-700 font-light">
                    <span className="font-normal">{motif.name || `Motif ${index + 1}`}</span>
                    {motif.color && (
                      <span 
                        className="inline-block w-5 h-5 rounded-full ml-2 border-2 border-white shadow-sm"
                        style={{ backgroundColor: motif.color }}
                        title={motif.color}
                      />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Price Quote */}
          {(() => {
            const headstoneItem = designData.find((item: any) => item.type === 'Headstone');
            const baseItem = designData.find((item: any) => item.type === 'Base');
            const inscriptionItems = designData.filter((item: any) => item.type === 'Inscription' && item.label);
            const motifItems = adjustedMotifData;
            
            const headstonePrice = Number(headstoneItem?.price || 0);
            const basePrice = Number(baseItem?.price || 0);
            const inscriptionPrice = inscriptionItems.reduce((sum: number, item: any) => sum + Number(item.price || 0), 0);
            const motifPrice = motifItems.reduce((sum: number, item: any) => sum + Number(item.price || 0), 0);
            const totalPrice = headstonePrice + basePrice + inscriptionPrice + motifPrice;
            
            if (totalPrice === 0) return null;
            
            return (
              <div className="bg-green-50/50 rounded-lg p-6 border border-green-200/50">
                <h3 className="font-serif font-light text-xl text-slate-900 mb-4 flex items-center gap-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Price Quote</span>
                </h3>
                <div className="ml-9 space-y-3">
                  {headstonePrice > 0 && (
                    <div className="flex justify-between items-baseline text-slate-700">
                      <span className="font-light">Headstone:</span>
                      <span className="font-normal">${headstonePrice.toFixed(2)}</span>
                    </div>
                  )}
                  {basePrice > 0 && (
                    <div className="flex justify-between items-baseline text-slate-700">
                      <span className="font-light">Base:</span>
                      <span className="font-normal">${basePrice.toFixed(2)}</span>
                    </div>
                  )}
                  {inscriptionPrice > 0 && (
                    <div className="flex justify-between items-baseline text-slate-700">
                      <span className="font-light">Inscriptions ({inscriptionItems.length}):</span>
                      <span className="font-normal">${inscriptionPrice.toFixed(2)}</span>
                    </div>
                  )}
                  {motifPrice > 0 && (
                    <div className="flex justify-between items-baseline text-slate-700">
                      <span className="font-light">Motifs ({motifItems.length}):</span>
                      <span className="font-normal">${motifPrice.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-green-300 pt-3 mt-3">
                    <div className="flex justify-between items-baseline">
                      <span className="font-serif text-lg text-slate-900">Total:</span>
                      <span className="font-serif text-2xl font-normal text-green-700">${totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
          </div>
        </div>
      )}


      {/* Unique Content Block for SEO */}
      <DesignContentBlock
        design={designMetadata}
        categoryTitle={categoryTitle}
        simplifiedProductName={simplifiedProductName}
        shapeName={shapeDisplayName}
        productType={designMetadata.productType}
        productSlug={productSlug}
      />
      </div>
    </div>
    </>
  );
}
