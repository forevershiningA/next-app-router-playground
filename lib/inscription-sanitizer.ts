/**
 * Shared inscription sanitization logic.
 * Pure functions — no React dependencies.
 * Used by DesignPageClient (browser) and anonymize-price-quotes script (Node.js).
 */

export interface NameDatabase {
  /** Uppercase Set of all first names (male + female) */
  firstNames: Set<string>;
  /** Uppercase Set of all surnames */
  surnames: Set<string>;
  /** Female first names (original case), for seeded selection */
  femaleNames: string[];
  /** Male first names (original case), for seeded selection */
  maleNames: string[];
  /** Combined first names array (femaleNames + maleNames) */
  firstNamesArray: string[];
  /** Surnames array (original case), for seeded selection */
  surnamesArray: string[];
}

/** Simple djb2-variant hash — must match the client implementation exactly. */
export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32-bit integer
  }
  return Math.abs(hash);
}

export function getGenderFromCategory(category: string): 'female' | 'male' | 'neutral' {
  const lower = category.toLowerCase();
  if (
    lower.includes('mother') || lower.includes('daughter') || lower.includes('wife') ||
    lower.includes('sister') || lower.includes('grandmother') || lower.includes('nanna') ||
    lower.includes('grandma') || lower.includes('aunt') || lower.includes('woman') ||
    lower.includes('lady') || lower.includes('girl')
  ) return 'female';
  if (
    lower.includes('father') || lower.includes('son') || lower.includes('husband') ||
    lower.includes('brother') || lower.includes('grandfather') || lower.includes('papa') ||
    lower.includes('grandpa') || lower.includes('uncle') || lower.includes('man') ||
    lower.includes('gentleman') || lower.includes('boy') || lower.includes('dad')
  ) return 'male';
  return 'neutral';
}

export function getRandomName(seed: string | undefined, db: NameDatabase, category: string): string {
  const gender = getGenderFromCategory(category);
  const femaleNames = db.femaleNames;
  const maleNames = db.maleNames;
  const surnamesArray = db.surnamesArray;

  let firstNamesArray: string[];
  if (gender === 'female' && femaleNames.length > 0) {
    firstNamesArray = femaleNames;
  } else if (gender === 'male' && maleNames.length > 0) {
    firstNamesArray = maleNames;
  } else {
    firstNamesArray = db.firstNamesArray;
  }

  const seedValue = seed ? hashString(seed) : Math.floor(Math.random() * 10000);
  const randomFirstName = firstNamesArray[seedValue % firstNamesArray.length];
  const randomSurname = surnamesArray[(seedValue + 1) % surnamesArray.length];
  return `${randomFirstName} ${randomSurname}`;
}

export function getRandomSurname(seed: string | undefined, db: NameDatabase): string {
  const seedValue = seed ? hashString(seed) : Math.floor(Math.random() * 10000);
  return db.surnamesArray[seedValue % db.surnamesArray.length];
}

export function getRandomFirstName(seed: string | undefined, db: NameDatabase, category: string): string {
  const gender = getGenderFromCategory(category);
  let firstNamesArray = db.firstNamesArray;
  if (gender === 'female' && db.femaleNames.length > 0) firstNamesArray = db.femaleNames;
  else if (gender === 'male' && db.maleNames.length > 0) firstNamesArray = db.maleNames;
  const seedValue = seed ? hashString(seed) : Math.floor(Math.random() * 10000);
  return firstNamesArray[seedValue % firstNamesArray.length];
}

/**
 * Sanitize a single inscription text — replace likely personal names while
 * preserving memorial phrases, dates, and poetic verses.
 *
 * @param text     Original inscription label
 * @param db       Name database (null → falls back to pattern-only detection)
 * @param category Design category slug (used for gender selection in generated names)
 */
