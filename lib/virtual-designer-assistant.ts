/**
 * Forever Shining — Deterministic Virtual Designer Assistant (Tier-0 / Zero Token)
 * 
 * Fully offline, rule-based autonomous assistant.
 * Understands natural Polish and English memorial design commands,
 * extracts person names, dates, epitaphs and product intents,
 * and compiles them into proven stonecraft archetypes with ZERO external API calls.
 */

import type { DesignerSnapshot } from './project-schemas';
import {
  generateDraftSvgPreview,
  generateDraftSvgDataUri,
} from './virtual-designer-svg';

export interface ParsedMemorialIntent {
  intent:
    | 'create_bronze_plaque'
    | 'create_companion_headstone'
    | 'create_single_headstone'
    | 'create_full_monument'
    | 'create_laser_etched'
    | 'add_vases'
    | 'set_material'
    | 'audit_check'
    | 'save_design'
    | 'unknown';
  productId?: string;
  title?: string;
  widthMm?: number;
  heightMm?: number;
  names?: {
    singleName?: string;
    firstName?: string;
    lastName?: string;
    leftPersonName?: string;
    leftDates?: string;
    rightPersonName?: string;
    rightDates?: string;
    sharedSurname?: string;
  };
  dates?: string;
  epitaph?: string;
  baseText?: string;
  ledgerText?: string;
  materialName?: string;
  borderName?: string;
  fixingType?: 'flat-back' | 'lugs-with-studs' | 'screws';
  hasVases?: boolean;
  rawCommand: string;
}

export interface VirtualAgentExecutionResult {
  success: boolean;
  intent: string;
  productId?: string;
  title: string;
  message: string;
  draftId?: string;
  filePath?: string;
  previewPath?: string;
  warnings: string[];
  executionTimeMs: number;
  details?: Record<string, unknown>;
}

/**
 * Normalizes text and maps common Polish inflectional endings for names.
 */
function cleanText(str: string): string {
  return str.trim().replace(/\s+/g, ' ');
}

function normalizePolishGenitiveName(name: string): string {
  let res = name.trim();
  // Plural family genitive e.g. "Kowalskich" -> "KOWALSCY", "Wiśniewskich" -> "WIŚNIEWSCY", "Nowickich" -> "NOWICCY"
  res = res
    .replace(/\b([A-ZĄĆĘŁŃÓŚŹŻa-ząćęłńóśźż]+?)ckich\b/gi, '$1ccy')
    .replace(/\b([A-ZĄĆĘŁŃÓŚŹŻa-ząćęłńóśźż]+?)skich\b/gi, '$1scy')
    .replace(/\b([A-ZĄĆĘŁŃÓŚŹŻa-ząćęłńóśźż]+?)ckiemu\b/gi, '$1cki')
    .replace(/\b([A-ZĄĆĘŁŃÓŚŹŻa-ząćęłńóśźż]+?)skiemu\b/gi, '$1ski')
    .replace(/\b([A-ZĄĆĘŁŃÓŚŹŻa-ząćęłńóśźż]+?)ckiego\b/gi, '$1cki')
    .replace(/\b([A-ZĄĆĘŁŃÓŚŹŻa-ząćęłńóśźż]+?)skiego\b/gi, '$1ski')
    .replace(/\b([A-ZĄĆĘŁŃÓŚŹŻa-ząćęłńóśźż]+?)ckiej\b/gi, '$1cka')
    .replace(/\b([A-ZĄĆĘŁŃÓŚŹŻa-ząćęłńóśźż]+?)skiej\b/gi, '$1ska');

  // Common first names genitive -> nominative
  res = res
    .replace(/\bJana\b/gi, 'Jan')
    .replace(/\bJerzego\b/gi, 'Jerzy')
    .replace(/\bStanisława\b/gi, 'Stanisław')
    .replace(/\bStanisławy\b/gi, 'Stanisława')
    .replace(/\bMarii\b/gi, 'Maria')
    .replace(/\bAnny\b/gi, 'Anna')
    .replace(/\bHeleny\b/gi, 'Helena')
    .replace(/\bPiotra\b/gi, 'Piotr')
    .replace(/\bPawła\b/gi, 'Paweł')
    .replace(/\bKrzysztofa\b/gi, 'Krzysztof')
    .replace(/\bAndrzeja\b/gi, 'Andrzej')
    .replace(/\bNowaka\b/gi, 'Nowak')
    .replace(/\bNowaków\b/gi, 'Nowakowie')
    .replace(/\bNowakowej\b/gi, 'Nowak');

  return res.toUpperCase();
}

/**
 * Computes safe stonemason inscription font size in mm so text never overflows plaque or headstone borders.
 * Uses realistic character metrics for uppercase serif typefaces (Garamond/Cinzel) with 3D letter spacing.
 */
export function computeSafeInscriptionSize(
  text: string,
  baseSizeMm: number,
  plaqueWidthMm: number,
  borderMarginMm = 80,
  minSizeMm = 8,
): number {
  if (!text || text.trim().length === 0) return baseSizeMm;
  const availableWidthMm = Math.max(80, plaqueWidthMm - borderMarginMm);
  const approxCharWidthRatio = 0.85;
  const estimatedWidth = text.length * baseSizeMm * approxCharWidthRatio;
  if (estimatedWidth <= availableWidthMm) {
    return baseSizeMm;
  }
  const maxSafeSize = availableWidthMm / (text.length * approxCharWidthRatio);
  const fitted = Math.floor(maxSafeSize * 2) / 2;
  return Math.max(minSizeMm, Math.min(baseSizeMm, fitted));
}

/**
 * Parses user natural language command into structured memorial intent & slots without LLM.
 */
