'use client';

import React from 'react';
import Link from 'next/link';
import type { SavedDesignMetadata } from '#/lib/saved-designs-data';
import { getRelatedDesigns, getDesignsByCategory, DESIGN_CATEGORIES } from '#/lib/saved-designs-data';
import { 
  getRegionFromMlDir, 
  LOCALIZED_CONTENT, 
  formatDimensionRange,
  formatPrice,
  getShippingInfo,
  getCemeteryComplianceTitle,
  getLeadTime,
  type Region
} from '#/lib/localization';

/**
 * Format shape name for display - convert snake_case or lowercase to Title Case
 */
function formatShapeName(shapeName: string): string {
  return shapeName
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

interface DesignContentBlockProps {
  design: SavedDesignMetadata;
  categoryTitle: string;
  simplifiedProductName: string;
  shapeName: string | null;
  productType: 'headstone' | 'plaque' | 'monument';
  productSlug: string;
}

export default function DesignContentBlock({
  design,
  categoryTitle,
  simplifiedProductName,
  shapeName,
  productType,
  productSlug
}: DesignContentBlockProps) {
  
  // Get region and localized content
  const region = getRegionFromMlDir(design.mlDir);
  const locale = LOCALIZED_CONTENT[region];
  
  // Generate edit URL based on mlDir
  const getEditUrl = () => {
    const mlDir = design.mlDir || '';
    let domain = 'headstonesdesigner.com';
    if (mlDir.includes('forevershining')) {
      domain = 'forevershining.com.au';
    } else if (mlDir.includes('bronze-plaque')) {
      domain = 'bronze-plaque.com';
    }
    return `https://${domain}/design/html5/#edit${design.id}`;
  };
  
  const editUrl = getEditUrl();
  
  // Generate intro paragraph
  const generateIntro = () => {
    const shape = shapeName ? `${shapeName.toLowerCase()}-shaped ` : '';
    const material = simplifiedProductName.toLowerCase();
    const finish = material.includes('laser') ? 'laser-etched' : 
                   material.includes('traditional') ? 'traditional engraved' : 'laser-etched';
    
    const intros = [
      `This ${categoryTitle.toLowerCase()} design features a ${shape}${material} ${productType} with ${finish} detailing. Perfect for creating a lasting tribute that reflects personality and cherished memories.`,
      `Create a meaningful ${categoryTitle.toLowerCase()} with this ${shape}${material} ${productType}. The ${finish} finish ensures exceptional clarity and durability for generations to come.`,
      `A beautiful ${shape}${material} ${productType} designed for ${categoryTitle.toLowerCase()}s. ${finish.charAt(0).toUpperCase() + finish.slice(1)} craftsmanship guarantees a timeless memorial.`,
      `Design your ${categoryTitle.toLowerCase()} with this elegant ${shape}${material} ${productType}. ${finish.charAt(0).toUpperCase() + finish.slice(1)} detailing provides stunning visual impact and lasting quality.`
    ];
    
    // Use design ID to deterministically select intro (keeps it consistent per design)
    const index = parseInt(design.id) % intros.length;
    return intros[index];
  };

  // Generate design notes
  const generateDesignNotes = () => {
    const hasMotifs = design.hasMotifs;
    const hasPhoto = design.hasPhoto;
    const inscriptionCount = design.inscriptionCount;
    
    const verseLength = inscriptionCount <= 2 ? 'short to medium' : 
                       inscriptionCount <= 4 ? 'medium length' : 
                       'multiple short';
    
    const fontGuidance = simplifiedProductName.toLowerCase().includes('laser') ?
      'This laser-etched design offers exceptional detail, making it ideal for script fonts like Chopin, Edwardian, or elegant serif fonts like Times New Roman and Garamond.' :
      'Traditional engraving works best with bold, clear fonts such as Arial, Helvetica, or strong serif options like Georgia for optimal readability.';
    
    const motifGuidance = hasMotifs ?
      `This design includes ${design.motifNames.join(', ')} motif${design.motifNames.length > 1 ? 's' : ''}. Motifs are best positioned in corners or above/below inscriptions to frame the text beautifully without overwhelming the design.` :
      'Motifs can be added to enhance this design. Popular choices include flowers, crosses, doves, or butterflies, typically placed in corner positions or as header elements.';
    
    const photoGuidance = hasPhoto ?
      'Photo placement is included in this design. For best results, use high-resolution portrait photos (minimum 300 DPI) with good contrast.' :
      productType === 'headstone' ? 'Photo placement can be added to this design, typically positioned in the upper section or corner area.' : '';
    
    return {
      verseLength,
      fontGuidance,
      motifGuidance,
      photoGuidance
    };
  };

  // Generate specifications with localized units
  const generateSpecs = () => {
    const material = simplifiedProductName.toLowerCase();
    
    const specs: Record<string, string> = {};
    
    // Material
    specs['Material'] = material.includes('granite') ? 'Black Granite' :
                       material.includes('bronze') ? 'Bronze' :
                       material.includes('stainless') ? 'Stainless Steel' : 'Black Granite';
    
    // Finish
    specs['Finish'] = material.includes('laser') ? 'Laser-etched' :
                     material.includes('traditional') ? 'Traditional hand-engraved' : 'Laser-etched';
    
    // Dimensions (localized)
    if (productType === 'headstone') {
      if (locale.unitSystem === 'metric') {
        specs['Standard Sizes'] = '600mm × 450mm × 75mm, 750mm × 600mm × 100mm, 900mm × 600mm × 100mm';
        specs['Thickness'] = formatDimensionRange(75, 100, region);
      } else {
        specs['Standard Sizes'] = '24" × 18" × 3", 30" × 24" × 4", 36" × 24" × 4"';
        specs['Thickness'] = '3" to 4"';
      }
    } else if (productType === 'plaque') {
      if (locale.unitSystem === 'metric') {
        specs['Standard Sizes'] = '300mm × 200mm, 400mm × 300mm, 500mm × 400mm';
        specs['Thickness'] = formatDimensionRange(12, 25, region);
      } else {
        specs['Standard Sizes'] = '12" × 8", 16" × 12", 20" × 16"';
        specs['Thickness'] = '0.5" to 1"';
      }
    } else {
      if (locale.unitSystem === 'metric') {
        specs['Standard Sizes'] = '1200mm × 900mm × 150mm, 1500mm × 1050mm × 200mm';
        specs['Thickness'] = formatDimensionRange(150, 200, region);
      } else {
        specs['Standard Sizes'] = '48" × 36" × 6", 60" × 42" × 8"';
        specs['Thickness'] = '6" to 8"';
      }
    }
    
    // Edge finish
    if (material.includes('granite')) {
      specs['Edge'] = 'Polished or pitched edge';
    } else if (material.includes('bronze')) {
      specs['Edge'] = 'Smooth cast edge';
    } else {
      specs['Edge'] = 'Brushed or polished edge';
    }
    
    // Other specs
    specs['Warranty'] = '10-year manufacturer warranty';
    specs['Lead Time'] = '2-3 weeks (standard), 1 week (express available)';
    specs['Installation'] = 'Professional installation recommended';
    specs['Customisation'] = 'Inscriptions, motifs, photos, and border options';
    
    return specs;
  };

  // Generate compliance notes based on design source (mlDir)
  const generateComplianceNote = () => {
    const complianceTitle = getCemeteryComplianceTitle(region);
    const shipping = getShippingInfo(region, productType);
    
    if (region === 'AU') {
      return {
        title: complianceTitle,
        content: `This ${productType} design complies with typical Australian cemetery regulations. Most Australian cemeteries require ${productType}s to be made of durable materials like granite or bronze, with specific size restrictions varying by cemetery. We recommend checking with your local cemetery office for specific requirements regarding dimensions, foundation requirements, and installation procedures. Many Australian cemeteries require a base or foundation installation, which we can arrange through our network of licensed installers. ${shipping}`
      };
    } else if (region === 'US') {
      return {
        title: complianceTitle,
        content: `This memorial design is suitable for most US cemeteries. Cemetery regulations vary by state and individual cemetery. Common requirements include foundation specifications, size restrictions, and material approvals. We recommend confirming specific requirements with your cemetery administration before finalizing your order. ${shipping}`
      };
    } else {
      return {
        title: complianceTitle,
        content: `This design meets typical UK churchyard and cemetery requirements. Most UK burial grounds have specific regulations regarding memorial sizes, materials, and inscriptions. The Churchyard Regulations typically restrict height, width, and materials permitted. This design can be adapted to meet your local authority requirements. ${shipping}`
      };
    }
  };

  // Generate care and longevity content
  const generateCareContent = () => {
    const material = simplifiedProductName.toLowerCase();
    const finish = material.includes('laser') ? 'laser-etched' : 'traditional engraved';
    
    if (material.includes('granite')) {
      return {
        title: 'Care & Longevity: Why Granite Lasts',
        content: `${finish.charAt(0).toUpperCase() + finish.slice(1)} black granite memorials are renowned for their exceptional durability and longevity. Granite is one of the hardest natural stones, with a Mohs hardness rating of 6-7, making it highly resistant to weathering, erosion, and environmental damage. ${finish === 'laser-etched' ? 'Laser etching penetrates deep into the granite surface (typically 0.5-1mm), creating permanent markings that will not fade or wear away. The laser removes the polished surface layer, exposing the lighter granite beneath, which creates a lasting contrast that remains legible for centuries.' : 'Traditional hand engraving cuts deep into the granite, creating permanent inscriptions that resist weathering and remain clearly legible for generations.'} With minimal maintenance—typically just an annual gentle wash with water and a soft brush—your granite memorial will maintain its appearance for over 100 years. The natural density of granite prevents moisture absorption, eliminating issues with freeze-thaw damage common in softer materials.`
      };
    } else if (material.includes('bronze')) {
      return {
        title: 'Care & Longevity: Bronze Excellence',
        content: `Bronze memorials develop a beautiful natural patina over time while maintaining their structural integrity for centuries. Bronze is an incredibly durable alloy that resists corrosion and weathering. Regular cleaning with a soft cloth and mild soap helps maintain the bronze finish. The natural oxidation process creates a protective layer that actually enhances longevity. Professional refinishing services are available to restore the original luster if desired. With proper care, bronze memorials can last 200+ years while maintaining excellent legibility and visual appeal.`
      };
    } else {
      return {
        title: 'Care & Longevity: Stainless Steel Durability',
        content: `Stainless steel memorials offer modern aesthetics combined with exceptional weather resistance. The chromium content in stainless steel creates a passive oxide layer that protects against corrosion and staining. Regular cleaning with water and a microfiber cloth keeps the surface pristine. Stainless steel maintains its appearance in all weather conditions and is particularly suitable for coastal environments where salt air can damage other materials. Expected lifespan exceeds 50+ years with minimal maintenance required.`
      };
    }
  };

  const designNotes = generateDesignNotes();
  const specs = generateSpecs();
  const compliance = generateComplianceNote();
  const care = generateCareContent();
  
  // Generate FAQ based on design characteristics
  const generateFAQ = () => {
    const material = simplifiedProductName.toLowerCase();
    const isLaser = material.includes('laser');
    const isBronze = material.includes('bronze');
    const shape = shapeName || 'standard';
    const leadTimeText = getLeadTime(region, isLaser, isBronze);
    const shippingText = getShippingInfo(region, productType);
    
    const faqs = [
      {
        question: `What inscription length fits on the ${categoryTitle} ${shape !== 'standard' ? `(${shape})` : ''}?`,
        answer: `This ${categoryTitle.toLowerCase()} design accommodates ${design.inscriptionCount <= 2 ? 'short to medium' : design.inscriptionCount <= 4 ? 'medium length' : 'multiple'} inscriptions comfortably. You can add names, dates, verses, and personal messages. The design tool provides real-time preview so you can see exactly how your text will appear. We recommend keeping individual lines to 30-40 characters for optimal readability.`
      },
      {
        question: `Can I change fonts and motifs on this design?`,
        answer: `Absolutely! This design is fully ${locale.spellings.customise}able. You can choose from 10+ professional fonts suitable for memorials, adjust text sizes, and select from over 5,000 motifs including religious symbols, flora, fauna, and custom imagery. ${design.hasMotifs ? 'This design already includes motifs which you can keep, replace, or remove.' : 'You can easily add motifs to personalise your memorial.'} All changes are made through our interactive design tool with instant preview.`
      },
      {
        question: `How long does ${isLaser ? 'laser-etched black granite' : isBronze ? 'bronze' : simplifiedProductName.toLowerCase()} last outdoors?`,
        answer: isLaser 
          ? 'Laser-etched black granite memorials are exceptionally durable with an expected lifespan exceeding 100-200 years. The laser etching penetrates 0.5-1mm deep into the granite surface, creating permanent markings that resist weathering, fading, and environmental damage. Granite has a Mohs hardness rating of 6-7, making it highly resistant to erosion. With minimal maintenance (annual gentle wash), your memorial will maintain its appearance for generations.'
          : isBronze
          ? 'Bronze memorials can last 200+ years when properly maintained. Bronze naturally develops a protective patina over time that actually enhances longevity. The cast bronze construction is highly resistant to corrosion and weathering. Regular cleaning with mild soap maintains the finish, and professional refinishing services can restore original luster if desired.'
          : `${simplifiedProductName} memorials are built for lasting durability in outdoor conditions. With proper care and maintenance, expect a lifespan of 50+ years. The materials are selected specifically for weather resistance and longevity in cemetery environments.`
      },
      {
        question: "What's the typical lead time and delivery process?",
        answer: `${leadTimeText} After you finalize your design online, we provide detailed proofs for your approval before manufacturing begins. ${shippingText} Professional installation can be arranged through our network of certified installers. We'll keep you updated throughout the entire process.`
      }
    ];
    
    return faqs;
  };
  
  const faq = generateFAQ();
  
  // Get related designs for internal linking
  const relatedDesigns = getRelatedDesigns(design, 6);
  const sameCategoryDesigns = getDesignsByCategory(design.category).filter(d => d.id !== design.id).slice(0, 4);

  return (
    <div className="bg-white border-t border-slate-200 mt-12">
      <div className="container mx-auto px-8 py-12 max-w-7xl">
        {/* Intro Section */}
        <div className="mb-12">
          <p className="text-lg text-slate-700 leading-relaxed font-light">
            {generateIntro()}
          </p>
        </div>

        {/* Design Notes Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-serif font-light text-slate-900 mb-6">Design Notes & Recommendations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50/50 rounded-lg p-6 border border-blue-200/50">
              <h3 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Verse & Inscription Guidance
              </h3>
              <p className="text-slate-700 text-sm font-light mb-2">
                This design works best with <strong>{designNotes.verseLength}</strong> inscriptions.
              </p>
              <p className="text-slate-600 text-sm font-light">
                {designNotes.fontGuidance}
              </p>
            </div>

            <div className="bg-purple-50/50 rounded-lg p-6 border border-purple-200/50">
              <h3 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                Motif Positioning
              </h3>
              <p className="text-slate-700 text-sm font-light">
                {designNotes.motifGuidance}
              </p>
            </div>

            {designNotes.photoGuidance && (
              <div className="bg-green-50/50 rounded-lg p-6 border border-green-200/50 md:col-span-2">
                <h3 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Photo Guidelines
                </h3>
                <p className="text-slate-700 text-sm font-light">
                  {designNotes.photoGuidance}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Specifications Table */}
        <div className="mb-12">
          <h2 className="text-2xl font-serif font-light text-slate-900 mb-6">Technical Specifications</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
              <tbody>
                {Object.entries(specs).map(([key, value], index) => (
                  <tr key={key} className={index % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                    <td className="px-6 py-4 font-medium text-slate-900 border-b border-slate-200 w-1/3">
                      {key}
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-light border-b border-slate-200">
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Compliance Note */}
        <div className="mb-12">
          <div className="bg-amber-50/50 rounded-lg p-8 border border-amber-200/50">
            <h2 className="text-2xl font-serif font-light text-slate-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              {compliance.title}
            </h2>
            <p className="text-slate-700 leading-relaxed font-light">
              {compliance.content}
            </p>
          </div>
        </div>

        {/* Care & Longevity */}
        <div className="mb-12">
          <div className="bg-slate-50 rounded-lg p-8 border border-slate-200">
            <h2 className="text-2xl font-serif font-light text-slate-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {care.title}
            </h2>
            <p className="text-slate-700 leading-relaxed font-light">
              {care.content}
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-serif font-light text-slate-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faq.map((item, index) => (
              <details 
                key={index} 
                className="bg-white rounded-lg border border-slate-200 overflow-hidden group"
              >
                <summary className="px-6 py-4 cursor-pointer font-medium text-slate-900 hover:bg-slate-50 transition-colors flex justify-between items-center">
                  <span className="font-light">{item.question}</span>
                  <svg 
                    className="w-5 h-5 text-slate-400 transition-transform group-open:rotate-180" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-4 pt-2">
                  <p className="text-slate-700 font-light leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Related Designs */}
        {relatedDesigns.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-serif font-light text-slate-900 mb-6">Similar Designs You May Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {relatedDesigns.slice(0, 6).map((relatedDesign) => (
                <Link
                  key={relatedDesign.id}
                  href={`/designs/${relatedDesign.productSlug}/${relatedDesign.category}/${relatedDesign.slug}`}
                  className="group block bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-lg transition-all"
                >
                  {relatedDesign.preview && (
                    <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                      <img
                        src={relatedDesign.preview}
                        alt={relatedDesign.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="p-3">
                    <h3 className="font-light text-sm text-slate-900 group-hover:text-slate-600 transition-colors">
                      {relatedDesign.shapeName 
                        ? `${formatShapeName(relatedDesign.shapeName)} - ${relatedDesign.title}`
                        : relatedDesign.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {DESIGN_CATEGORIES[relatedDesign.category]?.name || relatedDesign.category}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Category Exploration */}
        {sameCategoryDesigns.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-serif font-light text-slate-900 mb-4">
              More {categoryTitle} Designs
            </h2>
            <p className="text-slate-600 font-light mb-6">
              Explore our collection of {categoryTitle.toLowerCase()} designs in various styles and materials.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {sameCategoryDesigns.map((catDesign) => (
                <Link
                  key={catDesign.id}
                  href={`/designs/${catDesign.productSlug}/${catDesign.category}/${catDesign.slug}`}
                  className="group block bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-lg transition-all"
                >
                  {catDesign.preview && (
                    <div className="aspect-square bg-slate-100 overflow-hidden">
                      <img
                        src={catDesign.preview}
                        alt={catDesign.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="p-2">
                    <p className="text-xs text-slate-600 font-light group-hover:text-slate-900 transition-colors line-clamp-2">
                      {catDesign.shapeName 
                        ? `${formatShapeName(catDesign.shapeName)} - ${catDesign.title}`
                        : catDesign.title}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link
                href={`/designs/${productSlug}/${design.category}`}
                className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-light transition-colors"
              >
                View all {categoryTitle} designs
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        )}

        {/* Helpful Resources */}
        <div className="mb-12">
          <h2 className="text-2xl font-serif font-light text-slate-900 mb-6">Helpful Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/designs/guide/design-your-own"
              className="flex items-start gap-4 p-4 bg-white rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all group"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">Design Guide</h3>
                <p className="text-sm text-slate-600 font-light mt-1">Learn how to customize your memorial design online</p>
              </div>
            </Link>

            <Link
              href="/designs/guide/pricing"
              className="flex items-start gap-4 p-4 bg-white rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all group"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-slate-900 group-hover:text-green-600 transition-colors">Pricing Guide</h3>
                <p className="text-sm text-slate-600 font-light mt-1">Understand memorial pricing and what's included</p>
              </div>
            </Link>

            <Link
              href="/designs/guide/cemetery-regulations"
              className="flex items-start gap-4 p-4 bg-white rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all group"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-slate-900 group-hover:text-amber-600 transition-colors">Cemetery Regulations</h3>
                <p className="text-sm text-slate-600 font-light mt-1">Important information about cemetery compliance</p>
              </div>
            </Link>

            <Link
              href="/designs/guide/buying-guide"
              className="flex items-start gap-4 p-4 bg-white rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all group"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-slate-900 group-hover:text-purple-600 transition-colors">Buying Guide</h3>
                <p className="text-sm text-slate-600 font-light mt-1">Step-by-step guide to ordering your memorial</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center py-8">
          <a
            href={editUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all text-lg font-light uppercase tracking-wider shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Customize This Design
          </a>
          <p className="text-slate-600 text-sm mt-4 font-light">
            Free proofing • Fast delivery • 10-year warranty
          </p>
        </div>
      </div>
    </div>
  );
}
