const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const FIRST_NAMES_F_PATH = path.join(ROOT, 'public', 'json', 'firstnames_f_small.json');
const FIRST_NAMES_M_PATH = path.join(ROOT, 'public', 'json', 'firstnames_m_small.json');
const SURNAMES_PATH = path.join(ROOT, 'public', 'json', 'surnames_small.json');

let nameDb;

const hashString = (str = '') => {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
};

const getGenderFromCategory = (category = '') => {
  const lower = category.toLowerCase();
  if (/(mother|daughter|wife|sister|grandmother|nanna|grandma|aunt|woman|lady|girl)/.test(lower)) {
    return 'female';
  }
  if (/(father|son|husband|brother|grandfather|papa|grandpa|uncle|man|gentleman|boy|dad)/.test(lower)) {
    return 'male';
  }
  return 'neutral';
};

const loadNameDb = () => {
  if (nameDb) return nameDb;
  const femaleNames = JSON.parse(fs.readFileSync(FIRST_NAMES_F_PATH, 'utf8'));
  const maleNames = JSON.parse(fs.readFileSync(FIRST_NAMES_M_PATH, 'utf8'));
  const surnames = JSON.parse(fs.readFileSync(SURNAMES_PATH, 'utf8'));
  nameDb = {
    firstNames: new Set([...femaleNames, ...maleNames].map((n) => n.toUpperCase())),
    surnames: new Set(surnames.map((n) => n.toUpperCase())),
    femaleNames,
    maleNames,
    firstNamesArray: [...femaleNames, ...maleNames],
    surnamesArray: surnames,
  };
  return nameDb;
};

const getRandomFirstName = (seed, category) => {
  const db = loadNameDb();
  if (!db.firstNamesArray.length) return 'Name';
  const gender = getGenderFromCategory(category);
  let pool = db.firstNamesArray;
  if (gender === 'female' && db.femaleNames.length) pool = db.femaleNames;
  else if (gender === 'male' && db.maleNames.length) pool = db.maleNames;
  const seedVal = seed ? hashString(seed) : Math.floor(Math.random() * 10000);
  return pool[seedVal % pool.length];
};

const getRandomSurname = (seed) => {
  const db = loadNameDb();
  if (!db.surnamesArray.length) return 'Surname';
  const seedVal = seed ? hashString(seed) : Math.floor(Math.random() * 10000);
  return db.surnamesArray[seedVal % db.surnamesArray.length];
};

const getRandomName = (seed, category) => {
  const db = loadNameDb();
  if (!db.firstNamesArray.length || !db.surnamesArray.length) return 'Name Surname';
  const gender = getGenderFromCategory(category);
  let pool = db.firstNamesArray;
  if (gender === 'female' && db.femaleNames.length) pool = db.femaleNames;
  else if (gender === 'male' && db.maleNames.length) pool = db.maleNames;
  const seedVal = seed ? hashString(seed) : Math.floor(Math.random() * 10000);
  const first = pool[seedVal % pool.length];
  const surname = db.surnamesArray[(seedVal + 1) % db.surnamesArray.length];
  return `${first} ${surname}`;
};