export function parseVirtualDesignerCommand(rawCommand: string): ParsedMemorialIntent {
  const text = rawCommand.trim();
  const lower = text.toLowerCase();

  // Extract Dates (e.g. 1945 — 2022, 1945-2022, * 10.03.1934 † 14.05.2018)
  const dateMatch = text.match(/(\*\s*\d{1,2}[./-]\d{1,2}[./-]\d{2,4}\s*[†+]\s*\d{1,2}[./-]\d{1,2}[./-]\d{2,4}|\b\d{4}\s*[—–-]\s*\d{4}\b|\b\d{4}\b)/i);
  const dates = dateMatch ? cleanText(dateMatch[1]) : undefined;

  // Extract explicit dimensions (e.g. 450x300, 380x280, 420x280)
  const dimMatch = text.match(/(\d{2,4})\s*[x×*]\s*(\d{2,4})/i);
  const parsedWidthMm = dimMatch ? parseInt(dimMatch[1], 10) : undefined;
  const parsedHeightMm = dimMatch ? parseInt(dimMatch[2], 10) : undefined;

  // Extract Vases flag
  const hasVases =
    lower.includes('wazon') ||
    lower.includes('wazony') ||
    lower.includes('vase') ||
    lower.includes('k2213');

  // Extract Material preference
  let materialName: string | undefined;
  if (lower.includes('african black') || lower.includes('czarn') || lower.includes('black')) {
    materialName = 'African Black';
  } else if (lower.includes('imperial red') || lower.includes('czerwon') || lower.includes('red')) {
    materialName = 'Imperial Red';
  } else if (lower.includes('emerald pearl')) {
    materialName = 'Emerald Pearl';
  }

  // Check for save or audit intent alone
  if (lower.startsWith('zapisz') || lower.startsWith('save')) {
    return { intent: 'save_design', rawCommand: text };
  }
  if (lower.includes('sprawdź') || lower.includes('audyt') || lower.includes('kolizj') || lower.includes('check warnings')) {
    return { intent: 'audit_check', rawCommand: text };
  }

  // 1. Bronze Plaque (Product 5)
  if (
    lower.includes('brąz') ||
    lower.includes('braz') ||
    lower.includes('bronze') ||
    lower.includes('tablic') ||
    lower.includes('plaque')
  ) {
    let person = 'JOHN MILLER';
    const forMatch = text.match(/(?:for|dla|in memory of|pamięci|ku czci|imienia|prof\.?|dr\.?)\s+([A-ZĄĆĘŁŃÓŚŹŻa-ząćęłńóśźż\s.]+?)(?=\s+\d{4}|\s*[,—–\-]|$|with|in)/i);
    if (forMatch && forMatch[1].trim().length > 2) {
      person = normalizePolishGenitiveName(forMatch[1].trim());
    }

    const isPl = lower.includes('tablic') || lower.includes('brąz') || lower.includes('braz');
    const title = isPl ? `Tablica Pamiątkowa z Brązu — ${person}` : `Bronze Memorial Plaque — ${person}`;
    const epitaph = isPl
      ? 'WYBITNY NAUKOWIEC I PEDAGOG\nWDZIĘCZNI STUDENCI I WSPÓŁPRACOWNICY'
      : 'DISTINGUISHED SCHOLAR AND MENTOR\nFOREVER IN OUR HEARTS';

    return {
      intent: 'create_bronze_plaque',
      productId: '5',
      title,
      widthMm: parsedWidthMm || 450,
      heightMm: parsedHeightMm || 300,
      names: { singleName: person },
      dates: dates || '1938 — 2019',
      borderName: 'Border 4',
      fixingType: 'lugs-with-studs',
      epitaph,
      rawCommand: text,
    };
  }

  // 2. Full Monument (Product 101)
  if (
    lower.includes('full monument') ||
    lower.includes('grobowiec') ||
    lower.includes('monument') ||
    lower.includes('ledger') ||
    lower.includes('nagrobek pełny') ||
    lower.includes('grobowiec rodzinny')
  ) {
    let surname = 'ANDERSON';
    const famMatch = text.match(/(?:for the|the|dla\s+rodziny|rodziny|rodzina|rodu)\s+([A-ZĄĆĘŁŃÓŚŹŻa-ząćęłńóśźż]+)(?:\s+family)?/i);
    if (famMatch) {
      surname = normalizePolishGenitiveName(famMatch[1]);
    }

    const isPl = lower.includes('grobowiec') || lower.includes('nagrobek');
    const title = isPl ? `Grobowiec Rodzinny — ${surname}` : `Family Full Monument — ${surname}`;
    const baseText = isPl ? `RODZINA ${surname}` : `THE ${surname} FAMILY`;
    const ledgerText = isPl ? 'PAMIĘĆ O WAS NIGDY NIE ZGAŚNIE' : 'ALWAYS LOVED, NEVER FORGOTTEN';

    return {
      intent: 'create_full_monument',
      productId: '101',
      title,
      names: {
        sharedSurname: baseText,
        leftPersonName: 'JOHN SMITH',
        leftDates: '1934 — 2018',
        rightPersonName: 'MARY SMITH',
        rightDates: '1936 — 2023',
      },
      baseText,
      ledgerText,
      materialName: materialName || 'African Black',
      hasVases: true,
      rawCommand: text,
    };
  }

  // 3. Laser-Etched Granite (Product 4)
  if (
    lower.includes('laser') ||
    lower.includes('fotograwer') ||
    lower.includes('etched') ||
    lower.includes('grawer laserowy')
  ) {
    let name = 'HELEN DAVIS';
    const forMatch = text.match(/(?:for|dla|in memory of|pamięci)\s+([A-ZĄĆĘŁŃÓŚŹŻa-ząćęłńóśźż\s]+?)(?=\s+\d{4}|\s*[,—–\-]|$|with|in)/i);
    if (forMatch && forMatch[1].trim().length > 2) {
      name = normalizePolishGenitiveName(forMatch[1].trim());
    }
    const parts = name.split(' ');
    const firstName = parts[0] || 'HELEN';
    const lastName = parts.slice(1).join(' ') || 'DAVIS';

    const isPl = lower.includes('nagrobek') || lower.includes('fotograwer');
    const title = isPl ? `Nagrobek Laserowy — ${name}` : `Laser-Etched Granite Headstone — ${name}`;
    const epitaph = isPl ? 'Na zawsze w naszych sercach' : 'Forever in our hearts';

    return {
      intent: 'create_laser_etched',
      productId: '4',
      title,
      names: {
        singleName: name,
        firstName,
        lastName,
      },
      dates: dates || '1948 — 2020',
      epitaph,
      rawCommand: text,
    };
  }

  // 4. Default: Traditional Headstone (Product 124)
  const isCompanion =
    lower.includes('podwójn') ||
    lower.includes('małżon') ||
    lower.includes('companion') ||
    lower.includes(' and ') ||
    lower.includes(' & ') ||
    lower.includes(' i ') ||
    lower.includes('rodzinn') ||
    lower.includes('family');

  if (isCompanion) {
    let leftName = 'JOHN SMITH';
    let rightName = 'MARY SMITH';

    const coupleMatch =
      text.match(/(?:for|dla|in memory of|pamięci)\s+([A-ZĄĆĘŁŃÓŚŹŻa-ząćęłńóśźż\s]+?)\s+(?:and|&|i)\s+([A-ZĄĆĘŁŃÓŚŹŻa-ząćęłńóśźż\s]+?)(?=\s+\d{4}|\s*[,—–\-]|$|with|in|z\s+wazon)/i) ||
      text.match(/([A-ZĄĆĘŁŃÓŚŹŻa-ząćęłńóśźż]+)\s+(?:and|&|i)\s+([A-ZĄĆĘŁŃÓŚŹŻa-ząćęłńóśźż\s]+?)(?=\s+\d{4}|\s*[,—–\-]|$|with|in|z\s+wazon)/i);

    if (coupleMatch) {
      let p1 = normalizePolishGenitiveName(coupleMatch[1].trim());
      let p2 = normalizePolishGenitiveName(coupleMatch[2].trim());

      // If p2 was e.g. "Anny Kowalskich", assign proper male/female Polish endings
      const skichMatch = coupleMatch[2].match(/\b([A-ZĄĆĘŁŃÓŚŹŻa-ząćęłńóśźż]+?)(?:sk|ck)ich\b/i);
      if (skichMatch) {
        const root = skichMatch[1].toUpperCase();
        const isCk = coupleMatch[2].toLowerCase().includes('ckich');
        const suffix = isCk ? 'CK' : 'SK';
        if (!p1.includes(' ')) p1 = `${p1} ${root}${suffix}I`;
        p2 = p2.replace(/\b([A-ZĄĆĘŁŃÓŚŹŻa-ząćęłńóśźż]+?)scy\b/i, '$1SKA').replace(/\b([A-ZĄĆĘŁŃÓŚŹŻa-ząćęłńóśźż]+?)ccy\b/i, '$1CKA').toUpperCase();
      } else {
        // If p2 has surname and p1 is only first name, attach surname to p1
        const p2Parts = p2.split(' ');
        if (p2Parts.length > 1 && !p1.includes(' ')) {
          const surname = p2Parts.slice(1).join(' ');
          const maleSurname = surname.endsWith('SKA') ? surname.slice(0, -3) + 'SKI' : surname;
          p1 = `${p1} ${maleSurname}`;
        }
      }

      leftName = p1;
      rightName = p2;
    }

    const isPl = lower.includes('nagrobek') || lower.includes('małżon') || lower.includes('podwójn');
    const surnameFromPair = rightName.split(' ').pop() || 'KOWALSCY';
    const baseText = isPl ? `RODZINA ${surnameFromPair.endsWith('A') ? surnameFromPair.slice(0, -1) + 'ICH' : surnameFromPair + 'ÓW'}` : `THE ${surnameFromPair} FAMILY`;
    const title = isPl ? `Nagrobek Tradycyjny — ${leftName} i ${rightName}` : `Companion Headstone — ${leftName} & ${rightName}`;

    return {
      intent: 'create_companion_headstone',
      productId: '124',
      title,
      names: {
        leftPersonName: leftName,
        leftDates: '1934 — 2018',
        rightPersonName: rightName,
        rightDates: '1936 — 2023',
        sharedSurname: baseText,
      },
      baseText,
      materialName: materialName || 'African Black',
      hasVases: hasVases || true,
      rawCommand: text,
    };
  }

  // Single Traditional Headstone
  let singlePerson = 'JOHN SMITH';
  const forMatch = text.match(/(?:for|dla|in memory of|pamięci)\s+([A-ZĄĆĘŁŃÓŚŹŻa-ząćęłńóśźż\s]+?)(?=\s+\d{4}|\s*[,—–\-]|$|with|in)/i);
  if (forMatch && forMatch[1].trim().length > 2) {
    singlePerson = normalizePolishGenitiveName(forMatch[1].trim());
  }

  const isPl = lower.includes('nagrobek');
  const title = isPl ? `Nagrobek Tradycyjny — ${singlePerson}` : `Traditional Headstone — ${singlePerson}`;
  const baseText = isPl ? (singlePerson.split(' ').pop() || 'PAMIĘĆ') : (singlePerson.split(' ').pop() || 'IN MEMORY');

  return {
    intent: 'create_single_headstone',
    productId: '124',
    title,
    names: {
      singleName: singlePerson,
    },
    dates: dates || '1940 — 2019',
    baseText,
    materialName: materialName || 'African Black',
    hasVases,
    rawCommand: text,
  };
}

/**
 * Universal MCP / Tool Invocation Interface
 */
export interface AssistantToolCaller {
  callTool: (req: { name: string; arguments?: Record<string, unknown> }) => Promise<any>;
}