export function sanitizeInscription(text: string, db: NameDatabase | null, category: string): string {
  const commonPhrases = [
    'IN LOVING MEMORY', 'OF', 'LOVING', 'SON', 'DAUGHTER', 'BROTHER', 'SISTER',
    'MOTHER', 'FATHER', 'WIFE', 'HUSBAND', 'FOREVER', 'REST IN PEACE', 'RIP',
    'R.I.P', 'R.I.P.', 'BELOVED', 'CHERISHED', 'ALWAYS', 'REMEMBERED',
  ];

  const memorialPhrases = [
    'WILL ALWAYS BE IN OUR HEARTS', 'FOREVER IN OUR HEARTS', 'ALWAYS IN OUR HEARTS',
    'IN OUR HEARTS FOREVER', 'GONE BUT NOT FORGOTTEN', 'FOREVER LOVED', 'ALWAYS LOVED',
    'DEARLY LOVED', 'FOREVER MISSED', 'DEEPLY MISSED', 'GREATLY MISSED',
    'YOUR LIFE WAS A BLESSING', 'YOUR MEMORY A TREASURE', 'SHE MADE BROKEN LOOK BEAUTIFUL',
    'UNIVERSE ON HER SHOULDERS', 'BELOVED MOTHER', 'BELOVED FATHER', 'BELOVED GRANDMOTHER',
    'BELOVED GRANDFATHER', 'BELOVED WIFE', 'BELOVED HUSBAND', 'LOVING MOTHER', 'LOVING FATHER',
    'DEVOTED MOTHER', 'DEVOTED FATHER', 'A LIFE LIVED WITH PASSION', 'A LOVE THAT NEVER FADED',
    'A LIFE LIVED WITH PASSION, A LOVE THAT NEVER FADED',
  ];

  const upperText = text.toUpperCase().trim();
  const upperTextNoPunctuation = upperText.replace(/[.,!?;:'"]/g, '');

  if (memorialPhrases.some(phrase => upperText === phrase || upperText.includes(phrase))) return text;
  if (commonPhrases.includes(upperText) || commonPhrases.includes(upperTextNoPunctuation)) return text;

  if (
    (text.startsWith('"') && text.endsWith('"')) ||
    (text.startsWith("'") && text.endsWith("'")) ||
    text.includes('"FOREVER') ||
    text.includes('"#')
  ) return text;

  const relationshipWords = /\b(beloved|loving|cherished|dear|dearest|devoted|precious|adored|treasured|father|mother|son|daughter|brother|sister|grandfather|grandmother|uncle|aunt|wife|husband|grandson|granddaughter|great-grandfather|great-grandmother|friend)\b/i;
  if (relationshipWords.test(text.toLowerCase())) {
    if (/\b(to|of)\s*$/i.test(text)) return text;
  }

  const hasDatePattern =
    /\d{1,2}[,\/\-\s]+\d{1,4}/.test(text) ||
    /(?:JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)/i.test(text) ||
    /\d{4}\s*-\s*\d{4}/.test(text) ||
    /\d{2}\/\d{2}\/\d{4}/.test(text);

  if (hasDatePattern) {
    const textWithoutDates = text
      .replace(/\d{4}\s*-\s*\d{4}/g, '')
      .replace(/\d{1,2}[,\/\-\s]+\d{1,4}/g, '')
      .replace(/\d{2}\/\d{2}\/\d{4}/g, '')
      .replace(/(?:JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (textWithoutDates.length === 0 || textWithoutDates === '-') return text;
  }

  const words = text.split(/\s+/).filter(w => w.length > 0);

  if (db && words.length >= 1) {
    const upperWords = words.map(w => w.toUpperCase().replace(/['".,!?]/g, ''));
    const hasFirstName = upperWords.some(w => db.firstNames.has(w));
    const hasSurname = upperWords.some(w => db.surnames.has(w));

    if (hasFirstName && words.length === 1 && !hasDatePattern) {
      const randomFirstName = getRandomFirstName(text, db, category);
      const isAllCaps = text === text.toUpperCase();
      return isAllCaps ? randomFirstName.toUpperCase() : randomFirstName;
    }

    if (hasSurname && !hasFirstName && words.length === 1 && !hasDatePattern) {
      const randomSurname = getRandomSurname(text, db);
      const isAllCaps = text === text.toUpperCase();
      return isAllCaps ? randomSurname.toUpperCase() : randomSurname;
    }

    if ((hasFirstName && hasSurname) || (hasFirstName && words.length >= 2)) {
      const hasSentenceWords = /\b(the|you|me|my|your|when|feel|know|am|are|is|see|being|part|of|and|or|not|lost|may|be|thine|thy|thee|heaven|eternal|happiness|shall|will|has|had|was|were|would|could|should|our|their|us|we)\b/i.test(text);
      if (!hasSentenceWords) {
        if (hasDatePattern) {
          const randomName = getRandomName(text, db, category);
          const isAllCaps = text === text.toUpperCase();
          const nameToUse = isAllCaps ? randomName.toUpperCase() : randomName;
          const dateMatch = text.match(/(\d{4}\s*-\s*\d{4}|\d{1,2}[,\/\-\s]+\d{1,4}|\d{2}\/\d{2}\/\d{4})/);
          if (dateMatch) {
            const dateAndAfter = text.substring(text.indexOf(dateMatch[0]));
            return `${nameToUse} ${dateAndAfter}`;
          }
        }
        const randomName = getRandomName(text, db, category);
        const isAllCaps = text === text.toUpperCase();
        return isAllCaps ? randomName.toUpperCase() : randomName;
      }
    }

    // Single ALL CAPS word fallback
    const isAllCapsSingleWord = /^[A-Z'-]+$/.test(text) && words.length === 1;
    if (isAllCapsSingleWord && !/\b(the|you|me|my|your|when|feel|know|am|are|is|see|being|part|of|and|or|not|lost)\b/i.test(text)) {
      const upperWord = text.toUpperCase().replace(/['".,!?]/g, '');
      const isFirstName = db.firstNames.has(upperWord);
      const isSurname = db.surnames.has(upperWord);
      if (isFirstName && !isSurname) return getRandomFirstName(text, db, category).toUpperCase();
      if (isSurname) return getRandomSurname(text, db).toUpperCase();
    }
  }

  // Pattern-only fallback (no db)
  const isTitleCaseName =
    words.length >= 2 &&
    words.every(word => /^[A-Z][a-z]+$/.test(word)) &&
    !words.some(word =>
      ['The', 'When', 'You', 'Feel', 'Know', 'See', 'Being', 'Part', 'And', 'Or', 'Am', 'Are', 'Is', 'Not', 'Lost'].includes(word)
    );
  if (isTitleCaseName) return db ? getRandomName(text, db, category) : 'Name Surname';

  const hasSentenceWords = /\b(the|you|me|my|your|when|feel|know|am|are|is|see|being|part|of|and|or|not|lost)\b/i.test(text);
  const hasLowerCase = /[a-z]/.test(text);
  const isShortPhrase = words.length <= 8;
  if (hasLowerCase && isShortPhrase && hasSentenceWords) return text;

  const isAllCapsOrMixedCaps = /^[A-Z\s'-]+$/.test(text) && words.length >= 2;
  const hasSuffix = /\b(JR\.?|SR\.?|III|II|IV)\b/i.test(text);
  if ((isAllCapsOrMixedCaps || hasSuffix) && !hasSentenceWords) {
    return db ? getRandomName(text, db, category).toUpperCase() : 'NAME SURNAME';
  }

  return text;
}