function sanitizeInscription(text, category = '') {
  if (!text) return text;
  const db = loadNameDb();

  const commonPhrases = [
    'IN LOVING MEMORY', 'OF', 'LOVING', 'SON', 'DAUGHTER', 'BROTHER', 'SISTER', 'MOTHER', 'FATHER',
    'WIFE', 'HUSBAND', 'FOREVER', 'REST IN PEACE', 'RIP', 'R.I.P', 'R.I.P.', 'BELOVED', 'CHERISHED',
    'ALWAYS', 'REMEMBERED',
  ];
  const memorialPhrases = [
    'WILL ALWAYS BE IN OUR HEARTS', 'FOREVER IN OUR HEARTS', 'ALWAYS IN OUR HEARTS', 'IN OUR HEARTS FOREVER',
    'GONE BUT NOT FORGOTTEN', 'FOREVER LOVED', 'ALWAYS LOVED', 'DEARLY LOVED', 'FOREVER MISSED',
    'DEEPLY MISSED', 'GREATLY MISSED', 'YOUR LIFE WAS A BLESSING', 'YOUR MEMORY A TREASURE',
    'SHE MADE BROKEN LOOK BEAUTIFUL', 'UNIVERSE ON HER SHOULDERS', 'BELOVED MOTHER', 'BELOVED FATHER',
    'BELOVED GRANDMOTHER', 'BELOVED GRANDFATHER', 'BELOVED WIFE', 'BELOVED HUSBAND', 'LOVING MOTHER',
    'LOVING FATHER', 'DEVOTED MOTHER', 'DEVOTED FATHER', 'A LIFE LIVED WITH PASSION',
    'A LOVE THAT NEVER FADED', 'A LIFE LIVED WITH PASSION, A LOVE THAT NEVER FADED',
  ];

  const upper = text.toUpperCase().trim();
  const upperNoPunc = upper.replace(/[.,!?;:'"]/g, '');
  if (memorialPhrases.some((phrase) => upper === phrase || upper.includes(phrase))) return text;
  if (commonPhrases.includes(upper) || commonPhrases.includes(upperNoPunc)) return text;
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith('\'') && text.endsWith('\'')) || text.includes('"FOREVER') || text.includes('"#')) {
    return text;
  }

  const relationshipWords = /(beloved|loving|cherished|dear|dearest|devoted|precious|adored|treasured|father|mother|son|daughter|brother|sister|grandfather|grandmother|uncle|aunt|wife|husband|grandson|granddaughter|great-grandfather|great-grandmother|friend)/i;
  if (relationshipWords.test(text.toLowerCase()) && /\b(to|of)\s*$/i.test(text)) {
    return text;
  }

  const hasDatePattern = /(\d{1,2}[,\/\-\s]+\d{1,4})|(?:JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)|\d{4}\s*-\s*\d{4}|\d{2}\/\d{2}\/\d{4}/i.test(text);
  if (hasDatePattern) {
    const stripped = text
      .replace(/\d{4}\s*-\s*\d{4}/g, '')
      .replace(/\d{1,2}[,\/\-\s]+\d{1,4}/g, '')
      .replace(/\d{2}\/\d{2}\/\d{4}/g, '')
      .replace(/(JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (!stripped || stripped === '-') {
      return text;
    }
  }

  const words = text.split(/\s+/).filter(Boolean);
  const upperWords = words.map((w) => w.toUpperCase().replace(/['".,!?]/g, ''));
  const hasFirstName = upperWords.some((w) => db.firstNames.has(w));
  const hasSurname = upperWords.some((w) => db.surnames.has(w));

  const sentenceRegex = /(the|you|me|my|your|when|feel|know|am|are|is|see|being|part|of|and|or|not|lost|may|be|thine|thy|thee|heaven|eternal|happiness|shall|will|has|had|was|were|would|could|should|our|their|us|we)/i;
  const looksLikeSentence = sentenceRegex.test(text);

  if (hasFirstName && words.length === 1 && !hasDatePattern) {
    const replacement = getRandomFirstName(text, category);
    return text === text.toUpperCase() ? replacement.toUpperCase() : replacement;
  }

  if (hasSurname && !hasFirstName && words.length === 1 && !hasDatePattern) {
    const replacement = getRandomSurname(text);
    return text === text.toUpperCase() ? replacement.toUpperCase() : replacement;
  }

  if ((hasFirstName && hasSurname) || (hasFirstName && words.length >= 2)) {
    if (!looksLikeSentence) {
      if (hasDatePattern) {
        const replacementName = getRandomName(text, category);
        const finalName = text === text.toUpperCase() ? replacementName.toUpperCase() : replacementName;
        const dateMatch = text.match(/(\d{4}\s*-\s*\d{4}|\d{1,2}[,\/\-\s]+\d{1,4}|\d{2}\/\d{2}\/\d{4})/);
        if (dateMatch) {
          const suffix = text.substring(text.indexOf(dateMatch[0]));
          return `${finalName} ${suffix}`.trim();
        }
        return finalName;
      }
      const replacementName = getRandomName(text, category);
      return text === text.toUpperCase() ? replacementName.toUpperCase() : replacementName;
    }
  }

  const titleCase = words.length >= 2 &&
    words.every((word) => /^[A-Z][a-z]+$/.test(word)) &&
    !['The', 'When', 'You', 'Feel', 'Know', 'See', 'Being', 'Part', 'And', 'Or', 'Am', 'Are', 'Is', 'Not', 'Lost']
      .some((stop) => words.includes(stop));
  if (titleCase) {
    return getRandomName(text, category);
  }

  const hasLowerCase = /[a-z]/.test(text);
  const shortPhrase = words.length <= 8;
  const sentenceWords = /(the|you|me|my|your|when|feel|know|am|are|is|see|being|part|of|and|or|not|lost)/i.test(text);
  if (hasLowerCase && shortPhrase && sentenceWords) {
    return text;
  }

  const allCaps = /^[A-Z\s'-]+$/.test(text) && words.length >= 2;
  const singleAllCaps = /^[A-Z'-]+$/.test(text) && words.length === 1;
  if (singleAllCaps && !sentenceWords) {
    const upperWord = text.toUpperCase().replace(/['".,!?]/g, '');
    const isFirst = db.firstNames.has(upperWord);
    if (isFirst && !db.surnames.has(upperWord)) {
      return getRandomFirstName(text, category).toUpperCase();
    }
    return getRandomSurname(text).toUpperCase();
  }

  if (allCaps && !sentenceWords) {
    return getRandomName(text, category).toUpperCase();
  }

  return text;
}

module.exports = {
  sanitizeInscription,
};