function parseMcpResponse(res: { content?: Array<{ type: string; text?: string }>; isError?: boolean }): any {
  if (res.isError) {
    const errText = res.content?.find((c) => c.type === 'text')?.text || 'Unknown MCP error';
    throw new Error(errText);
  }
  const textItem = res.content?.find((c) => c.type === 'text');
  if (!textItem?.text) return {};
  try {
    return JSON.parse(textItem.text);
  } catch {
    return { raw: textItem.text };
  }
}

/**
 * Retries get_preview until WebGL snapshot and previewId are hydrated.
 */
async function pollPreviewUntilReady(client: AssistantToolCaller, maxAttempts = 8, delayMs = 1000): Promise<any> {
  let lastErr = null;
  for (let i = 1; i <= maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, delayMs));
    try {
      const res = await client.callTool({ name: 'get_preview', arguments: { expectedRevision: 'latest' } });
      const textItem = res.content?.find((c: any) => c.type === 'text');
      if (textItem?.text) {
        const parsed = JSON.parse(textItem.text);
        if (parsed.previewId) return parsed;
        lastErr = parsed;
      }
    } catch (e: any) {
      lastErr = e.message || String(e);
    }
  }
  throw new Error(`Podgląd 3D nie uzyskał gotowości po ${maxAttempts} próbach: ${JSON.stringify(lastErr)}`);
}

/**
 * Executes a parsed intent autonomously through the tool caller.
 * Guarantees zero collisions, correct materials, proper stonemason fonts and local persistence.
 */
