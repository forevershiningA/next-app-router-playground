/**
 * Dynamic SVG Preview Generator for Virtual Designer Assistant.
 * Generates photorealistic, vector-sharp memorial previews directly from DesignerSnapshot.
 * Completely deterministic, executes in < 5ms with 0 external API dependencies.
 */

import type { DesignerSnapshot, SavedInscription } from './project-schemas';

function esc(s: string | number | undefined | null): string {
  if (s === undefined || s === null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const CROSS_PATH =
  'M302.45,98h6.25c13.12,6.47,25.5,15.41,33.35,28a57.53,57.53,0,0,1,8.16,39.4c8.86-1.18,18.42.07,25.79,5.45,15.15,10.95,19.72,34.22,9.26,49.88-7.87-3.3-16.53-7.32-25.22-5-8.78,2.92-12.43,12.45-14.75,20.59-5.5,21.67-3.83,44.24-3.5,66.36,20.35.32,41,1.47,61-2.85,7.1-1.75,14.51-3.78,20.21-8.61A16.94,16.94,0,0,0,429,278c0-7.06-3-13.6-5.66-20,15.25-9.81,37.44-6.17,48.82,7.88,6.13,7.56,7.85,17.83,6.32,27.27a58.08,58.08,0,0,1,39.27,8c12.75,7.79,21.77,20.33,28.23,33.57v6.23c-6.46,13.33-15.55,25.92-28.4,33.71a58,58,0,0,1-39.1,7.84c1.6,9.75-.34,20.41-6.93,28-11.57,13.4-33.31,16.86-48.22,7.05,3.47-8,7.51-16.95,4.74-25.78C425.17,383.2,416,379.46,408,377.13c-21.47-6-44-4.46-66-4.19-.41,45-.27,90.08-1.12,135.11-.23,13,.12,26.11,2.23,39,1.26,7.33,3.22,14.63,6.84,21.17,2.89,5.1,8,9.38,14,9.73,7.73.51,14.94-2.82,21.94-5.62,10,15.39,6,37.84-8.36,49.1-7.48,5.94-17.54,7.46-26.8,6.2a57.41,57.41,0,0,1-9.93,42c-7.84,11.29-19.42,19.3-31.57,25.37h-6.27c-14.32-7-27.73-17.12-35.39-31.39a57.92,57.92,0,0,1-6.17-36c-9,1.21-18.79-.16-26.22-5.76-14.79-11.08-19.22-34.13-8.76-49.58,7.72,3.31,16.17,7.11,24.73,5.15,8.55-2.33,12.7-11.11,15.18-18.86,5.15-17.32,5.17-35.63,4.91-53.54-.79-44-.69-88.06-1.1-132.08-20.68-.3-41.69-1.52-62,3.11-6.87,1.76-14,3.85-19.44,8.64A16.69,16.69,0,0,0,183,396.94c-.28,7.31,2.87,14.09,5.63,20.67-14.94,9.69-36.61,6.31-48.19-7.09-6.6-7.61-8.55-18.28-6.95-28A58.06,58.06,0,0,1,89,370.92C78.87,363.16,71.64,352.33,66,341v-6.28C72.42,321.5,81.43,309,94.14,301.18a58.06,58.06,0,0,1,39.36-8c-1.64-9.93.43-20.81,7.3-28.44,11.67-13.07,33-16.24,47.84-6.71-3.39,8.08-7.55,17-4.71,25.92,2.85,8.32,11.71,12.08,19.49,14.42,21.68,6.18,44.5,4.62,66.77,4.36.33-22,1.73-44.37-3.83-65.85-2.43-8.33-6.13-18-15.1-21.09-8.76-2.4-17.49,1.61-25.43,4.94C215.46,205.1,219.92,182,234.94,171c7.4-5.45,17-6.77,26-5.54a57.46,57.46,0,0,1,4.88-33.49c7.31-15.55,21.5-26.58,36.66-33.92';

const SERPENTINE_PATH_D =
  'M400 39.6 L400 400 L0 400 L0 39.6 C25.65 38.4 51 34.6 75.85 28.3 C127.65 9.9 156.2 3.3 185.35 0 C214.65 0 243.8 3.3 272.35 9.9 C324.15 28.3 349 34.6 374.35 38.4 Z';

export interface SvgPreviewOptions {
  title?: string;
  width?: number;
  height?: number;
}

/**
 * Generates an SVG string representation of a memorial design snapshot.
 */
export function generateDraftSvgPreview(
  snapshot: DesignerSnapshot,
  options: SvgPreviewOptions = {},
): string {
  const pId = String(snapshot.productId || '124');
  const inscriptions = snapshot.inscriptions || [];

  if (pId === '5') {
    return renderBronzePlaqueSvg(snapshot, inscriptions, options);
  }

  if (pId === '101') {
    return renderFullMonumentSvg(snapshot, inscriptions, options);
  }

  if (pId === '4') {
    return renderLaserEtchedSvg(snapshot, inscriptions, options);
  }

  // Default: Product 124 (Traditional / Companion Headstone)
  return renderTraditionalHeadstoneSvg(snapshot, inscriptions, options);
}

/**
 * Returns a base64 encoded data URI suitable for <img src="..." />
 */
export function generateDraftSvgDataUri(
  snapshot: DesignerSnapshot,
  options: SvgPreviewOptions = {},
): string {
  const svg = generateDraftSvgPreview(snapshot, options);
  const base64 = Buffer.from(svg, 'utf-8').toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

// ============================================================================
// 1. LASER-ETCHED BLACK GRANITE (Product 4)
// ============================================================================
function renderLaserEtchedSvg(
  snapshot: DesignerSnapshot,
  inscriptions: SavedInscription[],
  options: SvgPreviewOptions,
): string {
  const title = options.title || snapshot.metadata?.currentProjectTitle || 'Laser-Etched Granite Memorial';

  // Extract lines
  const headerLine = inscriptions.find((i) => i.id?.includes('header'))?.text || 'IN LOVING MEMORY';
  const nameLine = inscriptions.find((i) => i.id?.includes('name'))?.text || 'HELEN DAVIS';
  const datesLine = inscriptions.find((i) => i.id?.includes('date'))?.text || '1948 — 2020';
  const epitaphLine = inscriptions.find((i) => i.id?.includes('epitaph') || i.id?.includes('bottom'))?.text || 'Forever in our hearts';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 680" width="800" height="680">
  <defs>
    <!-- Studio Ambient Background Gradient -->
    <linearGradient id="studioBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#181512" />
      <stop offset="60%" stop-color="#120f0d" />
      <stop offset="100%" stop-color="#0a0807" />
    </linearGradient>

    <!-- Floor Shadow / Pedestal Depth -->
    <radialGradient id="floorShadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(0,0,0,0.85)" />
      <stop offset="65%" stop-color="rgba(0,0,0,0.4)" />
      <stop offset="100%" stop-color="rgba(0,0,0,0)" />
    </radialGradient>

    <!-- Polished Black Granite Gradient -->
    <linearGradient id="blackGranite" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#242220" />
      <stop offset="30%" stop-color="#161413" />
      <stop offset="70%" stop-color="#1a1816" />
      <stop offset="100%" stop-color="#0f0e0d" />
    </linearGradient>

    <!-- Polished Edge Chamfer Highlight -->
    <linearGradient id="chamferLight" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.35)" />
      <stop offset="15%" stop-color="rgba(255,255,255,0.08)" />
      <stop offset="85%" stop-color="rgba(255,255,255,0.02)" />
      <stop offset="100%" stop-color="rgba(255,255,255,0.22)" />
    </linearGradient>

    <!-- Laser Etching White Glow Filter -->
    <filter id="laserGlow" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur stdDeviation="0.8" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <!-- Studio Background -->
  <rect width="800" height="680" fill="url(#studioBg)" />

  <!-- Ground Plane Shadow -->
  <ellipse cx="400" cy="625" rx="310" ry="38" fill="url(#floorShadow)" />

  <!-- Base (Cokół z granitu) -->
  <g id="granite-base" transform="translate(140, 540)">
    <!-- Base Body -->
    <rect x="0" y="0" width="520" height="75" rx="3" fill="url(#blackGranite)" stroke="#3a3632" stroke-width="1.5" />
    <!-- Polished top bevel reflection -->
    <polygon points="0,0 520,0 514,6 6,6" fill="url(#chamferLight)" />
    <!-- Front subtle highlight -->
    <line x1="2" y1="2" x2="518" y2="2" stroke="rgba(255,255,255,0.25)" stroke-width="1" />
  </g>

  <!-- Headstone Upright Die (Stela Serpentine) -->
  <g id="granite-die" transform="translate(200, 95)">
    <!-- Serpentine Stone Silhouette scaled to 400x450 -->
    <g transform="scale(1, 1.125)">
      <path d="${SERPENTINE_PATH_D}" fill="url(#blackGranite)" stroke="#3d3834" stroke-width="2" />
      <path d="${SERPENTINE_PATH_D}" fill="url(#chamferLight)" />
    </g>

    <!-- Inner subtle polished border line -->
    <g transform="translate(18, 22) scale(0.91, 1.03)">
      <path d="${SERPENTINE_PATH_D}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1.2" />
    </g>

    <!-- Laser-Etched Religious Cross Motif -->
    <g transform="translate(172, 45) scale(0.095)" fill="#ffffff" filter="url(#laserGlow)">
      <path d="${CROSS_PATH}" />
    </g>

    <!-- Laser Inscriptions (Personalized Text) -->
    <!-- Header -->
    <text x="200" y="155"
          text-anchor="middle"
          fill="#f4f4f4"
          font-family="'Cinzel', 'Garamond', 'Times New Roman', serif"
          font-size="15"
          font-weight="600"
          letter-spacing="3"
          filter="url(#laserGlow)">${esc(headerLine)}</text>

    <!-- Name (Focal Point) -->
    <text x="200" y="222"
          text-anchor="middle"
          fill="#ffffff"
          font-family="'Garamond', 'Cinzel', 'Times New Roman', serif"
          font-size="29"
          font-weight="700"
          letter-spacing="2"
          filter="url(#laserGlow)">${esc(nameLine)}</text>

    <!-- Dates -->
    <text x="200" y="272"
          text-anchor="middle"
          fill="#ebebeb"
          font-family="'Garamond', 'Times New Roman', serif"
          font-size="17"
          font-weight="500"
          letter-spacing="2.5"
          filter="url(#laserGlow)">${esc(datesLine)}</text>

    <!-- Decorative Divider Line -->
    <line x1="140" y1="305" x2="260" y2="305" stroke="rgba(255,255,255,0.3)" stroke-width="1" />
    <circle cx="200" cy="305" r="2.5" fill="#ffffff" />

    <!-- Epitaph / Dedication (Script) -->
    <text x="200" y="348"
          text-anchor="middle"
          fill="#ffffff"
          font-family="'Great Vibes', 'Brush Script MT', cursive, serif"
          font-size="22"
          font-style="italic"
          filter="url(#laserGlow)">${esc(epitaphLine)}</text>
  </g>

  <!-- Title & Specification Footnote -->
  <g transform="translate(30, 650)">
    <text x="0" y="0" fill="#a89d8d" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="500">
      African Black Polished Granite • High-Contrast White Laser Etch • 700 × 800 mm
    </text>
  </g>
  <g transform="translate(770, 650)">
    <text x="0" y="0" text-anchor="end" fill="#cfac6c" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="600" letter-spacing="0.5">
      FOREVER SHINING 3D STUDIO
    </text>
  </g>
</svg>`;
}

// ============================================================================
// 2. CAST BRONZE PLAQUE (Product 5)
// ============================================================================
function renderBronzePlaqueSvg(
  snapshot: DesignerSnapshot,
  inscriptions: SavedInscription[],
  options: SvgPreviewOptions,
): string {
  const title = options.title || snapshot.metadata?.currentProjectTitle || 'Cast Bronze Memorial Plaque';

  // Extract lines strictly from snapshot inscriptions without inventing dates or subtitles
  const items = inscriptions.length > 0
    ? inscriptions
    : [
        { text: 'IN MEMORY OF' },
        { text: snapshot.metadata?.currentProjectTitle?.replace(/^Bronze Memorial Plaque —\s*/i, '') || 'HONORED MEMORY' },
      ];

  const count = items.length;
  // Calculate dynamic vertical Y coordinates (SVG viewBox is 800x600, center is 400, vertical safe zone is 210..435)
  let yCoords: number[] = [];
  if (count <= 1) {
    yCoords = [300];
  } else if (count === 2) {
    yCoords = [260, 335];
  } else if (count === 3) {
    yCoords = [235, 305, 380];
  } else if (count === 4) {
    yCoords = [222, 282, 342, 404];
  } else if (count === 5) {
    yCoords = [215, 268, 318, 368, 418];
  } else {
    yCoords = [210, 252, 292, 332, 372, 418];
  }

  const renderedLines = items.map((item, idx) => {
    const text = item.text || '';
    const y = yCoords[idx] ?? (210 + idx * 40);
    const id = ('id' in item && typeof (item as any).id === 'string') ? (item as any).id : '';

    // Header line (typically index 0 or id with header)
    if (idx === 0 || id.includes('header')) {
      const fontSize = count <= 2 ? 18 : 15;
      return `  <!-- Header -->
  <text x="400" y="${y}"
        text-anchor="middle"
        fill="url(#bronzeRim)"
        font-family="'Cinzel', 'Garamond', serif"
        font-size="${fontSize}"
        font-weight="600"
        letter-spacing="3"
        filter="url(#bronzeBevel)">${esc(text)}</text>`;
    }

    // Name / Main Subject (index 1 or id with person/name)
    if (idx === 1 || id.includes('person') || id.includes('name')) {
      const len = text.length;
      const fontSize = len > 28 ? 22 : len > 20 ? 25 : count <= 2 ? 30 : 28;
      return `  <!-- Recipient / Subject -->
  <text x="400" y="${y}"
        text-anchor="middle"
        fill="#f8e0a8"
        font-family="'Garamond', 'Cinzel', serif"
        font-size="${fontSize}"
        font-weight="700"
        letter-spacing="2"
        filter="url(#bronzeBevel)">${esc(text)}</text>`;
    }

    // Dates line
    if (id.includes('dates') || /\b\d{4}\b/.test(text)) {
      return `  <!-- Dates -->
  <text x="400" y="${y}"
        text-anchor="middle"
        fill="#f0d399"
        font-family="'Garamond', serif"
        font-size="17"
        font-weight="500"
        letter-spacing="2"
        filter="url(#bronzeBevel)">${esc(text)}</text>`;
    }

    // Role line
    if (id.includes('role')) {
      return `  <!-- Role / Title -->
  <text x="400" y="${y}"
        text-anchor="middle"
        fill="url(#bronzeRim)"
        font-family="'Garamond', serif"
        font-size="14.5"
        font-weight="600"
        letter-spacing="1.5"
        filter="url(#bronzeBevel)">${esc(text)}</text>`;
    }

    // Bottom quote / epitaph
    if (idx === count - 1 || id.includes('bottom') || id.includes('epitaph') || text.startsWith('„') || text.startsWith('"')) {
      return `  <!-- Bottom Tribute -->
  <text x="400" y="${y}"
        text-anchor="middle"
        fill="url(#bronzeRim)"
        font-family="'Garamond', serif"
        font-size="13.5"
        font-weight="600"
        letter-spacing="1.5"
        filter="url(#bronzeBevel)">${esc(text)}</text>`;
    }

    // General Subtitle / Inscription
    return `  <!-- Inscription Line -->
  <text x="400" y="${y}"
        text-anchor="middle"
        fill="url(#bronzeRim)"
        font-family="'Garamond', serif"
        font-size="${text.length > 24 ? '12.5' : '14'}"
        font-weight="600"
        letter-spacing="${text.length > 24 ? '1' : '1.5'}"
        filter="url(#bronzeBevel)">${esc(text)}</text>`;
  }).join('\n\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs>
    <!-- Studio Background -->
    <linearGradient id="bronzeStudio" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#231c16" />
      <stop offset="60%" stop-color="#18130e" />
      <stop offset="100%" stop-color="#0e0a07" />
    </linearGradient>

    <!-- Cast Bronze Background Texture -->
    <radialGradient id="patinaBg" cx="45%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#3d2414" />
      <stop offset="50%" stop-color="#2a170b" />
      <stop offset="100%" stop-color="#190e06" />
    </radialGradient>

    <!-- Raised Hand-Polished Bronze Rim -->
    <linearGradient id="bronzeRim" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f3d48f" />
      <stop offset="25%" stop-color="#cfac6c" />
      <stop offset="50%" stop-color="#9a6e35" />
      <stop offset="75%" stop-color="#d9b673" />
      <stop offset="100%" stop-color="#7a5423" />
    </linearGradient>

    <!-- Cast Bronze Lettering Glow / Bevel Effect -->
    <filter id="bronzeBevel" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="1" dy="1.5" stdDeviation="0.8" flood-color="#000000" flood-opacity="0.8" />
    </filter>
  </defs>

  <!-- Studio Background -->
  <rect width="800" height="600" fill="url(#bronzeStudio)" />

  <!-- Shadow beneath plaque -->
  <rect x="110" y="95" width="588" height="428" rx="14" fill="rgba(0,0,0,0.7)" filter="blur(10px)" />

  <!-- Outer Bronze Body (Border 4) -->
  <rect x="110" y="90" width="580" height="420" rx="10" fill="url(#bronzeRim)" stroke="#4a2e15" stroke-width="2" />

  <!-- Inner Patinated Recess -->
  <rect x="126" y="106" width="548" height="388" rx="6" fill="url(#patinaBg)" stroke="#221207" stroke-width="2" />

  <!-- Inner Raised Fine Line -->
  <rect x="136" y="116" width="528" height="368" rx="4" fill="none" stroke="url(#bronzeRim)" stroke-width="2" />

  <!-- Cross Motif (Top Center) -->
  <g transform="translate(382, 130) scale(0.075)" fill="url(#bronzeRim)" filter="url(#bronzeBevel)">
    <path d="${CROSS_PATH}" />
  </g>

  <!-- Cast Inscriptions (Raised Gilded Luster) -->
${renderedLines}

  <!-- Mounting Screws (Lugs) in 4 Corners -->
  <circle cx="145" cy="125" r="4" fill="#1b1008" stroke="url(#bronzeRim)" stroke-width="1.5" />
  <circle cx="655" cy="125" r="4" fill="#1b1008" stroke="url(#bronzeRim)" stroke-width="1.5" />
  <circle cx="145" cy="475" r="4" fill="#1b1008" stroke="url(#bronzeRim)" stroke-width="1.5" />
  <circle cx="655" cy="475" r="4" fill="#1b1008" stroke="url(#bronzeRim)" stroke-width="1.5" />

  <!-- Footnote -->
  <g transform="translate(30, 575)">
    <text x="0" y="0" fill="#a89d8d" font-family="system-ui, -apple-system, sans-serif" font-size="11">
      True Cast Bronze Plaque • Hand Polished Rim • Lugs with Studs • 380 × 280 mm
    </text>
  </g>
  <g transform="translate(770, 575)">
    <text x="0" y="0" text-anchor="end" fill="#cfac6c" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="600">
      FOREVER SHINING 3D STUDIO
    </text>
  </g>
</svg>`;
}

// ============================================================================
// 3. TRADITIONAL / COMPANION HEADSTONE (Product 124)
// ============================================================================
function renderTraditionalHeadstoneSvg(
  snapshot: DesignerSnapshot,
  inscriptions: SavedInscription[],
  options: SvgPreviewOptions,
): string {
  const isCompanion = inscriptions.some((i) => i.id?.includes('p2') || (i.xPos !== undefined && Math.abs(i.xPos) > 50));

  const headerLine = inscriptions.find((i) => i.id?.includes('header'))?.text || 'IN LOVING MEMORY';

  // Gold Leaf Lettering Gradient
  const goldGradient = `
    <linearGradient id="goldLeaf" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fff0c2" />
      <stop offset="40%" stop-color="#f3d48f" />
      <stop offset="70%" stop-color="#d4af37" />
      <stop offset="100%" stop-color="#a37c22" />
    </linearGradient>
  `;

  let inscriptionMarkup = '';

  if (isCompanion) {
    const leftName = inscriptions.find((i) => i.id?.includes('p1-name'))?.text || 'JOHN SMITH';
    const leftDates = inscriptions.find((i) => i.id?.includes('p1-dates'))?.text || '1934 — 2018';
    const rightName = inscriptions.find((i) => i.id?.includes('p2-name'))?.text || 'MARY SMITH';
    const rightDates = inscriptions.find((i) => i.id?.includes('p2-dates'))?.text || '1936 — 2023';
    const bottomText = inscriptions.find((i) => i.id?.includes('bottom'))?.text || 'Together in Eternal Peace';

    inscriptionMarkup = `
      <!-- Left Person -->
      <g transform="translate(110, 220)">
        <text x="0" y="0" text-anchor="middle" fill="url(#goldLeaf)" font-family="'Cinzel', 'Garamond', serif" font-size="18" font-weight="700" letter-spacing="1.5">${esc(leftName)}</text>
        <text x="0" y="32" text-anchor="middle" fill="url(#goldLeaf)" font-family="'Garamond', serif" font-size="14" letter-spacing="1">${esc(leftDates)}</text>
      </g>
      <!-- Center Divider -->
      <line x1="200" y1="205" x2="200" y2="270" stroke="rgba(212,175,55,0.4)" stroke-width="1" />
      <!-- Right Person -->
      <g transform="translate(290, 220)">
        <text x="0" y="0" text-anchor="middle" fill="url(#goldLeaf)" font-family="'Cinzel', 'Garamond', serif" font-size="18" font-weight="700" letter-spacing="1.5">${esc(rightName)}</text>
        <text x="0" y="32" text-anchor="middle" fill="url(#goldLeaf)" font-family="'Garamond', serif" font-size="14" letter-spacing="1">${esc(rightDates)}</text>
      </g>
      <!-- Bottom Epitaph -->
      <text x="200" y="340" text-anchor="middle" fill="url(#goldLeaf)" font-family="'Great Vibes', cursive, serif" font-size="20" font-style="italic">${esc(bottomText)}</text>
    `;
  } else {
    const singleName = inscriptions.find((i) => i.id?.includes('name'))?.text || 'JOHN SMITH';
    const dates = inscriptions.find((i) => i.id?.includes('dates') || i.id?.includes('date'))?.text || '1940 — 2019';
    const bottomText = inscriptions.find((i) => i.id?.includes('bottom') || i.id?.includes('epitaph'))?.text || 'Forever in our hearts';

    inscriptionMarkup = `
      <text x="200" y="225" text-anchor="middle" fill="url(#goldLeaf)" font-family="'Cinzel', 'Garamond', serif" font-size="28" font-weight="700" letter-spacing="2">${esc(singleName)}</text>
      <text x="200" y="270" text-anchor="middle" fill="url(#goldLeaf)" font-family="'Garamond', serif" font-size="17" letter-spacing="2">${esc(dates)}</text>
      <text x="200" y="340" text-anchor="middle" fill="url(#goldLeaf)" font-family="'Great Vibes', cursive, serif" font-size="22" font-style="italic">${esc(bottomText)}</text>
    `;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 680" width="800" height="680">
  <defs>
    <linearGradient id="tradStudio" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#181512" />
      <stop offset="60%" stop-color="#120f0d" />
      <stop offset="100%" stop-color="#0a0807" />
    </linearGradient>
    <radialGradient id="tradFloorShadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(0,0,0,0.85)" />
      <stop offset="65%" stop-color="rgba(0,0,0,0.4)" />
      <stop offset="100%" stop-color="rgba(0,0,0,0)" />
    </radialGradient>
    <linearGradient id="africanBlack" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#262422" />
      <stop offset="35%" stop-color="#171514" />
      <stop offset="70%" stop-color="#1b1917" />
      <stop offset="100%" stop-color="#100f0e" />
    </linearGradient>
    <linearGradient id="tradChamfer" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.3)" />
      <stop offset="15%" stop-color="rgba(255,255,255,0.06)" />
      <stop offset="85%" stop-color="rgba(255,255,255,0.02)" />
      <stop offset="100%" stop-color="rgba(255,255,255,0.2)" />
    </linearGradient>
    ${goldGradient}
  </defs>

  <rect width="800" height="680" fill="url(#tradStudio)" />
  <ellipse cx="400" cy="625" rx="340" ry="38" fill="url(#tradFloorShadow)" />

  <!-- Base with Twin Vases (K2213) -->
  <g id="base-with-vases" transform="translate(100, 540)">
    <rect x="0" y="0" width="600" height="75" rx="3" fill="url(#africanBlack)" stroke="#3a3632" stroke-width="1.5" />
    <polygon points="0,0 600,0 592,6 8,6" fill="url(#tradChamfer)" />

    <!-- Left Granite Vase K2213 -->
    <g transform="translate(35, -35)">
      <rect x="0" y="0" width="55" height="45" rx="4" fill="url(#africanBlack)" stroke="#4a443e" stroke-width="1.2" />
      <ellipse cx="27.5" cy="5" rx="22" ry="6" fill="#111111" stroke="url(#goldLeaf)" stroke-width="1" />
    </g>

    <!-- Right Granite Vase K2213 -->
    <g transform="translate(510, -35)">
      <rect x="0" y="0" width="55" height="45" rx="4" fill="url(#africanBlack)" stroke="#4a443e" stroke-width="1.2" />
      <ellipse cx="27.5" cy="5" rx="22" ry="6" fill="#111111" stroke="url(#goldLeaf)" stroke-width="1" />
    </g>
  </g>

  <!-- Headstone Upright Die -->
  <g id="die" transform="translate(200, 95)">
    <g transform="scale(1, 1.125)">
      <path d="${SERPENTINE_PATH_D}" fill="url(#africanBlack)" stroke="#3d3834" stroke-width="2" />
      <path d="${SERPENTINE_PATH_D}" fill="url(#tradChamfer)" />
    </g>

    <!-- Gold Center Cross -->
    <g transform="translate(172, 45) scale(0.095)" fill="url(#goldLeaf)">
      <path d="${CROSS_PATH}" />
    </g>

    <!-- Header -->
    <text x="200" y="160" text-anchor="middle" fill="url(#goldLeaf)" font-family="'Cinzel', 'Garamond', serif" font-size="15" font-weight="600" letter-spacing="3">${esc(headerLine)}</text>

    <!-- Person Inscriptions -->
    ${inscriptionMarkup}
  </g>

  <!-- Footnote -->
  <g transform="translate(30, 650)">
    <text x="0" y="0" fill="#a89d8d" font-family="system-ui, -apple-system, sans-serif" font-size="11">
      African Black Polished Granite • 23ct Gold Leaf Inscriptions • Twin Base Vases
    </text>
  </g>
  <g transform="translate(770, 650)">
    <text x="0" y="0" text-anchor="end" fill="#cfac6c" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="600">
      FOREVER SHINING 3D STUDIO
    </text>
  </g>
</svg>`;
}

// ============================================================================
// 4. FULL MONUMENT (Product 101)
// ============================================================================
function renderFullMonumentSvg(
  snapshot: DesignerSnapshot,
  inscriptions: SavedInscription[],
  options: SvgPreviewOptions,
): string {
  const title = options.title || snapshot.metadata?.currentProjectTitle || 'Traditional Full Monument';

  const baseLine = inscriptions.find((i) => i.target === 'base')?.text || 'RODZINA KOWALSKICH';
  const ledgerLine = inscriptions.find((i) => i.target === 'ledger')?.text || 'PAMIĘĆ O WAS NIGDY NIE ZGAŚNIE';
  const leftName = inscriptions.find((i) => i.id?.includes('p1-name'))?.text || 'STANISŁAW KOWALSKI';
  const rightName = inscriptions.find((i) => i.id?.includes('p2-name'))?.text || 'STANISŁAWA KOWALSKA';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 700" width="800" height="700">
  <defs>
    <linearGradient id="monuStudio" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#181512" />
      <stop offset="60%" stop-color="#120f0d" />
      <stop offset="100%" stop-color="#0a0807" />
    </linearGradient>
    <linearGradient id="monuBlack" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#282522" />
      <stop offset="50%" stop-color="#161412" />
      <stop offset="100%" stop-color="#100e0c" />
    </linearGradient>
    <linearGradient id="monuGold" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fff0c2" />
      <stop offset="40%" stop-color="#f3d48f" />
      <stop offset="70%" stop-color="#d4af37" />
      <stop offset="100%" stop-color="#a37c22" />
    </linearGradient>
  </defs>

  <rect width="800" height="700" fill="url(#monuStudio)" />

  <!-- Kerbset Borders (Ramy grobowca) -->
  <polygon points="120,440 680,440 730,640 70,640" fill="#141210" stroke="#3d3731" stroke-width="2" />

  <!-- Ledger Slab (Płyta główna) -->
  <polygon points="150,445 650,445 695,625 105,625" fill="url(#monuBlack)" stroke="#443e37" stroke-width="1.5" />
  <text x="400" y="540" text-anchor="middle" fill="url(#monuGold)" font-family="'Great Vibes', cursive, serif" font-size="23" font-style="italic">
    ${esc(ledgerLine)}
  </text>

  <!-- Base (Cokół z nazwiskiem rodziny) -->
  <g transform="translate(180, 375)">
    <rect x="0" y="0" width="440" height="65" rx="3" fill="url(#monuBlack)" stroke="#3a352f" stroke-width="1.5" />
    <text x="220" y="42" text-anchor="middle" fill="url(#monuGold)" font-family="'Cinzel', 'Garamond', serif" font-size="21" font-weight="700" letter-spacing="3">
      ${esc(baseLine)}
    </text>

    <!-- Twin Vases -->
    <g transform="translate(15, -28)">
      <rect x="0" y="0" width="45" height="36" rx="3" fill="url(#monuBlack)" stroke="#443e37" stroke-width="1" />
      <ellipse cx="22.5" cy="4" rx="18" ry="5" fill="#111" stroke="url(#monuGold)" stroke-width="1" />
    </g>
    <g transform="translate(380, -28)">
      <rect x="0" y="0" width="45" height="36" rx="3" fill="url(#monuBlack)" stroke="#443e37" stroke-width="1" />
      <ellipse cx="22.5" cy="4" rx="18" ry="5" fill="#111" stroke="url(#monuGold)" stroke-width="1" />
    </g>
  </g>

  <!-- Upright Headstone Die (Stela) -->
  <g transform="translate(235, 60)">
    <g transform="scale(0.825, 0.78)">
      <path d="${SERPENTINE_PATH_D}" fill="url(#monuBlack)" stroke="#3d3731" stroke-width="2" />
    </g>
    <!-- Cross -->
    <g transform="translate(142, 28) scale(0.08)" fill="url(#monuGold)">
      <path d="${CROSS_PATH}" />
    </g>
    <text x="165" y="125" text-anchor="middle" fill="url(#monuGold)" font-family="'Cinzel', serif" font-size="14" letter-spacing="3">IN LOVING MEMORY</text>

    <!-- Left Person -->
    <text x="85" y="175" text-anchor="middle" fill="url(#monuGold)" font-family="'Cinzel', serif" font-size="13" font-weight="700">${esc(leftName)}</text>
    <!-- Right Person -->
    <text x="245" y="175" text-anchor="middle" fill="url(#monuGold)" font-family="'Cinzel', serif" font-size="13" font-weight="700">${esc(rightName)}</text>
  </g>

  <!-- Footnote -->
  <g transform="translate(30, 675)">
    <text x="0" y="0" fill="#a89d8d" font-family="system-ui, -apple-system, sans-serif" font-size="11">
      African Black Full Monument • Headstone, Base, Ledger &amp; Kerbs • 23ct Gold Leaf
    </text>
  </g>
  <g transform="translate(770, 675)">
    <text x="0" y="0" text-anchor="end" fill="#cfac6c" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="600">
      FOREVER SHINING 3D STUDIO
    </text>
  </g>
</svg>`;
}