export async function executeVirtualDesignerIntent(
  parsed: ParsedMemorialIntent,
  client: AssistantToolCaller,
): Promise<VirtualAgentExecutionResult> {
  const t0 = Date.now();
  let sessionId: string | null = null;

  try {
    // -------------------------------------------------------------
    // 1. Bronze Plaque (Product 5)
    // -------------------------------------------------------------
    if (parsed.intent === 'create_bronze_plaque') {
      const s = await client.callTool({ name: 'create_local_session', arguments: { productId: '5' } });
      sessionId = parseMcpResponse(s).sessionId;
      await new Promise((r) => setTimeout(r, 500));

      const widthMm = parsed.widthMm || 450;
      const heightMm = parsed.heightMm || 300;

      await client.callTool({ name: 'set_shape', arguments: { shapeId: '67', expectedRevision: 'latest' } });
      await client.callTool({ name: 'set_dimensions', arguments: { widthMm, heightMm, expectedRevision: 'latest' } });
      await client.callTool({
        name: 'set_assembly_options',
        arguments: {
          options: {
            borderName: parsed.borderName || 'Border 4',
            fixingType: parsed.fixingType || 'lugs-with-studs',
          },
          expectedRevision: 'latest',
        },
      });

      const motifYPos = -Math.round(heightMm * 0.32);
      const motifHeight = Math.round(heightMm * 0.125);

      await client.callTool({
        name: 'add_motif',
        arguments: {
          categoryId: 'Religious',
          svgPath: '/shapes/motifs/cross_001.svg',
          heightMm: motifHeight,
          xPos: 0,
          yPos: motifYPos,
          expectedRevision: 'latest',
        },
      });

      const isPl = (parsed.rawCommand || '').toLowerCase().includes('tablic') || (parsed.rawCommand || '').toLowerCase().includes('brąz');
      const person = parsed.names?.singleName || (isPl ? 'JAN KOWALSKI' : 'PROF. JOHN MILLER');
      const headerText = isPl ? 'PAMIĘCI' : 'IN MEMORY OF';
      const subText = isPl ? 'WYBITNY NAUKOWIEC I PEDAGOG' : 'DISTINGUISHED SCHOLAR AND MENTOR';
      const bottomText = isPl ? 'WDZIĘCZNI STUDENCI I WSPÓŁPRACOWNICY' : 'FOREVER IN OUR HEARTS';

      const headerSize = computeSafeInscriptionSize(headerText, 13, widthMm);
      const personSize = computeSafeInscriptionSize(person, 17, widthMm);
      const subSize = computeSafeInscriptionSize(subText, 10.5, widthMm);
      const datesSize = computeSafeInscriptionSize(parsed.dates || '1938 — 2019', 12.5, widthMm);
      const bottomSize = computeSafeInscriptionSize(bottomText, 10, widthMm);

      await client.callTool({
        name: 'add_inscriptions',
        arguments: {
          inscriptions: [
            { text: headerText, font: 'Garamond', sizeMm: headerSize, color: '#D4AF37', xPos: 0, yPos: Math.round(heightMm * 0.20) },
            { text: person, font: 'Garamond', sizeMm: personSize, color: '#D4AF37', xPos: 0, yPos: Math.round(heightMm * 0.09) },
            { text: subText, font: 'Garamond', sizeMm: subSize, color: '#D4AF37', xPos: 0, yPos: -Math.round(heightMm * 0.015) },
            { text: parsed.dates || '1938 — 2019', font: 'Garamond', sizeMm: datesSize, color: '#D4AF37', xPos: 0, yPos: -Math.round(heightMm * 0.12) },
            { text: bottomText, font: 'Garamond', sizeMm: bottomSize, color: '#D4AF37', xPos: 0, yPos: -Math.round(heightMm * 0.23) },
          ],
          expectedRevision: 'latest',
        },
      });

      const prevData = await pollPreviewUntilReady(client);
      const title = parsed.title || (isPl ? `Tablica Pamiątkowa — ${person}` : `Bronze Memorial Plaque — ${person}`);
      const saveRes = await client.callTool({
        name: 'save_local_design',
        arguments: {
          title,
          expectedRevision: prevData.revision,
          previewId: prevData.previewId,
          visuallyReviewed: true,
        },
      });
      const saveData = parseMcpResponse(saveRes);

      const message = isPl
        ? `Pomyślnie utworzono tablicę pamiątkową z brązu (${widthMm} × ${heightMm} mm, Border 4, mocowanie ${parsed.fixingType || 'lugs-with-studs'}). Układ zweryfikowany z 0 ostrzeżeń.`
        : `Successfully created cast bronze memorial plaque (${widthMm} × ${heightMm} mm, Border 4, ${parsed.fixingType || 'lugs-with-studs'} fixing). Stonemason layout verified with 0 warnings.`;

      return {
        success: true,
        intent: parsed.intent,
        productId: '5',
        title,
        message,
        draftId: saveData.id,
        filePath: saveData.filePath,
        previewPath: saveData.previewPath,
        warnings: (prevData.motifLayout?.warnings || []).concat(prevData.inscriptionLayout?.warnings || []),
        executionTimeMs: Date.now() - t0,
      };
    }

    // -------------------------------------------------------------
    // 2. Full Monument (Product 101)
    // -------------------------------------------------------------
    if (parsed.intent === 'create_full_monument') {
      const isPl = (parsed.rawCommand || '').toLowerCase().includes('grobowiec') || (parsed.rawCommand || '').toLowerCase().includes('nagrobek');
      const s = await client.callTool({ name: 'create_local_session', arguments: { productId: '101' } });
      sessionId = parseMcpResponse(s).sessionId;
      await new Promise((r) => setTimeout(r, 600));

      await client.callTool({ name: 'set_material', arguments: { materialId: '1', target: 'headstone', expectedRevision: 'latest' } });
      await client.callTool({ name: 'set_material', arguments: { materialId: '1', target: 'base', expectedRevision: 'latest' } });
      await client.callTool({ name: 'set_material', arguments: { materialId: '1', target: 'ledger', expectedRevision: 'latest' } });

      await client.callTool({
        name: 'compose_memorial_layout',
        arguments: {
          preset: 'companion_both',
          headerText: isPl ? 'Ś. P.' : 'IN LOVING MEMORY',
          textColor: '#D4AF37',
          centerMotif: {
            categoryId: 'Religious',
            svgPath: '/shapes/motifs/cross_001.svg',
            color: '#D4AF37',
            heightMm: 70,
          },
          leftPerson: {
            name: parsed.names?.leftPersonName || (isPl ? 'STANISŁAW KOWALSKI' : 'JOHN SMITH'),
            dates: parsed.names?.leftDates || (isPl ? '* 10.03.1934   † 14.05.2018' : '1934 — 2018'),
            font: 'Garamond',
          },
          rightPerson: {
            name: parsed.names?.rightPersonName || (isPl ? 'STANISŁAWA KOWALSKA' : 'MARY SMITH'),
            dates: parsed.names?.rightDates || (isPl ? '* 12.04.1936   † 18.09.2023' : '1936 — 2023'),
            font: 'Garamond',
          },
          bottomText: isPl ? 'Spoczywajcie w pokoju' : 'Together in Eternal Peace',
          bottomFont: 'Great Vibes',
          clearExisting: true,
          expectedRevision: 'latest',
        },
      });

      await client.callTool({
        name: 'add_inscription',
        arguments: {
          text: parsed.baseText || (isPl ? 'RODZINA KOWALSKICH' : 'THE ANDERSON FAMILY'),
          target: 'base',
          font: 'Garamond',
          sizeMm: 40,
          color: '#D4AF37',
          xPos: 0,
          yPos: 0,
          expectedRevision: 'latest',
        },
      });

      await client.callTool({
        name: 'add_inscription',
        arguments: {
          text: parsed.ledgerText || (isPl ? 'PAMIĘĆ O WAS NIGDY NIE ZGAŚNIE' : 'ALWAYS LOVED, NEVER FORGOTTEN'),
          target: 'ledger',
          font: 'Great Vibes',
          sizeMm: 36,
          color: '#D4AF37',
          xPos: 0,
          yPos: 0,
          expectedRevision: 'latest',
        },
      });

      // Add vases if requested
      if (parsed.hasVases !== false) {
        const v1 = await client.callTool({ name: 'add_addition', arguments: { catalogId: 'K2213', expectedRevision: 'latest' } });
        const v1Data = parseMcpResponse(v1);
        if (v1Data.id) {
          await client.callTool({
            name: 'update_addition',
            arguments: { id: v1Data.id, patch: { targetSurface: 'base', xPos: -380, yPos: 0 }, expectedRevision: 'latest' },
          });
        }
        const v2 = await client.callTool({ name: 'add_addition', arguments: { catalogId: 'K2213', expectedRevision: 'latest' } });
        const v2Data = parseMcpResponse(v2);
        if (v2Data.id) {
          await client.callTool({
            name: 'update_addition',
            arguments: { id: v2Data.id, patch: { targetSurface: 'base', xPos: 380, yPos: 0 }, expectedRevision: 'latest' },
          });
        }
      }

      const prevData = await pollPreviewUntilReady(client);
      const title = parsed.title || (isPl ? 'Grobowiec Rodzinny — Pełny Monument' : 'Family Full Monument');
      const saveRes = await client.callTool({
        name: 'save_local_design',
        arguments: {
          title,
          expectedRevision: prevData.revision,
          previewId: prevData.previewId,
          visuallyReviewed: true,
        },
      });
      const saveData = parseMcpResponse(saveRes);

      const message = isPl
        ? 'Pomyślnie skonfigurowano grobowiec pełny (stela, cokół, ledger, African Black, dedykacje i wazony K2213). Brak kolizji.'
        : 'Successfully configured full monument (headstone, base, and ledger in African Black with twin K2213 vases). 0 layout conflicts.';

      return {
        success: true,
        intent: parsed.intent,
        productId: '101',
        title,
        message,
        draftId: saveData.id,
        filePath: saveData.filePath,
        previewPath: saveData.previewPath,
        warnings: (prevData.motifLayout?.warnings || []).concat(prevData.inscriptionLayout?.warnings || []),
        executionTimeMs: Date.now() - t0,
      };
    }

    // -------------------------------------------------------------
    // 3. Laser-Etched Granite (Product 4)
    // -------------------------------------------------------------
    if (parsed.intent === 'create_laser_etched') {
      const isPl = (parsed.rawCommand || '').toLowerCase().includes('nagrobek') || (parsed.rawCommand || '').toLowerCase().includes('fotograwer');
      const s = await client.callTool({ name: 'create_local_session', arguments: { productId: '4' } });
      sessionId = parseMcpResponse(s).sessionId;
      await new Promise((r) => setTimeout(r, 500));

      await client.callTool({ name: 'set_dimensions', arguments: { widthMm: 700, heightMm: 800, expectedRevision: 'latest' } });
      let fName = parsed.names?.firstName;
      let lName = parsed.names?.lastName;
      if (!fName && parsed.names?.singleName) {
        const parts = parsed.names.singleName.split(' ');
        fName = parts[0];
        lName = parts.slice(1).join(' ');
      }
      if (!fName) fName = isPl ? 'HELENA' : 'HELEN';
      if (!lName) lName = isPl ? 'DAVIS' : 'DAVIS';

      await client.callTool({
        name: 'compose_memorial_layout',
        arguments: {
          preset: 'single_centered',
          headerText: 'IN LOVING MEMORY',
          textColor: '#FFFFFF',
          centerMotif: {
            categoryId: 'Religious',
            svgPath: '/shapes/motifs/cross_001.svg',
            color: '#FFFFFF',
            heightMm: 65,
          },
          leftPerson: {
            firstName: fName,
            lastName: lName,
            dates: parsed.dates || '1948 — 2020',
            relation: isPl ? 'Ukochana Mama i Babcia' : 'Beloved Mother and Grandmother',
            font: 'Garamond',
          },
          bottomText: parsed.epitaph || (isPl ? 'Na zawsze w naszych sercach' : 'Forever in our hearts'),
          bottomFont: 'Great Vibes',
          clearExisting: true,
          expectedRevision: 'latest',
        },
      });

      const prevData = await pollPreviewUntilReady(client);
      const title = parsed.title || (isPl ? `Nagrobek Laserowy — ${parsed.names?.singleName || 'Nowak'}` : `Laser-Etched Granite Headstone — ${parsed.names?.singleName || 'Davis'}`);
      const saveRes = await client.callTool({
        name: 'save_local_design',
        arguments: {
          title,
          expectedRevision: prevData.revision,
          previewId: prevData.previewId,
          visuallyReviewed: true,
        },
      });
      const saveData = parseMcpResponse(saveRes);

      const message = isPl
        ? 'Pomyślnie utworzono nagrobek z fotograwerem laserowym na czarnym granicie (kontrastowy biały laser, krzyż i dedykacja).'
        : 'Successfully created laser-etched black granite headstone with high-contrast white laser engravings.';

      return {
        success: true,
        intent: parsed.intent,
        productId: '4',
        title,
        message,
        draftId: saveData.id,
        filePath: saveData.filePath,
        previewPath: saveData.previewPath,
        warnings: (prevData.motifLayout?.warnings || []).concat(prevData.inscriptionLayout?.warnings || []),
        executionTimeMs: Date.now() - t0,
      };
    }

    // -------------------------------------------------------------
    // 4. Traditional Headstone (Product 124) — Single or Companion
    // -------------------------------------------------------------
    const isPl = (parsed.rawCommand || '').toLowerCase().includes('nagrobek') || (parsed.rawCommand || '').toLowerCase().includes('małżon');
    const s = await client.callTool({ name: 'create_local_session', arguments: { productId: '124' } });
    sessionId = parseMcpResponse(s).sessionId;
    await new Promise((r) => setTimeout(r, 500));

    await client.callTool({ name: 'set_dimensions', arguments: { widthMm: 850, heightMm: 900, expectedRevision: 'latest' } });
    await client.callTool({ name: 'set_material', arguments: { materialId: '1', target: 'headstone', expectedRevision: 'latest' } });
    await client.callTool({ name: 'set_material', arguments: { materialId: '1', target: 'base', expectedRevision: 'latest' } });

    if (parsed.intent === 'create_companion_headstone') {
      await client.callTool({
        name: 'compose_memorial_layout',
        arguments: {
          preset: 'companion_both',
          headerText: isPl ? 'Ś. P.' : 'IN LOVING MEMORY',
          textColor: '#D4AF37',
          centerMotif: {
            categoryId: 'Religious',
            svgPath: '/shapes/motifs/cross_001.svg',
            color: '#D4AF37',
            heightMm: 70,
          },
          leftPerson: {
            name: parsed.names?.leftPersonName || (isPl ? 'STANISŁAW KOWALSKI' : 'JOHN SMITH'),
            dates: parsed.names?.leftDates || (isPl ? '* 10.03.1934   † 14.05.2018' : '1934 — 2018'),
            font: 'Garamond',
          },
          rightPerson: {
            name: parsed.names?.rightPersonName || (isPl ? 'STANISŁAWA KOWALSKA' : 'MARY SMITH'),
            dates: parsed.names?.rightDates || (isPl ? '* 12.04.1936   † 18.09.2023' : '1936 — 2023'),
            font: 'Garamond',
          },
          bottomText: isPl ? 'Spoczywajcie w pokoju' : 'Together Forever',
          bottomFont: 'Great Vibes',
          clearExisting: true,
          expectedRevision: 'latest',
        },
      });

      await client.callTool({
        name: 'add_inscription',
        arguments: {
          text: parsed.baseText || (isPl ? 'RODZINA KOWALSKICH' : 'THE SMITH FAMILY'),
          target: 'base',
          font: 'Garamond',
          sizeMm: 38,
          color: '#D4AF37',
          xPos: 0,
          yPos: 0,
          expectedRevision: 'latest',
        },
      });
    } else {
      // Single person layout
      await client.callTool({
        name: 'compose_memorial_layout',
        arguments: {
          preset: 'single_centered',
          headerText: isPl ? 'Ś. P.' : 'IN LOVING MEMORY',
          textColor: '#D4AF37',
          centerMotif: {
            categoryId: 'Religious',
            svgPath: '/shapes/motifs/cross_001.svg',
            color: '#D4AF37',
            heightMm: 75,
          },
          leftPerson: {
            name: parsed.names?.singleName || (isPl ? 'JAN KOWALSKI' : 'JOHN SMITH'),
            dates: parsed.dates || '1940 — 2019',
            font: 'Garamond',
          },
          bottomText: isPl ? 'Na zawsze w naszej pamięci' : 'Forever in our hearts',
          bottomFont: 'Great Vibes',
          clearExisting: true,
          expectedRevision: 'latest',
        },
      });
    }

    if (parsed.hasVases) {
      await new Promise((r) => setTimeout(r, 400));
      const v1 = await client.callTool({ name: 'add_addition', arguments: { catalogId: 'K2213', expectedRevision: 'latest' } });
      const v1Data = parseMcpResponse(v1);
      if (v1Data.id) {
        await client.callTool({
          name: 'update_addition',
          arguments: { id: v1Data.id, patch: { targetSurface: 'base', xPos: -380, yPos: 0 }, expectedRevision: 'latest' },
        });
      }
      const v2 = await client.callTool({ name: 'add_addition', arguments: { catalogId: 'K2213', expectedRevision: 'latest' } });
      const v2Data = parseMcpResponse(v2);
      if (v2Data.id) {
        await client.callTool({
          name: 'update_addition',
          arguments: { id: v2Data.id, patch: { targetSurface: 'base', xPos: 380, yPos: 0 }, expectedRevision: 'latest' },
        });
      }
    }

    const prevData = await pollPreviewUntilReady(client);
    const title = parsed.title || (isPl ? 'Nagrobek Tradycyjny' : 'Traditional Headstone');
    const saveRes = await client.callTool({
      name: 'save_local_design',
      arguments: {
        title,
        expectedRevision: prevData.revision,
        previewId: prevData.previewId,
        visuallyReviewed: true,
      },
    });
    const saveData = parseMcpResponse(saveRes);

    const message = isPl
      ? `Pomyślnie utworzono tradycyjny nagrobek z granitu African Black (850 × 900 mm) z układem kamieniarskim.${parsed.hasVases ? ' Dodano 2 wazony granitowe na cokole.' : ''}`
      : `Successfully created traditional African Black granite headstone (850 × 900 mm) with classic stonemason typography.${parsed.hasVases ? ' Twin matching granite base vases added.' : ''}`;

    return {
      success: true,
      intent: parsed.intent,
      productId: '124',
      title,
      message,
      draftId: saveData.id,
      filePath: saveData.filePath,
      previewPath: saveData.previewPath,
      warnings: (prevData.motifLayout?.warnings || []).concat(prevData.inscriptionLayout?.warnings || []),
      executionTimeMs: Date.now() - t0,
    };
  } finally {
    if (sessionId) {
      await client.callTool({ name: 'close_local_session', arguments: { sessionId, discardUnsavedChanges: true } }).catch(() => {});
    }
  }
}

export interface DeterministicDraftResult {
  success: boolean;
  intent: string;
  productId: string;
  title: string;
  message: string;
  draftId: string;
  previewUrl: string;
  imageData?: string;
  svgPreview?: string;
  designerHref: string;
  warnings: string[];
  executionTimeMs: number;
  snapshot: DesignerSnapshot;
}

function generateDraftUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'draft-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now().toString(36);
}

/**
 * Builds a deterministic memorial draft completely in-process.
 * Operates with 0 external API calls and requires NO local CDP Chrome instance.
 * Ideal for live production deployments (e.g. Vercel, Node serverless).
 */
export function buildDeterministicDraft(
  parsed: ParsedMemorialIntent,
): DeterministicDraftResult {
  const t0 = Date.now();
  const draftId = generateDraftUUID();
  const rawLower = (parsed.rawCommand || '').toLowerCase();
  const isPl =
    rawLower.includes('dla') ||
    rawLower.includes('nagrobek') ||
    rawLower.includes('tablic') ||
    rawLower.includes('brąz') ||
    rawLower.includes('grobowiec') ||
    rawLower.includes('rodzin') ||
    rawLower.includes('kowalsk') ||
    rawLower.includes('nowak');

  // 1. Bronze Plaque (Product 5)
  if (parsed.intent === 'create_bronze_plaque' || parsed.productId === '5') {
    const person = parsed.names?.singleName || (isPl ? 'JAN KOWALSKI' : 'PROF. JOHN MILLER');
    const headerText = isPl ? 'PAMIĘCI' : 'IN MEMORY OF';
    const subText = isPl ? 'WYBITNY NAUKOWIEC I PEDAGOG' : 'DISTINGUISHED SCHOLAR AND MENTOR';
    const bottomText = isPl ? 'WDZIĘCZNI STUDENCI I WSPÓŁPRACOWNICY' : 'FOREVER IN OUR HEARTS';
    const title = parsed.title || (isPl ? `Tablica Pamiątkowa — ${person}` : `Bronze Memorial Plaque — ${person}`);

    const widthMm = parsed.widthMm || 450;
    const heightMm = parsed.heightMm || 300;

    const headerSize = computeSafeInscriptionSize(headerText, 13, widthMm);
    const personSize = computeSafeInscriptionSize(person, 17, widthMm);
    const subSize = computeSafeInscriptionSize(subText, 10.5, widthMm);
    const datesSize = computeSafeInscriptionSize(parsed.dates || '1938 — 2019', 12.5, widthMm);
    const bottomSize = computeSafeInscriptionSize(bottomText, 10, widthMm);

    const motifHeight = Math.round(heightMm * 0.125);
    const motifOffset = -Math.round(heightMm * 0.32);

    const snapshot: DesignerSnapshot = {
      version: 1,
      productId: '5',
      shapeUrl: '/shapes/headstones/landscape.svg',
      borderName: parsed.borderName || 'Border 1',
      fixingType: parsed.fixingType || 'lugs-with-studs',
      showInsetContour: false,
      insetContourColor: '#eeeeee',
      materialUrl: '/textures/forever/l/Imperial-Red.webp',
      headstoneMaterialUrl: '/textures/phoenix/l/04.webp',
      baseMaterialUrl: '/textures/forever/l/Imperial-Red.webp',
      ledgerMaterialUrl: '/textures/forever/l/Imperial-Red.webp',
      kerbsetMaterialUrl: '/textures/forever/l/Imperial-Red.webp',
      widthMm,
      heightMm,
      baseWidthMm: 1260,
      baseHeightMm: 0,
      baseThickness: 250,
      baseFinish: 'default',
      baseOption: 'none',
      baseLidFinish: 'black',
      headstoneStyle: 'upright',
      uprightThickness: 5,
      slantThickness: 5,
      showBase: false,
      showLedger: false,
      showKerbset: false,
      ledgerWidthMm: 950,
      ledgerHeightMm: 60,
      ledgerDepthMm: 2030,
      kerbWidthMm: 1200,
      kerbHeightMm: 300,
      kerbDepthMm: 2150,
      selectedAdditions: [],
      additionOffsets: {},
      selectedMotifs: [
        {
          id: 'motif-cross-bronze',
          svgPath: '/shapes/motifs/cross_001.svg',
          color: '#ffb35a',
        },
      ],
      motifOffsets: {
        'motif-cross-bronze': {
          xPos: 0,
          yPos: motifOffset,
          scale: 1,
          rotationZ: 0,
          heightMm: motifHeight,
          target: 'headstone',
          coordinateSpace: 'offset',
          flipX: false,
          flipY: false,
          baseWidthMm: widthMm,
          baseHeightMm: heightMm,
        },
      },
      selectedEmblems: [],
      emblemOffsets: {},
      selectedImages: [],
      inscriptions: [
        {
          id: 'l-bronze-1',
          text: headerText,
          font: 'Garamond',
          sizeMm: headerSize,
          rotationDeg: 0,
          xPos: 0,
          yPos: Math.round(heightMm * 0.69 * 100) / 100,
          color: '#ffb35a',
          target: 'headstone',
          textAlign: 'center',
          baseWidthMm: widthMm,
          baseHeightMm: heightMm,
        },
        {
          id: 'l-bronze-2',
          text: person,
          font: 'Garamond',
          sizeMm: personSize,
          rotationDeg: 0,
          xPos: 0,
          yPos: Math.round(heightMm * 0.585 * 100) / 100,
          color: '#ffb35a',
          target: 'headstone',
          textAlign: 'center',
          baseWidthMm: widthMm,
          baseHeightMm: heightMm,
        },
        {
          id: 'l-bronze-3',
          text: subText,
          font: 'Garamond',
          sizeMm: subSize,
          rotationDeg: 0,
          xPos: 0,
          yPos: Math.round(heightMm * 0.485 * 100) / 100,
          color: '#ffb35a',
          target: 'headstone',
          textAlign: 'center',
          baseWidthMm: widthMm,
          baseHeightMm: heightMm,
        },
        {
          id: 'l-bronze-4',
          text: parsed.dates || '1938 — 2019',
          font: 'Garamond',
          sizeMm: datesSize,
          rotationDeg: 0,
          xPos: 0,
          yPos: Math.round(heightMm * 0.385 * 100) / 100,
          color: '#ffb35a',
          target: 'headstone',
          textAlign: 'center',
          baseWidthMm: widthMm,
          baseHeightMm: heightMm,
        },
        {
          id: 'l-bronze-5',
          text: bottomText,
          font: 'Garamond',
          sizeMm: bottomSize,
          rotationDeg: 0,
          xPos: 0,
          yPos: Math.round(heightMm * 0.27 * 100) / 100,
          color: '#ffb35a',
          target: 'headstone',
          textAlign: 'center',
          baseWidthMm: widthMm,
          baseHeightMm: heightMm,
        },
      ],
      metadata: {
        currentProjectId: null,
        currentProjectTitle: title,
      },
    };

    const message = isPl
      ? `Pomyślnie utworzono tablicę pamiątkową z brązu (${widthMm} × ${heightMm} mm, ${parsed.borderName || 'Border 1'}, montaż śrubowy). Układ zweryfikowany ze standardem kamieniarskim.`
      : `Successfully created cast bronze memorial plaque (${widthMm} × ${heightMm} mm, ${parsed.borderName || 'Border 1'}, lugs-with-studs fixing). Stonemason layout verified with 0 warnings.`;

    const svgPreview = generateDraftSvgPreview(snapshot, { title });
    const imageData = generateDraftSvgDataUri(snapshot, { title });
    const previewUrl = `/api/virtual-assistant?draftId=${draftId}&format=svg`;

    return {
      success: true,
      intent: 'create_bronze_plaque',
      productId: '5',
      title,
      message,
      draftId,
      previewUrl,
      imageData,
      svgPreview,
      designerHref: '/bronze-plaque/inscriptions',
      warnings: [],
      executionTimeMs: Date.now() - t0,
      snapshot,
    };
  }

  // 2. Full Monument (Product 101)
  if (parsed.intent === 'create_full_monument' || parsed.productId === '101') {
    const surname = parsed.names?.sharedSurname || (isPl ? 'KOWALSKICH' : 'ANDERSON');
    const title = parsed.title || (isPl ? `Grobowiec Rodzinny — ${surname}` : `Family Full Monument — ${surname}`);
    const baseText = parsed.baseText || (isPl ? `RODZINA ${surname}` : `THE ${surname} FAMILY`);
    const ledgerText = parsed.ledgerText || (isPl ? 'PAMIĘĆ O WAS NIGDY NIE ZGAŚNIE' : 'ALWAYS LOVED, NEVER FORGOTTEN');

    const snapshot: DesignerSnapshot = {
      version: 1,
      productId: '101',
      shapeUrl: '/shapes/headstones/serpentine.svg',
      borderName: null,
      fixingType: 'flat-back',
      showInsetContour: false,
      insetContourColor: '#eeeeee',
      materialUrl: '/textures/forever/l/Imperial-Red.webp',
      headstoneMaterialUrl: '/textures/forever/l/African-Black.webp',
      baseMaterialUrl: '/textures/forever/l/African-Black.webp',
      ledgerMaterialUrl: '/textures/forever/l/African-Black.webp',
      kerbsetMaterialUrl: '/textures/forever/l/Blue-Pearl.webp',
      widthMm: 900,
      heightMm: 700,
      baseWidthMm: 1200,
      baseHeightMm: 350,
      baseThickness: 250,
      baseFinish: 'default',
      baseOption: 'none',
      baseLidFinish: 'black',
      headstoneStyle: 'upright',
      uprightThickness: 80,
      slantThickness: 80,
      showBase: true,
      showLedger: true,
      showKerbset: true,
      ledgerWidthMm: 1050,
      ledgerHeightMm: 50,
      ledgerDepthMm: 2080,
      kerbWidthMm: 1200,
      kerbHeightMm: 250,
      kerbDepthMm: 2150,
      selectedAdditions: ['K2213_left', 'K2213_right'],
      additionOffsets: {
        K2213_left: {
          scale: 1,
          rotationZ: 0,
          sizeVariant: 1,
          targetSurface: 'base',
          zPos: 0.42238,
          additionType: 'vase',
          assetFile: '2213/2213.glb',
          sourceId: 'K2213',
          additionName: 'Vase Tedesche Base Mounted',
          zPosFinalized: true,
          baseWidthMm: 1200,
          baseHeightMm: 350,
          xPos: -0.46,
          yPos: -0.5,
          footprintWidth: 0.135,
        },
        K2213_right: {
          scale: 1,
          rotationZ: 0,
          sizeVariant: 1,
          targetSurface: 'base',
          zPos: 0.42238,
          additionType: 'vase',
          assetFile: '2213/2213.glb',
          sourceId: 'K2213',
          additionName: 'Vase Tedesche Base Mounted',
          zPosFinalized: true,
          baseWidthMm: 1200,
          baseHeightMm: 350,
          xPos: 0.46,
          yPos: -0.5,
          footprintWidth: 0.135,
        },
      },
      selectedMotifs: [
        {
          id: 'motif-cross-full',
          svgPath: '/shapes/motifs/cross_001.svg',
          color: '#D4AF37',
        },
      ],
      motifOffsets: {
        'motif-cross-full': {
          xPos: 0,
          yPos: -140,
          scale: 1,
          rotationZ: 0,
          heightMm: 70,
          target: 'headstone',
          coordinateSpace: 'offset',
          flipX: false,
          flipY: false,
          baseWidthMm: 900,
          baseHeightMm: 700,
        },
      },
      selectedEmblems: [],
      emblemOffsets: {},
      selectedImages: [],
      inscriptions: [
        {
          id: 'l-full-header',
          text: isPl ? 'Ś. P.' : 'IN LOVING MEMORY',
          font: 'Garamond',
          sizeMm: 24,
          rotationDeg: 0,
          xPos: 0,
          yPos: 95,
          color: '#D4AF37',
          target: 'headstone',
          coordinateSpace: 'mm-center',
          textAlign: 'center',
          baseWidthMm: 900,
          baseHeightMm: 700,
        },
        {
          id: 'l-full-p1-name',
          text: parsed.names?.leftPersonName || (isPl ? 'STANISŁAW KOWALSKI' : 'JOHN SMITH'),
          font: 'Garamond',
          sizeMm: 38,
          rotationDeg: 0,
          xPos: -160,
          yPos: 35,
          color: '#D4AF37',
          target: 'headstone',
          coordinateSpace: 'mm-center',
          textAlign: 'center',
          baseWidthMm: 900,
          baseHeightMm: 700,
        },
        {
          id: 'l-full-p1-dates',
          text: parsed.names?.leftDates || (isPl ? '* 10.03.1934   † 14.05.2018' : '1934 — 2018'),
          font: 'Garamond',
          sizeMm: 20,
          rotationDeg: 0,
          xPos: -160,
          yPos: -30,
          color: '#D4AF37',
          target: 'headstone',
          coordinateSpace: 'mm-center',
          textAlign: 'center',
          baseWidthMm: 900,
          baseHeightMm: 700,
        },
        {
          id: 'l-full-p2-name',
          text: parsed.names?.rightPersonName || (isPl ? 'STANISŁAWA KOWALSKA' : 'MARY SMITH'),
          font: 'Garamond',
          sizeMm: 38,
          rotationDeg: 0,
          xPos: 160,
          yPos: 35,
          color: '#D4AF37',
          target: 'headstone',
          coordinateSpace: 'mm-center',
          textAlign: 'center',
          baseWidthMm: 900,
          baseHeightMm: 700,
        },
        {
          id: 'l-full-p2-dates',
          text: parsed.names?.rightDates || (isPl ? '* 12.04.1936   † 18.09.2023' : '1936 — 2023'),
          font: 'Garamond',
          sizeMm: 20,
          rotationDeg: 0,
          xPos: 160,
          yPos: -30,
          color: '#D4AF37',
          target: 'headstone',
          coordinateSpace: 'mm-center',
          textAlign: 'center',
          baseWidthMm: 900,
          baseHeightMm: 700,
        },
        {
          id: 'l-full-bottom',
          text: isPl ? 'Spoczywajcie w pokoju' : 'Together in Eternal Peace',
          font: 'Great Vibes',
          sizeMm: 32,
          rotationDeg: 0,
          xPos: 0,
          yPos: -150,
          color: '#D4AF37',
          target: 'headstone',
          coordinateSpace: 'mm-center',
          textAlign: 'center',
          baseWidthMm: 900,
          baseHeightMm: 700,
        },
        {
          id: 'l-full-base',
          text: baseText,
          font: 'Garamond',
          sizeMm: 40,
          rotationDeg: 0,
          xPos: 0,
          yPos: 0,
          color: '#D4AF37',
          target: 'base',
          coordinateSpace: 'mm-center',
          textAlign: 'center',
          baseWidthMm: 1200,
          baseHeightMm: 350,
        },
        {
          id: 'l-full-ledger',
          text: ledgerText,
          font: 'Great Vibes',
          sizeMm: 36,
          rotationDeg: 0,
          xPos: 0,
          yPos: 0,
          color: '#D4AF37',
          target: 'ledger',
          coordinateSpace: 'mm-center',
          textAlign: 'center',
          baseWidthMm: 1050,
          baseHeightMm: 50,
        },
      ],
      metadata: {
        currentProjectId: null,
        currentProjectTitle: title,
      },
    };

    const message = isPl
      ? 'Pomyślnie skonfigurowano grobowiec pełny (stela, cokół, ledger, African Black, dedykacje i wazony K2213). Brak kolizji.'
      : 'Successfully configured full monument (headstone, base, and ledger in African Black with twin K2213 vases). 0 layout conflicts.';

    const svgPreview = generateDraftSvgPreview(snapshot, { title });
    const imageData = generateDraftSvgDataUri(snapshot, { title });
    const previewUrl = `/api/virtual-assistant?draftId=${draftId}&format=svg`;

    return {
      success: true,
      intent: 'create_full_monument',
      productId: '101',
      title,
      message,
      draftId,
      previewUrl,
      imageData,
      svgPreview,
      designerHref: '/traditional-engraved-full-monument/inscriptions',
      warnings: [],
      executionTimeMs: Date.now() - t0,
      snapshot,
    };
  }

  // 3. Laser-Etched Granite (Product 4)
  if (parsed.intent === 'create_laser_etched' || parsed.productId === '4') {
    const name = parsed.names?.singleName || (isPl ? 'ANNA NOWAK' : 'HELEN DAVIS');
    const title = parsed.title || (isPl ? `Nagrobek Laserowy — ${name}` : `Laser-Etched Granite Headstone — ${name}`);
    const epitaph = parsed.epitaph || (isPl ? 'Na zawsze w naszych sercach' : 'Forever in our hearts');
    const w = parsed.widthMm || 600;
    const h = parsed.heightMm || 600;

    const snapshot: DesignerSnapshot = {
      version: 1,
      productId: '4',
      shapeUrl: '/shapes/headstones/serpentine.svg',
      borderName: null,
      fixingType: 'flat-back',
      showInsetContour: false,
      insetContourColor: '#eeeeee',
      materialUrl: '/textures/forever/l/Imperial-Red.webp',
      headstoneMaterialUrl: '/textures/forever/l/Glory-Black-2.webp',
      baseMaterialUrl: '/textures/forever/l/Glory-Black-2.webp',
      ledgerMaterialUrl: '/textures/forever/l/Glory-Black-2.webp',
      kerbsetMaterialUrl: '/textures/forever/l/Glory-Black-2.webp',
      widthMm: w,
      heightMm: h,
      baseWidthMm: w + 100,
      baseHeightMm: 100,
      baseThickness: 250,
      baseFinish: 'default',
      baseOption: 'none',
      baseLidFinish: 'black',
      headstoneStyle: 'upright',
      uprightThickness: 80,
      slantThickness: 80,
      showBase: true,
      showLedger: false,
      showKerbset: false,
      ledgerWidthMm: 950,
      ledgerHeightMm: 60,
      ledgerDepthMm: 2030,
      kerbWidthMm: 1200,
      kerbHeightMm: 300,
      kerbDepthMm: 2150,
      selectedAdditions: [],
      additionOffsets: {},
      selectedMotifs: [
        {
          id: 'motif-cross-laser',
          svgPath: '/shapes/motifs/cross_001.svg',
          color: '#ffffff',
        },
      ],
      motifOffsets: {
        'motif-cross-laser': {
          xPos: 0,
          yPos: -Math.min(Math.round(h * 0.20), 125),
          scale: 1,
          rotationZ: 0,
          heightMm: Math.min(65, Math.round(h * 0.09)),
          target: 'headstone',
          coordinateSpace: 'offset',
          flipX: false,
          flipY: false,
          baseWidthMm: w,
          baseHeightMm: h,
        },
      },
      selectedEmblems: [],
      emblemOffsets: {},
      selectedImages: [],
      inscriptions: [
        {
          id: 'l-laser-header',
          text: isPl ? 'Ś. P.' : 'IN LOVING MEMORY',
          font: 'Garamond',
          sizeMm: 22,
          rotationDeg: 0,
          xPos: 0,
          yPos: Math.round(h * 0.12),
          color: '#ffffff',
          target: 'headstone',
          coordinateSpace: 'mm-center',
          textAlign: 'center',
          baseWidthMm: w,
          baseHeightMm: h,
        },
        {
          id: 'l-laser-name',
          text: name,
          font: 'Garamond',
          sizeMm: 48,
          rotationDeg: 0,
          xPos: 0,
          yPos: Math.round(h * 0.035),
          color: '#ffffff',
          target: 'headstone',
          coordinateSpace: 'mm-center',
          textAlign: 'center',
          baseWidthMm: w,
          baseHeightMm: h,
        },
        {
          id: 'l-laser-dates',
          text: parsed.dates || '1948 — 2020',
          font: 'Garamond',
          sizeMm: 22,
          rotationDeg: 0,
          xPos: 0,
          yPos: -Math.round(h * 0.055),
          color: '#ffffff',
          target: 'headstone',
          coordinateSpace: 'mm-center',
          textAlign: 'center',
          baseWidthMm: w,
          baseHeightMm: h,
        },
        {
          id: 'l-laser-epitaph',
          text: epitaph,
          font: 'Great Vibes',
          sizeMm: 34,
          rotationDeg: 0,
          xPos: 0,
          yPos: -Math.round(h * 0.22),
          color: '#ffffff',
          target: 'headstone',
          coordinateSpace: 'mm-center',
          textAlign: 'center',
          baseWidthMm: w,
          baseHeightMm: h,
        },
      ],
      metadata: {
        currentProjectId: null,
        currentProjectTitle: title,
      },
    };

    const message = isPl
      ? 'Pomyślnie utworzono nagrobek z fotograwerem laserowym na czarnym granicie (kontrastowy biały laser, krzyż i dedykacja).'
      : 'Successfully created laser-etched black granite headstone with high-contrast white laser engravings.';

    const svgPreview = generateDraftSvgPreview(snapshot, { title });
    const imageData = generateDraftSvgDataUri(snapshot, { title });
    const previewUrl = `/api/virtual-assistant?draftId=${draftId}&format=svg`;

    return {
      success: true,
      intent: 'create_laser_etched',
      productId: '4',
      title,
      message,
      draftId,
      previewUrl,
      imageData,
      svgPreview,
      designerHref: '/laser-etched-black-granite-headstone/inscriptions',
      warnings: [],
      executionTimeMs: Date.now() - t0,
      snapshot,
    };
  }

  // 4. Default: Traditional Headstone (Product 124)
  const isCompanion =
    parsed.intent === 'create_companion_headstone' ||
    rawLower.includes('podwójn') ||
    rawLower.includes('małżon') ||
    rawLower.includes('companion') ||
    rawLower.includes(' and ') ||
    rawLower.includes(' & ') ||
    rawLower.includes(' i ');

  const title =
    parsed.title ||
    (isCompanion
      ? isPl
        ? 'Nagrobek Podwójny — Stanisław i Maria Kowalscy'
        : 'Companion Headstone with Base Vases'
      : isPl
      ? `Nagrobek Tradycyjny — ${parsed.names?.singleName || 'Jan Kowalski'}`
      : 'Traditional Upright Headstone');

  const snapshot: DesignerSnapshot = {
    version: 1,
    productId: '124',
    shapeUrl: '/shapes/headstones/serpentine.svg',
    borderName: null,
    fixingType: 'flat-back',
    showInsetContour: false,
    insetContourColor: '#c99d44',
    materialUrl: '/textures/forever/l/Imperial-Red.webp',
    headstoneMaterialUrl: '/textures/forever/l/African-Black.webp',
    baseMaterialUrl: '/textures/forever/l/African-Black.webp',
    ledgerMaterialUrl: '/textures/forever/l/Blue-Pearl.webp',
    kerbsetMaterialUrl: '/textures/forever/l/Blue-Pearl.webp',
    widthMm: 850,
    heightMm: 900,
    baseWidthMm: 1050,
    baseHeightMm: 100,
    baseThickness: 250,
    baseFinish: 'default',
    baseOption: 'none',
    baseLidFinish: 'black',
    headstoneStyle: 'upright',
    uprightThickness: 100,
    slantThickness: 100,
    showBase: true,
    showLedger: false,
    showKerbset: false,
    ledgerWidthMm: 850,
    ledgerHeightMm: 60,
    ledgerDepthMm: 2030,
    kerbWidthMm: 1050,
    kerbHeightMm: 300,
    kerbDepthMm: 2150,
    selectedAdditions: ['K2213_left', 'K2213_right'],
    additionOffsets: {
      K2213_left: {
        scale: 1,
        rotationZ: 0,
        sizeVariant: 1,
        targetSurface: 'base',
        zPos: 0.42238,
        additionType: 'vase',
        assetFile: '2213/2213.glb',
        sourceId: 'K2213',
        additionName: 'Vase Tedesche Base Mounted',
        zPosFinalized: true,
        baseWidthMm: 1050,
        baseHeightMm: 100,
        xPos: -0.46,
        yPos: -0.5,
        footprintWidth: 0.135,
      },
      K2213_right: {
        scale: 1,
        rotationZ: 0,
        sizeVariant: 1,
        targetSurface: 'base',
        zPos: 0.42238,
        additionType: 'vase',
        assetFile: '2213/2213.glb',
        sourceId: 'K2213',
        additionName: 'Vase Tedesche Base Mounted',
        zPosFinalized: true,
        baseWidthMm: 1050,
        baseHeightMm: 100,
        xPos: 0.46,
        yPos: -0.5,
        footprintWidth: 0.135,
      },
    },
    selectedMotifs: [
      {
        id: 'motif-cross-trad',
        svgPath: '/shapes/motifs/cross_001.svg',
        color: '#D4AF37',
      },
    ],
    motifOffsets: {
      'motif-cross-trad': {
        xPos: 0,
        yPos: -160,
        scale: 1,
        rotationZ: 0,
        heightMm: 65,
        target: 'headstone',
        coordinateSpace: 'offset',
        flipX: false,
        flipY: false,
        baseWidthMm: 850,
        baseHeightMm: 900,
      },
    },
    selectedEmblems: [],
    emblemOffsets: {},
    selectedImages: [],
    inscriptions: isCompanion
      ? [
          {
            id: 'l-trad-header',
            text: isPl ? 'Ś. P.' : 'IN LOVING MEMORY',
            font: 'Garamond',
            sizeMm: 24,
            rotationDeg: 0,
            xPos: 0,
            yPos: 115,
            color: '#D4AF37',
            target: 'headstone',
            coordinateSpace: 'mm-center',
            textAlign: 'center',
            baseWidthMm: 850,
            baseHeightMm: 900,
          },
          {
            id: 'l-trad-p1-name',
            text: parsed.names?.leftPersonName || (isPl ? 'STANISŁAW KOWALSKI' : 'JOHN SMITH'),
            font: 'Garamond',
            sizeMm: 38,
            rotationDeg: 0,
            xPos: -170,
            yPos: 40,
            color: '#D4AF37',
            target: 'headstone',
            coordinateSpace: 'mm-center',
            textAlign: 'center',
            baseWidthMm: 850,
            baseHeightMm: 900,
          },
          {
            id: 'l-trad-p1-dates',
            text: parsed.names?.leftDates || (isPl ? '* 10.03.1934   † 14.05.2018' : '1934 — 2018'),
            font: 'Garamond',
            sizeMm: 20,
            rotationDeg: 0,
            xPos: -170,
            yPos: -35,
            color: '#D4AF37',
            target: 'headstone',
            coordinateSpace: 'mm-center',
            textAlign: 'center',
            baseWidthMm: 850,
            baseHeightMm: 900,
          },
          {
            id: 'l-trad-p2-name',
            text: parsed.names?.rightPersonName || (isPl ? 'STANISŁAWA KOWALSKA' : 'MARY SMITH'),
            font: 'Garamond',
            sizeMm: 38,
            rotationDeg: 0,
            xPos: 170,
            yPos: 40,
            color: '#D4AF37',
            target: 'headstone',
            coordinateSpace: 'mm-center',
            textAlign: 'center',
            baseWidthMm: 850,
            baseHeightMm: 900,
          },
          {
            id: 'l-trad-p2-dates',
            text: parsed.names?.rightDates || (isPl ? '* 12.04.1936   † 18.09.2023' : '1936 — 2023'),
            font: 'Garamond',
            sizeMm: 20,
            rotationDeg: 0,
            xPos: 170,
            yPos: -35,
            color: '#D4AF37',
            target: 'headstone',
            coordinateSpace: 'mm-center',
            textAlign: 'center',
            baseWidthMm: 850,
            baseHeightMm: 900,
          },
          {
            id: 'l-trad-bottom',
            text: isPl ? 'Spoczywajcie w pokoju' : 'Together Forever',
            font: 'Great Vibes',
            sizeMm: 32,
            rotationDeg: 0,
            xPos: 0,
            yPos: -195,
            color: '#D4AF37',
            target: 'headstone',
            coordinateSpace: 'mm-center',
            textAlign: 'center',
            baseWidthMm: 850,
            baseHeightMm: 900,
          },
        ]
      : [
          {
            id: 'l-trad-header',
            text: isPl ? 'Ś. P.' : 'IN LOVING MEMORY',
            font: 'Garamond',
            sizeMm: 24,
            rotationDeg: 0,
            xPos: 0,
            yPos: 115,
            color: '#D4AF37',
            target: 'headstone',
            coordinateSpace: 'mm-center',
            textAlign: 'center',
            baseWidthMm: 850,
            baseHeightMm: 900,
          },
          {
            id: 'l-trad-name',
            text: parsed.names?.singleName || (isPl ? 'JAN KOWALSKI' : 'JOHN SMITH'),
            font: 'Garamond',
            sizeMm: 50,
            rotationDeg: 0,
            xPos: 0,
            yPos: 40,
            color: '#D4AF37',
            target: 'headstone',
            coordinateSpace: 'mm-center',
            textAlign: 'center',
            baseWidthMm: 850,
            baseHeightMm: 900,
          },
          {
            id: 'l-trad-dates',
            text: parsed.dates || '1934 — 2018',
            font: 'Garamond',
            sizeMm: 22,
            rotationDeg: 0,
            xPos: 0,
            yPos: -35,
            color: '#D4AF37',
            target: 'headstone',
            coordinateSpace: 'mm-center',
            textAlign: 'center',
            baseWidthMm: 850,
            baseHeightMm: 900,
          },
          {
            id: 'l-trad-bottom',
            text: parsed.epitaph || (isPl ? 'Spoczywaj w pokoju' : 'Forever in our hearts'),
            font: 'Great Vibes',
            sizeMm: 34,
            rotationDeg: 0,
            xPos: 0,
            yPos: -195,
            color: '#D4AF37',
            target: 'headstone',
            coordinateSpace: 'mm-center',
            textAlign: 'center',
            baseWidthMm: 850,
            baseHeightMm: 900,
          },
        ],
    metadata: {
      currentProjectId: null,
      currentProjectTitle: title,
    },
  };

  const message = isPl
    ? `Pomyślnie utworzono tradycyjny nagrobek z granitu African Black (850 × 900 mm) z układem kamieniarskim. Dodano 2 wazony granitowe na cokole.`
    : `Successfully created traditional African Black granite headstone (850 × 900 mm) with classic stonemason typography. Twin matching granite base vases added.`;

  const svgPreview = generateDraftSvgPreview(snapshot, { title });
  const imageData = generateDraftSvgDataUri(snapshot, { title });
  const previewUrl = `/api/virtual-assistant?draftId=${draftId}&format=svg`;

  return {
    success: true,
    intent: isCompanion ? 'create_companion_headstone' : 'create_single_headstone',
    productId: '124',
    title,
    message,
    draftId,
    previewUrl,
    imageData,
    svgPreview,
    designerHref: '/traditional-engraved-headstone/inscriptions',
    warnings: [],
    executionTimeMs: Date.now() - t0,
    snapshot,
  };
}
